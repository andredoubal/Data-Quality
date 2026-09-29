import { useState } from 'react'
import { Orbit, Landmark, ListChecks, Wrench, BarChart3 } from 'lucide-react'
import { PageHead, Section, Tabs, Swimlane, SwimLegend, RoleChip, Callout } from '../components/ui.jsx'
import { E2E } from '../data/workflows.js'

const COMPONENTS = [
  {
    id: 'program', icon: Landmark, title: 'Data Quality Program',
    desc: 'All the roles, capabilities, processes, standards and artifacts required to improve, maintain and report on data quality.',
    items: ['DQ policy & six standards', 'Roles: Owner, Steward, Champion, Custodian', 'Tooling: Informatica IDMC', 'Training & communications', 'Funding and roadmap'],
    link: 'roles',
  },
  {
    id: 'rules', icon: ListChecks, title: 'Rules & Threshold Definition',
    desc: 'Define measurement dimensions for business-critical data so data quality can be reported quantitatively against them.',
    items: ['Identify CDEs', 'Profile & baseline', 'Write logical and technical rules', 'Set green / amber / red thresholds', 'Review rules yearly'],
    link: 'rules',
  },
  {
    id: 'issues', icon: Wrench, title: 'Issue Management & Resolution',
    desc: 'Identify and track data issues, conduct root cause analysis, evaluate solution options and execute improvement activities such as data fixes.',
    items: ['Issue intake & registry', 'Triage & prioritization', 'Root cause analysis', 'Remediation plan & execution', 'Business testing & closure'],
    link: 'issues',
  },
  {
    id: 'reporting', icon: BarChart3, title: 'Reporting & Measurement',
    desc: 'Monitor improvement or degradation of data quality with dashboards that represent quality across dimensions and track data issues.',
    items: ['DQ scorecards by CDE, asset, domain', 'Issue & SLO metrics', 'Quarterly review at DG forums', 'Threshold breach alerts', 'Adoption metrics'],
    link: 'monitoring',
  },
]

const STANDARDS = [
  { n: 1, s: 'Data Owners are responsible for ensuring that data quality standards for their assigned data domain(s) are adhered to.', k: 'Ownership & adherence', c: 'Clearly outline the responsibilities of Data Owners for accountability of overall quality in their domain.' },
  { n: 2, s: 'Data Stewards are responsible for defining data quality rules for data elements within their business domain, including critical data elements.', k: 'Stewardship & rule definition', c: 'Stewards define specific rules based on business logic and prioritize domain elements (e.g., identify CDEs).' },
  { n: 3, s: 'Changes to data quality rules must be reviewed and approved by the Data Owner prior to implementation by the Data Custodian.', k: 'Approval & implementation', c: 'Rules are refreshed to reflect changing business priorities, operations and processes.' },
  { n: 4, s: 'Data quality rules must be reviewed yearly (at minimum) and updated to reflect relevant changes to business processes or requirements.', k: 'Rule management cadence', c: 'Establish a regular cadence for how often rules are reviewed and updated.' },
  { n: 5, s: 'Data quality must be baselined quarterly (at minimum) and profiling results reviewed and validated by the Data Owner.', k: 'Baseline measurement', c: 'A regular procedure to audit/baseline profiling results, with visibility for Data Owners.' },
  { n: 6, s: 'Data quality metrics must be reported to the Data Governance forums quarterly (at minimum) to ensure adherence to thresholds.', k: 'Performance metrics', c: 'Report completeness, accuracy etc. for CDEs and standard elements; agree actions at the Working Group and Council.' },
]

const LIFECYCLE = [
  { t: 'Scan & report', owner: ['custodian'], items: ['Run data quality scan in Informatica CDQ', 'Generate the DQ issue report'] },
  { t: 'Review report', owner: ['steward'], items: ['Review the DQ issue report', 'Validate & close fixed issues', 'Confirm the DQ scoring change'] },
  { t: 'Prioritize & submit', owner: ['steward'], items: ['DQ issue prioritization', 'DQ issue submission to the registry', 'Refine logical DQ rules'] },
  { t: 'Root cause & estimate', owner: ['custodian', 'source'], items: ['DQ issue root cause analysis', 'Identify remediation option(s)', 'Estimate effort & plan'] },
  { t: 'Confirm plan', owner: ['steward', 'owner'], items: ['Validate prioritization', 'Confirm remediation plan'] },
  { t: 'Build & fix', owner: ['source'], items: ['Develop remediations', 'Implement remediations', 'Technical testing'] },
  { t: 'Business test', owner: ['steward'], items: ['Business testing of the fix', 'Hand back for the next scan'] },
]

export default function Framework() {
  const [tab, setTab] = useState('framework')
  return (
    <>
      <PageHead
        eyebrow="Chapter 2 · Framework" icon={Orbit}
        title="The data quality framework"
        lead="The framework gives context to every part of the Data Quality Program and shows how improvements get executed: a continuous cycle of assessment, improvement and monitoring, governed by six standards."
      />
      <Tabs
        tabs={[
          { id: 'framework', label: 'Framework' },
          { id: 'standards', label: 'Six standards' },
          { id: 'lifecycle', label: 'BAU remediation lifecycle' },
          { id: 'e2e', label: 'End-to-end process' },
        ]}
        active={tab}
        onChange={setTab}
      />
      {tab === 'framework' && <FrameworkWheel />}
      {tab === 'standards' && <Standards />}
      {tab === 'lifecycle' && <Lifecycle />}
      {tab === 'e2e' && (
        <Section title="End-to-end: from rule creation to remediation" sub="Triggered when a new data asset is created in the HRIS (e.g., Learning & Development, Dependent Details) or a new DQ rule is needed on an existing asset. Scroll sideways to follow the flow.">
          <SwimLegend />
          <Swimlane {...E2E} />
          <div className="grid g2">
            <div className="card flat stack">
              <h4>Phase A · Data quality rule creation (steps 1–5)</h4>
              <p className="small" style={{ color: 'var(--ink-2)' }}>The Steward defines logical rules. If the asset isn't yet in the Informatica catalog, the source team loads it and the Custodian builds the pipeline and registers metadata in CDGC. The Custodian then implements the rules in Cloud Data Quality.</p>
            </div>
            <div className="card flat stack">
              <h4>Phase B · Data quality remediation (steps 6–11)</h4>
              <p className="small" style={{ color: 'var(--ink-2)' }}>Scans run and the report goes to the Steward, who proposes high-priority issues. The Champion confirms. The Custodian logs issues (data product, asset, element, DQ score, sample IDs, failed record count); the source team performs RCA and remediation; the Steward monitors scores and status.</p>
            </div>
          </div>
        </Section>
      )}
    </>
  )
}

function FrameworkWheel() {
  const [sel, setSel] = useState('rules')
  const c = COMPONENTS.find((x) => x.id === sel)
  const Icon = c.icon
  const R = 120, cx = 160, cy = 160
  const arc = (i) => {
    const a0 = (-90 + i * 90 + 6) * (Math.PI / 180)
    const a1 = (-90 + (i + 1) * 90 - 6) * (Math.PI / 180)
    const r0 = R - 26, r1 = R + 10
    const p = (r, a) => `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
    const tip = (-90 + (i + 1) * 90 - 1) * (Math.PI / 180)
    return `M${p(r1, a0)} A${r1},${r1} 0 0 1 ${p(r1, a1)} L${p((r0 + r1) / 2, tip)} L${p(r0, a1)} A${r0},${r0} 0 0 0 ${p(r0, a0)} Z`
  }
  return (
    <div className="grid g2" style={{ alignItems: 'center' }}>
      <div className="card" style={{ display: 'grid', placeItems: 'center' }}>
        <svg viewBox="0 0 320 320" width="100%" style={{ maxWidth: 380 }} role="img" aria-label="Data quality framework cycle">
          {COMPONENTS.map((x, i) => {
            const mid = (-90 + i * 90 + 45) * (Math.PI / 180)
            const lr = R + 1
            return (
              <g key={x.id} onClick={() => setSel(x.id)} style={{ cursor: 'pointer' }}>
                <path d={arc(i)} fill={sel === x.id ? 'var(--accent)' : 'var(--navy)'} stroke="var(--surface)" strokeWidth="2" />
                <circle cx={cx + (lr - 8) * Math.cos(mid)} cy={cy + (lr - 8) * Math.sin(mid)} r="14" fill="var(--surface)" />
                <text x={cx + (lr - 8) * Math.cos(mid)} y={cy + (lr - 8) * Math.sin(mid) + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--ink)">{i + 1}</text>
              </g>
            )
          })}
          <text x={cx} y={cy - 14} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="var(--ink)">Periodic</text>
          <text x={cx} y={cy + 2} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="var(--ink)">assessment,</text>
          <text x={cx} y={cy + 18} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="var(--ink)">improvement &amp;</text>
          <text x={cx} y={cy + 34} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="var(--ink)">monitoring</text>
        </svg>
        <div className="row" style={{ justifyContent: 'center', gap: 6 }}>
          {COMPONENTS.map((x, i) => (
            <button key={x.id} className={'btn sm' + (sel === x.id ? ' primary' : '')} onClick={() => setSel(x.id)}>{i + 1}. {x.title.replace('Data Quality ', '')}</button>
          ))}
        </div>
      </div>
      <div className="card stack" style={{ gap: 12 }}>
        <div className="row"><div className="icon-tile"><Icon size={19} /></div><h2>{c.title}</h2></div>
        <p style={{ color: 'var(--ink-2)' }}>{c.desc}</p>
        <h4>What it includes</h4>
        <ul className="bullets small">{c.items.map((x) => <li key={x}>{x}</li>)}</ul>
        <Callout>The four components run as one loop: rules define what to measure, reporting shows where quality falls short, issue management fixes it, and the program keeps the loop staffed and governed.</Callout>
      </div>
    </div>
  )
}

function Standards() {
  return (
    <Section title="Six data quality standards" sub="These are the non-negotiables of the program. Every process in this portal implements one or more of them.">
      <div className="grid g3">
        {STANDARDS.map((s) => (
          <article key={s.n} className="card stack" style={{ gap: 10, padding: 0, overflow: 'hidden' }}>
            <div style={{ background: 'var(--navy)', color: '#fff', padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start', minHeight: 150 }}>
              <span className="big-num" style={{ fontSize: '2.6rem' }}>{s.n}</span>
              <p className="small" style={{ opacity: 0.95 }}>{s.s}</p>
            </div>
            <div style={{ padding: '4px 18px 18px' }} className="stack">
              <div className="eyebrow">Key consideration</div>
              <h4>{s.k}</h4>
              <p className="small" style={{ color: 'var(--ink-2)' }}>{s.c}</p>
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}

function Lifecycle() {
  const [sel, setSel] = useState(0)
  const n = LIFECYCLE.length
  const cx = 170, cy = 170, R = 128
  const s = LIFECYCLE[sel]
  return (
    <Section title="Data quality remediation lifecycle (BAU)" sub="Once foundations are in place, this seven-step loop runs every scan cycle. Select a step.">
      <div className="grid g2" style={{ alignItems: 'center' }}>
        <div className="card" style={{ display: 'grid', placeItems: 'center' }}>
          <svg viewBox="0 0 340 340" width="100%" style={{ maxWidth: 400 }} role="img" aria-label="Remediation lifecycle">
            <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--line-strong)" strokeWidth="2" strokeDasharray="4 5" />
            {LIFECYCLE.map((x, i) => {
              const a = (-90 + (i * 360) / n) * (Math.PI / 180)
              const px = cx + R * Math.cos(a), py = cy + R * Math.sin(a)
              const on = i === sel
              return (
                <g key={i} onClick={() => setSel(i)} style={{ cursor: 'pointer' }}>
                  <circle cx={px} cy={py} r={on ? 27 : 23} fill={on ? 'var(--accent)' : 'var(--navy)'} stroke="var(--surface)" strokeWidth="3" />
                  <text x={px} y={py + 5} textAnchor="middle" fontSize="15" fontWeight="700" fill="#ffffff">{i + 1}</text>
                </g>
              )
            })}
            <text x={cx} y={cy - 8} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--ink)">Remediation</text>
            <text x={cx} y={cy + 12} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--ink)">lifecycle</text>
          </svg>
        </div>
        <div className="card stack" style={{ gap: 12 }}>
          <div className="mono muted small">Step {sel + 1} of {n}</div>
          <h2>{s.t}</h2>
          <div className="row" style={{ gap: 6 }}>{s.owner.map((o) => <RoleChip key={o} id={o} />)}</div>
          <ul className="bullets">{s.items.map((x) => <li key={x}>{x}</li>)}</ul>
          <div className="row">
            <button className="btn sm" onClick={() => setSel((sel - 1 + n) % n)}>Previous</button>
            <button className="btn sm primary" onClick={() => setSel((sel + 1) % n)}>Next step</button>
          </div>
        </div>
      </div>
      <div className="grid g4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
        {LIFECYCLE.map((x, i) => (
          <button key={i} className="card flat stack" style={{ gap: 4, textAlign: 'left', cursor: 'pointer', borderColor: i === sel ? 'var(--accent)' : 'var(--line)' }} onClick={() => setSel(i)}>
            <span className="mono xs muted">{i + 1}</span>
            <b className="small">{x.t}</b>
          </button>
        ))}
      </div>
    </Section>
  )
}
