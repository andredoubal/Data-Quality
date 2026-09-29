import { useState } from 'react'
import { BookOpen, Search, CheckCircle2, XCircle } from 'lucide-react'
import { PageHead, Section, Pill } from '../components/ui.jsx'

const TERMS = [
  ['CIF / customs value', 'Value of imported goods for duty purposes: cost (FOB) + insurance + freight.'],
  ['Clearance (e-invoicing)', 'Real-time validation and stamping of a standard (B2B) tax invoice by FATOORA before it is shared with the buyer.'],
  ['Reporting (e-invoicing)', 'Submission of a simplified B2C invoice to FATOORA after issue, within 24 hours.'],
  ['EGS unit', 'E-invoice generation solution: the taxpayer’s device or ERP that creates and submits e-invoices.'],
  ['HS code', 'Harmonized System tariff code classifying goods; extended nationally to 12 digits.'],
  ['TIN / VAT number', 'Taxpayer identifiers used across Customs, Tax and E-Invoicing. The Saudi VAT registration number has 15 digits and starts and ends with 3 (e.g., 310122334400003).'],
  ['ZATCA', 'Zakat, Tax and Customs Authority: the authority that owns the Customs, Tax and E-Invoicing data in this portal.'],
  ['FASAH', 'The Saudi customs single window where import, export and transit declarations are submitted and cleared.'],
  ['FATOORA', 'ZATCA\u2019s e-invoicing platform: clears standard (B2B) tax invoices and receives reported simplified (B2C) invoices.'],
  ['CSID', 'Cryptographic Stamp Identifier: the certificate ZATCA issues to each onboarded EGS unit so it can sign e-invoices.'],
  ['Invoice hash / PIH', 'Each e-invoice carries its own hash and the previous invoice hash (PIH), chaining a device\u2019s invoices so gaps or tampering can be detected.'],
  ['QR code (e-invoice)', 'Mandatory code on e-invoices carrying seller name, VAT number, timestamp, totals and the cryptographic stamp.'],
  ['SAMA', 'Saudi Central Bank; publishes the exchange rates used to convert foreign-currency customs values.'],
  ['Invoice UUID', 'Universally unique identifier of an e-invoice, used to detect duplicates.'],
  ['Amended return', 'A corrected VAT or excise return that replaces the original for the same period.'],
  ['Acceptance threshold', 'The pass-rate levels that decide whether a rule result is fine (green), needs monitoring (amber) or needs remediation (red).'],
  ['Baseline', 'A frozen snapshot of DQ scores at a point in time, used to measure improvement. Required at least quarterly.'],
  ['Business rule / DQ rule', 'A testable statement of what good data looks like, written against one dimension.'],
  ['Business term', 'A governed business concept with an agreed definition, owner and steward, recorded in the catalog.'],
  ['CDE (Critical Data Element)', 'A data element whose quality materially affects compliance, finance, operations or key decisions.'],
  ['Data catalog', 'The inventory of data assets, business terms, lineage and quality scores (Informatica CDGC).'],
  ['Data Champion', 'Business lead who confirms priorities and promotes data quality in their function.'],
  ['Data Custodian', 'Technical team that implements and runs data platforms, rules, scans and technical fixes.'],
  ['Data contract', 'An agreement between a data producer and consumer on schema, meaning, quality and freshness.'],
  ['Data domain', 'A functional area of data with one accountable Data Owner: Customs, Tax or E-Invoicing.'],
  ['Data impact assessment', 'A check on how a business or system change affects data, rules and reports, done before go-live.'],
  ['Data lineage', 'The path data takes from source to report, including every transformation.'],
  ['Data Owner', 'Senior business leader accountable for the quality of a data domain.'],
  ['Data profiling', 'Systematic examination of data content, structure and relationships to understand what the data really looks like.'],
  ['Data Steward', 'Business subject-matter expert who defines rules and drives issues to closure.'],
  ['DQ gate', 'A rule executed in a pipeline that stops or quarantines data failing a threshold.'],
  ['DQ score', 'Records passing a rule ÷ records evaluated, aggregated to element, asset, domain and enterprise.'],
  ['Dimension', 'One of seven lenses for measuring quality: completeness, accuracy, validity, consistency, uniqueness, timeliness, integrity.'],
  ['Issue registry', 'The single log of data quality issues with their evidence, owner, priority, root cause and resolution.'],
  ['Proactive DQ', 'Preventing defects through standards, validation, controls and change assessment.'],
  ['Reactive DQ', 'Detecting, investigating and repairing defects that already exist.'],
  ['Reference data', 'Governed lists of allowed values (tariff, exchange rates, country, currency and port codes) used across systems.'],
  ['Remediation', 'Actions that correct defective data and remove the root cause.'],
  ['Root cause analysis (RCA)', 'Structured investigation into why an issue happened, using 5 Whys, fishbone and lineage.'],
  ['SLO (service level objective)', 'Target time to resolve an issue by priority (e.g., Critical in 5 business days).'],
]

const QUIZ = [
  { q: 'FATOORA rejects an invoice with a missing buyer VAT number at clearance. This is…', o: ['Reactive data quality', 'Proactive data quality', 'Profiling'], a: 1 },
  { q: 'Who approves a change to a data quality rule before the Custodian implements it?', o: ['Data Steward', 'Data Custodian', 'Data Owner'], a: 2 },
  { q: 'Output VAT in the return differs from VAT on the taxpayer’s e-invoices. Which dimension fails?', o: ['Consistency', 'Uniqueness', 'Timeliness'], a: 0 },
  { q: 'An invoice shows VAT of 105.00 on 1,000.00 at 15%. The format is fine. Which dimension fails?', o: ['Validity', 'Accuracy', 'Completeness'], a: 1 },
  { q: 'A credit note refers to an original invoice UUID that does not exist anywhere. Which dimension fails?', o: ['Integrity', 'Timeliness', 'Accuracy'], a: 0 },
  { q: 'How often must data quality be baselined at minimum?', o: ['Monthly', 'Quarterly', 'Yearly'], a: 1 },
  { q: 'The revenue dashboard counts both original and amended VAT returns. The source of the issue is…', o: ['Data entry', 'Business change', 'BI query / report logic'], a: 2 },
  { q: 'A declaration in the warehouse has the wrong HS code because the broker submitted it wrong. Where should it be corrected?', o: ['In the warehouse', 'In FASAH, with the broker', 'In the report'], a: 1 },
  { q: 'New HS codes from the annual tariff update are missing in the warehouse. Which source is this?', o: ['Business & regulatory change', 'BI query', 'Data entry'], a: 0 },
]

export default function Glossary() {
  const [q, setQ] = useState('')
  const [ans, setAns] = useState({})
  const list = [...TERMS].sort((a, b) => a[0].localeCompare(b[0])).filter(([t, d]) => (t + d).toLowerCase().includes(q.toLowerCase()))
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

      <Section title="Knowledge check" sub="Nine questions. Pick an answer to see if you got it right." action={
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
