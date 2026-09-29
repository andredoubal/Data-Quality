import { useState } from 'react'
import { Waypoints, Building2, Keyboard, Plug, Database, BarChart3, ArchiveRestore } from 'lucide-react'
import { PageHead, Section, Callout, Pill } from '../components/ui.jsx'

export const SOURCES = [
  {
    id: 'business', icon: Building2, name: 'Business changes', stage: 0,
    what: 'The business changes faster than the data definitions, rules and mappings that describe it. Reorganizations, new policies, new pay components, acquisitions or new legal requirements make yesterday’s correct data wrong or incomplete today.',
    causes: ['Reorg creates new departments or cost centers', 'New policy changes eligibility or definitions', 'M&A brings a new population with different codes', 'New regulation needs data that was never captured'],
    example: {
      title: 'Reorganization breaks headcount by department',
      story: 'On 1 July, Operations was split into "Field Operations" and "Operations Support" with 18 new cost centers. Finance created them in its master, but the HR reporting hierarchy was not updated. The headcount dashboard showed 52 employees in two departments, and cost allocation for Q3 posted 236 employees to a suspense account.',
      impact: 'Headcount overstated by 52; $1.4M of salary cost in suspense for three weeks.',
    },
    detect: 'Consistency rule: every active cost center has a parent in the reporting hierarchy; month-over-month headcount variance > 3% alert.',
    prevent: 'Data impact assessment in every reorg and policy change; Champion flags upcoming changes to the Steward.',
    fix: 'Map new cost centers, reprocess affected periods, add the hierarchy step to the reorg checklist.',
    dims: ['Consistency', 'Completeness', 'Validity'],
  },
  {
    id: 'entry', icon: Keyboard, name: 'Data entry & operational issues', stage: 1,
    what: 'People create most HR data by hand: hires, transfers, pay changes, terminations. Typos, workarounds, placeholder values, late entry and missing training all introduce defects at the point of creation.',
    causes: ['Manual typing errors and swapped fields', 'Placeholder values to bypass mandatory fields', 'Late or missing transactions (terminations, transfers)', 'Duplicate records on rehire', 'Unclear definitions or no training'],
    example: {
      title: 'Placeholder birth dates and late terminations',
      story: 'HR Operations used 1901-01-01 as Date of Birth when documents were missing, so 41 records passed the completeness rule but were effectively blank. In the same quarter, 7 terminations were entered after the payroll cut-off, so those employees were paid one extra month.',
      impact: 'Pension eligibility report wrong for 41 employees; $38k overpayment to recover.',
    },
    detect: 'Validity rule for placeholder dates; timeliness rule on termination entry lag; duplicate-person check.',
    prevent: 'Pick-lists and validations in the HRIS form, "document pending" status instead of fake values, termination SLA and training.',
    fix: 'Correct records at source from documents; recover overpayments; retrain the team.',
    dims: ['Accuracy', 'Validity', 'Timeliness', 'Uniqueness'],
  },
  {
    id: 'integration', icon: Plug, name: 'Source systems & integrations', stage: 2, suggested: true,
    what: 'Data moves between the HRIS, payroll, identity management, finance and benefits providers. Interface mappings, missing validations in a source system, timing mismatches and silent record drops corrupt data in transit.',
    causes: ['Interface field mapping errors (truncation, leading zeros)', 'Records rejected by the target without alerting', 'Different code lists in two systems', 'Batch timing: target updated before source'],
    example: {
      title: 'Leading zeros dropped in the payroll interface',
      story: 'After an interface upgrade, the HRIS → Payroll file wrote Employee ID as a number, so "E00412" style IDs lost characters for 124 employees hired before 2005. Payroll created new payee records for them instead of updating the existing ones.',
      impact: '124 duplicate payees; year-end tax forms at risk.',
    },
    detect: 'Record-count and checksum reconciliation per run; consistency rule HRIS ID = Payroll ID; uniqueness on payee.',
    prevent: 'Data contracts with explicit data types; interface regression tests; schema-change alerts.',
    fix: 'Fix the mapping, merge duplicate payees, replay the affected interface runs.',
    dims: ['Consistency', 'Uniqueness', 'Validity'],
  },
  {
    id: 'dwh', icon: Database, name: 'Data warehouse & pipelines', stage: 3,
    what: 'The warehouse (landing → curated → gold) transforms and combines data. Transformation bugs, incremental load gaps, late-arriving data, history handling and schema drift can create defects that don’t exist in the source.',
    causes: ['Incremental load misses late or back-dated changes', 'Slowly changing dimension (history) logic errors', 'Join that drops or duplicates rows', 'Schema drift in the source not handled', 'Failed jobs without alerting (stale data)'],
    example: {
      title: 'Back-dated terminations missed by the incremental load',
      story: 'The nightly Employee pipeline picked up changes where last_modified > previous run. Terminations entered with an effective date in the past but processed by an overnight HRIS batch kept the old last_modified stamp. 63 terminated employees stayed "Active" in the gold layer for up to six weeks.',
      impact: 'Attrition rate understated by 0.5 pts; headcount overstated in the executive pack.',
    },
    detect: 'Consistency rule between source and gold status; row-count reconciliation per layer; freshness rule on load timestamp.',
    prevent: 'Change-data-capture or effective-date based loads; DQ gates before gold promotion; pipeline unit tests.',
    fix: 'Correct load logic, reload affected history, add reconciliation to the pipeline.',
    dims: ['Consistency', 'Timeliness', 'Completeness'],
  },
  {
    id: 'bi', icon: BarChart3, name: 'BI queries & report logic', stage: 4,
    what: 'Even with perfect data, a report can be wrong. Different definitions of the same measure, wrong joins or filters, stale extracts and spreadsheet manipulations produce numbers that don’t match.',
    causes: ['Two reports define "active headcount" differently', 'Join to a one-to-many table duplicates people', 'Filter excludes a population (e.g., leave of absence)', 'Hard-coded values or stale extracts', 'Manual spreadsheet adjustments'],
    example: {
      title: 'Concurrent jobs double-count headcount',
      story: 'A new diversity dashboard joined Employee to Assignment. 214 employees with two concurrent assignments were counted twice. The report showed 12,694 employees while the certified headcount was 12,480, and the female representation ratio was off by 0.8 pts.',
      impact: 'Conflicting numbers presented to the executive committee; loss of trust in both reports.',
    },
    detect: 'Report reconciliation to certified control totals; peer review; aggregate reasonableness rule.',
    prevent: 'Certified datasets and a semantic layer with one definition per measure; business glossary; report certification.',
    fix: 'Use primary assignment only; rebase the report on the certified Workforce dataset.',
    dims: ['Accuracy', 'Consistency'],
  },
  {
    id: 'migration', icon: ArchiveRestore, name: 'Data migration & reference data', stage: 2, suggested: true,
    what: 'Moving from a legacy system, merging populations after an acquisition, or letting reference lists (countries, grades, job codes) drift creates systematic defects affecting many records at once.',
    causes: ['Legacy-to-new code mapping errors', 'Default values used for unmapped fields', 'Reference lists maintained in several places', 'Retired codes still in use'],
    example: {
      title: 'Legacy grade mapping after an acquisition',
      story: 'When 900 employees from an acquired company were migrated, their 14 legacy grades were mapped to our grades by name. Three names matched but meant different levels, so 156 employees landed in a grade whose salary band didn’t fit their pay.',
      impact: 'Salary-in-band rule failed for 156 employees; merit cycle recommendations were wrong.',
    },
    detect: 'Profiling before and after migration; validity rule salary within grade band; reconciliation of totals.',
    prevent: 'Profile legacy data first, owner-approved mapping tables, mock migrations with DQ checks, one governed reference list.',
    fix: 'Re-map grades with HR Rewards, correct records, add grade mapping to the reference data catalog.',
    dims: ['Validity', 'Accuracy', 'Consistency'],
  },
]

const STAGES = ['Business', 'Data entry', 'Source systems & interfaces', 'Warehouse & pipelines', 'BI & reports', 'Decisions']

export default function Sources() {
  const [sel, setSel] = useState('business')
  const s = SOURCES.find((x) => x.id === sel)
  const Icon = s.icon
  return (
    <>
      <PageHead
        eyebrow="Chapter 5 · Root causes" icon={Waypoints}
        title="Where data quality issues come from"
        lead="Issues can enter at any point in the data journey, from a business decision to the final report. Knowing the source tells you who fixes it, where the fix belongs and which proactive control would have stopped it."
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
        <b>Source systems & integrations</b> and <b>data migration & reference data</b> behave differently from data entry and warehouse issues: they are systematic (hundreds of records at once), are fixed by different teams, and need different controls (interface reconciliation, mapping approval). Tracking them separately makes RCA trends more useful.
      </Callout>
    </>
  )
}
