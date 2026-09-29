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
      ['Aggregation', 'Summary statistics to confirm against business logic (e.g., total declared customs value per day).'],
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
  { col: 'decl_no', type: 'VARCHAR(16)', nulls: 0, distinct: 412880, pattern: 'DEC-99-9999999 (100%)', minmax: 'DEC-26-0000012 – DEC-26-0131907', finding: 'Unique, conforms', tone: 'good' },
  { col: 'hs_code', type: 'VARCHAR(12)', nulls: 0, distinct: 11904, pattern: '999999999999 (99.5%), 99999999 (0.5%)', minmax: '010121000000 – 999999999999', finding: '5,900 lines on generic code 9999…; 0.5% only 8 digits', tone: 'crit' },
  { col: 'origin_cc', type: 'VARCHAR(3)', nulls: 0.2, distinct: 168, pattern: 'AA (99.6%), AAA (0.4%)', minmax: '—', finding: '0.4% use 3-letter codes (ISO alpha-3)', tone: 'warn' },
  { col: 'customs_value', type: 'DECIMAL(15,2)', nulls: 0, distinct: 603210, pattern: 'numeric', minmax: '0.00 – 48,500,000.00', finding: '212 lines valued at 0.00; 4.2% ≠ FOB+freight+ins.', tone: 'crit' },
  { col: 'currency', type: 'CHAR(3)', nulls: 0, distinct: 41, pattern: 'AAA (100%)', minmax: '—', finding: 'Conforms to ISO 4217', tone: 'good' },
  { col: 'importer_tin', type: 'VARCHAR(15)', nulls: 0.9, distinct: 38112, pattern: '9{15} (99.1%)', minmax: '—', finding: '0.9% null, mostly courier declarations', tone: 'warn' },
  { col: 'gross_weight_kg', type: 'DECIMAL(12,3)', nulls: 0, distinct: 88410, pattern: 'numeric', minmax: '0.001 – 1,900,000.000', finding: '31 lines above 1,000 t: outliers to verify', tone: 'warn' },
  { col: 'port_code', type: 'CHAR(5)', nulls: 0, distinct: 36, pattern: 'AAAAA (100%)', minmax: '—', finding: '74 lines use retired port codes', tone: 'warn' },
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
          <Section title="Profiling results: cus_gold.declaration_line (Q3 baseline)" sub="1,284,000 declaration lines, profiled in full on 2026-09-01.">
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
            <Callout tone="crit" title="Hidden defect: the generic HS code">
              HS code looks 100% complete and valid, but profiling shows 5,900 e-commerce lines classified under the catch-all code 999999999999. They pass the rule yet tell us nothing about the goods, and duty may be wrong. Result: a new rule blocking the generic code for commercial shipments and broker guidance from the Steward.
            </Callout>
            <Callout title="Baseline to target">
              HS code validity baselined at 96.2%. Target: 99% by next quarter. The dashboard now tracks this against the baseline.
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
