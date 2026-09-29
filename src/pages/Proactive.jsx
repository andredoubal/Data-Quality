import { useState } from 'react'
import { ShieldCheck, PenLine, Plug, Database, BarChart3, GitPullRequest, Check as CheckIcon } from 'lucide-react'
import { PageHead, Section, StepFlow, Callout, Check } from '../components/ui.jsx'
import { Comparison } from './Reactive.jsx'

const STAGES = [
  {
    id: 'design', label: 'Design & change', icon: GitPullRequest,
    q: 'Stop defects before a law, tariff, system or process change goes live.',
    controls: [
      'Data impact assessment for every tariff update, tax rate change and new e-invoicing wave',
      'Identify CDEs and define DQ rules before go-live, not after the first bad revenue report',
      'Data contracts between systems: fields, formats, code lists and timing',
      'Reference data (tariff, exchange rates, port codes) agreed with the Data Owner and loaded ahead of time',
    ],
    example: 'The 2027 tariff schedule is loaded into the test environment 30 days before 1 January. Declarations from the last quarter are re-classified against it in a parallel run, so the 140 retired codes are spotted before brokers ever use them.',
  },
  {
    id: 'entry', label: 'Data entry & submission', icon: PenLine,
    q: 'Make it easy for brokers and taxpayers to submit correct data and hard to submit it wrong.',
    controls: [
      'Declaration form validates HS code against the tariff in force and country of origin against ISO 3166',
      'Customs value (CIF) calculated automatically from FOB, freight and insurance',
      'E-invoicing platform rejects invoices that fail the XML schema or business rules at clearance',
      'VAT number format validation (15 digits, starts and ends with 3) and placeholder blocking (e.g., 000000000000000)',
    ],
    example: 'At clearance, FATOORA rejects a standard B2B invoice whose buyer VAT number is missing or not in the Saudi 15-digit format (starting and ending with 3), and returns a clear error code to the taxpayer’s system in real time.',
  },
  {
    id: 'integration', label: 'Integration', icon: Plug,
    q: 'Guarantee that what leaves one system arrives complete and unchanged in the next.',
    controls: [
      'Record-count and amount reconciliation for every interface run',
      'Schema-change detection with alerting',
      'Reject-and-quarantine of records failing mandatory checks, never silent drops',
      'Interface monitoring with SLAs and a named owner on call',
    ],
    example: 'Every night, the FASAH → ZATCA tax ledger interface compares 18,402 declarations and SAR 41.7M in import VAT sent against what the tax ledger received, and blocks the posting run if either total differs.',
  },
  {
    id: 'pipeline', label: 'Warehouse & pipelines', icon: Database,
    q: 'Put quality gates in the pipeline so bad data never reaches the gold layer.',
    controls: [
      'Informatica CDQ rules executed as pipeline steps (DQ gates)',
      'Freshness checks: e-invoice data no older than 24 hours',
      'Referential integrity: every seller VAT number exists in the taxpayer registry',
      'Idempotent loads (merge on UUID or declaration number) so replays never duplicate',
    ],
    example: 'The hourly e-invoice pipeline stops promotion to the gold layer when more than 0.5% of invoices have a seller VAT number that isn’t active in the taxpayer registry, and alerts the Custodian on duty.',
  },
  {
    id: 'consumption', label: 'Reporting & BI', icon: BarChart3,
    q: 'Make sure every revenue and compliance report uses the same definitions and certified data.',
    controls: [
      'Certified datasets and a business glossary (e.g., "Active VAT taxpayer", "VAT collected")',
      'Reconciliation of new report logic to the treasury ledger before release',
      'DQ scores shown next to the report (trust indicator)',
      'Semantic layer so each revenue measure is defined once',
    ],
    example: 'The revenue dashboard reads only from the certified Revenue dataset, which counts only the latest amendment of each VAT return, and shows the current DQ score for VAT Returns in its header.',
  },
]

const PROCESS = [
  { title: 'Identify CDEs', owner: ['steward', 'owner'], desc: 'Agree which elements drive revenue, compliance and border decisions (TIN, HS code, customs value, VAT amounts).', out: 'Approved CDE list' },
  { title: 'Define rules & thresholds', owner: ['steward', 'custodian'], desc: 'Write logical rules per dimension; set green/amber/red thresholds.', out: 'Rule definitions' },
  { title: 'Embed controls at submission', owner: ['source', 'architect'], desc: 'Validations in declaration forms, return forms and e-invoice clearance.', out: 'Preventive controls' },
  { title: 'Automate DQ gates', owner: 'custodian', desc: 'Run rules in pipelines and block or quarantine failing loads.', out: 'Pipeline DQ gates' },
  { title: 'Assess every change', owner: ['champion', 'architect'], desc: 'Data impact assessment for tariff updates, tax changes and new e-invoicing waves.', out: 'Impact assessment' },
  { title: 'Guide & certify', owner: ['owner', 'steward'], desc: 'Publish broker and taxpayer guidance; certify datasets and report definitions.', out: 'Guidance, certified data' },
]

export default function Proactive() {
  const [stage, setStage] = useState('entry')
  const s = STAGES.find((x) => x.id === stage)
  return (
    <>
      <PageHead
        eyebrow="Chapter 1 · Mindset" icon={ShieldCheck}
        title="Proactive data quality"
        lead="Proactive data quality prevents defects from being created or from travelling downstream. It builds controls into declaration forms, returns, e-invoice clearance, interfaces and pipelines so that quality is designed in, not inspected in afterwards."
      />

      <div className="grid g3">
        <div className="card stack">
          <h3>What it is</h3>
          <p className="small" style={{ color: 'var(--ink-2)' }}>Controls that act <b>before</b> or <b>as</b> data is submitted or moved: validation, standards, approvals, automated gates and change impact assessment.</p>
        </div>
        <div className="card stack">
          <h3>Why it matters</h3>
          <p className="small" style={{ color: 'var(--ink-2)' }}>A wrong HS code or VAT amount that is stopped at submission never reaches revenue reports, risk engines or refunds. Rejecting it at the door is far simpler than chasing a taxpayer or broker months later.</p>
        </div>
        <div className="card stack">
          <h3>When we use it</h3>
          <p className="small" style={{ color: 'var(--ink-2)' }}>New systems, new e-invoicing waves, tariff and tax changes, new interfaces and new reports. Any time data is about to be created or change shape.</p>
        </div>
      </div>

      <Section title="Control points along the data journey" sub="Select a stage to see the preventive controls that belong there and a real example.">
        <div className="row" style={{ gap: 8 }}>
          {STAGES.map((x, i) => {
            const Icon = x.icon
            return (
              <button key={x.id} className={'btn' + (stage === x.id ? ' primary' : '')} onClick={() => setStage(x.id)}>
                <span className="mono xs" style={{ opacity: 0.7 }}>{i + 1}</span> <Icon size={15} /> {x.label}
              </button>
            )
          })}
        </div>
        <div className="grid g2">
          <div className="card stack">
            <h3>{s.label}</h3>
            <p style={{ color: 'var(--ink-2)' }}>{s.q}</p>
            <ul className="clean small">{s.controls.map((c) => <Check key={c}>{c}</Check>)}</ul>
          </div>
          <div className="card tint stack">
            <div className="eyebrow">Example</div>
            <p>{s.example}</p>
          </div>
        </div>
      </Section>

      <Section title="The proactive process" sub="Run once when a data asset is onboarded, then again whenever the law, tariff, business or system changes.">
        <StepFlow steps={PROCESS} />
      </Section>

      <Section title="Proactive toolkit">
        <div className="grid g4">
          {[
            ['Data standards', 'Formats and code lists (HS, ISO country, UN/LOCODE, currency) agreed and published in the catalog.'],
            ['Validation at submission', 'Mandatory fields, tariff look-ups, VAT number format checks and calculated fields in forms and APIs.'],
            ['E-invoice clearance rules', 'Schema and business-rule checks that reject a bad invoice before it is issued.'],
            ['DQ gates', 'Rules executed inside pipelines that stop or quarantine bad loads.'],
            ['Data contracts', 'Agreed schema, meaning and timing between Customs, Tax and E-Invoicing systems.'],
            ['Change impact assessment', 'Every tariff, tax or regulatory change answers: what data does this create, change or retire?'],
            ['Reference data management', 'One governed source for tariff, exchange rates, port codes and tax rates.'],
            ['Broker & taxpayer guidance', 'Clear guides, error messages and training so submitters know the rules.'],
          ].map(([h, p]) => (
            <div key={h} className="card flat stack" style={{ gap: 6 }}>
              <div className="row" style={{ gap: 8 }}><CheckIcon size={16} color="var(--accent)" /><h4>{h}</h4></div>
              <p className="small" style={{ color: 'var(--ink-2)' }}>{p}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="How we measure proactive maturity">
        <div className="grid g3">
          {[
            ['% of CDEs with rules defined before go-live', 'Target ≥ 90%'],
            ['% of tariff, tax and e-invoicing changes with a data impact assessment', 'Target 100%'],
            ['% of issues caught at submission or a DQ gate before reaching reports', 'Target ≥ 70%'],
          ].map(([k, t]) => (
            <div key={k} className="card flat stack" style={{ gap: 4 }}>
              <p style={{ fontWeight: 600 }}>{k}</p>
              <p className="small muted">{t}</p>
            </div>
          ))}
        </div>
      </Section>

      <Comparison highlight="proactive" />

      <Callout title="Rule of thumb">
        If you find yourself fixing the same kind of issue twice, the second fix should be a proactive control. Every reactive fix should end with the question: <i>how do we stop this from happening again?</i>
      </Callout>
    </>
  )
}
