import { Siren, MessageSquareWarning, ScanLine, FileWarning, ClipboardList, BellRing } from 'lucide-react'
import { PageHead, Section, StepFlow, Callout } from '../components/ui.jsx'

const TRIGGERS = [
  { icon: ScanLine, t: 'Scheduled DQ scan', d: 'An Informatica scan shows a rule below threshold (e.g., HS code validity drops to 96.2%).' },
  { icon: MessageSquareWarning, t: 'User or taxpayer report', d: 'A risk analyst sees country of origin conflicting with the certificate; a taxpayer disputes an assessment.' },
  { icon: FileWarning, t: 'Revenue reconciliation', d: 'Customs duty on the dashboard does not reconcile to the treasury ledger.' },
  { icon: ClipboardList, t: 'Audit or international review', d: 'Internal audit or an international peer review questions the completeness of trade statistics.' },
  { icon: BellRing, t: 'Pipeline alert', d: 'The e-invoice feed to the warehouse fails its freshness check: data is 3 days old.' },
]

const PROCESS = [
  { title: 'Detect & raise', owner: ['consumer', 'custodian'], desc: 'The issue is spotted by a scan, a user or an alert and raised through the Issue Submission Portal.', out: 'Issue logged' },
  { title: 'Triage', owner: 'steward', desc: 'Validate it is a real DQ issue, not a duplicate or a definition question. Capture expected vs. actual outcome.', out: 'Valid / rejected' },
  { title: 'Prioritize', owner: ['steward', 'champion'], desc: 'Score impact, reach and urgency; the Champion confirms the high-priority list.', out: 'Priority & SLA' },
  { title: 'Contain', owner: ['steward', 'custodian'], desc: 'Warn report users, flag affected revenue figures, pause automated refunds or risk rules if needed.', out: 'Impact contained' },
  { title: 'Root cause', owner: ['custodian', 'source'], desc: 'Trace lineage, run 5 Whys, classify the source of the issue.', out: 'RCA record' },
  { title: 'Remediate', owner: ['source', 'custodian'], desc: 'Correct the data at the source and fix the process, system or code that created it.', out: 'Fix deployed' },
  { title: 'Validate & close', owner: ['steward', 'owner'], desc: 'Business testing, re-run the scan, confirm the DQ score changed, close the issue.', out: 'Closed with evidence' },
  { title: 'Prevent', owner: ['steward', 'architect'], desc: 'Add or tighten a rule or preventive control so it cannot recur silently.', out: 'New control' },
]

const EXAMPLES = [
  {
    t: 'Customs duty below the treasury ledger',
    s: 'July duty on the revenue dashboard is 4% lower than the treasury ledger.',
    r: '1,240 foreign-currency declarations were converted at a rate of 0 because the exchange rate feed publishes nothing on public holidays.',
    f: 'Reprocessed July, added a last-published-rate fallback and a completeness rule on exchange rates.',
  },
  {
    t: 'Output VAT doesn’t match e-invoices',
    s: '1,870 taxpayers declared output VAT more than 2% different from the VAT on the e-invoices they issued in Q2.',
    r: 'Taxpayers prepare returns from their general ledger, not from issued invoices, so credit notes and late invoices are missed.',
    f: 'Risk-based follow-up letters; VAT return now pre-filled from e-invoice totals.',
  },
  {
    t: 'Duplicate e-invoices in the warehouse',
    s: 'E-invoice counts jumped 18,040 overnight; invoice UUID uniqueness fell to 99.2%.',
    r: 'After an outage, a batch was replayed with INSERT instead of MERGE, loading the same invoices twice.',
    f: 'Removed duplicates, made the load idempotent on UUID, added a uniqueness DQ gate.',
  },
]

export default function Reactive() {
  return (
    <>
      <PageHead
        eyebrow="Chapter 1 · Mindset" icon={Siren}
        title="Reactive data quality"
        lead="Reactive data quality detects, investigates and repairs defects that already exist in our Customs, Tax and E-Invoicing data. It is unavoidable and valuable, but every reactive fix should also feed a proactive control."
      />

      <div className="grid g3">
        <div className="card stack">
          <h3>What it is</h3>
          <p className="small" style={{ color: 'var(--ink-2)' }}>Finding and fixing problems <b>after</b> the data is submitted: monitoring, issue management, root cause analysis, correction and validation.</p>
        </div>
        <div className="card stack">
          <h3>Why we still need it</h3>
          <p className="small" style={{ color: 'var(--ink-2)' }}>No prevention is perfect. Legacy registrations, tariff and law changes, and submission errors by brokers and taxpayers mean some defects will always get through.</p>
        </div>
        <div className="card stack">
          <h3>The risk</h3>
          <p className="small" style={{ color: 'var(--ink-2)' }}>Without discipline, teams fall into firefighting: adjusting revenue figures in spreadsheets, the same issue returns every filing period, and trust in the numbers erodes.</p>
        </div>
      </div>

      <Section title="What triggers a reactive response">
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
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

      <Comparison highlight="reactive" />

      <Callout tone="warn" title="Anti-patterns to avoid">
        Adjusting revenue figures in the warehouse or a report instead of fixing the source · closing an issue without re-running the scan · no root cause recorded · the same issue logged by three teams under three IDs.
      </Callout>
    </>
  )
}

export function Comparison({ highlight }) {
  const rows = [
    ['Goal', 'Prevent defects', 'Detect and repair defects'],
    ['Timing', 'Before / during submission and data movement', 'After data exists and is used'],
    ['Typical activities', 'Standards, submission validations, e-invoice clearance rules, DQ gates, change impact assessment', 'Scans, issue logging, triage, RCA, data correction, validation'],
    ['Primary owners', 'Data Owner, Architect, Source System Team', 'Data Steward, Custodian, Source System Team'],
    ['Success measure', '% issues prevented or caught at the gate', 'Time to detect, time to resolve, recurrence rate'],
    ['Example', 'Declaration form rejects an HS code not in the tariff in force', 'Scan finds 5,900 lines on a generic HS code; steward follows up with brokers'],
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
