import { useState } from 'react'
import { GitBranch } from 'lucide-react'
import Block from '../../components/Block.jsx'
import { Section, StepFlow, Callout, Pill } from '../../components/ui.jsx'

export const ROOT_CAUSES = [
  ['Business change', 'Tariff update, VAT or excise rate change, new e-invoicing wave, new law not reflected in data or rules'],
  ['Data entry', 'Broker or taxpayer keying error, placeholder values, wrong classification, missing guidance'],
  ['Source system / integration', 'Missing validation, interface mapping, dropped records, taxpayer ERP (EGS) behavior, timing'],
  ['Data warehouse / pipeline', 'Transformation bug, incremental load gap, schema drift, late-arriving data'],
  ['BI query / report logic', 'Wrong join or filter, inconsistent definition, stale extract'],
  ['Migration & reference data', 'Legacy registration migration, outdated tariff, exchange rate or port code lists'],
]

const FISH = [
  { cat: 'People', causes: ['Analysts adjust figures by hand', 'No named owner for FX rates'] },
  { cat: 'Process', causes: ['No holiday calendar in feed', 'No duty-to-ledger reconciliation'] },
  { cat: 'Technology', causes: ['Join defaults missing rate to 0', 'No alert on empty rate load'] },
  { cat: 'Data', causes: ['1,240 lines without a rate', '9 currencies affected'] },
  { cat: 'Governance', causes: ['FX rates not a CDE', 'No DQ rule on rate table'] },
  { cat: 'Change', causes: ['Central bank feed format changed', 'Change not assessed for data'] },
]

const WHYS = [
  ['Why is July customs duty on the dashboard 4% below the treasury ledger?', 'Because 1,240 foreign-currency declarations were converted to local currency at 0.'],
  ['Why were they converted at 0?', 'Because the exchange rate table had no rate for their declaration dates, and the join defaults a missing rate to 0.'],
  ['Why was there no rate for those dates?', 'Because the SAMA (Saudi Central Bank) feed publishes nothing on public holidays, and those declarations were lodged on a holiday.'],
  ['Why didn\u2019t the pipeline handle that?', 'Because it has no fallback to the last published rate and no alert when a day\u2019s rates are missing.'],
  ['Why was that never built?', 'Because exchange rates were never governed as a CDE: no owner, no rules, no monitoring. \u2190 Root cause'],
]

export default function RCA({ go }) {
  const [shown, setShown] = useState(1)
  return (
    <Block
      go={go}
      icon={GitBranch}
      title="Root cause analysis (RCA)"
      lead="RCA finds out why a data issue happened, not just where. Fixing the symptom cleans the data once. Fixing the root cause stops the defect from being created again."
      facts={[
        ['Led by', 'Data Custodian / Source System Team'],
        ['Input from', 'Data Steward, Data Architect'],
        ['Techniques', '5 Whys, fishbone, lineage trace'],
        ['Output', 'Root cause category + options'],
      ]}
      templates={['Root Cause Analysis']}
      process={
        <Section title="How we run an RCA">
          <StepFlow
            steps={[
              { title: 'Reproduce', owner: 'custodian', desc: 'Re-run the rule; pull sample IDs; confirm the issue and its size.', out: 'Confirmed scope' },
              { title: 'Trace lineage', owner: ['custodian', 'architect'], desc: 'Follow the data from revenue report → warehouse → interface → Customs, Tax or E-Invoicing system in Informatica CDGC lineage. Find the first point where it goes wrong.', out: 'Point of failure' },
              { title: 'Ask why (5 Whys)', owner: ['custodian', 'steward'], desc: 'Keep asking why until you reach a process, system or policy cause, not a person.', out: 'Causal chain' },
              { title: 'Map contributing factors', owner: ['steward', 'source'], desc: 'Use a fishbone for complex issues: people, process, technology, data, governance, change.', out: 'Fishbone' },
              { title: 'Categorize', owner: 'custodian', desc: 'Assign a root cause category so trends can be reported and proactive fixes targeted.', out: 'Root cause category' },
              { title: 'Identify options', owner: ['source', 'custodian'], desc: 'List remediation options: correct data, fix process, add control, fix code. Estimate effort.', out: 'Options & estimate' },
            ]}
          />
        </Section>
      }
      framework={
        <>
          <Section title="Root cause categories" sub="Every resolved issue gets one primary category. These map directly to the Sources of DQ Issues chapter.">
            <div className="grid g3">
              {ROOT_CAUSES.map(([k, v]) => (
                <div key={k} className="card flat stack" style={{ gap: 4 }}>
                  <h4>{k}</h4>
                  <p className="small" style={{ color: 'var(--ink-2)' }}>{v}</p>
                </div>
              ))}
            </div>
          </Section>
          <Section title="Techniques">
            <div className="grid g3">
              <div className="card stack"><h3>5 Whys</h3><p className="small" style={{ color: 'var(--ink-2)' }}>Best for single-thread issues. Ask "why" until the answer is a process or system cause you can change. Usually 3–6 levels.</p></div>
              <div className="card stack"><h3>Fishbone (Ishikawa)</h3><p className="small" style={{ color: 'var(--ink-2)' }}>Best for issues with several contributing factors. Group possible causes into six categories, then test the likely ones.</p></div>
              <div className="card stack"><h3>Lineage trace</h3><p className="small" style={{ color: 'var(--ink-2)' }}>Best for technical issues. Compare the same sample records at each hop to find where values change or disappear.</p></div>
            </div>
          </Section>
          <Callout tone="warn" title="Blame-free by design">
            "The broker typed it wrong" is never a root cause. Ask why the declaration form allowed it, why the broker didn't know the rule, or why nobody noticed. That's where the lasting fix is.
          </Callout>
        </>
      }
      example={
        <>
          <Section title="5 Whys: customs duty below the ledger" sub="Reveal one step at a time, the way you would run it in a workshop.">
            <div className="stack" style={{ gap: 8 }}>
              {WHYS.slice(0, shown).map(([q, a], i) => (
                <div key={i} className="card flat" style={{ display: 'grid', gridTemplateColumns: '40px minmax(0,1fr)', gap: 12, borderColor: i === 4 ? 'var(--accent)' : 'var(--line)' }}>
                  <span className="step-num">{i + 1}</span>
                  <div><b>{q}</b><p style={{ color: 'var(--ink-2)' }}>{a}</p></div>
                </div>
              ))}
              <div className="row">
                {shown < WHYS.length && <button className="btn primary sm" onClick={() => setShown(shown + 1)}>Ask why again</button>}
                {shown > 1 && <button className="btn sm" onClick={() => setShown(1)}>Start over</button>}
                {shown === WHYS.length && <Pill tone="accent">Root cause category: Migration & reference data</Pill>}
              </div>
            </div>
          </Section>
          <Section title="Fishbone: contributing factors">
            <Fishbone />
          </Section>
        </>
      }
    />
  )
}

function Fishbone() {
  const W = 980, H = 380, spineY = H / 2, headX = W - 170
  const top = FISH.slice(0, 3), bot = FISH.slice(3)
  const boneX = (i) => 110 + i * 250
  return (
    <div className="table-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: 'block', minWidth: W }} role="img" aria-label="Fishbone diagram">
        <rect width={W} height={H} fill="var(--surface)" />
        <line x1="40" x2={headX} y1={spineY} y2={spineY} stroke="var(--navy)" strokeWidth="4" />
        <path d={`M${headX},${spineY - 44} L${W - 16},${spineY - 44} L${W - 16},${spineY + 44} L${headX},${spineY + 44} Z`} fill="var(--navy)" />
        {['Duty 4% below', 'treasury', 'ledger (July)'].map((t, i) => (
          <text key={i} x={headX + (W - 16 - headX) / 2} y={spineY - 14 + i * 17} textAnchor="middle" fontSize="13" fontWeight="600" fill="#ffffff">{t}</text>
        ))}
        {[...top.map((f, i) => ({ f, i, up: true })), ...bot.map((f, i) => ({ f, i, up: false }))].map(({ f, i, up }) => {
          const x0 = boneX(i), x1 = x0 + 90
          const y0 = up ? 40 : H - 40
          return (
            <g key={f.cat}>
              <line x1={x0} y1={y0} x2={x1} y2={spineY} stroke="var(--ink-2)" strokeWidth="2" />
              <rect x={x0 - 50} y={up ? y0 - 28 : y0 + 4} width="100" height="24" rx="5" fill="var(--accent)" />
              <text x={x0} y={up ? y0 - 11 : y0 + 21} textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#ffffff">{f.cat}</text>
              {f.causes.map((c, k) => {
                const t = up ? 0.35 + k * 0.3 : 0.35 + k * 0.3
                const cx = x0 + (x1 - x0) * t
                const cy = y0 + (spineY - y0) * t
                return (
                  <g key={k}>
                    <line x1={cx} y1={cy} x2={cx + 14} y2={cy} stroke="var(--line-strong)" strokeWidth="1.4" />
                    <text x={cx + 18} y={cy + 4} fontSize="11.5" fill="var(--ink)">{c}</text>
                  </g>
                )
              })}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
