import { useState } from 'react'
import { Ruler, Target, CircleDashed, GitCompare, BadgeCheck, Fingerprint, Timer } from 'lucide-react'
import Block from '../../components/Block.jsx'
import { Section, StepFlow, Callout } from '../../components/ui.jsx'

export const DIMENSIONS = [
  { id: 'Accuracy', icon: Target, q: 'Is the value in a data field correct?', measure: '% of values that match an authoritative source or recalculation', rule: 'Invoice VAT amount = taxable amount × VAT rate; customs value = FOB + freight + insurance', fail: 'VAT of 105.00 on a taxable amount of 1,000.00 at 15% (should be 150.00)' },
  { id: 'Completeness', icon: CircleDashed, q: 'Is all necessary data present, and are mandatory fields populated for all records?', measure: '% of records where the field is populated', rule: 'Importer TIN must not be null on import declarations', fail: '3,100 courier declarations without an importer TIN' },
  { id: 'Consistency', icon: GitCompare, q: 'Does the same fact show the same value across systems or tables?', measure: '% of records where values agree across systems', rule: 'Output VAT in the return reconciles to VAT on the taxpayer’s e-invoices', fail: 'Return declares 2.1M output VAT; e-invoices total 2.6M' },
  { id: 'Validity', icon: BadgeCheck, q: 'Do values fall within the formats, ranges and code lists defined by the business?', measure: '% of values conforming to format, range or allowed list', rule: 'HS code exists in the tariff in force; VAT number is 15 digits with a valid check digit', fail: 'Retired HS code used after 1 January; VAT number with 14 digits' },
  { id: 'Uniqueness', icon: Fingerprint, q: 'Is each real-world record captured once?', measure: '% of records with no duplicates on the business key', rule: 'One record per e-invoice UUID; one active VAT registration per commercial registration', fail: 'Same invoice UUID loaded twice after a batch replay' },
  { id: 'Timeliness', icon: Timer, q: 'Is the data submitted and available when it should be?', measure: '% of records received within the agreed deadline', rule: 'Simplified invoices reported within 24 hours; VAT returns filed by the due date', fail: 'Retail POS invoices reported 52 hours after issue' },
]

// A small set of e-invoices seeded with defects. Each defect is tagged with the dimension it violates.
const ROWS = [
  { id: 'INV-1001', uuid: '8e1f…a2c4', type: 'Standard', seller: '300112233400003', sstatus: 'Active', buyer: '310998877600003', issued: '2026-09-20', taxable: '1,000.00', vat: '150.00', rep: '0 h' },
  { id: 'INV-1002', uuid: '5c0a…19b7', type: 'Standard', seller: '300112233400003', sstatus: 'Active', buyer: '', issued: '2026-09-21', taxable: '4,200.00', vat: '630.00', rep: '0 h' },
  { id: 'INV-1003', uuid: 'd4e2…7f10', type: 'Standard', seller: '30055443320003', sstatus: 'Active', buyer: '311223344500003', issued: '2026-11-02', taxable: '1,000.00', vat: '105.00', rep: '0 h' },
  { id: 'INV-1004', uuid: '7a93…c3e8', type: 'Simplified', seller: '300776655400003', sstatus: 'Deregistered', buyer: '—', issued: '2026-09-18', taxable: '86.96', vat: '13.04', rep: '52 h' },
  { id: 'INV-1005', uuid: '8e1f…a2c4', type: 'Standard', seller: '300112233400003', sstatus: 'Active', buyer: '310998877600003', issued: '2026-09-20', taxable: '1,000.00', vat: '150.00', rep: '0 h' },
  { id: 'INV-1006', uuid: 'b210…44d1', type: 'Simplified', seller: '300665544300003', sstatus: 'Active', buyer: '—', issued: '2026-09-22', taxable: '43.48', vat: '6.52', rep: '3 h' },
]
const DEFECTS = {
  Completeness: [['INV-1002', 'buyer']],
  Validity: [['INV-1003', 'seller'], ['INV-1003', 'issued']],
  Consistency: [['INV-1004', 'seller'], ['INV-1004', 'sstatus']],
  Uniqueness: [['INV-1001', 'uuid'], ['INV-1005', 'uuid']],
  Timeliness: [['INV-1004', 'rep']],
  Accuracy: [['INV-1003', 'vat']],
}
const EXPLAIN = {
  Completeness: 'INV-1002 is a standard B2B tax invoice with no buyer VAT number. It is mandatory for standard invoices.',
  Validity: 'INV-1003 has a seller VAT number with only 14 digits, and an issue date in the future (2 November 2026).',
  Consistency: 'INV-1004 was issued by a seller that the taxpayer registry shows as Deregistered. The two systems disagree.',
  Uniqueness: 'INV-1001 and INV-1005 carry the same UUID: the same invoice was loaded twice.',
  Timeliness: 'INV-1004 is a simplified invoice reported 52 hours after issue. The limit is 24 hours.',
  Accuracy: 'INV-1003 shows VAT of 105.00 on 1,000.00 at 15%. The digits look plausible and pass format checks, but the correct value is 150.00. Only a recalculation reveals it.',
}

export default function Dimensions({ go }) {
  return (
    <Block
      go={go}
      icon={Ruler}
      title="Data quality dimensions"
      lead="Dimensions are the lenses we use to measure data quality. Every rule is written against one dimension, so scores can be compared and aggregated across Customs, Tax and E-Invoicing."
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
              { title: 'Start from the use', owner: 'steward', desc: 'Ask how the element is used: duty and VAT calculation, risk targeting, trade statistics, refunds? The use tells you what "wrong" means.' },
              { title: 'Always check completeness & validity', owner: 'steward', desc: 'Cheap to measure, and they catch most submission errors. Apply them to every CDE.' },
              { title: 'Add consistency if shared', owner: ['steward', 'architect'], desc: 'If the fact exists in more than one system (declaration ↔ tax ledger, return ↔ e-invoices), compare them.' },
              { title: 'Add uniqueness for keys', owner: 'steward', desc: 'TINs, VAT registrations, declaration numbers and invoice UUIDs must be unique.' },
              { title: 'Add timeliness for deadlines', owner: 'steward', desc: 'Returns, e-invoice reporting and interface loads all have legal or agreed deadlines.' },
              { title: 'Add accuracy where a source of truth exists', owner: ['steward', 'owner'], desc: 'Accuracy needs a reference: a recalculation, a certificate, an audit sample. Sample-based checks are fine.' },
            ]}
          />
        </Section>
      }
      framework={
        <Section title="The six dimensions" sub="Definition, how it's measured, an example rule and what failure looks like in our data.">
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
  const cell = (r, col, v, mono) => (
    <td className={mono ? 'mono' : ''} style={bad(r.id, col) ? { background: 'var(--crit-soft)', color: 'var(--crit-ink)', fontWeight: 600, outline: '2px solid var(--crit)', outlineOffset: -2 } : {}}>
      {v || <span className="muted">(blank)</span>}
    </td>
  )
  return (
    <>
      <Section title="Dimension lab: six e-invoices, six lenses" sub="These invoices hide six kinds of defect. Choose a dimension to highlight the cells that fail it.">
        <div className="row" style={{ gap: 6 }}>
          {DIMENSIONS.map((d) => (
            <button key={d.id} className={'btn sm' + (dim === d.id ? ' primary' : '')} onClick={() => setDim(d.id)}>{d.id}</button>
          ))}
        </div>
        <div className="table-wrap">
          <table className="t">
            <thead>
              <tr><th>Invoice</th><th>UUID</th><th>Type</th><th>Seller VAT</th><th>Seller status (registry)</th><th>Buyer VAT</th><th>Issue date</th><th className="num">Taxable</th><th className="num">VAT 15%</th><th>Reported after</th></tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.id}>
                  <td className="mono">{r.id}</td>
                  {cell(r, 'uuid', r.uuid, true)}
                  <td>{r.type}</td>
                  {cell(r, 'seller', r.seller, true)}
                  {cell(r, 'sstatus', r.sstatus)}
                  {cell(r, 'buyer', r.buyer, true)}
                  {cell(r, 'issued', r.issued)}
                  <td className="num">{r.taxable}</td>
                  {cell(r, 'vat', r.vat)}
                  {cell(r, 'rep', r.rep)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout title={dim}>{EXPLAIN[dim]}</Callout>
      </Section>
      <Callout tone="warn" title="Takeaway">
        A record can pass five dimensions and still fail the sixth. That's why each CDE is measured on several dimensions, and why accuracy (the hardest to automate) needs a recalculation or a trusted reference.
      </Callout>
    </>
  )
}
