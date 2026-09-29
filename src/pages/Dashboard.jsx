import { useMemo, useState } from 'react'
import { LayoutDashboard, TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react'
import { PageHead, Section, Pill, ScorePill } from '../components/ui.jsx'
import { LineChart, HBars, Heatmap, FlowChart, StackedBars, Sparkline } from '../components/charts.jsx'
import { ISSUES } from '../data/issues.js'
import { RULES } from '../data/rules.js'
import { isOpen, isOverdue, TODAY } from './Registry.jsx'

// Data areas (rows) grouped under the three business domains (filter)
const AREAS = [
  { a: 'Declarations', d: 'Customs' },
  { a: 'Tariff & Classification', d: 'Customs' },
  { a: 'Trader Registry', d: 'Customs' },
  { a: 'Taxpayer Registration', d: 'Tax' },
  { a: 'VAT Returns', d: 'Tax' },
  { a: 'Excise', d: 'Tax' },
  { a: 'E-Invoices', d: 'E-Invoicing' },
  { a: 'Taxpayer Onboarding', d: 'E-Invoicing' },
]
const DOMAINS = AREAS.map((x) => x.a)
const DIMS = ['Completeness', 'Validity', 'Accuracy', 'Consistency', 'Uniqueness', 'Timeliness', 'Integrity']
const MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']

// Latest score per data area x dimension (illustrative)
const MATRIX = {
  Declarations: [99.1, 98.4, 95.8, 97.4, 99.9, 98.9, 99.9],
  'Tariff & Classification': [99.8, 96.2, 97.0, 98.1, 99.9, 96.8, 99.6],
  'Trader Registry': [97.6, 88.0, 96.5, 95.9, 99.4, 94.2, 96.8],
  'Taxpayer Registration': [98.9, 99.9, 97.8, 96.7, 99.6, 97.3, 99.2],
  'VAT Returns': [99.4, 98.7, 96.1, 83.6, 99.9, 91.3, 98.4],
  Excise: [90.2, 97.5, 95.4, 94.9, 99.7, 93.8, 97.9],
  'E-Invoices': [95.1, 99.1, 97.7, 99.3, 99.2, 93.9, 97.6],
  'Taxpayer Onboarding': [93.0, 98.2, 96.6, 97.1, 99.5, 95.5, 98.9],
}
const CDES = { Declarations: [9, 7], 'Tariff & Classification': [4, 3], 'Trader Registry': [4, 3], 'Taxpayer Registration': [7, 6], 'VAT Returns': [8, 6], Excise: [5, 3], 'E-Invoices': [10, 8], 'Taxpayer Onboarding': [4, 3] }
const RULE_COUNT = { Declarations: 38, 'Tariff & Classification': 14, 'Trader Registry': 11, 'Taxpayer Registration': 19, 'VAT Returns': 27, Excise: 12, 'E-Invoices': 41, 'Taxpayer Onboarding': 9 }
// Months of improvement, per area: start offset below latest
const START_GAP = { Declarations: 4.1, 'Tariff & Classification': 3.2, 'Trader Registry': 5.0, 'Taxpayer Registration': 2.6, 'VAT Returns': 6.4, Excise: 4.4, 'E-Invoices': 7.1, 'Taxpayer Onboarding': 5.8 }

const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length
const domainScore = (d) => avg(MATRIX[d])
const trendFor = (d) => {
  const end = domainScore(d), gap = START_GAP[d]
  return MONTHS.map((m, i) => {
    const p = i / 11
    const wobble = Math.sin(i * 1.7 + d.length) * 0.5
    return { label: m, v: +(end - gap * (1 - p) ** 1.4 + (i < 11 ? wobble : 0)).toFixed(1) }
  })
}

const PRIO_COLORS = ['var(--seq-5)', 'var(--seq-4)', 'var(--seq-3)', 'var(--seq-2)']
const statusIcon = (v, t = 95, a = 90) =>
  v >= t ? <CheckCircle2 size={13} color="var(--good)" aria-label="Meets target" /> : v >= a ? <AlertTriangle size={13} color="var(--warn)" aria-label="Monitor" /> : <AlertOctagon size={13} color="var(--crit)" aria-label="Below threshold" />

export default function Dashboard() {
  const [domain, setDomain] = useState('All domains')
  const doms = domain === 'All domains' ? DOMAINS : AREAS.filter((x) => x.d === domain).map((x) => x.a)

  const trend = useMemo(() => {
    const series = doms.map(trendFor)
    return MONTHS.map((m, i) => ({ label: m, v: +avg(series.map((s) => s[i].v)).toFixed(1) }))
  }, [domain])
  const score = trend[11].v
  const delta = score - trend[8].v
  const byDim = DIMS.map((d, k) => ({ label: d, v: avg(doms.map((x) => MATRIX[x][k])) }))
  const cde = doms.reduce((a, d) => [a[0] + CDES[d][0], a[1] + CDES[d][1]], [0, 0])
  const rules = doms.reduce((a, d) => a + RULE_COUNT[d], 0)

  const iss = ISSUES.filter((i) => doms.includes(i.product))
  const open = iss.filter(isOpen)
  const closed = iss.filter((i) => i.resolved && i.status !== 'Rejected')
  const avgDays = closed.length ? avg(closed.map((i) => (new Date(i.resolved) - new Date(i.reported)) / 86400000)) : 0

  const flow = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((label, k) => {
    const mm = String(k + 3).padStart(2, '0')
    const end = `2026-${mm}-31`
    return {
      label,
      created: iss.filter((i) => i.reported.slice(5, 7) === mm).length,
      closed: iss.filter((i) => i.resolved && i.resolved.slice(5, 7) === mm).length,
      net: iss.filter((i) => i.reported <= end && (!i.resolved || i.resolved > end)).length,
    }
  })

  const prioByDomain = DOMAINS.filter((d) => doms.includes(d)).map((d) => {
    const o = open.filter((i) => i.product === d)
    return { label: d, Critical: o.filter((i) => i.priority === 'Critical').length, High: o.filter((i) => i.priority === 'High').length, Medium: o.filter((i) => i.priority === 'Medium').length, Low: o.filter((i) => i.priority === 'Low').length }
  }).filter((r) => r.Critical + r.High + r.Medium + r.Low > 0)

  const causes = [...new Set(ISSUES.map((i) => i.source))].map((s) => ({ label: s, v: iss.filter((i) => i.source === s && i.status !== 'Rejected').length })).sort((a, b) => b.v - a.v)

  const age = (i) => (new Date(TODAY) - new Date(i.reported)) / 86400000
  const aging = [['0–30 days', 0, 30], ['31–90 days', 31, 90], ['91–180 days', 91, 180], ['> 180 days', 181, 9999]].map(([label, a, b]) => {
    const o = open.filter((i) => age(i) >= a && age(i) <= b)
    return { label, Critical: o.filter((i) => i.priority === 'Critical').length, High: o.filter((i) => i.priority === 'High').length, Medium: o.filter((i) => i.priority === 'Medium').length, Low: o.filter((i) => i.priority === 'Low').length }
  })

  const failing = [...RULES].map((r) => ({ ...r, gap: r.score - r.t[0] })).sort((a, b) => a.gap - b.gap).slice(0, 6)

  const kpis = [
    { l: 'Overall DQ score', v: score.toFixed(1) + '%', sub: <span className="row" style={{ gap: 4, color: delta >= 0 ? 'var(--good-ink)' : 'var(--crit-ink)' }}>{delta >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}{delta >= 0 ? '+' : ''}{delta.toFixed(1)} pts vs. June</span>, spark: trend.map((d) => d.v) },
    { l: 'CDEs above threshold', v: `${cde[1]} / ${cde[0]}`, sub: <span className="muted">{Math.round((cde[1] / cde[0]) * 100)}% of critical data elements</span> },
    { l: 'Open issues', v: open.length, sub: <span className="muted">{open.filter((i) => i.priority === 'Critical').length} critical · {open.filter((i) => i.priority === 'High').length} high</span> },
    { l: 'SLO breaches', v: open.filter(isOverdue).length, sub: <span className="muted">Open issues past target date</span>, tone: open.filter(isOverdue).length ? 'crit' : 'good' },
    { l: 'Avg. days to resolve', v: avgDays ? avgDays.toFixed(0) : '—', sub: <span className="muted">{closed.length} issues resolved</span> },
    { l: 'Active rules', v: rules, sub: <span className="muted">Across {doms.length} data areas</span> },
  ]

  return (
    <>
      <PageHead eyebrow="Workbench" icon={LayoutDashboard} title="Data quality dashboard" lead="How healthy is our Customs, Tax and E-Invoicing data, where is it failing, and is the issue backlog under control? Illustrative data; issue charts use the Issue Registry.">
        <div className="row" style={{ gap: 10 }}>
          <label className="field" htmlFor="dash-domain" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            Data domain
            <select id="dash-domain" className="input" value={domain} onChange={(e) => setDomain(e.target.value)}>
              <option>All domains</option>
              {['Customs', 'Tax', 'E-Invoicing'].map((d) => <option key={d}>{d}</option>)}
            </select>
          </label>
          <span className="small muted">Last scan: 29 Sep 2026, 02:00 · Informatica CDQ</span>
        </div>
      </PageHead>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
        {kpis.map((k) => (
          <div key={k.l} className="card stack" style={{ gap: 6, padding: 16 }}>
            <span className="small muted">{k.l}</span>
            <div className="row between" style={{ flexWrap: 'nowrap' }}>
              <span className="big-num" style={{ color: k.tone === 'crit' ? 'var(--crit-ink)' : undefined }}>{k.v}</span>
              {k.spark && <Sparkline values={k.spark} />}
            </div>
            <span className="xs">{k.sub}</span>
          </div>
        ))}
      </div>

      <div className="split-wide">
        <div className="card stack">
          <div><div className="chart-title">DQ score trend, last 12 months</div><div className="chart-sub">Weighted score · {domain}</div></div>
          <LineChart data={trend} yMin={80} yMax={100} bands={[{ v: 90, label: 'Target 90%', color: 'var(--good)' }]} />
        </div>
        <div className="card stack">
          <div><div className="chart-title">Score by dimension</div><div className="chart-sub">Scale 80–100% · black mark = 95% target</div></div>
          <HBars data={byDim} min={80} max={100} marker={95} fmt={(v) => v.toFixed(1) + '%'} labelW={110} icon={(d) => statusIcon(d.v)} />
          <div className="legend">
            <span><CheckCircle2 size={13} color="var(--good)" /> ≥ 95%</span>
            <span><AlertTriangle size={13} color="var(--warn)" /> 90–95%</span>
            <span><AlertOctagon size={13} color="var(--crit)" /> &lt; 90%</span>
          </div>
        </div>
      </div>

      <div className="card stack">
        <div><div className="chart-title">Data area × dimension heatmap</div><div className="chart-sub">Where to focus. Cells are colored by threshold band; hover for detail.</div></div>
        <Heatmap
          rows={DOMAINS}
          cols={DIMS}
          value={(r, c) => MATRIX[r][DIMS.indexOf(c)]}
          fmt={(v) => v.toFixed(1)}
          scale={(v) => (v >= 95 ? { bg: 'var(--good-soft)', fg: 'var(--good-ink)' } : v >= 90 ? { bg: 'var(--warn-soft)', fg: 'var(--warn-ink)' } : { bg: 'var(--crit-soft)', fg: 'var(--crit-ink)' })}
        />
        <div className="legend">
          <span><i style={{ background: 'var(--good-soft)', border: '1px solid var(--good)' }} /> ≥ 95 meets target</span>
          <span><i style={{ background: 'var(--warn-soft)', border: '1px solid var(--warn)' }} /> 90–95 monitor</span>
          <span><i style={{ background: 'var(--crit-soft)', border: '1px solid var(--crit)' }} /> &lt; 90 remediate</span>
        </div>
      </div>

      <div className="grid g2">
        <div className="card stack">
          <div><div className="chart-title">Issues created, closed and net open by month</div><div className="chart-sub">Mar–Sep 2026 · {domain}</div></div>
          <div className="legend"><span><i style={{ background: 'var(--s1)' }} />Created</span><span><i style={{ background: 'var(--s2)' }} />Closed</span><span><i style={{ background: 'var(--s3)', height: 3 }} />Net open</span></div>
          <FlowChart data={flow} />
        </div>
        <div className="card stack">
          <div><div className="chart-title">Unresolved issues by data area and priority</div><div className="chart-sub">Open issues only</div></div>
          <div className="legend">{['Critical', 'High', 'Medium', 'Low'].map((p, i) => <span key={p}><i style={{ background: PRIO_COLORS[i] }} />{p}</span>)}</div>
          {prioByDomain.length ? <StackedBars data={prioByDomain} keys={['Critical', 'High', 'Medium', 'Low']} colors={PRIO_COLORS} labelW={160} /> : <p className="muted small">No open issues for this domain.</p>}
        </div>
      </div>

      <div className="grid g2">
        <div className="card stack">
          <div><div className="chart-title">Issues by root cause category</div><div className="chart-sub">All logged issues, excluding rejected · informs proactive fixes</div></div>
          <HBars data={causes} fmt={(v) => v} labelW={190} />
        </div>
        <div className="card stack">
          <div><div className="chart-title">Aging of open issues</div><div className="chart-sub">Days since reported</div></div>
          <div className="legend">{['Critical', 'High', 'Medium', 'Low'].map((p, i) => <span key={p}><i style={{ background: PRIO_COLORS[i] }} />{p}</span>)}</div>
          <StackedBars data={aging} keys={['Critical', 'High', 'Medium', 'Low']} colors={PRIO_COLORS} labelW={100} />
        </div>
      </div>

      <Section title="Rules furthest below target">
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>Rule</th><th>Business term</th><th>Dimension</th><th>Priority</th><th className="num">Target</th><th className="num">Score</th><th className="num">Gap</th><th>12-month trend</th></tr></thead>
            <tbody>
              {failing.map((r, k) => (
                <tr key={r.id}>
                  <td className="mono">{r.id}</td><td style={{ fontWeight: 600 }}>{r.term}</td><td>{r.dim}</td><td className="small">{r.priority}</td>
                  <td className="num">{r.t[0]}%</td><td className="num"><ScorePill score={r.score} t={{ green: r.t[0], amber: r.t[1] }} /></td>
                  <td className="num" style={{ color: 'var(--crit-ink)', fontWeight: 600 }}>{r.gap.toFixed(1)}</td>
                  <td><Sparkline values={MONTHS.map((_, i) => r.score - (11 - i) * (0.25 + k * 0.08) + Math.sin(i + k) * 0.6)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Program metrics" sub="The four metric types reported to the DG forums each quarter.">
        <div className="grid g4">
          <div className="card flat stack" style={{ gap: 6 }}><div className="eyebrow">Ongoing performance</div><span className="big-num">{Math.round((cde[1] / cde[0]) * 100)}%</span><span className="small muted">CDEs above threshold · newly ingested data above threshold 94%</span></div>
          <div className="card flat stack" style={{ gap: 6 }}><div className="eyebrow">Issue management</div><span className="big-num">{open.length}</span><span className="small muted">open · {open.filter((i) => i.status === 'Escalated').length} escalated · {open.filter((i) => i.status === 'Under Review').length} under review</span></div>
          <div className="card flat stack" style={{ gap: 6 }}><div className="eyebrow">Service level objectives</div><span className="big-num">{open.filter(isOverdue).length}</span><span className="small muted">SLO breaches · avg {avgDays ? avgDays.toFixed(0) : '—'} days to resolve</span></div>
          <div className="card flat stack" style={{ gap: 6 }}><div className="eyebrow">Adoption</div><span className="big-num">6 / 9</span><span className="small muted">business units onboarded · 71% of stewards trained</span></div>
        </div>
      </Section>

      <div className="card tint row" style={{ gap: 10 }}>
        <Pill tone="accent">How to read this</Pill>
        <span className="small">Start top-left: is the score trending toward target? Then use the heatmap to find the weakest data area and dimension, and the issue charts to check the backlog is shrinking and nothing critical is aging.</span>
      </div>
    </>
  )
}
