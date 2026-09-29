import { useState } from 'react'
import { Flag, ScanLine, MessageSquareWarning, FileWarning, ClipboardList, BellRing, ScanSearch } from 'lucide-react'
import Block from '../../components/Block.jsx'
import { Section, StepFlow, Callout, Swimlane, SwimLegend, PriorityPill, Pill } from '../../components/ui.jsx'
import { ISSUE_WF } from '../../data/workflows.js'
import { PRIORITY_CRITERIA, priorityScore, priorityOf, SLA } from '../../data/priority.js'

const CHANNELS = [
  [ScanLine, 'Scheduled DQ scans', 'Rules below threshold in Informatica CDQ'],
  [ScanSearch, 'Profiling', 'Anomalies found during quarterly baselining'],
  [MessageSquareWarning, 'Users', 'Raised through the Issue Submission Portal'],
  [FileWarning, 'Reconciliations', 'Control totals that don’t match between systems'],
  [BellRing, 'Pipeline alerts', 'Failed loads, schema changes, freshness breaches'],
  [ClipboardList, 'Audit & risk', 'Findings from internal audit or compliance reviews'],
]

const FIELDS = [
  ['Domain & expected outcome', ['Business Rule ID(s)', 'Business Term ID(s)', 'Data Domain', 'Data Product / Asset / Element', 'Expected Outcome', 'Actual Outcome']],
  ['Evidence', ['DQ Score', 'Failed Record Count', 'Sample IDs', 'Screenshot / query']],
  ['Issue tracking', ['Reported On', 'Reported By', 'Assigned To', 'Current Status']],
  ['Prioritization', ['Severity', 'Priority', 'Target Date (SLA)']],
  ['Root cause & resolution', ['Root Cause Category', 'Remediation Summary', 'Date Resolved']],
]

const EXAMPLES = [
  { t: 'Output VAT in returns does not reconcile to e-invoices', v: { impact: 5, reg: 4, cde: 5, scale: 4, urgency: 4 } },
  { t: 'Import VAT not transferred to the tax ledger', v: { impact: 5, reg: 3, cde: 5, scale: 2, urgency: 5 } },
  { t: 'Retired port codes on transit declarations', v: { impact: 2, reg: 1, cde: 4, scale: 1, urgency: 2 } },
  { t: 'Placeholder text in trader trading names', v: { impact: 1, reg: 1, cde: 1, scale: 4, urgency: 1 } },
]

export default function Issues({ go }) {
  return (
    <Block
      go={go}
      icon={Flag}
      title="Issue identification & prioritization"
      lead="An issue is any case where data doesn't meet an agreed rule or a reasonable business expectation. Identification makes sure every issue is captured once, with evidence. Prioritization makes sure we spend effort where the business impact is highest."
      facts={[
        ['Logged in', 'Issue Registry / Submission Portal'],
        ['Triaged by', 'Data Steward'],
        ['Priority confirmed by', 'Data Champion'],
        ['Scored on', '5 weighted criteria → 0–100'],
      ]}
      templates={['Issue Log', 'Priority Scoring']}
      process={
        <>
          <Section title="From detection to a prioritized backlog">
            <StepFlow
              steps={[
                { title: 'Detect', owner: ['custodian', 'consumer'], desc: 'Scan, profile, user report, reconciliation, alert or audit finding.' },
                { title: 'Raise & log', owner: ['steward', 'custodian'], desc: 'Record expected vs. actual outcome, rule ID, sample IDs and failed record count.', out: 'Issue ID' },
                { title: 'Validate', owner: 'steward', desc: 'Is it a real defect? Check for duplicates, definition misunderstandings or legitimate exceptions.', out: 'Valid / rejected' },
                { title: 'Assess severity', owner: 'steward', desc: 'How bad is the impact if nothing is done?', out: 'Severity' },
                { title: 'Score priority', owner: 'steward', desc: 'Score the 5 weighted criteria to get a 0–100 priority score and SLA.', out: 'Priority & SLA' },
                { title: 'Confirm list', owner: 'champion', desc: 'Review and confirm the high-priority list; resolve conflicts with the Data Owner.', out: 'Confirmed backlog' },
                { title: 'Assign', owner: ['steward', 'custodian'], desc: 'Assign to the team who will do root cause analysis.', out: 'Assigned issue' },
              ]}
            />
          </Section>
          <Section title="Issue management & resolution workflow" sub="The full workflow, including solution approval, escalation and closure.">
            <SwimLegend />
            <Swimlane {...ISSUE_WF} />
          </Section>
        </>
      }
      framework={
        <>
          <Section title="Detection channels">
            <div className="grid g3">
              {CHANNELS.map(([Icon, t, d]) => (
                <div key={t} className="card flat row" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
                  <div className="icon-tile"><Icon size={18} /></div>
                  <div><h4>{t}</h4><p className="small" style={{ color: 'var(--ink-2)' }}>{d}</p></div>
                </div>
              ))}
            </div>
          </Section>
          <Section title="What every issue must capture" sub="These fields can be integrated into any intake or ticketing platform.">
            <div className="grid g3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              {FIELDS.map(([g, f]) => (
                <div key={g} className="card flat stack" style={{ gap: 6 }}>
                  <h4>{g}</h4>
                  <ul className="bullets small">{f.map((x) => <li key={x}>{x}</li>)}</ul>
                </div>
              ))}
            </div>
          </Section>
          <Section title="Priority scoring model" sub="Each criterion scored 1–5, weighted, then scaled to 0–100.">
            <div className="table-wrap">
              <table className="t">
                <thead><tr><th>Criterion</th><th className="num">Weight</th><th>1</th><th>3</th><th>5</th></tr></thead>
                <tbody>
                  {PRIORITY_CRITERIA.map((c) => (
                    <tr key={c.id}><td style={{ fontWeight: 600 }}>{c.label}</td><td className="num">{Math.round(c.w * 100)}%</td><td className="small">{c.scale[0]}</td><td className="small">{c.scale[2]}</td><td className="small">{c.scale[4]}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid g4">
              {Object.entries(SLA).map(([p, d]) => (
                <div key={p} className="card flat stack" style={{ gap: 6 }}>
                  <PriorityPill value={p} />
                  <span className="small">{p === 'Critical' ? '80–100' : p === 'High' ? '60–79' : p === 'Medium' ? '40–59' : '0–39'} points</span>
                  <span className="small muted">Resolve within {d} business days</span>
                </div>
              ))}
            </div>
          </Section>
          <RequestMatrix />
          <Callout title="Severity vs. priority">
            <b>Severity</b> describes how bad the impact is. <b>Priority</b> decides the order we work in, combining severity with scale, criticality, compliance risk and urgency. A severe issue affecting 3 declarations may rank below a moderate one affecting every e-invoice cleared through FATOORA next week.
          </Callout>
        </>
      }
      example={<PriorityLab />}
    />
  )
}

function PriorityLab() {
  const [v, setV] = useState({ impact: 4, reg: 3, cde: 5, scale: 3, urgency: 4 })
  const score = priorityScore(v)
  const p = priorityOf(score)
  return (
    <>
      <Section title="Priority calculator" sub="Example: 1,240 declarations converted at an exchange rate of 0, the week before the monthly revenue report.">
        <div className="card grid g2" style={{ alignItems: 'center' }}>
          <div className="stack" style={{ gap: 12 }}>
            {PRIORITY_CRITERIA.map((c) => (
              <label key={c.id} className="field" htmlFor={'pc-' + c.id}>
                <span className="row between"><span>{c.label} <span className="muted">({Math.round(c.w * 100)}%)</span></span><b>{v[c.id]} · {c.scale[v[c.id] - 1]}</b></span>
                <input id={'pc-' + c.id} type="range" min="1" max="5" value={v[c.id]} onChange={(e) => setV({ ...v, [c.id]: +e.target.value })} />
              </label>
            ))}
          </div>
          <div className="stack" style={{ alignItems: 'center', textAlign: 'center', gap: 10 }}>
            <span className="muted small">Priority score</span>
            <span className="big-num" style={{ fontSize: '3.6rem' }}>{score}</span>
            <PriorityPill value={p} />
            <span className="small muted">Target resolution: {SLA[p]} business days</span>
          </div>
        </div>
      </Section>
      <Section title="Scored examples">
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>Issue</th>{PRIORITY_CRITERIA.map((c) => <th key={c.id} className="num">{c.label.split(' ')[0]}</th>)}<th className="num">Score</th><th>Priority</th><th>SLA</th></tr></thead>
            <tbody>
              {EXAMPLES.map((e) => {
                const s = priorityScore(e.v)
                const pr = priorityOf(s)
                return (
                  <tr key={e.t}>
                    <td style={{ fontWeight: 600 }}>{e.t}</td>
                    {PRIORITY_CRITERIA.map((c) => <td key={c.id} className="num">{e.v[c.id]}</td>)}
                    <td className="num" style={{ fontWeight: 700 }}>{s}</td><td><PriorityPill value={pr} /></td><td className="small">{SLA[pr]} days</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>
      <Section title="Sample issue log entries" sub="How two issues look when logged with the required fields.">
        <div className="table-wrap">
          <table className="t navy-head">
            <thead><tr><th>Rule ID</th><th>Term ID</th><th>Domain</th><th>Expected outcome</th><th>Actual outcome</th><th>Reported on</th><th>Assigned to</th><th>Status</th><th>Severity</th><th>Priority</th><th>Root cause</th><th>Resolved</th></tr></thead>
            <tbody>
              <tr><td className="mono">DQ00008</td><td className="mono">BT-0210</td><td>Tax</td><td>Output VAT within 2% of e-invoice VAT</td><td>1,870 taxpayers differ by more than 2%</td><td>2026-08-04</td><td>Karim Farouk</td><td><Pill tone="warn">In Progress</Pill></td><td>High</td><td><PriorityPill value="Critical" /></td><td>—</td><td>—</td></tr>
              <tr><td className="mono">DQ00014</td><td className="mono">BT-0305</td><td>E-Invoicing</td><td>Real buyer VAT number on B2B invoices</td><td>41,200 invoices use 000000000000000</td><td>2026-06-10</td><td>Huda Rahman</td><td><Pill tone="good">Resolved</Pill></td><td>Medium</td><td><PriorityPill value="High" /></td><td>Data Entry</td><td>2026-07-02</td></tr>
            </tbody>
          </table>
        </div>
      </Section>
    </>
  )
}

const FACTORS = [
  ['Requestor-assigned priority', 'Priority given by the requestor on the intake form.'],
  ['Benefits', 'Revenue protected, faster clearance at FASAH, fewer taxpayer disputes, better risk targeting.'],
  ['Available funding', 'Budget approved for the remediation or project.'],
  ['Data sensitivity', 'NDMO classification (Top Secret / Secret / Restricted / Public) and impact of poor-quality taxpayer data.'],
  ['Program dependency', 'Needed by a large program, e.g., the next FATOORA integration wave or a FASAH release.'],
  ['External requirements', 'VAT and customs law, GCC obligations, international reporting (WCO, OECD).'],
  ['Resource availability', 'Stewards, profilers, source system teams and SMEs available to do the work.'],
]
const VALUE_C = ['Breadth of use', 'Use cases supported', 'Strategic alignment', 'Financial benefit']
const EFFORT_C = ['Source system complexity', 'Number of data elements', 'SME availability (5 = scarce)', 'Budget gap (5 = unfunded)', 'Timeline pressure']
const REQUESTS = [
  { id: 'R1', t: 'Reconcile output VAT to FATOORA e-invoices', v: 4.8, e: 2.2 },
  { id: 'R2', t: 'Cleanse legacy trader registry in FASAH', v: 2.1, e: 4.2 },
  { id: 'R3', t: 'SAMA exchange rate holiday fallback', v: 4.2, e: 1.4 },
  { id: 'R4', t: 'Re-classify generic HS codes (e-commerce)', v: 4.4, e: 4.1 },
  { id: 'R5', t: 'Standardize port codes to UN/LOCODE', v: 1.8, e: 1.6 },
  { id: 'R6', t: 'Merge duplicate VAT registrations per CR', v: 3.6, e: 3.4 },
]
const quad = (v, e) => (v >= 3 ? (e >= 3 ? 'Prioritize' : 'Execute') : e >= 3 ? 'Defer' : 'Delay & schedule')
const QTONE = { Execute: 'good', Prioritize: 'accent', 'Delay & schedule': 'warn', Defer: 'neutral' }

function RequestMatrix() {
  const [val, setVal] = useState([4, 3, 4, 3])
  const [eff, setEff] = useState([2, 2, 3, 2, 3])
  const v = val.reduce((a, b) => a + b, 0) / val.length
  const e = eff.reduce((a, b) => a + b, 0) / eff.length
  const S = 300, pad = 34
  // x axis: effort High (left) to Low (right); y axis: value Low (bottom) to High (top)
  const X = (ef) => pad + ((5 - ef) / 4) * (S - pad - 10)
  const Y = (va) => 10 + ((5 - va) / 4) * (S - pad - 10)
  const mid = { x: X(3), y: Y(3) }
  const slider = (label, arr, set, i, id) => (
    <label key={label} className="field" htmlFor={id}>
      <span className="row between"><span>{label}</span><b>{arr[i]}</b></span>
      <input id={id} type="range" min="1" max="5" value={arr[i]} onChange={(ev) => set(arr.map((x, k) => (k === i ? +ev.target.value : x)))} />
    </label>
  )
  return (
    <Section title="DQ request prioritization: value vs. effort" sub="For remediation requests and DQ projects competing for the same team, score weighted value against weighted effort and place each request on the matrix.">
      <div className="card tint stack" style={{ gap: 8 }}>
        <h4>Prioritization factors</h4>
        <div className="grid g2" style={{ gap: 8 }}>
          {FACTORS.map(([k, d]) => <p key={k} className="small"><b>{k}:</b> <span style={{ color: 'var(--ink-2)' }}>{d}</span></p>)}
        </div>
      </div>
      <div className="grid g2" style={{ alignItems: 'start' }}>
        <div className="card stack" style={{ gap: 12 }}>
          <div className="small muted">Score a new request, e.g. <b>validate QR codes on simplified invoices</b>. 1 = low, 5 = high.</div>
          <h4>Weighted value / impact · {v.toFixed(1)}</h4>
          {VALUE_C.map((c, i) => slider(c, val, setVal, i, 'rv-' + i))}
          <h4>Weighted effort / complexity · {e.toFixed(1)}</h4>
          {EFFORT_C.map((c, i) => slider(c, eff, setEff, i, 're-' + i))}
          <div className="row"><span className="small">Recommendation:</span><Pill tone={QTONE[quad(v, e)]}>{quad(v, e)}</Pill></div>
        </div>
        <div className="card stack" style={{ alignItems: 'center' }}>
          <svg viewBox={`0 0 ${S} ${S}`} width="100%" style={{ maxWidth: 420 }} role="img" aria-label="Value versus effort matrix">
            <rect x={pad} y="10" width={S - pad - 10} height={S - pad - 10} fill="var(--surface)" stroke="var(--line-strong)" />
            <rect x={mid.x} y="10" width={S - 10 - mid.x} height={mid.y - 10} fill="var(--good-soft)" />
            <line x1={mid.x} x2={mid.x} y1="10" y2={S - pad} stroke="var(--line-strong)" strokeWidth="2" />
            <line x1={pad} x2={S - 10} y1={mid.y} y2={mid.y} stroke="var(--line-strong)" strokeWidth="2" />
            {[['Prioritize', (pad + mid.x) / 2, mid.y - 8], ['Execute', (mid.x + S - 10) / 2, mid.y - 8], ['Defer', (pad + mid.x) / 2, S - pad - 10], ['Delay & schedule', (mid.x + S - 10) / 2, S - pad - 10]].map(([t, x, y]) => (
              <text key={t} x={x} y={y} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--ink-2)">{t}</text>
            ))}
            <text x={pad} y={S - pad + 16} fontSize="10" fill="var(--muted)">High</text>
            <text x={S - 10} y={S - pad + 16} fontSize="10" fill="var(--muted)" textAnchor="end">Low</text>
            <text x={(pad + S) / 2} y={S - 4} fontSize="10.5" fill="var(--ink-2)" textAnchor="middle">Weighted effort / complexity</text>
            <text x="12" y={(S - pad) / 2} fontSize="10.5" fill="var(--ink-2)" textAnchor="middle" transform={`rotate(-90 12 ${(S - pad) / 2})`}>Weighted value / impact</text>
            {REQUESTS.map((r) => (
              <g key={r.id}>
                <circle cx={X(r.e)} cy={Y(r.v)} r="10" fill="var(--s1)" stroke="var(--surface)" strokeWidth="2"><title>{r.t}</title></circle>
                <text x={X(r.e)} y={Y(r.v) + 3.5} textAnchor="middle" fontSize="9" fontWeight="700" fill="#ffffff">{r.id}</text>
              </g>
            ))}
            <circle cx={X(e)} cy={Y(v)} r="11" fill="var(--s2)" stroke="var(--surface)" strokeWidth="2" />
            <text x={X(e)} y={Y(v) + 3.5} textAnchor="middle" fontSize="9" fontWeight="700" fill="#ffffff">New</text>
          </svg>
          <div className="legend"><span><i style={{ background: 'var(--s1)', borderRadius: '50%' }} />Backlog request</span><span><i style={{ background: 'var(--s2)', borderRadius: '50%' }} />Request you are scoring</span></div>
        </div>
      </div>
      <div className="table-wrap">
        <table className="t">
          <thead><tr><th>#</th><th>Request</th><th className="num">Value</th><th className="num">Effort</th><th>Decision</th></tr></thead>
          <tbody>
            {REQUESTS.map((r) => (
              <tr key={r.id}><td className="mono">{r.id}</td><td>{r.t}</td><td className="num">{r.v.toFixed(1)}</td><td className="num">{r.e.toFixed(1)}</td><td><Pill tone={QTONE[quad(r.v, r.e)]}>{quad(r.v, r.e)}</Pill></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  )
}
