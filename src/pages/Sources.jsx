import { useState } from 'react'
import { Waypoints, Building2, Keyboard, Plug, Database, BarChart3, ArchiveRestore } from 'lucide-react'
import { PageHead, Section, Callout, Pill } from '../components/ui.jsx'

export const SOURCES = [
  {
    id: 'business', icon: Building2, name: 'Business & regulatory changes', stage: 0,
    what: 'Laws, tariffs and programs change faster than the data definitions, reference tables, rules and mappings that describe them. A new tariff schedule, a VAT or excise rate change, a new excise category or a new e-invoicing wave can make yesterday’s correct data wrong or incomplete today.',
    causes: ['Annual tariff update adds, splits and retires HS codes', 'VAT or excise rate change with an effective date', 'New excise goods category added in law', 'New e-invoicing wave brings new taxpayers and fields', 'New international reporting requirement'],
    example: {
      title: 'New tariff codes missing on 1 January',
      story: 'The 2026 tariff schedule came into force on 1 January with 312 new 12-digit codes. FASAH was updated, but the warehouse tariff reference table was not. For three weeks, 8,400 declaration lines could not be mapped to a tariff chapter and appeared as "Unknown" in the revenue and trade statistics dashboards.',
      impact: 'Duty by chapter misreported for January; trade statistics release delayed by a week.',
    },
    detect: 'Validity rule: HS code exists in the tariff in force on the declaration date; alert when "Unknown" chapter share exceeds 0.1%.',
    prevent: 'Data impact assessment for every tariff, tax and e-invoicing change; tariff loaded and tested 30 days ahead; Champion flags upcoming changes.',
    fix: 'Load the new tariff into reference data, reprocess January, add tariff releases to the change calendar.',
    dims: ['Validity', 'Consistency', 'Completeness'],
  },
  {
    id: 'entry', icon: Keyboard, name: 'Data entry & submission', stage: 1,
    what: 'Brokers, taxpayers and officers create most of our data through declarations, returns, registrations and invoices. Keying errors, wrong classification, placeholder values, late filing and unclear guidance introduce defects at the point of submission.',
    causes: ['Broker selects a wrong or generic HS code', 'Customs value typed instead of calculated', 'Placeholder buyer VAT number (000000000000000)', 'Returns prepared from the general ledger, not issued invoices', 'Late filing by new or small taxpayers'],
    example: {
      title: 'Output VAT does not match e-invoices',
      story: 'In Q2, 1,870 taxpayers declared output VAT in their VAT return that was more than 2% different from the VAT on the e-invoices they issued in the same period. Most prepared the return from their general ledger, missing credit notes and invoices issued late in the month.',
      impact: 'Estimated SAR 96M of output VAT under-declared across the population, pending follow-up.',
    },
    detect: 'Consistency rule between return and e-invoice totals; completeness rule for buyer VAT; accuracy rule for customs value.',
    prevent: 'Pre-filled VAT returns from e-invoice totals, calculated CIF in the declaration form, placeholder blocking at clearance, broker and taxpayer guidance.',
    fix: 'Risk-based follow-up letters and amended returns; correct declarations through post-clearance audit.',
    dims: ['Accuracy', 'Consistency', 'Completeness', 'Timeliness'],
  },
  {
    id: 'integration', icon: Plug, name: 'Source systems & integrations', stage: 2, suggested: true,
    what: 'Data moves between FASAH, the ZATCA tax system, FATOORA, SAMA, treasury, other agencies and taxpayers’ own ERP systems. Interface mappings, missing validations, timeouts and different rounding logic corrupt or drop data in transit.',
    causes: ['Interface rejects records silently on timeout', 'Taxpayer ERP (EGS) rounds VAT per line instead of per invoice', 'Courier manifest API does not map importer TIN', 'Different code lists in two systems', 'Batch timing: target read before source finished'],
    example: {
      title: 'Import VAT not posted to the tax ledger',
      story: 'The nightly FASAH → ZATCA tax ledger interface transfers import VAT collected at the border to the tax ledger. After a network change, calls that took longer than 30 seconds timed out and the records were dropped without an error. 640 declarations with import VAT were never posted, so the taxpayers could not reclaim it as input VAT.',
      impact: 'SAR 11.2M of import VAT missing from the ledger; taxpayer refund claims rejected.',
    },
    detect: 'Record-count and amount reconciliation per interface run; accuracy rule: every import VAT has a ledger ID.',
    prevent: 'Data contracts with explicit types and rounding; quarantine instead of silent drops; interface regression tests; conformance testing for taxpayer EGS units.',
    fix: 'Replay the missing records, add reconciliation that blocks the posting run on mismatch.',
    dims: ['Consistency', 'Completeness', 'Accuracy'],
  },
  {
    id: 'dwh', icon: Database, name: 'Data warehouse & pipelines', stage: 3,
    what: 'The warehouse (landing → curated → gold) transforms and combines Customs, Tax and E-Invoicing data. Transformation bugs, incremental load gaps, amendments, replays and schema drift create defects that don’t exist in the source.',
    causes: ['Incremental load misses amended returns', 'Replay after an outage duplicates records', 'Join drops or duplicates rows', 'Schema change in the source not handled', 'Failed jobs without alerting (stale data)'],
    example: {
      title: 'Amended VAT returns missed by the incremental load',
      story: 'The VAT return pipeline picked up changes by original submission date. When 2,310 taxpayers amended their Q1 returns in May, the amendments kept the original submission date and were never loaded. The gold layer still showed the original net VAT payable.',
      impact: 'Net VAT payable for Q1 understated by SAR 38M in the compliance and revenue forecasts.',
    },
    detect: 'Consistency rule between source and gold for latest amendment; row-count reconciliation per layer; freshness rule on load timestamp.',
    prevent: 'Load on amendment timestamp or change-data-capture; idempotent merges on business keys; DQ gates before gold promotion.',
    fix: 'Correct the load logic, reload 2026 returns, add a source-to-gold reconciliation.',
    dims: ['Consistency', 'Timeliness', 'Uniqueness'],
  },
  {
    id: 'bi', icon: BarChart3, name: 'BI queries & report logic', stage: 4,
    what: 'Even with correct data, a report can be wrong. Different definitions of the same measure, wrong joins or filters, stale extracts and manual spreadsheet adjustments produce revenue and compliance numbers that don’t match.',
    causes: ['Original and amended returns both counted', 'Two definitions of "active taxpayer"', 'Filter excludes bonded-warehouse or free-zone declarations', 'Hard-coded exchange rates in a report', 'Manual adjustments in spreadsheets'],
    example: {
      title: 'Revenue dashboard double-counts amended returns',
      story: 'A new VAT revenue dashboard summed every return record. For 1,120 taxpayers who amended their Q2 return, both the original and the amendment were counted. The dashboard showed VAT collected 2.4% higher than the treasury ledger, and the figure was quoted in an executive briefing.',
      impact: 'Conflicting revenue figures presented to leadership; loss of trust in the dashboard.',
    },
    detect: 'Reconciliation of report totals to the treasury ledger; peer review of report logic; aggregate reasonableness rule.',
    prevent: 'Certified Revenue dataset with one row per return (latest amendment); semantic layer and business glossary; report certification.',
    fix: 'Rebase the dashboard on the certified dataset; publish a correction note.',
    dims: ['Accuracy', 'Consistency'],
  },
  {
    id: 'migration', icon: ArchiveRestore, name: 'Migration & reference data', stage: 2, suggested: true,
    what: 'Migrating from legacy systems, merging registries, or letting reference lists drift (tariff, exchange rates, port codes, country and currency codes) creates systematic defects affecting many records at once.',
    causes: ['Legacy migration created one registration per branch', 'Exchange rate feed gaps on holidays', 'Retired port or country codes still in use', 'Reference lists maintained in several places'],
    example: {
      title: 'Missing exchange rates on public holidays',
      story: 'The SAMA (Saudi Central Bank) publishes no exchange rates on public holidays. 1,240 foreign-currency declarations lodged on those days found no rate, and the pipeline converted their value to 0. July customs duty on the revenue dashboard came out 4% below the treasury ledger.',
      impact: 'July duty understated by SAR 27M in reports until reprocessed.',
    },
    detect: 'Completeness rule: a rate exists for every currency and calendar day; reconciliation of duty to the treasury ledger.',
    prevent: 'Govern exchange rates, tariff and port codes as CDEs with owners; fallback rules; one governed reference list per code set.',
    fix: 'Reprocess affected declarations; add a last-published-rate fallback and a missing-rate alert.',
    dims: ['Completeness', 'Validity', 'Accuracy'],
  },
]

const STAGES = ['Law, tariff & policy', 'Submission', 'Source systems & interfaces', 'Warehouse & pipelines', 'BI & reports', 'Decisions']

export default function Sources() {
  const [sel, setSel] = useState('business')
  const s = SOURCES.find((x) => x.id === sel)
  const Icon = s.icon
  return (
    <>
      <PageHead
        eyebrow="Chapter 5 · Root causes" icon={Waypoints}
        title="Where data quality issues come from"
        lead="Issues can enter at any point in the data journey, from a change in law or tariff to the final revenue report. Knowing the source tells you who fixes it, where the fix belongs and which proactive control would have stopped it."
      />

      <Section title="Along the data journey" sub="Six sources of data quality issues. Our four core sources plus two we recommend tracking separately (marked as suggested). Select one.">
        <div className="card" style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STAGES.length}, minmax(130px, 1fr))`, gap: 8, minWidth: 820 }}>
            {STAGES.map((st, i) => (
              <div key={st} className="stack" style={{ gap: 8 }}>
                <div style={{ background: i === STAGES.length - 1 ? 'var(--surface-3)' : 'var(--navy)', color: i === STAGES.length - 1 ? 'var(--ink)' : '#fff', padding: '10px 12px', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', clipPath: i < STAGES.length - 1 ? 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)' : undefined }}>
                  {st}
                </div>
                {SOURCES.filter((x) => x.stage === i).map((x) => {
                  const I = x.icon
                  return (
                    <button key={x.id} onClick={() => setSel(x.id)} className="card flat stack" style={{ gap: 6, padding: 12, textAlign: 'left', cursor: 'pointer', borderColor: sel === x.id ? 'var(--accent)' : 'var(--line)', borderWidth: sel === x.id ? 2 : 1, background: sel === x.id ? 'var(--accent-soft)' : 'var(--surface)' }}>
                      <I size={18} color="var(--accent-ink)" />
                      <b className="small">{x.name}</b>
                      {x.suggested && <Pill tone="accent">Suggested</Pill>}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </Section>

      <section className="card stack" style={{ gap: 18 }}>
        <div className="row"><div className="icon-tile navy"><Icon size={20} /></div><h2>{s.name}</h2>{s.suggested && <Pill tone="accent">Suggested addition</Pill>}</div>
        <p style={{ color: 'var(--ink-2)', maxWidth: '80ch' }}>{s.what}</p>
        <div className="grid g2">
          <div className="stack">
            <h4>Typical causes</h4>
            <ul className="bullets small">{s.causes.map((c) => <li key={c}>{c}</li>)}</ul>
            <h4 style={{ marginTop: 6 }}>Dimensions usually affected</h4>
            <div className="row" style={{ gap: 6 }}>{s.dims.map((d) => <Pill key={d} tone="neutral">{d}</Pill>)}</div>
          </div>
          <div className="card tint stack" style={{ gap: 8 }}>
            <div className="eyebrow">Example</div>
            <h3>{s.example.title}</h3>
            <p className="small">{s.example.story}</p>
            <p className="small"><b>Impact:</b> {s.example.impact}</p>
          </div>
        </div>
        <div className="grid g3">
          <div className="card flat stack" style={{ gap: 4 }}><div className="eyebrow">Detect (reactive)</div><p className="small">{s.detect}</p></div>
          <div className="card flat stack" style={{ gap: 4 }}><div className="eyebrow">Prevent (proactive)</div><p className="small">{s.prevent}</p></div>
          <div className="card flat stack" style={{ gap: 4 }}><div className="eyebrow">Fix</div><p className="small">{s.fix}</p></div>
        </div>
      </section>

      <Section title="All sources at a glance">
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>Source</th><th>Example</th><th>Best detection</th><th>Best prevention</th></tr></thead>
            <tbody>
              {SOURCES.map((x) => (
                <tr key={x.id} className="clickable" onClick={() => setSel(x.id)}>
                  <td style={{ fontWeight: 600, minWidth: 170 }}>{x.name}</td><td style={{ minWidth: 200 }}>{x.example.title}</td><td className="small" style={{ minWidth: 220 }}>{x.detect}</td><td className="small" style={{ minWidth: 220 }}>{x.prevent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Callout title="Why we added two sources">
        <b>Source systems & integrations</b> and <b>migration & reference data</b> behave differently from submission and warehouse issues: they are systematic (hundreds or thousands of declarations or invoices at once), are fixed by different teams, and need different controls (interface reconciliation, reference data ownership). Tracking them separately makes RCA trends more useful.
      </Callout>
    </>
  )
}
