import { useState } from 'react'
import { Siren, MessageSquareWarning, ScanLine, FileWarning, ClipboardList, BellRing } from 'lucide-react'
import { PageHead, Section, StepFlow, Callout } from '../components/ui.jsx'

const TRIGGERS = [
  { icon: ScanLine, t: 'Scheduled DQ scan', d: 'An Informatica scan shows a rule below threshold (e.g., Cost Center completeness drops to 91%).' },
  { icon: MessageSquareWarning, t: 'User complaint', d: 'An HR Business Partner says the headcount on the dashboard does not match their team list.' },
  { icon: FileWarning, t: 'Report reconciliation', d: 'Payroll totals do not reconcile to the HR compensation report.' },
  { icon: ClipboardList, t: 'Audit or regulator finding', d: 'Internal audit finds terminated employees who still have active system access.' },
  { icon: BellRing, t: 'Pipeline alert', d: 'A nightly load fails freshness: data is 3 days old.' },
]

const PROCESS = [
  { title: 'Detect & raise', owner: ['consumer', 'custodian'], desc: 'The issue is spotted by a scan, a user or an alert and raised through the Issue Submission Portal.', out: 'Issue logged' },
  { title: 'Triage', owner: 'steward', desc: 'Validate it is a real DQ issue, not a duplicate or a definition question. Capture expected vs. actual outcome.', out: 'Valid / rejected' },
  { title: 'Prioritize', owner: ['steward', 'champion'], desc: 'Score impact, reach and urgency; the Champion confirms the high-priority list.', out: 'Priority & SLA' },
  { title: 'Contain', owner: ['steward', 'custodian'], desc: 'Warn users, flag affected reports, apply a temporary workaround if needed.', out: 'Impact contained' },
  { title: 'Root cause', owner: ['custodian', 'source'], desc: 'Trace lineage, run 5 Whys, classify the source of the issue.', out: 'RCA record' },
  { title: 'Remediate', owner: ['source', 'custodian'], desc: 'Correct the data at the source and fix the process, system or code that created it.', out: 'Fix deployed' },
  { title: 'Validate & close', owner: ['steward', 'owner'], desc: 'Business testing, re-run the scan, confirm the DQ score changed, close the issue.', out: 'Closed with evidence' },
  { title: 'Prevent', owner: ['steward', 'architect'], desc: 'Add or tighten a rule or preventive control so it cannot recur silently.', out: 'New control' },
]

const EXAMPLES = [
  {
    t: 'Headcount mismatch after a reorg',
    s: 'Dashboard shows 4,812 active employees; HR operations count 4,760.',
    r: '52 employees moved to new cost centers that were never mapped to the reporting hierarchy, so they were counted in both old and new departments.',
    f: 'Mapped the new cost centers, re-ran the pipeline, added a rule: every active cost center must exist in the reporting hierarchy.',
  },
  {
    t: 'Terminated employees still paid',
    s: 'Payroll paid 7 employees one month after their termination date.',
    r: 'Terminations entered after the payroll cut-off were not sent by the HRIS → Payroll interface until the next cycle.',
    f: 'Recovered overpayments, added a late-termination alert and a daily delta interface.',
  },
  {
    t: 'Missing Date of Birth',
    s: 'Completeness of Date of Birth is 88% vs. a 95% target; pension eligibility report is wrong.',
    r: 'Contractor conversions created employee records without copying Date of Birth from the contractor profile.',
    f: 'Back-filled 312 records from source documents; made Date of Birth mandatory on the conversion form.',
  },
]

export default function Reactive() {
  const [records, setRecords] = useState(500)
  const [days, setDays] = useState(30)
  const [costPer, setCostPer] = useState(25)
  const reactiveCost = records * costPer * (1 + days / 30)
  const preventCost = records * (costPer / 10)

  return (
    <>
      <PageHead
        eyebrow="Chapter 1 · Mindset" icon={Siren}
        title="Reactive data quality"
        lead="Reactive data quality detects, investigates and repairs defects that already exist in our data. It is unavoidable and valuable, but it is the more expensive path, so every reactive fix should feed a proactive control."
      />

      <div className="grid g3">
        <div className="card stack">
          <h3>What it is</h3>
          <p className="small" style={{ color: 'var(--ink-2)' }}>Finding and fixing problems <b>after</b> the data is created: monitoring, issue management, root cause analysis, correction and validation.</p>
        </div>
        <div className="card stack">
          <h3>Why we still need it</h3>
          <p className="small" style={{ color: 'var(--ink-2)' }}>No prevention is perfect. Legacy data, business changes and human error mean some defects will always get through. We need a reliable way to catch and fix them.</p>
        </div>
        <div className="card stack">
          <h3>The risk</h3>
          <p className="small" style={{ color: 'var(--ink-2)' }}>Without discipline, teams fall into firefighting: fixing records in reports or spreadsheets, the same issue returns, and trust in the data erodes.</p>
        </div>
      </div>

      <Section title="What triggers a reactive response">
        <div className="grid g5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {TRIGGERS.map((x) => {
            const Icon = x.icon
            return (
              <div key={x.t} className="card flat stack" style={{ gap: 8 }}>
                <div className="icon-tile"><Icon size={18} /></div>
                <h4>{x.t}</h4>
                <p className="small" style={{ color: 'var(--ink-2)' }}>{x.d}</p>
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="The reactive process" sub="From detection to prevention. Step 8 is what turns reactive work into proactive protection.">
        <StepFlow steps={PROCESS} />
      </Section>

      <Section title="Examples from the field">
        <div className="grid g3">
          {EXAMPLES.map((e) => (
            <article key={e.t} className="card stack" style={{ gap: 10 }}>
              <h3>{e.t}</h3>
              <dl className="kv" style={{ gridTemplateColumns: '1fr' }}>
                <dt>Symptom</dt><dd>{e.s}</dd>
                <dt>Root cause</dt><dd>{e.r}</dd>
                <dt>Fix + prevention</dt><dd>{e.f}</dd>
              </dl>
            </article>
          ))}
        </div>
      </Section>

      <Section title="What does waiting cost?" sub="A rough model of the 1-10-100 rule. Adjust the inputs to see how quickly reactive costs outgrow prevention.">
        <div className="card grid g2" style={{ alignItems: 'center' }}>
          <div className="stack" style={{ gap: 14 }}>
            <label className="field" htmlFor="rc-records">Bad records: <b>{records.toLocaleString()}</b>
              <input id="rc-records" type="range" min="50" max="5000" step="50" value={records} onChange={(e) => setRecords(+e.target.value)} />
            </label>
            <label className="field" htmlFor="rc-days">Days until detected: <b>{days}</b>
              <input id="rc-days" type="range" min="1" max="180" value={days} onChange={(e) => setDays(+e.target.value)} />
            </label>
            <label className="field" htmlFor="rc-cost">Cost to correct one record after the fact ($): <b>{costPer}</b>
              <input id="rc-cost" type="range" min="5" max="200" step="5" value={costPer} onChange={(e) => setCostPer(+e.target.value)} />
            </label>
            <p className="xs muted">Model: reactive = records × cost × (1 + days/30) for downstream rework; prevention ≈ one tenth of correction cost per record.</p>
          </div>
          <div className="grid g2">
            <div className="card flat stack" style={{ gap: 4, background: 'var(--good-soft)' }}>
              <span className="small">Prevent at entry</span>
              <span className="big-num">${Math.round(preventCost).toLocaleString()}</span>
            </div>
            <div className="card flat stack" style={{ gap: 4, background: 'var(--crit-soft)' }}>
              <span className="small">Fix reactively</span>
              <span className="big-num">${Math.round(reactiveCost).toLocaleString()}</span>
            </div>
            <p className="small" style={{ gridColumn: '1 / -1' }}>Reactive path is <b>{(reactiveCost / preventCost).toFixed(0)}×</b> more expensive in this scenario.</p>
          </div>
        </div>
      </Section>

      <Comparison highlight="reactive" />

      <Callout tone="warn" title="Anti-patterns to avoid">
        Fixing data in the warehouse or in a report instead of at the source · closing an issue without re-running the scan · no root cause recorded · the same issue logged by three people under three IDs.
      </Callout>
    </>
  )
}

export function Comparison({ highlight }) {
  const rows = [
    ['Goal', 'Prevent defects', 'Detect and repair defects'],
    ['Timing', 'Before / during data creation and movement', 'After data exists and is used'],
    ['Typical activities', 'Standards, validations, DQ gates, change impact assessment, training', 'Scans, issue logging, triage, RCA, data correction, validation'],
    ['Primary owners', 'Data Owner, Architect, Source System Team', 'Data Steward, Custodian, Source System Team'],
    ['Cost profile', 'Low, upfront, scales well', 'High, recurring, grows with delay'],
    ['Success measure', '% issues prevented or caught at the gate', 'Time to detect, time to resolve, recurrence rate'],
    ['Example', 'Hire Date cannot be before Date of Birth + 16 years on the HRIS form', 'Scan finds 41 records where Hire Date < DOB + 16; steward corrects them'],
  ]
  return (
    <Section title="Proactive vs. reactive at a glance">
      <div className="table-wrap">
        <table className="t">
          <thead>
            <tr>
              <th style={{ width: '18%' }}></th>
              <th style={highlight === 'proactive' ? { background: 'var(--accent-soft)', color: 'var(--accent-ink)' } : {}}>Proactive</th>
              <th style={highlight === 'reactive' ? { background: 'var(--accent-soft)', color: 'var(--accent-ink)' } : {}}>Reactive</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[0]}>
                <td style={{ fontWeight: 600 }}>{r[0]}</td>
                <td>{r[1]}</td>
                <td>{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  )
}
