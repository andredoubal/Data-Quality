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
  { t: 'Terminated employees still active in Payroll', v: { impact: 5, reg: 4, cde: 5, scale: 2, urgency: 5 } },
  { t: '18 orphan cost centers after reorg', v: { impact: 4, reg: 2, cde: 5, scale: 3, urgency: 4 } },
  { t: 'Work e-mail off-pattern for 4% of employees', v: { impact: 2, reg: 1, cde: 2, scale: 3, urgency: 2 } },
  { t: 'Preferred Language uses non-ISO codes', v: { impact: 1, reg: 1, cde: 1, scale: 3, urgency: 1 } },
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
          <Callout title="Severity vs. priority">
            <b>Severity</b> describes how bad the impact is. <b>Priority</b> decides the order we work in, combining severity with scale, criticality, compliance risk and urgency. A severe issue affecting 3 records before year-end may rank below a moderate one affecting every payslip next week.
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
      <Section title="Priority calculator" sub="Example: Cost Center missing for 236 active employees, the week before the quarterly cost allocation.">
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
              <tr><td className="mono">DQ00006</td><td className="mono">BT-0142</td><td>Employee</td><td>Status matches in HRIS and Payroll</td><td>7 terminated in HRIS, active in Payroll</td><td>2026-08-04</td><td>Karim Farouk</td><td><Pill tone="warn">In Progress</Pill></td><td>High</td><td><PriorityPill value="Critical" /></td><td>—</td><td>—</td></tr>
              <tr><td className="mono">DQ00001</td><td className="mono">BT-0007</td><td>Employee</td><td>Date of Birth populated</td><td>312 blank values</td><td>2026-06-10</td><td>Nadia Karim</td><td><Pill tone="good">Resolved</Pill></td><td>Medium</td><td><PriorityPill value="High" /></td><td>Data Entry</td><td>2026-07-02</td></tr>
            </tbody>
          </table>
        </div>
      </Section>
    </>
  )
}
