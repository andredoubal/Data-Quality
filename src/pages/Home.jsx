import { ArrowRight, ShieldCheck, Siren, Orbit, Users, Blocks, Waypoints, LayoutDashboard, Layers, Rocket, RefreshCcw } from 'lucide-react'
import { Section, Callout } from '../components/ui.jsx'

const CHAPTERS = [
  { n: 1, title: 'Two mindsets', desc: 'Proactive prevention vs. reactive detection and repair, and why a mature program needs both.', icon: ShieldCheck, links: [['proactive', 'Proactive'], ['reactive', 'Reactive']] },
  { n: 2, title: 'The framework', desc: 'Program, rules & thresholds, issue management, reporting. Plus the six standards and the BAU lifecycle.', icon: Orbit, links: [['framework', 'Framework']] },
  { n: 3, title: 'Who does what', desc: 'Owners, Stewards, Champions, Custodians and the forums that hold them to account, with a full RACI.', icon: Users, links: [['roles', 'Roles']] },
  { n: 4, title: 'Building blocks', desc: 'CDEs, dimensions, rules, profiling, issue prioritization, RCA, remediation and monitoring. Each with process, framework and example.', icon: Blocks, links: [['cdes', 'CDEs'], ['dimensions', 'Dimensions'], ['rules', 'Rules'], ['profiling', 'Profiling'], ['issues', 'Issues'], ['rca', 'RCA'], ['remediation', 'Remediation'], ['monitoring', 'Monitoring']] },
  { n: 5, title: 'Where issues come from', desc: 'Business change, data entry, integrations, the warehouse, BI queries and migrations, with a real example of each.', icon: Waypoints, links: [['sources', 'Sources']] },
  { n: 6, title: 'Put it to work', desc: 'A live-style dashboard, the issue registry and every template you need to run the process.', icon: LayoutDashboard, links: [['dashboard', 'Dashboard'], ['registry', 'Registry'], ['templates', 'Templates']] },
]

const ROADMAP = [
  {
    icon: Layers, stage: 'Foundational', sub: 'Build the capability',
    cols: [
      ['Data custodianship', ['Define data custodian roles', 'Nominate HR Data Stewards', 'Train Data Custodians', 'Publish logical DQ rules guidance']],
      ['Data quality tools', ['DQ issue reports', 'DQ dashboards', 'DQ remediation process']],
      ['Data quality architecture', ['Identify & document CDEs', 'Implement Informatica IDMC (CDQ + CDGC)', 'DQ rules & profiling']],
    ],
  },
  { icon: Rocket, stage: 'Activation', sub: 'Fix what matters first', cols: [['First wave', ['Initial prioritization of DQ issues', 'Remediation of the highest-priority issues']]] },
  { icon: RefreshCcw, stage: 'Business as usual', sub: 'Run the lifecycle', cols: [['Continuous cycle', ['Scan → report → review → prioritize', 'RCA → plan → develop → test', 'Validate, close and confirm score change']]] },
]

export default function Home({ go }) {
  return (
    <>
      <section className="card" style={{ background: 'var(--navy)', color: '#fff', border: 0, padding: 'clamp(22px, 4vw, 40px)' }}>
        <div className="grid g2" style={{ alignItems: 'center', gap: 28 }}>
          <div className="stack" style={{ gap: 14 }}>
            <div className="eyebrow" style={{ color: '#9fe7dd' }}>Data Quality Academy · Team learning portal</div>
            <h1 style={{ color: '#fff' }}>Trusted data is managed on purpose.</h1>
            <p style={{ fontSize: '1.06rem', opacity: 0.88, maxWidth: '58ch' }}>
              This portal walks you through how we define, measure, protect and repair the quality of our data. Start with the two mindsets,
              learn the framework and roles, master each building block, then use the dashboard, registry and templates in your day-to-day work.
            </p>
            <div className="row">
              <button className="btn primary" onClick={() => go('proactive')}>Start the journey <ArrowRight size={15} /></button>
              <button className="btn" style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,0.35)' }} onClick={() => go('templates')}>Jump to templates</button>
            </div>
          </div>
          <CostPyramid />
        </div>
      </section>

      <Section title="The storyline" sub="Six chapters, in the order we recommend. Each chapter builds on the one before it.">
        <div className="grid g3">
          {CHAPTERS.map((c) => {
            const Icon = c.icon
            return (
              <article key={c.n} className="card stack" style={{ gap: 10 }}>
                <div className="row between">
                  <div className="icon-tile"><Icon size={19} /></div>
                  <span className="mono muted">Chapter {c.n}</span>
                </div>
                <h3>{c.title}</h3>
                <p className="small" style={{ color: 'var(--ink-2)' }}>{c.desc}</p>
                <div className="row" style={{ gap: 6, marginTop: 'auto' }}>
                  {c.links.map(([id, label]) => (
                    <button key={id} className="btn sm" onClick={() => go(id)}>{label} <ArrowRight size={13} /></button>
                  ))}
                </div>
              </article>
            )
          })}
        </div>
      </Section>

      <Section title="How the program rolls out" sub="Foundations first, then a focused activation wave, then the lifecycle becomes business as usual.">
        <div className="stack" style={{ gap: 12 }}>
          {ROADMAP.map((r, i) => {
            const Icon = r.icon
            return (
              <div key={r.stage} className="card flat roadmap-row">
                <div className="row" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
                  <div className="icon-tile navy"><Icon size={18} /></div>
                  <div>
                    <div className="mono xs muted">Stage {i + 1}</div>
                    <h3>{r.stage}</h3>
                    <div className="small muted">{r.sub}</div>
                  </div>
                </div>
                <div className={'grid ' + (r.cols.length === 3 ? 'g3' : 'g2')}>
                  {r.cols.map(([h, items]) => (
                    <div key={h} className="stack" style={{ gap: 6 }}>
                      <h4>{h}</h4>
                      <ul className="bullets small">{items.map((x) => <li key={x}>{x}</li>)}</ul>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      <Callout title="Tooling note">
        Examples reference <b>Informatica Intelligent Data Management Cloud (IDMC)</b>: Cloud Data Quality for rules and scans, Cloud Data Profiling for baselines,
        and Cloud Data Governance & Catalog (CDGC) for CDEs, business terms, lineage and scorecards. The concepts apply to any toolset.
      </Callout>
    </>
  )
}

function CostPyramid() {
  const tiers = [
    { cost: '$1', label: 'Prevention', desc: 'Validate at the point of entry', w: 46 },
    { cost: '$10', label: 'Correction', desc: 'Find and fix it in the pipeline', w: 72 },
    { cost: '$100', label: 'Failure', desc: 'Wrong pay, wrong report, wrong decision', w: 100 },
  ]
  return (
    <div className="stack" style={{ gap: 8 }}>
      <div className="xs" style={{ letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.7 }}>The 1-10-100 rule · cost per bad record</div>
      {tiers.map((t) => (
        <div key={t.cost} style={{ width: t.w + '%', margin: '0 auto', background: 'rgba(255,255,255,' + (0.08 + t.w / 700) + ')', borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 12, alignItems: 'center' }}>
          <span className="big-num" style={{ fontSize: '1.5rem', minWidth: 56 }}>{t.cost}</span>
          <span className="small" style={{ lineHeight: 1.3 }}><b>{t.label}</b><br /><span style={{ opacity: 0.8 }}>{t.desc}</span></span>
        </div>
      ))}
      <p className="xs" style={{ opacity: 0.7, textAlign: 'center' }}>The later a defect is caught, the more it costs. This is the case for proactive data quality.</p>
    </div>
  )
}
