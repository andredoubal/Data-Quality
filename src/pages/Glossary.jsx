import { useState } from 'react'
import { BookOpen, Search, CheckCircle2, XCircle } from 'lucide-react'
import { PageHead, Section, Pill } from '../components/ui.jsx'

const TERMS = [
  ['Acceptance threshold', 'The pass-rate levels that decide whether a rule result is fine (green), needs monitoring (amber) or needs remediation (red).'],
  ['Baseline', 'A frozen snapshot of DQ scores at a point in time, used to measure improvement. Required at least quarterly.'],
  ['Business rule / DQ rule', 'A testable statement of what good data looks like, written against one dimension.'],
  ['Business term', 'A governed business concept with an agreed definition, owner and steward, recorded in the catalog.'],
  ['CDE (Critical Data Element)', 'A data element whose quality materially affects compliance, finance, operations or key decisions.'],
  ['Data catalog', 'The inventory of data assets, business terms, lineage and quality scores (Informatica CDGC).'],
  ['Data Champion', 'Business lead who confirms priorities and promotes data quality in their function.'],
  ['Data Custodian', 'Technical team that implements and runs data platforms, rules, scans and technical fixes.'],
  ['Data contract', 'An agreement between a data producer and consumer on schema, meaning, quality and freshness.'],
  ['Data domain', 'A functional area of data with one accountable Data Owner (e.g., Employee, Compensation).'],
  ['Data impact assessment', 'A check on how a business or system change affects data, rules and reports, done before go-live.'],
  ['Data lineage', 'The path data takes from source to report, including every transformation.'],
  ['Data Owner', 'Senior business leader accountable for the quality of a data domain.'],
  ['Data profiling', 'Systematic examination of data content, structure and relationships to understand what the data really looks like.'],
  ['Data Steward', 'Business subject-matter expert who defines rules and drives issues to closure.'],
  ['DQ gate', 'A rule executed in a pipeline that stops or quarantines data failing a threshold.'],
  ['DQ score', 'Records passing a rule ÷ records evaluated, aggregated to element, asset, domain and enterprise.'],
  ['Dimension', 'A lens for measuring quality: completeness, accuracy, validity, consistency, uniqueness, timeliness.'],
  ['Issue registry', 'The single log of data quality issues with their evidence, owner, priority, root cause and resolution.'],
  ['Proactive DQ', 'Preventing defects through standards, validation, controls and change assessment.'],
  ['Reactive DQ', 'Detecting, investigating and repairing defects that already exist.'],
  ['Reference data', 'Governed lists of allowed values (countries, grades, job codes) used across systems.'],
  ['Remediation', 'Actions that correct defective data and remove the root cause.'],
  ['Root cause analysis (RCA)', 'Structured investigation into why an issue happened, using 5 Whys, fishbone and lineage.'],
  ['SLO (service level objective)', 'Target time to resolve an issue by priority (e.g., Critical in 5 business days).'],
]

const QUIZ = [
  { q: 'A new pay component is designed with a pick-list and a validation before go-live. This is…', o: ['Reactive data quality', 'Proactive data quality', 'Profiling'], a: 1 },
  { q: 'Who approves a change to a data quality rule before the Custodian implements it?', o: ['Data Steward', 'Data Custodian', 'Data Owner'], a: 2 },
  { q: '"Terminated in HRIS but active in Payroll" fails which dimension?', o: ['Consistency', 'Uniqueness', 'Timeliness'], a: 0 },
  { q: 'A record passes every format check but the salary is wrong vs. the contract. Which dimension fails?', o: ['Validity', 'Accuracy', 'Completeness'], a: 1 },
  { q: 'How often must data quality be baselined at minimum?', o: ['Monthly', 'Quarterly', 'Yearly'], a: 1 },
  { q: 'A report joins employees to all their assignments and double counts. The source of the issue is…', o: ['Data entry', 'Business change', 'BI query / report logic'], a: 2 },
  { q: 'The warehouse value is wrong because the source is wrong. Where should it be corrected?', o: ['In the warehouse', 'In the source system', 'In the report'], a: 1 },
  { q: 'In our final DQ score, Business Critical rules carry what weight?', o: ['35%', '50%', '60%'], a: 2 },
]

export default function Glossary() {
  const [q, setQ] = useState('')
  const [ans, setAns] = useState({})
  const list = TERMS.filter(([t, d]) => (t + d).toLowerCase().includes(q.toLowerCase()))
  const done = Object.keys(ans).length
  const correct = QUIZ.filter((x, i) => ans[i] === x.a).length
  return (
    <>
      <PageHead eyebrow="Workbench" icon={BookOpen} title="Glossary & knowledge check" lead="The shared vocabulary of the program, and a short quiz to check your understanding." />
      <Section title="Glossary" action={
        <div style={{ position: 'relative', minWidth: 240 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--muted)' }} />
          <input id="glossary-search" className="input" style={{ width: '100%', paddingLeft: 32 }} placeholder="Search terms" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      }>
        <div className="grid g2" style={{ gap: 10 }}>
          {list.map(([t, d]) => (
            <div key={t} className="card flat" style={{ padding: 14 }}>
              <b>{t}</b>
              <p className="small" style={{ color: 'var(--ink-2)', marginTop: 2 }}>{d}</p>
            </div>
          ))}
          {!list.length && <p className="muted">No terms match "{q}".</p>}
        </div>
      </Section>

      <Section title="Knowledge check" sub="Eight questions. Pick an answer to see if you got it right." action={
        <div className="row"><Pill tone={done === QUIZ.length ? (correct >= 6 ? 'good' : 'warn') : 'neutral'}>{correct} / {QUIZ.length} correct</Pill>{done > 0 && <button className="btn sm" onClick={() => setAns({})}>Reset</button>}</div>
      }>
        <div className="grid g2">
          {QUIZ.map((x, i) => (
            <div key={i} className="card stack" style={{ gap: 10 }}>
              <p style={{ fontWeight: 600 }}><span className="mono muted">Q{i + 1}. </span>{x.q}</p>
              <div className="stack" style={{ gap: 6 }}>
                {x.o.map((o, k) => {
                  const picked = ans[i] === k
                  const show = ans[i] != null
                  const right = k === x.a
                  return (
                    <button key={k} className="btn" disabled={show} onClick={() => setAns({ ...ans, [i]: k })}
                      style={{ justifyContent: 'space-between', cursor: show ? 'default' : 'pointer', background: show && right ? 'var(--good-soft)' : show && picked ? 'var(--crit-soft)' : 'var(--surface)', borderColor: show && right ? 'var(--good)' : show && picked ? 'var(--crit)' : 'var(--line-strong)', color: 'var(--ink)' }}>
                      {o}
                      {show && right && <CheckCircle2 size={16} color="var(--good)" />}
                      {show && picked && !right && <XCircle size={16} color="var(--crit)" />}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}
