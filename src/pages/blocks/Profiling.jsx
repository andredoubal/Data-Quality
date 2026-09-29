import { useState } from 'react'
import { ScanSearch } from 'lucide-react'
import Block from '../../components/Block.jsx'
import { Section, StepFlow, Callout, Pill } from '../../components/ui.jsx'

const LENSES = {
  Content: {
    color: 'var(--s1)',
    items: [
      ['Data domain', 'Validate formats and types of values expected (e.g., Country = ISO code).'],
      ['Data format exceptions', 'Flag outliers and anomalies that don’t match the expected format (e.g., date formats).'],
      ['Columnar consistency', 'Check null values using distinct / unique counts.'],
    ],
  },
  Structure: {
    color: 'var(--s7)',
    items: [
      ['Boundaries & outliers', 'Analyze upper / lower bounds and frequency distributions.'],
      ['Aggregation', 'Summary statistics to confirm against business logic (e.g., total headcount).'],
      ['Data types', 'Audit the expected data type of each column (string, date, boolean).'],
    ],
  },
  Relationship: {
    color: 'var(--s3)',
    items: [
      ['Data lineage', 'Check the values in the data model match the values in source systems.'],
      ['Entity relationships', 'Compare raw / landing layers with downstream semantic layers; confirm referential integrity.'],
    ],
  },
}

const TRIGGERS = [
  ['Data issue identification', 'When a DQ issue is found, profile the data to show where structural and business rule validations fail.'],
  ['Initial ingestion', 'Before data is migrated or onboarded, profiling lets Stewards, the Architecture Rep and Custodians validate their assumptions against the data model.'],
  ['Data quality monitoring', 'Periodic profiling feeds reporting and validates ingestion and technical metadata; results may lead to adjusted rules or model changes.'],
  ['Ad-hoc profiling', 'Business-driven: the Data Owner believes the data has changed and doesn’t want to wait for the next cycle.'],
  ['Rules definition (advanced)', 'Profiling can suggest rules and thresholds automatically (Informatica rule discovery), instead of writing every rule by hand.'],
]

const RESULTS = [
  { col: 'employee_id', type: 'VARCHAR(8)', nulls: 0, distinct: 12480, pattern: 'E99999 (100%)', minmax: 'E00012 – E12931', finding: 'Unique, conforms', tone: 'good' },
  { col: 'birth_date', type: 'DATE', nulls: 3.2, distinct: 9120, pattern: 'YYYY-MM-DD (100%)', minmax: '1901-01-01 – 2008-06-30', finding: '41 records = 1901-01-01 (default placeholder)', tone: 'crit' },
  { col: 'hire_date', type: 'DATE', nulls: 0, distinct: 4102, pattern: 'YYYY-MM-DD (100%)', minmax: '1986-02-03 – 2204-03-01', finding: '3 future hire dates', tone: 'warn' },
  { col: 'cost_center', type: 'VARCHAR(7)', nulls: 1.9, distinct: 318, pattern: 'CC-9999 (97.6%), CC9999 (2.4%)', minmax: '—', finding: 'Two formats; 18 codes not in Finance master', tone: 'crit' },
  { col: 'country_code', type: 'VARCHAR(4)', nulls: 0.1, distinct: 27, pattern: 'AA (99.4%), A.A. (0.6%)', minmax: '—', finding: '"U.K." and "UK" should be GB', tone: 'warn' },
  { col: 'work_email', type: 'VARCHAR(80)', nulls: 0.4, distinct: 12398, pattern: 'a.a@company.com (95.9%)', minmax: '—', finding: '82 duplicates, 4.1% off-pattern', tone: 'warn' },
  { col: 'base_salary', type: 'DECIMAL(12,2)', nulls: 0, distinct: 7011, pattern: 'numeric', minmax: '0.00 – 1,250,000.00', finding: '6 zero salaries on active employees', tone: 'crit' },
  { col: 'status', type: 'CHAR(1)', nulls: 0, distinct: 4, pattern: 'A 86%, T 12%, L 2%, X <0.1%', minmax: '—', finding: 'Unknown code "X" (3 rows)', tone: 'warn' },
]

export default function Profiling({ go }) {
  return (
    <Block
      go={go}
      icon={ScanSearch}
      title="Data profiling & baselining"
      lead="Profiling is the systematic examination of data to understand its content, structure and relationships. It shows what the data actually looks like, not what we assume it looks like. Baselining freezes that picture so improvement can be measured."
      facts={[
        ['Run by', 'Data Custodian (Informatica Cloud Data Profiling)'],
        ['Validated by', 'Data Owner (Standard 5)'],
        ['Baseline cadence', 'Quarterly at minimum'],
        ['Feeds', 'Rules, thresholds, issue RCA'],
      ]}
      templates={['Profiling & Baseline Report']}
      process={
        <Section title="Profiling and baselining steps">
          <StepFlow
            steps={[
              { title: 'Define scope', owner: ['steward', 'custodian'], desc: 'Pick the asset, columns (CDEs first) and whether to profile the full set or a sample.', out: 'Profiling scope' },
              { title: 'Connect & run', owner: 'custodian', desc: 'Run column, structure and relationship profiles in Informatica Cloud Data Profiling.', out: 'Profile run' },
              { title: 'Analyze results', owner: ['custodian', 'steward'], desc: 'Review null rates, distinct counts, patterns, min/max, outliers and orphan keys.', out: 'Findings' },
              { title: 'Validate with business', owner: 'steward', desc: 'Separate real defects from legitimate business cases (e.g., interns under 18).', out: 'Validated findings' },
              { title: 'Record baseline', owner: 'custodian', desc: 'Store the metrics as the quarter’s baseline per element and rule.', out: 'Baseline' },
              { title: 'Owner sign-off', owner: 'owner', desc: 'Data Owner reviews and validates the baseline (Standard 5).', out: 'Signed-off baseline' },
              { title: 'Act', owner: ['steward', 'custodian'], desc: 'Create or tune rules and thresholds; log issues for defects found.', out: 'Rules & issues' },
            ]}
          />
        </Section>
      }
      framework={<ProfilingFramework />}
      example={
        <>
          <Section title="Profiling results: hr_gold.employee (Q3 baseline)" sub="12,480 active records, profiled in full on 2026-09-01.">
            <div className="table-wrap">
              <table className="t">
                <thead><tr><th>Column</th><th>Type</th><th className="num">Null %</th><th className="num">Distinct</th><th>Patterns</th><th>Min – Max</th><th>Finding</th></tr></thead>
                <tbody>
                  {RESULTS.map((r) => (
                    <tr key={r.col}>
                      <td className="mono">{r.col}</td><td className="mono xs">{r.type}</td><td className="num">{r.nulls.toFixed(1)}</td><td className="num">{r.distinct.toLocaleString()}</td>
                      <td className="small">{r.pattern}</td><td className="small mono">{r.minmax}</td>
                      <td><Pill tone={r.tone}>{r.finding}</Pill></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
          <div className="grid g2">
            <Callout tone="crit" title="Hidden defect: placeholder dates">
              Date of Birth looks 96.8% complete, but profiling shows 41 records set to 1901-01-01, a default used to bypass the mandatory field. Those are effectively missing. Result: a new validity rule (DOB &gt; 1930-01-01) and a Steward follow-up with HR Operations.
            </Callout>
            <Callout title="Baseline to target">
              Cost Center completeness baselined at 98.1% with 18 orphan codes. Target: 99.5% with zero orphans by next quarter. The dashboard now tracks this against the baseline.
            </Callout>
          </div>
        </>
      }
    />
  )
}

function ProfilingFramework() {
  const [lens, setLens] = useState('Content')
  const circles = { Content: [128, 110], Structure: [202, 150], Relationship: [140, 196] }
  return (
    <>
      <Section title="Three lenses of profiling" sub="Content, structure and relationship. Select a lens to see what to check.">
        <div className="grid g2" style={{ alignItems: 'center' }}>
          <div className="card" style={{ display: 'grid', placeItems: 'center' }}>
            <svg viewBox="0 0 340 300" width="100%" style={{ maxWidth: 360 }} role="img" aria-label="Venn diagram of content, structure and relationship">
              {Object.entries(circles).map(([k, [x, y]]) => (
                <circle key={k} cx={x} cy={y} r="82" fill={LENSES[k].color} fillOpacity={lens === k ? 0.28 : 0.08} stroke={LENSES[k].color} strokeWidth={lens === k ? 4 : 2} onClick={() => setLens(k)} style={{ cursor: 'pointer' }} />
              ))}
              <text x="96" y="92" fontSize="14" fontWeight="700" fill="var(--ink)" onClick={() => setLens('Content')} style={{ cursor: 'pointer' }}>Content</text>
              <text x="222" y="152" fontSize="14" fontWeight="700" fill="var(--ink)" onClick={() => setLens('Structure')} style={{ cursor: 'pointer' }}>Structure</text>
              <text x="90" y="232" fontSize="14" fontWeight="700" fill="var(--ink)" onClick={() => setLens('Relationship')} style={{ cursor: 'pointer' }}>Relationship</text>
            </svg>
          </div>
          <div className="card stack" style={{ gap: 12 }}>
            <div className="row"><span className="dot" style={{ background: LENSES[lens].color, width: 14, height: 14 }} /><h2>{lens}</h2></div>
            {LENSES[lens].items.map(([k, v]) => (
              <div key={k}><b>{k}</b><p className="small" style={{ color: 'var(--ink-2)' }}>{v}</p></div>
            ))}
            <div className="row" style={{ gap: 6 }}>
              {Object.keys(LENSES).map((k) => <button key={k} className={'btn sm' + (lens === k ? ' primary' : '')} onClick={() => setLens(k)}>{k}</button>)}
            </div>
          </div>
        </div>
      </Section>
      <Section title="Data profiling triggers" sub="Five scenarios that start a profiling activity.">
        <div className="grid g3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
          {TRIGGERS.map(([t, d], i) => (
            <div key={t} className="card flat stack" style={{ gap: 6 }}>
              <span className="step-num">{i + 1}</span>
              <h4>{t}</h4>
              <p className="small" style={{ color: 'var(--ink-2)' }}>{d}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Sampling guidance">
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>Situation</th><th>Approach</th></tr></thead>
            <tbody>
              <tr><td>Tier 1 CDEs, under ~5M rows</td><td>Profile the full data set</td></tr>
              <tr><td>Very large tables, exploratory profiling</td><td>Random sample of at least 10% or 100k rows, stratified by business unit</td></tr>
              <tr><td>Accuracy checks against documents</td><td>Statistical sample (e.g., 95% confidence, ±5% margin ≈ 370 records)</td></tr>
              <tr><td>Quarterly baseline</td><td>Always full set, same scope as prior quarter so trends are comparable</td></tr>
            </tbody>
          </table>
        </div>
      </Section>
    </>
  )
}
