import { useState } from 'react'
import { Activity } from 'lucide-react'
import Block from '../../components/Block.jsx'
import { Section, StepFlow, Callout, Swimlane, SwimLegend, Pill } from '../../components/ui.jsx'
import { REPORT_WF } from '../../data/workflows.js'

export const METRIC_TYPES = [
  { t: 'Ongoing performance', ex: ['Proportion of CDEs above their DQ threshold', 'Proportion of newly ingested data above threshold'], k: 'Proportion of data elements: reporting compliance by domain and criticality shows where cleansing should focus.' },
  { t: 'Issue management', ex: ['Number of issues logged by severity (High / Medium / Low)', 'Proportion of issues by status (Under Review / In Progress / Resolved)', 'Number of issues requiring escalation'], k: 'Distribution of issues: shows which root causes drive effort and where the backlog is stuck.' },
  { t: 'Service level objectives (SLO)', ex: ['SLO failures by data domain', 'SLO failures by severity / criticality', 'Average time to resolution'], k: 'Service level compliance drives accountability for Stewards and Custodians. Resolution time shows how fast governance can respond.' },
  { t: 'Adoption', ex: ['Number of business units onboarded to the DQ process', 'Proportion of end users onboarded per business unit'], k: 'Onboarding coverage shows where more training is needed.' },
]

export const WEIGHTS = { 'Business Critical': 0.6, 'Business Disruptive': 0.35, Informational: 0.05 }

export function band(score) {
  if (score >= 100) return { label: 'Excellence', tone: 'good' }
  if (score >= 90) return { label: 'Target', tone: 'good' }
  if (score >= 70) return { label: 'Average', tone: 'warn' }
  return { label: 'Below threshold', tone: 'crit' }
}

export function Gauge({ value, size = 220 }) {
  const r = size / 2 - 18, cx = size / 2, cy = size / 2 + 4
  const pt = (v) => {
    const a = Math.PI * (1 - v / 100)
    return [cx + r * Math.cos(a), cy - r * Math.sin(a)]
  }
  const seg = (a, b, color) => {
    const [x0, y0] = pt(a), [x1, y1] = pt(b)
    return <path d={`M${x0},${y0} A${r},${r} 0 0 1 ${x1},${y1}`} stroke={color} strokeWidth="16" fill="none" />
  }
  const [nx, ny] = pt(Math.min(100, Math.max(0, value)))
  return (
    <svg viewBox={`0 0 ${size} ${size / 2 + 34}`} width="100%" style={{ maxWidth: size }} role="img" aria-label={`Score ${value.toFixed(1)}%`}>
      {seg(0, 69.5, 'var(--crit)')}
      {seg(70.5, 89.5, 'var(--warn)')}
      {seg(90.5, 100, 'var(--good)')}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="6" fill="var(--ink)" />
      <text x={cx} y={cy + 28} textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--ink)">{value.toFixed(1)}%</text>
      <text x={18} y={cy + 16} fontSize="10" fill="var(--muted)" textAnchor="middle">0</text>
      <text x={size - 18} y={cy + 16} fontSize="10" fill="var(--muted)" textAnchor="middle">100</text>
    </svg>
  )
}

export default function Monitoring({ go }) {
  return (
    <Block
      go={go}
      icon={Activity}
      title="Monitoring, reporting & measurement"
      lead="Monitoring turns rule results into scores, trends and alerts that people act on. Reports and dashboards show quality periodically or in near real time, and notifications fire when quality drops below a threshold."
      facts={[
        ['Built by', 'Data Custodian'],
        ['Used by', 'Stewards, Owners, DG forums'],
        ['Reported to DG', 'Quarterly at minimum (Standard 6)'],
        ['Score weighting', 'Critical 60 · Disruptive 35 · Info 5'],
      ]}
      templates={['DQ Scorecard', 'Quarterly DG Report']}
      process={
        <>
          <Section title="Monitoring steps">
            <StepFlow
              steps={[
                { title: 'Define what to report', owner: ['council', 'steward'], desc: 'Choose the rules, CDEs and metrics that appear on the dashboard.' },
                { title: 'Confirm priorities', owner: 'steward', desc: 'Tag rules as Business Critical, Business Disruptive or Informational.' },
                { title: 'Expose rules to dashboard', owner: 'custodian', desc: 'Publish Informatica CDQ results to the scorecard and BI dashboard.' },
                { title: 'Analyze trends', owner: 'steward', desc: 'Review scores vs. thresholds and vs. baseline; look for degradation.' },
                { title: 'Act', owner: ['steward', 'custodian'], desc: 'Below threshold → issue management. Rule no longer fits → rule & threshold definition.' },
                { title: 'Report', owner: ['steward', 'owner'], desc: 'Present quarterly to the DG Working Group and Council with actions.' },
              ]}
            />
          </Section>
          <Section title="Reporting & measurement workflow">
            <SwimLegend />
            <Swimlane {...REPORT_WF} />
          </Section>
        </>
      }
      framework={
        <>
          <Section title="Metric types">
            <div className="table-wrap">
              <table className="t navy-head">
                <thead><tr><th>Metric type</th><th>Examples</th><th>Key considerations</th></tr></thead>
                <tbody>
                  {METRIC_TYPES.map((m) => (
                    <tr key={m.t}><td style={{ fontWeight: 600, minWidth: 160 }}>{m.t}</td><td style={{ minWidth: 260 }}><ul className="bullets small">{m.ex.map((x) => <li key={x}>{x}</li>)}</ul></td><td className="small" style={{ minWidth: 260 }}>{m.k}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
          <Section title="How scores roll up" sub="Scores are computed at rule level and aggregated upward, weighted by record volume and rule priority.">
            <div className="row" style={{ gap: 8, alignItems: 'stretch' }}>
              {[['Rule', 'passed ÷ evaluated'], ['Data element', 'avg of its rules'], ['Data asset', 'weighted by rule priority'], ['Data domain', 'avg of its assets'], ['Enterprise', 'avg of domains']].map(([t, d], i, a) => (
                <div key={t} className="row" style={{ gap: 8, flexWrap: 'nowrap', flex: '1 1 150px' }}>
                  <div className="card flat stack" style={{ gap: 2, flex: 1, padding: 14 }}><b>{t}</b><span className="xs muted">{d}</span></div>
                  {i < a.length - 1 && <span className="muted" aria-hidden>→</span>}
                </div>
              ))}
            </div>
          </Section>
          <Section title="Score bands">
            <div className="grid g4">
              <div className="card flat stack"><Pill tone="crit">Below threshold</Pill><span className="small">&lt; 70%</span></div>
              <div className="card flat stack"><Pill tone="warn">Average</Pill><span className="small">70% – 90%</span></div>
              <div className="card flat stack"><Pill tone="good">Target</Pill><span className="small">≥ 90%</span></div>
              <div className="card flat stack"><Pill tone="good">Excellence</Pill><span className="small">100%</span></div>
            </div>
          </Section>
          <Section title="Reporting cadence">
            <div className="table-wrap">
              <table className="t">
                <thead><tr><th>Audience</th><th>Cadence</th><th>Content</th></tr></thead>
                <tbody>
                  <tr><td>Data Custodian</td><td>Daily / per load</td><td>Rule failures, pipeline DQ gates, freshness alerts</td></tr>
                  <tr><td>Data Steward</td><td>Weekly</td><td>Scores vs. thresholds, new issues, aging backlog</td></tr>
                  <tr><td>Data Owner</td><td>Monthly</td><td>Domain scorecard, critical issues, SLO breaches, plan approvals</td></tr>
                  <tr><td>DG Working Group & Council</td><td>Quarterly</td><td>Trends, baselines, adoption, escalations, decisions needed</td></tr>
                </tbody>
              </table>
            </div>
          </Section>
        </>
      }
      example={<ScoreCalc />}
    />
  )
}

function ScoreCalc() {
  const [rows, setRows] = useState([
    { p: 'Business Critical', avail: 141, run: 112, processed: 1250000, passed: 1208750 },
    { p: 'Business Disruptive', avail: 41, run: 35, processed: 420000, passed: 382620 },
    { p: 'Informational', avail: 2, run: 1, processed: 38400, passed: 33792 },
  ])
  const score = (r) => (r.passed / r.processed) * 100
  const final = rows.reduce((a, r) => a + score(r) * WEIGHTS[r.p], 0)
  const b = band(final)
  const upd = (i, k, v) => setRows(rows.map((r, j) => (j === i ? { ...r, [k]: Math.max(0, Math.min(k === 'passed' ? r.processed : Infinity, v)) } : r)))
  return (
    <>
      <Section title="Final DQ score calculator" sub="Score by priority = records passed ÷ records processed. Final score = weighted average (Critical 60%, Disruptive 35%, Informational 5%). Edit the passed counts.">
        <div className="split-wide" style={{ alignItems: 'center' }}>
          <div className="table-wrap">
            <table className="t">
              <thead><tr><th>Rule priority</th><th className="num">Rules available</th><th className="num">Rules run</th><th className="num">Records processed</th><th className="num">Records passed</th><th className="num">Score</th><th className="num">Weight</th></tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.p}>
                    <td style={{ fontWeight: 600 }}>{r.p}</td><td className="num">{r.avail}</td><td className="num">{r.run}</td><td className="num">{r.processed.toLocaleString()}</td>
                    <td className="num"><input className="input" id={'sc-' + i} aria-label={`Records passed for ${r.p}`} type="number" value={r.passed} style={{ width: 120, textAlign: 'right' }} onChange={(e) => upd(i, 'passed', +e.target.value)} /></td>
                    <td className="num">{score(r).toFixed(1)}%</td><td className="num">{Math.round(WEIGHTS[r.p] * 100)}%</td>
                  </tr>
                ))}
                <tr><td style={{ fontWeight: 700 }}>Final system score</td><td className="num">{rows.reduce((a, r) => a + r.avail, 0)}</td><td className="num">{rows.reduce((a, r) => a + r.run, 0)}</td><td colSpan="3"></td><td className="num" style={{ fontWeight: 700 }}>{final.toFixed(1)}%</td></tr>
              </tbody>
            </table>
          </div>
          <div className="card stack" style={{ alignItems: 'center' }}>
            <Gauge value={final} />
            <Pill tone={b.tone}>{b.label}</Pill>
          </div>
        </div>
      </Section>
      <Callout title="Why weight by priority?">
        A simple average lets 40 informational rules at 100% hide one failing rule on import VAT or HS codes. Weighting keeps the headline score honest about what matters to the business.
      </Callout>
    </>
  )
}
