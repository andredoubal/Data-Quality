import { useState } from 'react'
import { Star } from 'lucide-react'
import Block from '../../components/Block.jsx'
import { Section, StepFlow, Callout, Pill } from '../../components/ui.jsx'

export const CDE_CRITERIA = [
  { id: 'reg', label: 'Regulatory / legal', q: 'Used in statutory, tax, labor-law or audit reporting?' },
  { id: 'fin', label: 'Financial impact', q: 'Drives pay, benefits, cost allocation or financial statements?' },
  { id: 'ops', label: 'Operational criticality', q: 'Does a core HR process stop or fail if it is wrong?' },
  { id: 'rep', label: 'Reporting & KPIs', q: 'Used in executive dashboards or key KPIs (headcount, attrition)?' },
  { id: 'cross', label: 'Cross-system use', q: 'Shared across multiple systems or domains (payroll, finance, IT access)?' },
  { id: 'priv', label: 'Privacy sensitivity', q: 'Personal or sensitive data that carries privacy risk if wrong?' },
]

const SAMPLE = [
  { el: 'Employee ID', s: { reg: 3, fin: 3, ops: 3, rep: 3, cross: 3, priv: 2 } },
  { el: 'Date of Birth', s: { reg: 3, fin: 2, ops: 2, rep: 2, cross: 2, priv: 3 } },
  { el: 'Hire Date', s: { reg: 3, fin: 3, ops: 3, rep: 3, cross: 2, priv: 1 } },
  { el: 'Base Salary', s: { reg: 2, fin: 3, ops: 3, rep: 2, cross: 2, priv: 3 } },
  { el: 'Cost Center', s: { reg: 1, fin: 3, ops: 2, rep: 3, cross: 3, priv: 1 } },
  { el: 'Employment Status', s: { reg: 2, fin: 3, ops: 3, rep: 3, cross: 3, priv: 1 } },
  { el: 'Job Title (free text)', s: { reg: 1, fin: 1, ops: 1, rep: 1, cross: 1, priv: 1 } },
  { el: 'Preferred Name', s: { reg: 1, fin: 1, ops: 1, rep: 1, cross: 2, priv: 2 } },
]

export const tierOf = (total) =>
  total >= 14 ? { t: 'Tier 1 CDE', tone: 'crit' } : total >= 10 ? { t: 'Tier 2 CDE', tone: 'warn' } : { t: 'Standard element', tone: 'neutral' }

export default function CDEs({ go }) {
  return (
    <Block
      go={go}
      icon={Star}
      title="Critical Data Elements (CDEs)"
      lead="A CDE is a data element whose quality has a material impact on regulatory compliance, financial outcomes, core operations or key decisions. We can't govern everything equally, so CDEs tell us where to focus rules, monitoring and remediation first."
      facts={[
        ['Owned by', 'Data Owner (approves)'],
        ['Proposed by', 'Data Steward'],
        ['Recorded in', 'Informatica CDGC glossary'],
        ['Reviewed', 'Yearly, or on business change'],
      ]}
      templates={['CDE Identification & Scoring', 'Business Term Definition']}
      process={
        <Section title="How we identify and manage CDEs">
          <StepFlow
            steps={[
              { title: 'Collect candidates', owner: 'steward', desc: 'List elements used in key reports, regulatory filings, payroll, and cross-system interfaces.', out: 'Candidate list' },
              { title: 'Score against criteria', owner: ['steward', 'champion'], desc: 'Score each candidate 1–3 on six criteria (regulatory, financial, operational, reporting, cross-system, privacy).', out: 'Scored list' },
              { title: 'Map to physical data', owner: ['architect', 'custodian'], desc: 'Link each CDE to tables/columns in source, warehouse and reports; document lineage.', out: 'Lineage map' },
              { title: 'Approve', owner: 'owner', desc: 'The Data Owner approves the CDE list and tiers for the domain.', out: 'Approved CDEs' },
              { title: 'Publish in catalog', owner: 'custodian', desc: 'Register CDEs as business terms in Informatica CDGC with definition, owner, steward and lineage.', out: 'Catalog entries' },
              { title: 'Attach rules', owner: ['steward', 'custodian'], desc: 'Every Tier 1 CDE gets rules across at least completeness, validity and one more relevant dimension.', out: 'Rule coverage' },
              { title: 'Review yearly', owner: ['steward', 'owner'], desc: 'Re-score after reorganizations, new regulations or system changes.', out: 'Updated CDE list' },
            ]}
          />
        </Section>
      }
      framework={<CdeFramework />}
      example={<CdeExample />}
    />
  )
}

function CdeFramework() {
  return (
    <>
      <Section title="CDE scoring criteria" sub="Score each criterion: 1 = low, 2 = medium, 3 = high. Maximum score is 18.">
        <div className="grid g3">
          {CDE_CRITERIA.map((c) => (
            <div key={c.id} className="card flat stack" style={{ gap: 6 }}>
              <h4>{c.label}</h4>
              <p className="small" style={{ color: 'var(--ink-2)' }}>{c.q}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Tiers and what they mean">
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>Tier</th><th>Score</th><th>Governance expectation</th><th>Monitoring</th><th>Issue SLA</th></tr></thead>
            <tbody>
              <tr><td><Pill tone="crit">Tier 1 CDE</Pill></td><td>14–18</td><td>Owner-approved rules on ≥ 3 dimensions, lineage documented end-to-end, threshold ≥ 98%</td><td>Daily / every load</td><td>Critical: 5 business days</td></tr>
              <tr><td><Pill tone="warn">Tier 2 CDE</Pill></td><td>10–13</td><td>Rules on ≥ 2 dimensions, lineage to warehouse, threshold ≥ 95%</td><td>Weekly</td><td>High: 15 business days</td></tr>
              <tr><td><Pill>Standard element</Pill></td><td>6–9</td><td>Basic completeness/validity rules where useful</td><td>Monthly / quarterly profiling</td><td>Best effort</td></tr>
            </tbody>
          </table>
        </div>
      </Section>
      <Section title="What a CDE record must contain">
        <div className="grid g4">
          {['Business term & definition', 'Data Owner and Data Steward', 'Tier and criteria scores', 'Source system & physical location', 'Lineage to key reports', 'Linked DQ rules & thresholds', 'Allowed values / format', 'Last review date'].map((x) => (
            <div key={x} className="card flat small" style={{ padding: 14 }}>{x}</div>
          ))}
        </div>
      </Section>
    </>
  )
}

function CdeExample() {
  const [scores, setScores] = useState({ reg: 2, fin: 3, ops: 2, rep: 3, cross: 2, priv: 1 })
  const total = Object.values(scores).reduce((a, b) => a + b, 0)
  const tier = tierOf(total)
  return (
    <>
      <Section title="Worked example: HR Employee domain" sub="Eight candidate elements scored by the HR Data Steward and approved by the Head of HR Operations.">
        <div className="table-wrap">
          <table className="t">
            <thead>
              <tr><th>Element</th>{CDE_CRITERIA.map((c) => <th key={c.id} className="num">{c.label.split(' ')[0]}</th>)}<th className="num">Total</th><th>Result</th></tr>
            </thead>
            <tbody>
              {SAMPLE.map((r) => {
                const t = Object.values(r.s).reduce((a, b) => a + b, 0)
                const tr = tierOf(t)
                return (
                  <tr key={r.el}>
                    <td style={{ fontWeight: 600 }}>{r.el}</td>
                    {CDE_CRITERIA.map((c) => <td key={c.id} className="num">{r.s[c.id]}</td>)}
                    <td className="num" style={{ fontWeight: 700 }}>{t}</td>
                    <td><Pill tone={tr.tone}>{tr.t}</Pill></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>
      <Section title="Try it: score an element" sub="Example: Termination Reason. Adjust the scores to see the tier change.">
        <div className="card grid g2" style={{ alignItems: 'center' }}>
          <div className="stack" style={{ gap: 10 }}>
            {CDE_CRITERIA.map((c) => (
              <div key={c.id} className="row between" style={{ flexWrap: 'nowrap' }}>
                <span className="small" style={{ minWidth: 0 }}>{c.label}</span>
                <div className="seg">
                  {[1, 2, 3].map((v) => (
                    <button key={v} className={scores[c.id] === v ? 'on' : ''} onClick={() => setScores({ ...scores, [c.id]: v })} aria-label={`${c.label} ${v}`}>{v}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="stack" style={{ alignItems: 'center', textAlign: 'center', gap: 8 }}>
            <span className="muted small">Total score</span>
            <span className="big-num" style={{ fontSize: '3.4rem' }}>{total}<span className="muted" style={{ fontSize: '1.2rem' }}> / 18</span></span>
            <Pill tone={tier.tone}>{tier.t}</Pill>
          </div>
        </div>
      </Section>
      <Callout title="Why Job Title (free text) isn't a CDE">
        It's widely visible but nothing critical depends on it: pay, reporting and access all use Job Code. The right move is to govern Job Code as the CDE and treat free-text title as descriptive.
      </Callout>
    </>
  )
}
