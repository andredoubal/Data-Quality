import { useState } from 'react'
import { ShieldCheck, PenLine, Plug, Database, BarChart3, GitPullRequest, Check as CheckIcon } from 'lucide-react'
import { PageHead, Section, StepFlow, Callout, Check } from '../components/ui.jsx'
import { Comparison } from './Reactive.jsx'

const STAGES = [
  {
    id: 'design', label: 'Design & change', icon: GitPullRequest,
    q: 'Stop defects before a system or process goes live.',
    controls: [
      'Data impact assessment on every business or system change request',
      'Identify CDEs and define DQ rules before go-live, not after the first bad report',
      'Data contracts between source and consumer: fields, formats, SLAs',
      'Reference data and code values agreed with the Data Owner',
    ],
    example: 'A new "Remote Work Allowance" pay component is designed with a pick-list of allowed countries and a rule that the allowance end date must be after the start date, before the first employee is set up.',
  },
  {
    id: 'entry', label: 'Data entry', icon: PenLine,
    q: 'Make it easy to enter data correctly and hard to enter it wrong.',
    controls: [
      'Mandatory fields for CDEs (Date of Birth, Hire Date, Cost Center)',
      'Pick-lists instead of free text (Job Code, Country, Termination Reason)',
      'Format masks and range checks (e-mail pattern, age 16–80 at hire)',
      'Duplicate-person check on hire and rehire; four-eyes approval on pay changes',
    ],
    example: 'The HRIS hire form blocks a Hire Date earlier than the Date of Birth + 16 years and warns if a person with the same name and birth date already exists.',
  },
  {
    id: 'integration', label: 'Integration', icon: Plug,
    q: 'Guarantee what leaves one system arrives complete and unchanged in the next.',
    controls: [
      'Record-count and checksum reconciliation per interface run',
      'Schema-change detection with alerting',
      'Reject-and-quarantine of records failing mandatory checks',
      'Interface monitoring with SLAs and on-call ownership',
    ],
    example: 'The HRIS → Payroll interface compares 12,480 records sent vs. 12,480 received and the sum of base salary on both sides before payroll opens.',
  },
  {
    id: 'pipeline', label: 'Warehouse & pipelines', icon: Database,
    q: 'Put quality gates in the pipeline so bad data never reaches the gold layer.',
    controls: [
      'Informatica CDQ rules executed as pipeline steps (DQ gates)',
      'Freshness checks: load completed and data no older than 24 hours',
      'Referential integrity checks between facts and dimensions',
      'Automated profiling on new or changed assets before release',
    ],
    example: 'The nightly Employee pipeline halts promotion to the gold layer when more than 2% of active employees have no Cost Center, and notifies the Custodian on duty.',
  },
  {
    id: 'consumption', label: 'Reporting & BI', icon: BarChart3,
    q: 'Make sure every report uses the same definitions and certified data.',
    controls: [
      'Certified datasets and a published business glossary (e.g., "Active Headcount")',
      'Peer review and reconciliation of new report logic against a control total',
      'DQ scores visible next to the report (trust indicator)',
      'Semantic layer so measures are defined once',
    ],
    example: 'The Headcount dashboard reads only from the certified "Workforce" dataset and shows the latest DQ score for Employee data in its header.',
  },
]

const PROCESS = [
  { title: 'Identify CDEs', owner: ['steward', 'owner'], desc: 'Agree which elements are critical for pay, compliance, reporting and decisions.', out: 'Approved CDE list' },
  { title: 'Define rules & thresholds', owner: ['steward', 'custodian'], desc: 'Write logical rules per dimension; set green/amber/red thresholds.', out: 'Rule definitions' },
  { title: 'Embed controls at source', owner: ['source', 'architect'], desc: 'Pick-lists, mandatory fields, validations and approvals in the HRIS.', out: 'Preventive controls' },
  { title: 'Automate DQ gates', owner: 'custodian', desc: 'Run rules in pipelines and block or quarantine failing loads.', out: 'Pipeline DQ gates' },
  { title: 'Assess every change', owner: ['champion', 'architect'], desc: 'Run a data impact assessment on business and system changes.', out: 'Impact assessment' },
  { title: 'Train & certify', owner: ['owner', 'steward'], desc: 'Train data entry teams; certify datasets and report definitions.', out: 'Trained users, certified data' },
]

export default function Proactive() {
  const [stage, setStage] = useState('entry')
  const s = STAGES.find((x) => x.id === stage)
  return (
    <>
      <PageHead
        eyebrow="Chapter 1 · Mindset" icon={ShieldCheck}
        title="Proactive data quality"
        lead="Proactive data quality prevents defects from being created or from travelling downstream. It builds controls into processes, systems and pipelines so that quality is designed in, not inspected in afterwards."
      />

      <div className="grid g3">
        <div className="card stack">
          <h3>What it is</h3>
          <p className="small" style={{ color: 'var(--ink-2)' }}>Controls that act <b>before</b> or <b>as</b> data is created or moved: validation, standards, approvals, automated gates and change impact assessment.</p>
        </div>
        <div className="card stack">
          <h3>Why it matters</h3>
          <p className="small" style={{ color: 'var(--ink-2)' }}>Preventing one bad record costs about 1 unit; fixing it later costs 10; living with the consequences costs 100. Prevention scales, clean-up doesn't.</p>
        </div>
        <div className="card stack">
          <h3>When we use it</h3>
          <p className="small" style={{ color: 'var(--ink-2)' }}>New systems, new data assets, business changes, new interfaces and new reports. Any time data is about to be created or change shape.</p>
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

      <Section title="The proactive process" sub="Run once when a data asset is onboarded, then again whenever the business or system changes.">
        <StepFlow steps={PROCESS} />
      </Section>

      <Section title="Proactive toolkit">
        <div className="grid g4">
          {[
            ['Data standards', 'Formats, code values and naming agreed and published in the catalog.'],
            ['Validation at entry', 'Mandatory fields, pick-lists, masks and range checks in the source system.'],
            ['DQ gates', 'Rules executed inside pipelines that stop or quarantine bad loads.'],
            ['Data contracts', 'Agreed schema, semantics and freshness between producer and consumer.'],
            ['Change impact assessment', 'Every change request answers: what data does this create, change or retire?'],
            ['Reference data management', 'One governed list for countries, job codes, cost centers, grades.'],
            ['Training', 'Data entry and HR operations teams know the definitions and why they matter.'],
            ['Certified datasets', 'Reports only read from datasets that pass their DQ thresholds.'],
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
            ['% of change requests with a data impact assessment', 'Target 100%'],
            ['% of issues caught by a DQ gate before reaching reports', 'Target ≥ 70%'],
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
