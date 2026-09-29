import { useState } from 'react'
import { Ruler, Target, CircleDashed, GitCompare, BadgeCheck, Fingerprint, Timer } from 'lucide-react'
import Block from '../../components/Block.jsx'
import { Section, StepFlow, Callout } from '../../components/ui.jsx'

export const DIMENSIONS = [
  { id: 'Accuracy', icon: Target, q: 'Is the value in a data field correct?', measure: '% of values that match an authoritative source', rule: 'Base Salary in the HRIS equals Base Salary in the signed offer / payroll', fail: 'Salary keyed as 85,000 instead of 58,000' },
  { id: 'Completeness', icon: CircleDashed, q: 'Is all necessary data present, and are mandatory fields populated for all records?', measure: '% of records where the field is populated', rule: 'Date of Birth must not be null for active employees', fail: '312 employees without Date of Birth' },
  { id: 'Consistency', icon: GitCompare, q: 'Does the same field in two systems or tables show the same value?', measure: '% of records where values agree across systems', rule: 'Employment Status in HRIS = status in Payroll and Identity system', fail: 'Terminated in HRIS, still active in Payroll' },
  { id: 'Validity', icon: BadgeCheck, q: 'Do data values fall within acceptable ranges and formats defined by the business?', measure: '% of values conforming to format, range or allowed list', rule: 'Hire Date ≥ Date of Birth + 16 years; Country in ISO 3166 list', fail: 'Hire Date 2204-03-01; country "UK " with a trailing space' },
  { id: 'Uniqueness', icon: Fingerprint, q: 'Is each real-world entity recorded once, and can records for the same person be linked?', measure: '% of records with no duplicates on the business key', rule: 'One active Person record per National ID', fail: 'Rehire created a second person profile' },
  { id: 'Timeliness', icon: Timer, q: 'Is the data up to date and available when needed?', measure: '% of records updated within the agreed SLA', rule: 'Terminations entered within 2 business days of the last working day', fail: 'Termination entered 5 weeks late; access not revoked' },
]

// A tiny employee table seeded with defects. Each defect is tagged with the dimension it violates.
const ROWS = [
  { id: 'E10231', name: 'Amira Haddad', dob: '1988-04-12', hire: '2015-06-01', status: 'Active', payroll: 'Active', cc: 'CC-4100', country: 'AE', upd: '2 days' },
  { id: 'E10232', name: 'Liam O’Connor', dob: '', hire: '2019-01-14', status: 'Active', payroll: 'Active', cc: 'CC-4100', country: 'IE', upd: '1 day' },
  { id: 'E10233', name: 'Sara Nasser', dob: '1995-09-30', hire: '2204-03-01', status: 'Active', payroll: 'Active', cc: 'CC-5200', country: 'SA', upd: '3 days' },
  { id: 'E10234', name: 'Rahul Mehta', dob: '1979-02-17', hire: '2008-11-03', status: 'Terminated', payroll: 'Active', cc: 'CC-5200', country: 'IN', upd: '41 days' },
  { id: 'E10235', name: 'Amira Haddad', dob: '1988-04-12', hire: '2023-02-20', status: 'Active', payroll: 'Active', cc: 'CC-4300', country: 'AE', upd: '1 day' },
  { id: 'E10236', name: 'Chen Wei', dob: '1990-07-08', hire: '2017-05-22', status: 'Active', payroll: 'Active', cc: '', country: 'U.K.', upd: '2 days' },
]
const DEFECTS = {
  Completeness: [['E10232', 'dob'], ['E10236', 'cc']],
  Validity: [['E10233', 'hire'], ['E10236', 'country']],
  Consistency: [['E10234', 'status'], ['E10234', 'payroll']],
  Uniqueness: [['E10231', 'name'], ['E10235', 'name']],
  Timeliness: [['E10234', 'upd']],
  Accuracy: [['E10233', 'dob']],
}
const EXPLAIN = {
  Completeness: 'Liam has no Date of Birth and Chen has no Cost Center. Both are mandatory CDEs.',
  Validity: 'Sara’s Hire Date is in the future (2204) and Chen’s country "U.K." is not a valid ISO code (GB).',
  Consistency: 'Rahul is Terminated in the HRIS but still Active in Payroll.',
  Uniqueness: 'Amira Haddad appears twice with the same Date of Birth: a rehire created a second person record.',
  Timeliness: 'Rahul’s record was last updated 41 days ago: his termination reached systems far too late.',
  Accuracy: 'Sara’s Date of Birth passes every format check, but her passport says 1995-03-09: day and month were swapped. Only a trusted source reveals this.',
}

export default function Dimensions({ go }) {
  return (
    <Block
      go={go}
      icon={Ruler}
      title="Data quality dimensions"
      lead="Dimensions are the lenses we use to measure data quality. Every rule is written against one dimension, so scores can be compared and aggregated across elements, assets and domains."
      facts={[
        ['Standard set', 'Six core dimensions'],
        ['Used by', 'Every DQ rule'],
        ['Chosen by', 'Data Steward per CDE'],
        ['Reported as', 'Score % per dimension'],
      ]}
      templates={['Rule Definition']}
      process={
        <Section title="How to choose dimensions for an element">
          <StepFlow
            steps={[
              { title: 'Start from the use', owner: 'steward', desc: 'Ask how the element is used: pay, compliance, reporting, access? The use tells you what "wrong" means.' },
              { title: 'Always check completeness & validity', owner: 'steward', desc: 'These are cheap to measure and catch most entry errors. Apply them to every CDE.' },
              { title: 'Add consistency if shared', owner: ['steward', 'architect'], desc: 'If the element exists in more than one system, compare them.' },
              { title: 'Add uniqueness for keys', owner: 'steward', desc: 'Person, employee and position identifiers must be unique.' },
              { title: 'Add timeliness for events', owner: 'steward', desc: 'Hires, terminations, transfers and pay changes must arrive within an SLA.' },
              { title: 'Add accuracy where a source of truth exists', owner: ['steward', 'owner'], desc: 'Accuracy needs a reference (payroll, contract, government ID). Sample-based checks are fine.' },
            ]}
          />
        </Section>
      }
      framework={
        <Section title="The six dimensions" sub="Definition, how it's measured, an example rule and what failure looks like in HR data.">
          <div className="grid g3">
            {DIMENSIONS.map((d) => {
              const Icon = d.icon
              return (
                <article key={d.id} className="card stack" style={{ gap: 10 }}>
                  <div className="row"><div className="icon-tile"><Icon size={18} /></div><h3>{d.id}</h3></div>
                  <p style={{ fontWeight: 500 }}>{d.q}</p>
                  <dl className="kv small" style={{ gridTemplateColumns: '1fr' }}>
                    <dt>Measured as</dt><dd>{d.measure}</dd>
                    <dt>Example rule</dt><dd>{d.rule}</dd>
                    <dt>Failure looks like</dt><dd>{d.fail}</dd>
                  </dl>
                </article>
              )
            })}
          </div>
        </Section>
      }
      example={<DimensionLab />}
    />
  )
}

function DimensionLab() {
  const [dim, setDim] = useState('Completeness')
  const bad = (id, col) => DEFECTS[dim].some(([r, c]) => r === id && c === col)
  const cell = (r, col, v) => (
    <td style={bad(r.id, col) ? { background: 'var(--crit-soft)', color: 'var(--crit-ink)', fontWeight: 600, outline: '2px solid var(--crit)', outlineOffset: -2 } : {}}>
      {v || <span className="muted">(blank)</span>}
    </td>
  )
  return (
    <>
      <Section title="Dimension lab: one table, six lenses" sub="Six employee records hide six kinds of defect. Choose a dimension to highlight the cells that fail it.">
        <div className="row" style={{ gap: 6 }}>
          {DIMENSIONS.map((d) => (
            <button key={d.id} className={'btn sm' + (dim === d.id ? ' primary' : '')} onClick={() => setDim(d.id)}>{d.id}</button>
          ))}
        </div>
        <div className="table-wrap">
          <table className="t">
            <thead>
              <tr><th>Employee ID</th><th>Name</th><th>Date of Birth</th><th>Hire Date</th><th>HRIS Status</th><th>Payroll Status</th><th>Cost Center</th><th>Country</th><th>Last update</th></tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.id}>
                  <td className="mono">{r.id}</td>
                  {cell(r, 'name', r.name)}
                  {cell(r, 'dob', r.dob)}
                  {cell(r, 'hire', r.hire)}
                  {cell(r, 'status', r.status)}
                  {cell(r, 'payroll', r.payroll)}
                  {cell(r, 'cc', r.cc)}
                  {cell(r, 'country', r.country)}
                  {cell(r, 'upd', r.upd)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout title={dim}>{EXPLAIN[dim]}</Callout>
      </Section>
      <Callout tone="warn" title="Takeaway">
        A record can pass five dimensions and still fail the sixth. That's why each CDE is measured on several dimensions, and why accuracy (the hardest to automate) needs a trusted reference.
      </Callout>
    </>
  )
}
