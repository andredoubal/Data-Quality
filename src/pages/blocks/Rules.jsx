import { useState } from 'react'
import { ListChecks } from 'lucide-react'
import Block from '../../components/Block.jsx'
import { Section, StepFlow, Callout, Swimlane, SwimLegend, ScorePill, Pill, Seg } from '../../components/ui.jsx'
import { RULES_WF } from '../../data/workflows.js'
import { RULES } from '../../data/rules.js'

const ANATOMY = [
  { group: 'Rule owner, ID & business term', fields: [['Rule Owner', 'The accountable practitioner, usually the Data Steward.'], ['Rule ID', 'Unique identifier for tracking and traceability (DQ00001).'], ['Business Term', 'The functional data element the rule applies to.']] },
  { group: 'Dimension rule & measurement', fields: [['Dimension Rule', 'Business-friendly description of the rule.'], ['Measurement Dimension', 'Completeness, accuracy, validity, consistency, uniqueness or timeliness.']] },
  { group: 'Acceptance thresholds', fields: [['Thresholds', 'Green: meets target (e.g. > 95%). Amber: monitor closely (80–95%). Red: remediate (< 80%).']] },
  { group: 'Profiling frequency & assets', fields: [['Profiling Frequency', 'How often the rule runs: per load, daily, weekly, monthly.'], ['Related Data Asset(s)', 'Tables, fields, calculated fields and upstream curated datasets.']] },
  { group: 'Technical rule & review date', fields: [['Technical Rule', 'The executable logic in Informatica CDQ (SQL-like expression).'], ['Last Review Date', 'Tracks the yearly review required by Standard 4.']] },
]

const TYPES = [
  ['Field-level', 'One column, one record.', 'Date of Birth is not null'],
  ['Cross-field', 'Two or more columns in the same record.', 'Termination Date populated when Status = Terminated'],
  ['Cross-table / referential', 'A value must exist in another table.', 'Cost Center exists in the Finance cost center master'],
  ['Cross-system', 'Same fact compared in two systems.', 'HRIS status = Payroll status'],
  ['Aggregate / reasonableness', 'Totals or distributions within expected ranges.', 'Monthly headcount change within ±3% unless a reorg is flagged'],
  ['Timeliness / freshness', 'When data arrives versus when it should.', 'Gold table refreshed within 24 hours'],
]

export default function Rules({ go }) {
  return (
    <Block
      go={go}
      icon={ListChecks}
      title="Data quality rules & thresholds"
      lead="A data quality rule is a testable statement about what good data looks like, written in business language by the Steward and translated into executable logic by the Custodian. Thresholds turn the rule's pass rate into a decision: fine, watch it, or fix it."
      facts={[
        ['Defined by', 'Data Steward (logical rule)'],
        ['Built by', 'Data Custodian in Informatica CDQ'],
        ['Approved by', 'Data Owner, including every change'],
        ['Reviewed', 'At least yearly (Standard 4)'],
      ]}
      templates={['Rule Definition', 'Rule Change Request']}
      process={
        <>
          <Section title="Rule definition steps">
            <StepFlow
              steps={[
                { title: 'Profile first', owner: 'custodian', desc: 'Profile the element to see real values, patterns and null rates before writing rules.', out: 'Profiling results' },
                { title: 'Write the logical rule', owner: 'steward', desc: 'State the rule in business terms and pick one dimension.', out: 'Draft rule' },
                { title: 'Confirm business coverage', owner: ['steward', 'champion'], desc: 'Check the rules cover what the business actually needs.', out: 'Reviewed rule set' },
                { title: 'Set thresholds', owner: ['steward', 'owner'], desc: 'Use the baseline plus business risk to set green/amber/red.', out: 'Thresholds' },
                { title: 'Approve', owner: 'owner', desc: 'The Data Owner approves the rule and thresholds (Standard 3).', out: 'Approved rule' },
                { title: 'Build & test', owner: 'custodian', desc: 'Implement the technical rule in Informatica CDQ and test with known good and bad records.', out: 'Technical rule' },
                { title: 'Schedule & publish', owner: 'custodian', desc: 'Schedule scans and expose results on the DQ dashboard.', out: 'Live measurement' },
              ]}
            />
          </Section>
          <Section title="Rules & threshold definition workflow" sub="Swimlane view. Scroll sideways on smaller screens.">
            <SwimLegend />
            <Swimlane {...RULES_WF} />
          </Section>
        </>
      }
      framework={
        <>
          <Section title="Anatomy of a rule" sub="Every rule in our catalog carries these fields. The Rule Definition template in the Templates tab uses the same structure.">
            <div className="grid g3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              {ANATOMY.map((a) => (
                <div key={a.group} className="card flat stack" style={{ gap: 8 }}>
                  <h4>{a.group}</h4>
                  {a.fields.map(([k, v]) => (
                    <p key={k} className="small"><b>{k}:</b> <span style={{ color: 'var(--ink-2)' }}>{v}</span></p>
                  ))}
                </div>
              ))}
            </div>
          </Section>
          <ThresholdExplainer />
          <Section title="Types of rules">
            <div className="table-wrap">
              <table className="t">
                <thead><tr><th>Rule type</th><th>What it checks</th><th>Example</th></tr></thead>
                <tbody>{TYPES.map((t) => <tr key={t[0]}><td style={{ fontWeight: 600 }}>{t[0]}</td><td>{t[1]}</td><td>{t[2]}</td></tr>)}</tbody>
              </table>
            </div>
          </Section>
          <Callout title="Logical vs. technical rule">
            <b>Logical</b> (Steward): "Every active employee must have a Cost Center that exists in Finance."<br />
            <b>Technical</b> (Custodian): <code>cost_center IN (SELECT cc_code FROM fin_gold.cost_center WHERE active = 1)</code>. Keep both in the catalog so business and IT read the same rule.
          </Callout>
        </>
      }
      example={<RuleExamples />}
    />
  )
}

function ThresholdExplainer() {
  const [score, setScore] = useState(91)
  const green = 95, amber = 80
  const band = score >= green ? ['good', 'Meets target: no action'] : score >= amber ? ['warn', 'Monitor: steward reviews the trend'] : ['crit', 'Remediate: raise an issue']
  return (
    <Section title="How thresholds work" sub="Drag the score. Example rule: Date of Birth must not be null (green ≥ 95%, amber 80–95%, red < 80%).">
      <div className="card stack" style={{ gap: 14 }}>
        <div style={{ position: 'relative', height: 34, borderRadius: 8, overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${amber - 50}%`, background: 'var(--crit-soft)' }} />
          <div style={{ width: `${green - amber}%`, background: 'var(--warn-soft)' }} />
          <div style={{ flex: 1, background: 'var(--good-soft)' }} />
          <div style={{ position: 'absolute', left: `calc(${(score - 50) * 2}% - 1px)`, top: 0, bottom: 0, width: 3, background: 'var(--ink)' }} />
        </div>
        <div className="row between xs muted"><span>50%</span><span>Red &lt; {amber}%</span><span>Amber {amber}–{green}%</span><span>Green ≥ {green}%</span><span>100%</span></div>
        <input type="range" id="thr-score" aria-label="Rule pass rate" min="50" max="100" step="0.5" value={score} onChange={(e) => setScore(+e.target.value)} />
        <div className="row"><span className="big-num">{score.toFixed(1)}%</span><Pill tone={band[0]}>{band[1]}</Pill></div>
        <p className="small muted">Pass rate = records passing the rule ÷ records evaluated. With 12,480 active employees, {score.toFixed(1)}% means {Math.round(12480 * (1 - score / 100)).toLocaleString()} failing records.</p>
      </div>
    </Section>
  )
}

function RuleExamples() {
  const [dim, setDim] = useState('All')
  const list = RULES.filter((r) => dim === 'All' || r.dim === dim)
  const s = RULES[0]
  return (
    <>
      <Section title="Sample rule definition" sub="One fully completed rule, laid out the way it appears in the template.">
        <div className="table-wrap">
          <table className="t navy-head">
            <thead><tr><th>Rule Owner</th><th>Rule ID</th><th>Business Term</th><th>Dimension Rule</th><th>Dimension</th><th>Thresholds</th><th>Frequency</th><th>Related Asset</th><th>Technical Rule</th><th>Last Review</th></tr></thead>
            <tbody>
              <tr>
                <td>{s.owner}</td><td className="mono">{s.id}</td><td>{s.term}</td><td>{s.rule}</td><td>{s.dim}</td>
                <td><div className="row" style={{ gap: 3, flexWrap: 'nowrap' }}><Pill tone="good">≥{s.t[0]}%</Pill><Pill tone="warn">{s.t[1]}–{s.t[0]}%</Pill><Pill tone="crit">&lt;{s.t[1]}%</Pill></div></td>
                <td>{s.freq}</td><td className="mono xs">{s.asset}</td><td className="mono xs">{s.tech}</td><td>{s.review}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>
      <Section title="HR rule catalog" sub="Fourteen live-style rules across all six dimensions, with their latest scores." action={<Seg label="Filter by dimension" value={dim} onChange={setDim} options={['All', 'Completeness', 'Validity', 'Consistency', 'Uniqueness', 'Timeliness', 'Accuracy']} />}>
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>Rule ID</th><th>Business term</th><th>Rule</th><th>Dimension</th><th>Priority</th><th>Thresholds (G / A)</th><th>Technical rule</th><th className="num">Latest score</th></tr></thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id}>
                  <td className="mono">{r.id}</td><td style={{ fontWeight: 600 }}>{r.term}</td><td style={{ minWidth: 240 }}>{r.rule}</td><td>{r.dim}</td><td className="small">{r.priority}</td>
                  <td className="mono xs">≥{r.t[0]} / ≥{r.t[1]}</td><td className="mono xs" style={{ minWidth: 220 }}>{r.tech}</td>
                  <td className="num"><ScorePill score={r.score} t={{ green: r.t[0], amber: r.t[1] }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  )
}
