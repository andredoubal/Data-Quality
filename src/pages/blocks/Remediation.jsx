import { Wrench, Eraser, ShieldPlus, Radar, Umbrella } from 'lucide-react'
import Block from '../../components/Block.jsx'
import { Section, StepFlow, Callout, RoleChip, Pill } from '../../components/ui.jsx'

const STRATEGIES = [
  { icon: Eraser, t: 'Correct', term: 'Short term', d: 'Fix the bad records at the source system. Bulk-load corrections where volumes are large, with Owner approval.', e: 'Reprocess the 1,240 July declarations with the correct exchange rates.' },
  { icon: ShieldPlus, t: 'Prevent', term: 'Long term', d: 'Remove the root cause: change the process, add a system validation, fix the interface or pipeline code.', e: 'Fallback to the last published rate on holidays; name an owner for exchange rate reference data.' },
  { icon: Radar, t: 'Detect', term: 'Ongoing', d: 'Add or tighten a DQ rule so any recurrence is caught quickly.', e: 'New rule DQ00018: a rate exists for every currency and calendar day.' },
  { icon: Umbrella, t: 'Contain / accept', term: 'Temporary', d: 'Warn users, annotate reports, or formally accept the risk if a fix costs more than the impact.', e: 'Banner on the revenue dashboard: July customs duty under review.' },
]

const WHERE = [
  ['Business change', 'Process, reference data & governance', 'Policy / tariff owner, Champion'],
  ['Data entry', 'Submission validation + broker / taxpayer guidance', 'Source System Team, Customs / Tax operations'],
  ['Source system / integration', 'Source config or interface', 'Source System Team, Custodian'],
  ['Data warehouse / pipeline', 'Pipeline code', 'Data Custodian'],
  ['BI query / report logic', 'Semantic layer / report', 'BI developer, Custodian'],
  ['Migration & reference data', 'Master / reference data', 'Data Architect, Steward'],
]

const PLAN = [
  { a: 'Confirm scope: list 1,240 declarations and 9 currencies without a rate', o: 'custodian', s: 0, d: 2, st: 'Done' },
  { a: 'Agree fallback rule (last published rate) with Finance and Treasury', o: 'steward', s: 2, d: 3, st: 'Done' },
  { a: 'Build fallback and missing-rate alert in the rate pipeline', o: 'custodian', s: 5, d: 2, st: 'Done' },
  { a: 'Technical testing: reprocess July in QA, zero lines at rate 0', o: 'custodian', s: 7, d: 2, st: 'In progress' },
  { a: 'Business testing: duty totals reconcile to treasury ledger', o: 'steward', s: 9, d: 3, st: 'Planned' },
  { a: 'Deploy, reprocess July in production, rerun DQ scan', o: 'custodian', s: 12, d: 1, st: 'Planned' },
  { a: 'Designate exchange rates as CDE; add rule DQ00018', o: 'owner', s: 12, d: 4, st: 'Planned' },
  { a: 'Close issue and report at DG Working Group', o: 'steward', s: 16, d: 1, st: 'Planned' },
]

export default function Remediation({ go }) {
  return (
    <Block
      go={go}
      icon={Wrench}
      title="Remediation & remediation plans"
      lead="Remediation fixes the data and the cause. A remediation plan turns the chosen option into owned, dated actions, with technical and business testing before anything is closed, and evidence that the DQ score actually moved."
      facts={[
        ['Planned by', 'Source System Team / Custodian'],
        ['Approved by', 'Data Owner'],
        ['Tested by', 'Custodian (technical), Steward (business)'],
        ['Closed when', 'Scan confirms score change'],
      ]}
      templates={['Remediation Plan', 'Root Cause Analysis']}
      process={
        <Section title="Remediation steps">
          <StepFlow
            steps={[
              { title: 'Identify options', owner: ['source', 'custodian'], desc: 'From the RCA, list correct / prevent / detect / contain options.' },
              { title: 'Estimate effort & plan', owner: ['source', 'custodian'], desc: 'Size each option; draft actions, owners, dates, dependencies.', out: 'Draft plan' },
              { title: 'Validate & approve', owner: ['steward', 'owner'], desc: 'Steward validates priority; Data Owner approves the plan and any data correction.', out: 'Approved plan' },
              { title: 'Develop', owner: 'source', desc: 'Build the fix: data correction script, configuration, code or process change.' },
              { title: 'Technical testing', owner: 'custodian', desc: 'Test in a non-production environment; rerun rules on test data.', out: 'Test evidence' },
              { title: 'Business testing', owner: 'steward', desc: 'Business users confirm the fix gives the expected outcome.', out: 'Sign-off' },
              { title: 'Implement', owner: ['source', 'custodian'], desc: 'Deploy to production through change management.' },
              { title: 'Validate & close', owner: ['steward', 'owner'], desc: 'Next scan confirms the score change; issue closed with evidence.', out: 'Closed issue' },
            ]}
          />
        </Section>
      }
      framework={
        <>
          <Section title="Four remediation strategies" sub="Good plans usually combine a short-term correction with a long-term prevention and a detection rule.">
            <div className="grid g4">
              {STRATEGIES.map((s) => {
                const Icon = s.icon
                return (
                  <article key={s.t} className="card stack" style={{ gap: 8 }}>
                    <div className="row between"><div className="icon-tile"><Icon size={18} /></div><Pill>{s.term}</Pill></div>
                    <h3>{s.t}</h3>
                    <p className="small" style={{ color: 'var(--ink-2)' }}>{s.d}</p>
                    <p className="small"><b>e.g.</b> {s.e}</p>
                  </article>
                )
              })}
            </div>
          </Section>
          <Section title="Where to fix, by root cause">
            <div className="table-wrap">
              <table className="t">
                <thead><tr><th>Root cause category</th><th>Fix location</th><th>Typical fixer</th></tr></thead>
                <tbody>{WHERE.map((w) => <tr key={w[0]}><td style={{ fontWeight: 600 }}>{w[0]}</td><td>{w[1]}</td><td>{w[2]}</td></tr>)}</tbody>
              </table>
            </div>
          </Section>
          <Section title="What a remediation plan contains">
            <div className="grid g4">
              {['Issue ID(s) and linked rules', 'Root cause & chosen option(s)', 'Actions with owner and dates', 'Effort estimate & dependencies', 'Test approach (technical + business)', 'Expected DQ score after fix', 'Rollback / risk notes', 'Approval record'].map((x) => (
                <div key={x} className="card flat small" style={{ padding: 14 }}>{x}</div>
              ))}
            </div>
          </Section>
          <Callout tone="crit" title="Never fix it downstream only">
            Patching revenue figures in the warehouse or a report hides the problem: the source stays wrong and the next load overwrites the fix. Downstream patches are containment, and must have a source fix in the plan.
          </Callout>
        </>
      }
      example={<PlanExample />}
    />
  )
}

function PlanExample() {
  const days = 17
  const tone = { Done: 'good', 'In progress': 'warn', Planned: 'neutral' }
  return (
    <>
      <Section title="Remediation plan: DQI-2026-0108 · Missing exchange rates on public holidays" sub="Priority High · Score 77 · Owner: Customs Operations Director · Expected exchange rate completeness after fix: 100% (from 99.4%).">
        <div className="table-wrap">
          <table className="t" style={{ minWidth: 900 }}>
            <thead>
              <tr>
                <th style={{ width: 330 }}>Action</th><th>Owner</th><th>Status</th>
                <th style={{ width: 380 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${days}, 1fr)`, fontSize: 10, fontWeight: 500 }}>
                    {Array.from({ length: days }, (_, i) => <span key={i} style={{ textAlign: 'center' }}>{i + 1}</span>)}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {PLAN.map((p) => (
                <tr key={p.a}>
                  <td>{p.a}</td><td><RoleChip id={p.o} /></td><td><Pill tone={tone[p.st]}>{p.st}</Pill></td>
                  <td>
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${days}, 1fr)`, height: 18, background: 'var(--surface-2)', borderRadius: 4 }}>
                      <div style={{ gridColumn: `${p.s + 1} / span ${p.d}`, background: p.st === 'Done' ? 'var(--accent)' : p.st === 'In progress' ? 'var(--s4)' : 'var(--line-strong)', borderRadius: 4 }} title={`Day ${p.s + 1}–${p.s + p.d}`} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="xs muted">Timeline in business days from plan approval.</p>
      </Section>
      <div className="grid g3">
        <div className="card flat stack"><div className="eyebrow">Correct</div><p className="small">Reprocess 1,240 July declarations with correct rates.</p></div>
        <div className="card flat stack"><div className="eyebrow">Prevent</div><p className="small">Holiday fallback rate + named owner for exchange rates.</p></div>
        <div className="card flat stack"><div className="eyebrow">Detect</div><p className="small">New rule DQ00018 runs daily with threshold 100%.</p></div>
      </div>
    </>
  )
}
