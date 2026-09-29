import { useState } from 'react'
import { Info, CheckCircle2, AlertTriangle, AlertOctagon, CircleDot, Copy, Download } from 'lucide-react'
import { ROLES } from '../data/roles.js'

export function PageHead({ eyebrow, icon: Icon, title, lead, children }) {
  return (
    <header className="page-head">
      {eyebrow && (
        <div className="eyebrow">
          {Icon && <Icon size={15} />} {eyebrow}
        </div>
      )}
      <h1>{title}</h1>
      {lead && <p className="lead">{lead}</p>}
      {children}
    </header>
  )
}

export function Section({ title, sub, action, children }) {
  return (
    <section className="section">
      {(title || action) && (
        <div className="section-head">
          <div className="stack" style={{ gap: 4 }}>
            {title && <h2>{title}</h2>}
            {sub && <p>{sub}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((t) => {
        const Icon = t.icon
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            className={'tab' + (active === t.id ? ' on' : '')}
            onClick={() => onChange(t.id)}
          >
            {Icon && <Icon size={15} />}
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

export function Seg({ options, value, onChange, label }) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map((o) => {
        const v = typeof o === 'string' ? o : o.value
        const l = typeof o === 'string' ? o : o.label
        return (
          <button key={v} className={value === v ? 'on' : ''} onClick={() => onChange(v)}>
            {l}
          </button>
        )
      })}
    </div>
  )
}

export function Callout({ tone = 'accent', title, children, icon }) {
  const Icon = icon || (tone === 'warn' ? AlertTriangle : tone === 'crit' ? AlertOctagon : Info)
  return (
    <div className={'callout ' + tone}>
      <Icon size={18} />
      <div>
        {title && <strong>{title}</strong>}
        {children}
      </div>
    </div>
  )
}

export function Pill({ tone = 'neutral', children, icon: Icon }) {
  return (
    <span className={'pill ' + tone}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  )
}

export function RoleChip({ id }) {
  const r = ROLES.find((x) => x.id === id)
  if (!r) return <span className="role-chip">{id}</span>
  return (
    <span className="role-chip" title={r.name}>
      <span className="dot" style={{ background: r.color }} />
      {r.short}
    </span>
  )
}

// Status helpers: color is never alone - each carries an icon and a word.
const PRIORITY = {
  Critical: { tone: 'crit', icon: AlertOctagon },
  High: { tone: 'serious', icon: AlertTriangle },
  Medium: { tone: 'warn', icon: CircleDot },
  Low: { tone: 'good', icon: CheckCircle2 },
}
export function PriorityPill({ value }) {
  const p = PRIORITY[value] || { tone: 'neutral' }
  return <Pill tone={p.tone} icon={p.icon}>{value}</Pill>
}

const STATUS = {
  'Under Review': 'neutral',
  Triaged: 'accent',
  'RCA In Progress': 'warn',
  'Remediation In Progress': 'warn',
  'Business Testing': 'accent',
  'Pending Validation': 'accent',
  Resolved: 'good',
  Closed: 'good',
  Rejected: 'neutral',
  Escalated: 'crit',
}
export function StatusPill({ value }) {
  return <Pill tone={STATUS[value] || 'neutral'}>{value}</Pill>
}

export function scoreBand(score, t = { green: 95, amber: 80 }) {
  if (score >= t.green) return { tone: 'good', label: 'Meets target', icon: CheckCircle2 }
  if (score >= t.amber) return { tone: 'warn', label: 'Monitor', icon: AlertTriangle }
  return { tone: 'crit', label: 'Remediate', icon: AlertOctagon }
}
export function ScorePill({ score, t }) {
  const b = scoreBand(score, t)
  return <Pill tone={b.tone} icon={b.icon}>{score.toFixed(1)}%</Pill>
}

// Column count chosen so the last row is never a lone card (6 -> 3+3, 7 -> 4+3, 8 -> 4+4).
const FLOW_COLS = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 3, 7: 4, 8: 4, 9: 3, 10: 5 }
export function StepFlow({ steps }) {
  return (
    <div className="flow" style={{ '--cols': FLOW_COLS[steps.length] || 4 }}>
      {steps.map((s, i) => (
        <div className="step" key={i}>
          <div className="step-top">
            <span className="step-num">{String(i + 1).padStart(2, '0')}</span>
            <h4>{s.title}</h4>
          </div>
          {s.owner && (
            <div className="row" style={{ gap: 4 }}>
              {[].concat(s.owner).map((o) => <RoleChip key={o} id={o} />)}
            </div>
          )}
          <p>{s.desc}</p>
          {s.out && <div className="step-out"><b>Output:</b> {s.out}</div>}
        </div>
      ))}
    </div>
  )
}

export function Check({ children }) {
  return (
    <li>
      <CheckCircle2 size={15} />
      <span>{children}</span>
    </li>
  )
}

export function toCSV(headers, rows) {
  const esc = (v) => {
    const s = v == null ? '' : String(v)
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
  }
  return [headers.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n')
}

export function useToast() {
  const [msg, setMsg] = useState(null)
  const show = (m) => {
    setMsg(m)
    clearTimeout(window.__dqToast)
    window.__dqToast = setTimeout(() => setMsg(null), 2200)
  }
  const node = msg ? <div className="toast" role="status">{msg}</div> : null
  return [show, node]
}

export function CopyDownload({ filename, getText, onToast }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(getText())
      onToast?.('Copied to clipboard')
    } catch {
      onToast?.('Copy was blocked by the browser. Use Download instead.')
    }
  }
  const download = () => {
    const blob = new Blob([getText()], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    onToast?.('Download started: ' + filename)
  }
  return (
    <div className="row" style={{ gap: 6 }}>
      <button className="btn sm" onClick={copy}><Copy size={14} /> Copy CSV</button>
      <button className="btn sm" onClick={download}><Download size={14} /> Download</button>
    </div>
  )
}

/* ------------------------------------------------------------------
   Swimlane: renders a cross-functional process from a small spec.
   nodes: { id, lane, col, label, type: task|decision|start|end, tpl? }
   edges: { from, to, label?, route?: 'h'|'v'|'top'|'bottom' }
------------------------------------------------------------------- */
export function Swimlane({ lanes, nodes, edges, colW = 158, laneH = 112, headW = 118 }) {
  const cols = Math.max(...nodes.map((n) => n.col)) + 1
  const gutter = 22
  const W = headW + cols * colW + 10
  const H = gutter + lanes.length * laneH + gutter
  const laneIdx = Object.fromEntries(lanes.map((l, i) => [l.id, i]))
  const size = (n) =>
    n.type === 'decision' ? { w: 120, h: 70 } : n.type === 'start' || n.type === 'end' ? { w: 70, h: 28 } : { w: 132, h: 60 }
  const pos = {}
  nodes.forEach((n) => {
    const s = size(n)
    pos[n.id] = {
      ...s,
      x: headW + n.col * colW + colW / 2,
      y: gutter + laneIdx[n.lane] * laneH + laneH / 2,
    }
  })

  const edgePath = (e) => {
    const a = pos[e.from], b = pos[e.to]
    if (!a || !b) return { d: '', lx: 0, ly: 0 }
    const route = e.route || (a.y === b.y ? 'h' : a.x === b.x ? 'v' : 'h')
    if (route === 'top' || route === 'bottom') {
      const y = route === 'top' ? gutter / 2 : H - gutter / 2
      const sy = route === 'top' ? a.y - a.h / 2 : a.y + a.h / 2
      const ty = route === 'top' ? b.y - b.h / 2 : b.y + b.h / 2
      return { d: `M${a.x},${sy} V${y} H${b.x} V${ty}`, lx: (a.x + b.x) / 2, ly: y - 4 }
    }
    if (route === 'below' || route === 'above') {
      const s = route === 'below' ? 1 : -1
      const y = a.y + s * (laneH / 2 - 9)
      return { d: `M${a.x},${a.y + (s * a.h) / 2} V${y} H${b.x} V${b.y + (s * b.h) / 2}`, lx: (a.x + b.x) / 2, ly: y - 4 }
    }
    if (a.y === b.y) {
      const dir = b.x > a.x ? 1 : -1
      return { d: `M${a.x + (dir * a.w) / 2},${a.y} H${b.x - (dir * b.w) / 2}`, lx: (a.x + b.x) / 2, ly: a.y - 6 }
    }
    if (a.x === b.x || route === 'v') {
      const dir = b.y > a.y ? 1 : -1
      if (a.x === b.x) return { d: `M${a.x},${a.y + (dir * a.h) / 2} V${b.y - (dir * b.h) / 2}`, lx: a.x + 6, ly: (a.y + b.y) / 2 }
      const hdir = b.x > a.x ? 1 : -1
      return { d: `M${a.x},${a.y + (dir * a.h) / 2} V${b.y} H${b.x - (hdir * b.w) / 2}`, lx: a.x + 6, ly: (a.y + b.y) / 2 }
    }
    // horizontal first, then vertical into target
    const dir = b.x > a.x ? 1 : -1
    const vdir = b.y > a.y ? 1 : -1
    return { d: `M${a.x + (dir * a.w) / 2},${a.y} H${b.x} V${b.y - (vdir * b.h) / 2}`, lx: (a.x + a.w / 2 * dir + b.x) / 2, ly: a.y - 6 }
  }

  const wrap = (text, max = 19) => {
    const words = text.split(' ')
    const lines = []
    let cur = ''
    words.forEach((w) => {
      if ((cur + ' ' + w).trim().length > max) { lines.push(cur.trim()); cur = w } else cur += ' ' + w
    })
    if (cur.trim()) lines.push(cur.trim())
    return lines
  }

  return (
    <div className="table-wrap" style={{ padding: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: 'block', minWidth: W }} role="img">
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--ink-2)" />
          </marker>
        </defs>
        <rect x="0" y="0" width={W} height={H} fill="var(--surface)" />
        {lanes.map((l, i) => {
          const y = gutter + i * laneH
          return (
            <g key={l.id}>
              <rect x="0" y={y} width={W} height={laneH} fill={i % 2 ? 'var(--surface-2)' : 'var(--surface)'} />
              <rect x="0" y={y} width={headW - 10} height={laneH} fill="var(--navy)" />
              {wrap(l.label, 14).map((ln, k, arr) => (
                <text key={k} x={(headW - 10) / 2} y={y + laneH / 2 + (k - (arr.length - 1) / 2) * 15 + 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="#ffffff">
                  {ln}
                </text>
              ))}
              <line x1="0" x2={W} y1={y} y2={y} stroke="var(--line)" />
            </g>
          )
        })}
        {edges.map((e, i) => {
          const p = edgePath(e)
          return (
            <g key={i}>
              <path d={p.d} fill="none" stroke="var(--ink-2)" strokeWidth="1.4" markerEnd="url(#arr)" />
              {e.label && (
                <text x={p.lx} y={p.ly} fontSize="11" fontWeight="600" fill="var(--accent-ink)" textAnchor="middle">{e.label}</text>
              )}
            </g>
          )
        })}
        {nodes.map((n) => {
          const p = pos[n.id]
          const lines = wrap(n.label, n.type === 'decision' ? 13 : 19)
          const text = lines.map((ln, k) => (
            <text key={k} x={p.x} y={p.y + (k - (lines.length - 1) / 2) * 14 + 4} textAnchor="middle" fontSize="11.5" fill={n.type === 'start' || n.type === 'end' ? '#ffffff' : 'var(--ink)'}>
              {ln}
            </text>
          ))
          if (n.type === 'decision') {
            return (
              <g key={n.id}>
                <path d={`M${p.x},${p.y - p.h / 2} L${p.x + p.w / 2},${p.y} L${p.x},${p.y + p.h / 2} L${p.x - p.w / 2},${p.y} Z`} fill="var(--warn-soft)" stroke="var(--warn)" strokeWidth="1.4" />
                {text}
              </g>
            )
          }
          if (n.type === 'start' || n.type === 'end') {
            return (
              <g key={n.id}>
                <rect x={p.x - p.w / 2} y={p.y - p.h / 2} width={p.w} height={p.h} rx={p.h / 2} fill="var(--ink-2)" />
                {text}
              </g>
            )
          }
          return (
            <g key={n.id}>
              <rect x={p.x - p.w / 2} y={p.y - p.h / 2} width={p.w} height={p.h} rx="7" fill="var(--surface)" stroke={n.tpl ? 'var(--accent)' : 'var(--line-strong)'} strokeWidth={n.tpl ? 1.6 : 1.2} />
              {text}
              {n.tpl && (
                <g>
                  <circle cx={p.x + p.w / 2 - 2} cy={p.y - p.h / 2 + 2} r="8" fill="var(--accent)" />
                  <text x={p.x + p.w / 2 - 2} y={p.y - p.h / 2 + 5.5} textAnchor="middle" fontSize="10" fontWeight="700" fill="#1B1B1B">T</text>
                </g>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export function SwimLegend() {
  return (
    <div className="legend">
      <span><svg width="14" height="14"><rect x="1" y="1" width="12" height="12" rx="3" fill="var(--surface)" stroke="var(--accent)" strokeWidth="1.6" /></svg> Uses a template (T)</span>
      <span><svg width="14" height="14"><path d="M7,1 L13,7 L7,13 L1,7 Z" fill="var(--warn-soft)" stroke="var(--warn)" /></svg> Decision</span>
      <span><svg width="22" height="12"><rect x="1" y="1" width="20" height="10" rx="5" fill="var(--ink-2)" /></svg> Start / End</span>
    </div>
  )
}
