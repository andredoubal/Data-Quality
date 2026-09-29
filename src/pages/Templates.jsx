import { useState } from 'react'
import { FileSpreadsheet, RotateCcw } from 'lucide-react'
import { PageHead, RoleChip, CopyDownload, useToast, toCSV, Seg, Callout } from '../components/ui.jsx'
import { TEMPLATES } from '../data/templates.js'

export default function Templates() {
  const [sel, setSel] = useState('rule')
  const [mode, setMode] = useState('guide')
  const [values, setValues] = useState({})
  const [toast, toastNode] = useToast()
  const t = TEMPLATES.find((x) => x.id === sel)
  const groups = [...new Set(TEMPLATES.map((x) => x.group))]
  const filled = t.fields.map(([n, , ex]) => values[t.id]?.[n] ?? ex)
  const setVal = (n, v) => setValues({ ...values, [t.id]: { ...(values[t.id] || {}), [n]: v } })

  const blankCSV = () => toCSV(t.fields.map((f) => f[0]), [])
  const sampleCSV = () => toCSV(t.fields.map((f) => f[0]), [mode === 'fill' ? filled : t.fields.map((f) => f[2])])
  const guideCSV = () => toCSV(['Field', 'Description', 'Example'], t.fields)

  return (
    <>
      <PageHead
        eyebrow="Workbench" icon={FileSpreadsheet}
        title="Templates"
        lead="Every template the data quality process uses, in one place. Each one shows its purpose, who fills it in, a field guide with worked examples, and a fill-in mode you can export as CSV for Excel or your ticketing tool."
      />
      <div className="split">
        <nav className="card stack" style={{ gap: 12, padding: 14, position: 'sticky', top: 16 }} aria-label="Templates">
          {groups.map((g) => (
            <div key={g} className="stack" style={{ gap: 2 }}>
              <div className="eyebrow" style={{ color: 'var(--muted)', padding: '0 8px' }}>{g}</div>
              {TEMPLATES.filter((x) => x.group === g).map((x) => (
                <button key={x.id} onClick={() => setSel(x.id)} className="btn ghost sm" style={{ justifyContent: 'space-between', background: sel === x.id ? 'var(--accent-soft)' : 'transparent', color: sel === x.id ? 'var(--accent-ink)' : 'var(--ink)', fontWeight: sel === x.id ? 600 : 500 }}>
                  {x.name}<span className="mono xs muted">{x.fields.length}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <section className="stack" style={{ gap: 16, minWidth: 0 }}>
          <div className="card stack" style={{ gap: 12 }}>
            <div className="row between">
              <h2>{t.name} template</h2>
              <div className="row" style={{ gap: 4 }}>{t.owners.map((o) => <RoleChip key={o} id={o} />)}</div>
            </div>
            <div className="grid g2" style={{ gap: 12 }}>
              <p className="small"><b>Purpose:</b> <span style={{ color: 'var(--ink-2)' }}>{t.purpose}</span></p>
              <p className="small"><b>When to use:</b> <span style={{ color: 'var(--ink-2)' }}>{t.when}</span></p>
            </div>
            <div className="row between">
              <Seg label="Mode" value={mode} onChange={setMode} options={[{ value: 'guide', label: 'Field guide' }, { value: 'sample', label: 'Sample row' }, { value: 'fill', label: 'Fill in' }]} />
              <div className="row" style={{ gap: 6 }}>
                <span className="xs muted">{mode === 'guide' ? 'Field guide' : mode === 'fill' ? 'Your entry' : 'Header + sample'}:</span>
                <CopyDownload filename={`${t.id}-template${mode === 'guide' ? '-guide' : ''}.csv`} getText={mode === 'guide' ? guideCSV : sampleCSV} onToast={toast} />
                <button className="btn sm" onClick={() => { navigator.clipboard?.writeText(blankCSV()).then(() => toast('Blank header row copied'), () => toast('Copy was blocked by the browser')) }}>Copy blank header</button>
              </div>
            </div>
          </div>

          {mode === 'guide' && (
            <div className="table-wrap">
              <table className="t navy-head">
                <thead><tr><th style={{ width: 36 }}>#</th><th>Field</th><th>Description</th><th>Example</th></tr></thead>
                <tbody>
                  {t.fields.map(([n, d, e], i) => (
                    <tr key={n}><td className="mono muted">{i + 1}</td><td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{n}</td><td className="small" style={{ color: 'var(--ink-2)' }}>{d}</td><td className="small">{e || <span className="muted">(blank until resolved)</span>}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {mode === 'sample' && (
            <div className="table-wrap">
              <table className="t navy-head">
                <thead><tr>{t.fields.map(([n]) => <th key={n}>{n}</th>)}</tr></thead>
                <tbody><tr>{t.fields.map(([n, , e]) => <td key={n} className="small" style={{ minWidth: 130 }}>{e || '—'}</td>)}</tr></tbody>
              </table>
            </div>
          )}

          {mode === 'fill' && (
            <div className="card stack" style={{ gap: 14 }}>
              <div className="row between">
                <p className="small muted">Pre-filled with the worked example. Overwrite the values, then Copy CSV or Download.</p>
                <button className="btn sm" onClick={() => setValues({ ...values, [t.id]: {} })}><RotateCcw size={13} /> Reset to example</button>
              </div>
              <div className="grid g2" style={{ gap: 12 }}>
                {t.fields.map(([n, d], i) => (
                  <label key={n} className="field" htmlFor={`tpl-${t.id}-${i}`}>
                    <span>{n} <span className="muted" style={{ fontWeight: 400 }}>· {d}</span></span>
                    <input id={`tpl-${t.id}-${i}`} className="input" value={filled[i]} onChange={(e) => setVal(n, e.target.value)} />
                  </label>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <Callout title="Where the templates fit">
        CDE & Business Term → Rule Definition → Profiling & Baseline → Issue Log → Priority Scoring → RCA → Remediation Plan → DQ Scorecard → Quarterly DG Report. The Rule Change Request and Data Impact Assessment keep rules and data aligned when things change.
      </Callout>
      {toastNode}
    </>
  )
}
