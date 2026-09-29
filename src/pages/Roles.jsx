import { useState } from 'react'
import { Users, Clock } from 'lucide-react'
import { PageHead, Section, Callout } from '../components/ui.jsx'
import { ROLES, RACI_ACTIVITIES } from '../data/roles.js'

const RACI_LABEL = { R: 'Responsible', A: 'Accountable', C: 'Consulted', I: 'Informed' }
const RACI_STYLE = {
  R: { background: 'var(--accent)', color: 'var(--on-accent)' },
  A: { background: 'var(--navy)', color: '#fff' },
  C: { background: 'var(--accent-soft)', color: 'var(--accent-ink)' },
  I: { background: 'var(--surface-2)', color: 'var(--ink-2)' },
}

export default function Roles() {
  const [sel, setSel] = useState('steward')
  const r = ROLES.find((x) => x.id === sel)
  return (
    <>
      <PageHead
        eyebrow="Chapter 3 · People" icon={Users}
        title="Who is responsible for data quality?"
        lead="Everyone who touches data affects its quality, but accountability must be explicit. The business owns the data and defines what good looks like; technology implements and runs the controls; governance forums hold everyone to the standard."
      />

      <div className="grid g3">
        <div className="card tint stack"><div className="eyebrow">Business</div><h3>Owns & defines</h3><p className="small">Data Owner, Data Steward, Data Champion. They decide what quality means and which issues matter most.</p></div>
        <div className="card tint stack"><div className="eyebrow">Technology</div><h3>Implements & runs</h3><p className="small">Data Custodian, Source System Team, Data Architect. They build rules, pipelines, scans and fixes.</p></div>
        <div className="card tint stack"><div className="eyebrow">Governance</div><h3>Oversees & arbitrates</h3><p className="small">DG Council and Working Group. They set standards, review metrics quarterly and resolve conflicts.</p></div>
      </div>

      <Section title="The roles" sub="Select a role to see its responsibilities and highlight it in the RACI below.">
        <div className="grid g4">
          {ROLES.map((x) => (
            <button key={x.id} onClick={() => setSel(x.id)} className="card flat stack" style={{ gap: 6, textAlign: 'left', cursor: 'pointer', borderColor: sel === x.id ? x.color : 'var(--line)', borderWidth: sel === x.id ? 2 : 1, padding: sel === x.id ? 19 : 20 }}>
              <div className="row" style={{ gap: 8 }}>
                <span className="dot" style={{ background: x.color, width: 12, height: 12 }} />
                <h4>{x.name}</h4>
              </div>
              <p className="small" style={{ color: 'var(--ink-2)' }}>{x.mission}</p>
            </button>
          ))}
        </div>
        <div className="card grid g2">
          <div className="stack">
            <div className="row" style={{ gap: 8 }}><span className="dot" style={{ background: r.color, width: 14, height: 14 }} /><h2>{r.name}</h2></div>
            <p style={{ color: 'var(--ink-2)' }}><b>Who:</b> {r.who}</p>
            <p className="row small muted" style={{ gap: 6 }}><Clock size={14} /> Typical effort: {r.time}</p>
          </div>
          <div className="stack">
            <h4>Key responsibilities</h4>
            <ul className="bullets small">{r.does.map((d) => <li key={d}>{d}</li>)}</ul>
          </div>
        </div>
      </Section>

      <Section title="The Data Quality Office" sub="A small central team runs the DQ request process across Customs, Tax and E-Invoicing (see the DQ request lifecycle in the Framework chapter).">
        <div className="grid g3">
          {[
            ['Head of DQ / DQ Manager', 'Prioritizes submitted requests, schedules DQ projects, oversees assessments, gives direction for root cause analysis and reviews remediation plans.'],
            ['DQ Profiler', 'Confirms the scope and data access, runs and publishes profiling, works with stakeholders on root causes and helps write remediation plans. Works closely with the Data Custodian.'],
            ['Requestor', 'Any business team (e.g., Revenue Analytics, Risk Management) that submits a DQ request through the Intake Form, reviews results and takes the remediation plan to funding approval.'],
          ].map(([t, d]) => (
            <div key={t} className="card flat stack" style={{ gap: 6 }}><h4>{t}</h4><p className="small" style={{ color: 'var(--ink-2)' }}>{d}</p></div>
          ))}
        </div>
      </Section>

      <Section title="RACI matrix" sub="R = does the work · A = signs off, one per activity · C = gives input · I = kept informed.">
        <div className="legend">
          {Object.entries(RACI_LABEL).map(([k, v]) => (
            <span key={k}><i style={{ ...RACI_STYLE[k], width: 18, height: 18, display: 'inline-grid', placeItems: 'center', fontStyle: 'normal', fontSize: 11, fontWeight: 700 }}>{k}</i>{v}</span>
          ))}
        </div>
        <div className="table-wrap">
          <table className="t">
            <thead>
              <tr>
                <th>Activity</th>
                {ROLES.map((x) => (
                  <th key={x.id} style={{ textAlign: 'center', ...(sel === x.id ? { background: 'var(--accent-soft)', color: 'var(--accent-ink)' } : {}) }}>
                    <button className="btn ghost sm" style={{ padding: 0, fontWeight: 600, fontSize: '0.74rem', color: 'inherit' }} onClick={() => setSel(x.id)}>{x.short}</button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RACI_ACTIVITIES.map((row) => (
                <tr key={row.a}>
                  <td style={{ fontWeight: 500, minWidth: 220 }}>{row.a}</td>
                  {ROLES.map((x) => {
                    const v = row.r[x.id]
                    return (
                      <td key={x.id} style={{ textAlign: 'center', background: sel === x.id ? 'var(--surface-2)' : undefined }}>
                        {v && <span title={RACI_LABEL[v]} style={{ ...RACI_STYLE[v], display: 'inline-grid', placeItems: 'center', width: 24, height: 24, borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{v}</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Callout title="The golden rule of ownership">
        Data is fixed where it is created. The Custodian can detect and report a problem in the warehouse, but the correction happens in FASAH, the ZATCA tax system or FATOORA (or with the broker or taxpayer who submitted it), approved by the Data Owner.
      </Callout>
    </>
  )
}
