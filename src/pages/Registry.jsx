import { useMemo, useState } from 'react'
import { TableProperties, Search, X, Plus, ArrowUpDown, AlertTriangle, CheckCircle2, Columns3 } from 'lucide-react'
import { PageHead, PriorityPill, StatusPill, Pill, CopyDownload, useToast, toCSV, Callout } from '../components/ui.jsx'
import { ISSUES, STATUSES, OPEN_STATUSES } from '../data/issues.js'
import { SLA } from '../data/priority.js'

export const TODAY = '2026-09-29'
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000)
export const isOpen = (i) => OPEN_STATUSES.includes(i.status)
export const isOverdue = (i) => isOpen(i) && i.target && i.target < TODAY

const COLUMNS = [
  { k: 'id', l: 'Issue ID', core: true, mono: true },
  { k: 'title', l: 'Title', core: true, w: 260 },
  { k: 'domain', l: 'Data domain', core: true },
  { k: 'product', l: 'Data area' },
  { k: 'asset', l: 'Data asset', mono: true },
  { k: 'element', l: 'Data element', core: true },
  { k: 'cde', l: 'CDE' },
  { k: 'rule', l: 'Rule ID', mono: true },
  { k: 'term', l: 'Term ID', mono: true },
  { k: 'dim', l: 'Dimension', core: true },
  { k: 'expected', l: 'Expected outcome', w: 200 },
  { k: 'actual', l: 'Actual outcome', w: 200 },
  { k: 'score', l: 'DQ score', num: true },
  { k: 'failed', l: 'Failed records', num: true, core: true },
  { k: 'samples', l: 'Sample IDs', mono: true },
  { k: 'channel', l: 'Detected by' },
  { k: 'reported', l: 'Reported on', core: true },
  { k: 'assigned', l: 'Assigned to', core: true },
  { k: 'steward', l: 'Data Steward' },
  { k: 'owner', l: 'Data Owner' },
  { k: 'severity', l: 'Severity' },
  { k: 'pscore', l: 'Priority score', num: true },
  { k: 'priority', l: 'Priority', core: true },
  { k: 'status', l: 'Status', core: true },
  { k: 'target', l: 'Target date', core: true },
  { k: 'source', l: 'Root cause category', core: true },
  { k: 'rca', l: 'Root cause', w: 200 },
  { k: 'remediation', l: 'Remediation', w: 200 },
  { k: 'resolved', l: 'Date resolved' },
]

const P_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 }

export default function Registry() {
  const [rows, setRows] = useState(ISSUES)
  const [q, setQ] = useState('')
  const [scope, setScope] = useState('Open')
  const [f, setF] = useState({ priority: '', domain: '', dim: '', source: '', status: '' })
  const [sort, setSort] = useState({ k: 'priority', dir: 1 })
  const [full, setFull] = useState(false)
  const [sel, setSel] = useState(null)
  const [adding, setAdding] = useState(false)
  const [toast, toastNode] = useToast()

  const uniq = (k) => [...new Set(rows.map((r) => r[k]))].sort()
  const filtered = useMemo(() => {
    let r = rows.filter((i) => (scope === 'All' ? true : scope === 'Open' ? isOpen(i) : !isOpen(i)))
    Object.entries(f).forEach(([k, v]) => { if (v) r = r.filter((i) => i[k] === v) })
    if (q) {
      const s = q.toLowerCase()
      r = r.filter((i) => Object.values(i).some((v) => String(v).toLowerCase().includes(s)))
    }
    const cmp = (a, b) => {
      if (sort.k === 'priority') return (P_ORDER[a.priority] - P_ORDER[b.priority]) * sort.dir
      const x = a[sort.k], y = b[sort.k]
      if (typeof x === 'number') return (x - y) * sort.dir
      return String(x).localeCompare(String(y)) * sort.dir
    }
    return [...r].sort(cmp)
  }, [rows, q, scope, f, sort])

  const cols = full ? COLUMNS : COLUMNS.filter((c) => c.core)
  const open = rows.filter(isOpen)
  const stats = [
    ['Open issues', open.length, null],
    ['Critical open', open.filter((i) => i.priority === 'Critical').length, 'crit'],
    ['Overdue vs SLA', open.filter(isOverdue).length, 'serious'],
    ['Escalated', open.filter((i) => i.status === 'Escalated').length, 'warn'],
    ['Closed / resolved YTD', rows.filter((i) => ['Closed', 'Resolved'].includes(i.status)).length, 'good'],
  ]

  const csv = () => toCSV(COLUMNS.map((c) => c.l), filtered.map((r) => COLUMNS.map((c) => r[c.k])))

  return (
    <>
      <PageHead
        eyebrow="Workbench" icon={TableProperties}
        title="Data quality issue registry"
        lead="The single log of every data quality issue: what failed, the evidence, who owns it, how it was prioritized, where it came from and how it was fixed. Example data for training."
      />

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        {stats.map(([l, v, tone]) => (
          <div key={l} className="card flat stack" style={{ gap: 4 }}>
            <span className="small muted">{l}</span>
            <div className="row" style={{ gap: 8 }}>
              <span className="big-num">{v}</span>
              {tone && <span className="dot" style={{ background: `var(--${tone})`, width: 10, height: 10 }} />}
            </div>
          </div>
        ))}
      </div>

      <div className="card stack" style={{ gap: 12, padding: 16 }}>
        <div className="row between">
          <div className="row" style={{ gap: 8, flex: '1 1 320px' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--muted)' }} />
              <input id="reg-search" className="input" style={{ width: '100%', paddingLeft: 32 }} placeholder="Search issues, IDs, elements, people…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="seg" role="group" aria-label="Scope">
              {['Open', 'Closed', 'All'].map((s) => <button key={s} className={scope === s ? 'on' : ''} onClick={() => setScope(s)}>{s}</button>)}
            </div>
          </div>
          <div className="row" style={{ gap: 6 }}>
            <button className="btn sm" onClick={() => setFull(!full)}><Columns3 size={14} /> {full ? 'Core columns' : `All ${COLUMNS.length} columns`}</button>
            <CopyDownload filename="dq-issue-registry.csv" getText={csv} onToast={toast} />
            <button className="btn sm primary" onClick={() => setAdding(true)}><Plus size={14} /> Log issue</button>
          </div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          {[['priority', 'Priority', ['Critical', 'High', 'Medium', 'Low']], ['status', 'Status', STATUSES], ['domain', 'Domain', uniq('domain')], ['dim', 'Dimension', uniq('dim')], ['source', 'Root cause', uniq('source')]].map(([k, l, opts]) => (
            <select key={k} id={'reg-f-' + k} aria-label={l} className="input" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })}>
              <option value="">{l}: all</option>
              {opts.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
          {(Object.values(f).some(Boolean) || q) && <button className="btn ghost sm" onClick={() => { setF({ priority: '', domain: '', dim: '', source: '', status: '' }); setQ('') }}><X size={14} /> Clear</button>}
          <span className="small muted" style={{ marginLeft: 'auto' }}>{filtered.length} of {rows.length} issues</span>
        </div>
      </div>

      <div className="table-wrap" style={{ maxHeight: '70vh' }}>
        <table className="t">
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c.k} className={'sortable' + (c.num ? ' num' : '')} onClick={() => setSort({ k: c.k, dir: sort.k === c.k ? -sort.dir : 1 })}>
                  <span className="row" style={{ gap: 4, flexWrap: 'nowrap', justifyContent: c.num ? 'flex-end' : 'flex-start' }}>{c.l} <ArrowUpDown size={11} opacity={sort.k === c.k ? 1 : 0.35} /></span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="clickable" onClick={() => setSel(r)}>
                {cols.map((c) => <td key={c.k} className={(c.num ? 'num ' : '') + (c.mono ? 'mono ' : '')} style={{ minWidth: c.w, whiteSpace: c.w ? 'normal' : 'nowrap' }}>{renderCell(r, c.k)}</td>)}
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={cols.length} className="muted" style={{ textAlign: 'center', padding: 30 }}>No issues match these filters. Clear the filters or switch scope to All.</td></tr>}
          </tbody>
        </table>
      </div>

      <Callout title="How to use the registry">
        One issue per defect (search before logging). Always include the rule ID, sample IDs and failed record count. Status moves Under Review → Triaged → RCA → Remediation → Business Testing → Pending Validation → Closed. An issue is closed only after the next scan confirms the score change.
      </Callout>

      {sel && <IssueDrawer issue={sel} onClose={() => setSel(null)} />}
      {adding && <NewIssue onClose={() => setAdding(false)} onSave={(i) => { setRows([i, ...rows]); setAdding(false); setScope('All'); toast('Logged ' + i.id + ' (this session only)') }} nextId={`DQI-2026-0${125 + rows.length - ISSUES.length}`} />}
      {toastNode}
    </>
  )
}

function renderCell(r, k) {
  const v = r[k]
  if (k === 'priority') return <PriorityPill value={v} />
  if (k === 'status') return <StatusPill value={v} />
  if (k === 'score') return v ? v.toFixed(1) + '%' : '—'
  if (k === 'failed') return v.toLocaleString()
  if (k === 'cde') return v === 'No' ? <span className="muted">No</span> : <Pill tone={v === 'Tier 1' ? 'crit' : 'warn'}>{v}</Pill>
  if (k === 'target') return isOverdue(r) ? <span className="row" style={{ gap: 4, color: 'var(--crit-ink)', fontWeight: 600, flexWrap: 'nowrap' }}><AlertTriangle size={13} /> {v}</span> : v || '—'
  if (k === 'title') return <b style={{ fontWeight: 600 }}>{v}</b>
  return v || '—'
}

function IssueDrawer({ issue: i, onClose }) {
  const steps = ['Under Review', 'Triaged', 'RCA In Progress', 'Remediation In Progress', 'Business Testing', 'Pending Validation', 'Closed']
  const idx = i.status === 'Resolved' ? 6 : i.status === 'Escalated' ? 3 : steps.indexOf(i.status)
  const age = daysBetween(i.reported, i.resolved || TODAY)
  return (
    <>
      <div className="drawer-back" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label={i.id}>
        <div className="row between" style={{ flexWrap: 'nowrap' }}>
          <span className="mono muted">{i.id}</span>
          <button className="btn ghost sm" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <h2>{i.title}</h2>
        <div className="row" style={{ gap: 6 }}><PriorityPill value={i.priority} /><StatusPill value={i.status} /><Pill>{i.dim}</Pill>{i.cde !== 'No' && <Pill tone="neutral">{i.cde} CDE</Pill>}</div>
        {i.status === 'Rejected' ? (
          <Callout tone="warn">Rejected during triage: {i.remediation}</Callout>
        ) : (
          <div className="stack" style={{ gap: 6 }}>
            <div className="small muted">Lifecycle</div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${steps.length}, 1fr)`, gap: 3 }}>
              {steps.map((s, k) => <div key={s} title={s} style={{ height: 6, borderRadius: 3, background: k <= idx ? (i.status === 'Escalated' ? 'var(--crit)' : 'var(--accent)') : 'var(--surface-3)' }} />)}
            </div>
            <div className="row between xs muted"><span>Logged</span><span>Closed</span></div>
          </div>
        )}
        <div className="grid g2" style={{ gap: 10 }}>
          <div className="card flat" style={{ padding: 12 }}><div className="xs muted">Expected outcome</div><div className="small">{i.expected}</div></div>
          <div className="card flat" style={{ padding: 12, background: 'var(--crit-soft)' }}><div className="xs muted">Actual outcome</div><div className="small">{i.actual}</div></div>
        </div>
        <dl className="kv">
          <dt>Data domain</dt><dd>{i.domain}</dd>
          <dt>Data area</dt><dd>{i.product}</dd>
          <dt>Data asset</dt><dd className="mono">{i.asset}</dd>
          <dt>Data element</dt><dd>{i.element}</dd>
          <dt>Rule / Term ID</dt><dd className="mono">{i.rule} · {i.term}</dd>
          <dt>DQ score</dt><dd>{i.score ? i.score.toFixed(1) + '%' : '—'}</dd>
          <dt>Failed records</dt><dd>{i.failed.toLocaleString()}</dd>
          <dt>Sample IDs</dt><dd className="mono">{i.samples}</dd>
          <dt>Detected by</dt><dd>{i.channel} ({i.by})</dd>
          <dt>Reported on</dt><dd>{i.reported} · {age} days {i.resolved ? 'to resolve' : 'open'}</dd>
          <dt>Assigned to</dt><dd>{i.assigned}</dd>
          <dt>Steward / Owner</dt><dd>{i.steward} · {i.owner}</dd>
          <dt>Severity</dt><dd>{i.severity}</dd>
          <dt>Priority score</dt><dd>{i.pscore} / 100 · SLA {SLA[i.priority]} business days</dd>
          <dt>Target date</dt><dd>{i.target || '—'} {isOverdue(i) ? <Pill tone="crit" icon={AlertTriangle}>Overdue</Pill> : i.resolved ? <Pill tone="good" icon={CheckCircle2}>Done</Pill> : null}</dd>
          <dt>Root cause category</dt><dd>{i.source}</dd>
          <dt>Root cause</dt><dd>{i.rca || <span className="muted">Pending RCA</span>}</dd>
          <dt>Remediation</dt><dd>{i.remediation || <span className="muted">Not yet defined</span>}</dd>
          <dt>Date resolved</dt><dd>{i.resolved || '—'}</dd>
        </dl>
      </aside>
    </>
  )
}

function NewIssue({ onClose, onSave, nextId }) {
  const [d, setD] = useState({ title: '', domain: 'Customs', element: '', dim: 'Completeness', expected: '', actual: '', failed: '', samples: '', assigned: '', priority: 'Medium', source: 'Data entry' })
  const [err, setErr] = useState('')
  const set = (k) => (e) => setD({ ...d, [k]: e.target.value })
  const submit = (e) => {
    e.preventDefault()
    if (!d.title || !d.element || !d.expected || !d.actual) { setErr('Fill in the title, data element, expected outcome and actual outcome.'); return }
    onSave({
      id: nextId, ...d, failed: +d.failed || 0, product: '—', asset: '—', cde: 'No', rule: '—', term: '—', score: 0, channel: 'User', by: 'You', reported: TODAY,
      steward: '—', owner: '—', status: 'Under Review', severity: d.priority === 'Critical' ? 'High' : d.priority, pscore: 0, target: '', resolved: '', remediation: '', rca: '',
    })
  }
  const field = (k, l, props = {}) => (
    <label className="field" htmlFor={'ni-' + k}>{l}<input id={'ni-' + k} className="input" value={d[k]} onChange={set(k)} {...props} /></label>
  )
  const pick = (k, l, opts) => (
    <label className="field" htmlFor={'ni-' + k}>{l}<select id={'ni-' + k} className="input" value={d[k]} onChange={set(k)}>{opts.map((o) => <option key={o}>{o}</option>)}</select></label>
  )
  return (
    <>
      <div className="drawer-back" onClick={onClose} />
      <form className="drawer" onSubmit={submit} aria-label="Log a new issue">
        <div className="row between"><h2>Log a data quality issue</h2><button type="button" className="btn ghost sm" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
        <p className="small muted">Practice form. Entries stay in this browser session only.</p>
        {field('title', 'Issue title *', { placeholder: 'e.g., Exporter TIN missing on re-export declarations' })}
        <div className="grid g2" style={{ gap: 10 }}>
          {pick('domain', 'Data domain', ['Customs', 'Tax', 'E-Invoicing'])}
          {field('element', 'Data element *')}
          {pick('dim', 'Dimension', ['Completeness', 'Validity', 'Accuracy', 'Consistency', 'Uniqueness', 'Timeliness'])}
          {pick('source', 'Suspected source', ['Business change', 'Data entry', 'Source system / integration', 'Data warehouse / pipeline', 'BI query / report logic', 'Migration & reference data'])}
        </div>
        {field('expected', 'Expected outcome *')}
        {field('actual', 'Actual outcome *')}
        <div className="grid g2" style={{ gap: 10 }}>
          {field('failed', 'Failed record count', { type: 'number', min: 0 })}
          {field('samples', 'Sample IDs')}
          {field('assigned', 'Assigned to')}
          {pick('priority', 'Proposed priority', ['Critical', 'High', 'Medium', 'Low'])}
        </div>
        {err && <Callout tone="crit">{err}</Callout>}
        <div className="row"><button type="submit" className="btn primary">Log issue</button><button type="button" className="btn" onClick={onClose}>Cancel</button></div>
      </form>
    </>
  )
}
