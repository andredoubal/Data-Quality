import { ArrowRight, Ship, Landmark, Receipt, ShieldCheck, Siren, Orbit, Users, Blocks, Waypoints, LayoutDashboard, Layers, Rocket, RefreshCcw } from 'lucide-react'
import { Section, Callout } from '../components/ui.jsx'

const CHAPTERS = [
  { n: 1, title: 'Two mindsets', desc: 'Proactive prevention vs. reactive detection and repair, and why a mature program needs both.', icon: ShieldCheck, links: [['proactive', 'Proactive'], ['reactive', 'Reactive']] },
  { n: 2, title: 'The framework', desc: 'Program, rules & thresholds, issue management, reporting. Plus the six standards and the BAU lifecycle.', icon: Orbit, links: [['framework', 'Framework']] },
  { n: 3, title: 'Who does what', desc: 'Owners, Stewards, Champions, Custodians and the forums that hold them to account, with a full RACI.', icon: Users, links: [['roles', 'Roles']] },
  { n: 4, title: 'Building blocks', desc: 'CDEs, dimensions, rules, profiling, issue prioritization, RCA, remediation and monitoring. Each with process, framework and example.', icon: Blocks, links: [['cdes', 'CDEs'], ['dimensions', 'Dimensions'], ['rules', 'Rules'], ['profiling', 'Profiling'], ['issues', 'Issues'], ['rca', 'RCA'], ['remediation', 'Remediation'], ['monitoring', 'Monitoring']] },
  { n: 5, title: 'Where issues come from', desc: 'Tariff and tax changes, broker and taxpayer entry, integrations, the warehouse, BI queries and reference data, with a real example of each.', icon: Waypoints, links: [['sources', 'Sources']] },
  { n: 6, title: 'Put it to work', desc: 'A live-style dashboard, the issue registry and every template you need to run the process.', icon: LayoutDashboard, links: [['dashboard', 'Dashboard'], ['registry', 'Registry'], ['templates', 'Templates']] },
]

const ROADMAP = [
  {
    icon: Layers, stage: 'Foundational', sub: 'Build the capability',
    cols: [
      ['Data custodianship', ['Define data custodian roles', 'Nominate Customs, Tax & E-Invoicing Data Stewards', 'Train Data Custodians', 'Publish logical DQ rules guidance']],
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
              This portal walks you through how we define, measure, protect and repair the quality of our Customs, Tax and E-Invoicing data. Start with the two mindsets,
              learn the framework and roles, master each building block, then use the dashboard, registry and templates in your day-to-day work.
            </p>
            <div className="row">
              <button className="btn primary" onClick={() => go('proactive')}>Start the journey <ArrowRight size={15} /></button>
              <button className="btn" style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,0.35)' }} onClick={() => go('templates')}>Jump to templates</button>
            </div>
          </div>
          <DomainPanel />
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

const DOMAINS = [
  { icon: Ship, name: 'Customs · FASAH', data: 'Declarations, 12-digit HS codes, customs value, country of origin, importers and brokers' },
  { icon: Landmark, name: 'Tax · ZATCA tax system', data: 'VAT registration (15-digit VAT numbers), VAT & excise returns, payments and refunds' },
  { icon: Receipt, name: 'E-Invoicing · FATOORA', data: 'Cleared and reported e-invoices, QR codes, invoice hashes, EGS onboarding (CSIDs)' },
]

function DomainPanel() {
  return (
    <div className="stack" style={{ gap: 10 }}>
      <div className="xs" style={{ letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.7 }}>Our data domains</div>
      {DOMAINS.map((d) => {
        const Icon = d.icon
        return (
          <div key={d.name} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ width: 38, height: 38, borderRadius: 9, background: 'rgba(255,255,255,0.14)', display: 'grid', placeItems: 'center', flex: 'none' }}><Icon size={19} /></span>
            <span className="small" style={{ lineHeight: 1.35 }}><b style={{ fontSize: '1rem' }}>{d.name}</b><br /><span style={{ opacity: 0.8 }}>{d.data}</span></span>
          </div>
        )
      })}
      <p className="xs" style={{ opacity: 0.7 }}>Every example in this portal comes from these three domains.</p>
    </div>
  )
}
