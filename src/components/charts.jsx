import { useRef, useState } from 'react'

// Small hand-built SVG charts. One axis each, thin marks, recessive grid, hover tooltips.

function useTip() {
  const ref = useRef(null)
  const [tip, setTip] = useState(null)
  const show = (e, content) => {
    const box = ref.current?.getBoundingClientRect()
    if (!box) return
    const x = e.clientX - box.left, y = e.clientY - box.top
    setTip({ x: Math.min(x + 12, box.width - 180), y: Math.max(y - 12, 0), content })
  }
  const node = tip ? <div className="tooltip" style={{ left: tip.x, top: tip.y }}>{tip.content}</div> : null
  return { ref, show, hide: () => setTip(null), node }
}

const niceMax = (v) => {
  const p = Math.pow(10, Math.floor(Math.log10(v || 1)))
  const n = v / p
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p
}

export function LineChart({ data, yMin = 60, yMax = 100, bands = [], height = 240, fmt = (v) => v.toFixed(1) + '%', label = 'Score' }) {
  const t = useTip()
  const W = 640, H = height, m = { l: 40, r: 16, t: 14, b: 28 }
  const iw = W - m.l - m.r, ih = H - m.t - m.b
  const x = (i) => m.l + (i / (data.length - 1)) * iw
  const y = (v) => m.t + ih - ((v - yMin) / (yMax - yMin)) * ih
  const [hover, setHover] = useState(null)
  const path = data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d.v)}`).join(' ')
  const area = `${path} L${x(data.length - 1)},${y(yMin)} L${x(0)},${y(yMin)} Z`
  const ticks = [yMin, yMin + (yMax - yMin) / 4, yMin + (yMax - yMin) / 2, yMin + (3 * (yMax - yMin)) / 4, yMax]
  const onMove = (e) => {
    const box = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - box.left) / box.width) * W
    const i = Math.max(0, Math.min(data.length - 1, Math.round(((px - m.l) / iw) * (data.length - 1))))
    setHover(i)
    t.show(e, <><b>{data[i].label}</b><br />{label}: {fmt(data[i].v)}</>)
  }
  const last = data[data.length - 1]
  return (
    <div ref={t.ref} style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" onMouseMove={onMove} onMouseLeave={() => { setHover(null); t.hide() }} role="img" aria-label={label + ' trend'}>
        {bands.map((b) => (
          <g key={b.v}>
            <line x1={m.l} x2={W - m.r} y1={y(b.v)} y2={y(b.v)} stroke={b.color} strokeWidth="1.5" strokeDasharray="5 4" />
            <text x={W - m.r} y={y(b.v) - 5} textAnchor="end" fontSize="10.5" fill="var(--ink-2)">{b.label}</text>
          </g>
        ))}
        {ticks.map((v) => (
          <g key={v}>
            <line x1={m.l} x2={W - m.r} y1={y(v)} y2={y(v)} stroke="var(--grid)" strokeWidth="1" />
            <text x={m.l - 8} y={y(v) + 4} textAnchor="end" fontSize="10.5" fill="var(--muted)" style={{ fontVariantNumeric: 'tabular-nums' }}>{v}</text>
          </g>
        ))}
        <path d={area} fill="var(--s1)" fillOpacity="0.1" />
        <path d={path} fill="none" stroke="var(--s1)" strokeWidth="2" strokeLinejoin="round" />
        {data.map((d, i) => (i % 2 === 0 || i === data.length - 1) && (
          <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10.5" fill="var(--muted)">{d.label}</text>
        ))}
        {hover != null && <line x1={x(hover)} x2={x(hover)} y1={m.t} y2={m.t + ih} stroke="var(--axis)" strokeWidth="1" />}
        {hover != null && <circle cx={x(hover)} cy={y(data[hover].v)} r="5" fill="var(--s1)" stroke="var(--surface)" strokeWidth="2" />}
        <circle cx={x(data.length - 1)} cy={y(last.v)} r="4.5" fill="var(--s1)" stroke="var(--surface)" strokeWidth="2" />
        <text x={x(data.length - 1) - 8} y={y(last.v) - 10} textAnchor="end" fontSize="12" fontWeight="600" fill="var(--ink)">{fmt(last.v)}</text>
      </svg>
      {t.node}
    </div>
  )
}

export function HBars({ data, max, min, fmt = (v) => v, marker, color = 'var(--s1)', rowH = 30, labelW = 150, icon }) {
  const t = useTip()
  const mx = max ?? niceMax(Math.max(...data.map((d) => d.v)))
  // With a non-zero minimum, draw a dot plot (dots don't imply a zero baseline the way bars do).
  if (min != null) {
    const pos = (v) => `${((Math.max(min, v) - min) / (mx - min)) * 100}%`
    return (
      <div ref={t.ref} style={{ position: 'relative' }} className="stack">
        {data.map((d) => (
          <div key={d.label} style={{ display: 'grid', gridTemplateColumns: `${labelW}px minmax(0,1fr) 64px`, gap: 10, alignItems: 'center', minHeight: rowH }}
            onMouseMove={(e) => t.show(e, <><b>{d.label}</b><br />{d.tip || fmt(d.v)}</>)} onMouseLeave={t.hide}>
            <span className="small" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</span>
            <div style={{ position: 'relative', height: 14 }}>
              <div style={{ position: 'absolute', left: 0, right: 0, top: 6, height: 2, background: 'var(--grid)', borderRadius: 2 }} />
              <div style={{ position: 'absolute', left: 0, width: pos(d.v), top: 6, height: 2, background: d.color || color }} />
              {marker != null && <div title={`Target ${marker}`} style={{ position: 'absolute', left: pos(marker), top: -2, bottom: -2, width: 2, background: 'var(--ink)' }} />}
              <div style={{ position: 'absolute', left: pos(d.v), top: 1, width: 12, height: 12, marginLeft: -6, borderRadius: '50%', background: d.color || color, border: '2px solid var(--surface)' }} />
            </div>
            <span className="small row" style={{ gap: 4, justifyContent: 'flex-end', fontVariantNumeric: 'tabular-nums', flexWrap: 'nowrap' }}>{icon?.(d)}{fmt(d.v)}</span>
          </div>
        ))}
        <div style={{ display: 'grid', gridTemplateColumns: `${labelW}px minmax(0,1fr) 64px`, gap: 10 }}>
          <span />
          <div className="row between xs muted"><span>{min}%</span><span>{(min + mx) / 2}%</span><span>{mx}%</span></div>
          <span />
        </div>
        {t.node}
      </div>
    )
  }
  return (
    <div ref={t.ref} style={{ position: 'relative' }} className="stack">
      {data.map((d) => (
        <div key={d.label} style={{ display: 'grid', gridTemplateColumns: `${labelW}px minmax(0,1fr) 64px`, gap: 10, alignItems: 'center', minHeight: rowH }}
          onMouseMove={(e) => t.show(e, <><b>{d.label}</b><br />{d.tip || fmt(d.v)}</>)} onMouseLeave={t.hide}>
          <span className="small" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</span>
          <div style={{ position: 'relative', height: 14, background: 'var(--surface-2)', borderRadius: 4 }}>
            <div style={{ width: `${(d.v / mx) * 100}%`, height: '100%', background: d.color || color, borderRadius: '0 4px 4px 0' }} />
            {marker != null && <div title={`Target ${marker}`} style={{ position: 'absolute', left: `${(marker / mx) * 100}%`, top: -3, bottom: -3, width: 2, background: 'var(--ink)' }} />}
          </div>
          <span className="small row" style={{ gap: 4, justifyContent: 'flex-end', fontVariantNumeric: 'tabular-nums', flexWrap: 'nowrap' }}>{icon?.(d)}{fmt(d.v)}</span>
        </div>
      ))}
      {t.node}
    </div>
  )
}

export function Heatmap({ rows, cols, value, fmt = (v) => v.toFixed(1), scale }) {
  const t = useTip()
  return (
    <div ref={t.ref} style={{ position: 'relative', overflowX: 'auto' }}>
      <table style={{ borderCollapse: 'separate', borderSpacing: 3, width: '100%', minWidth: 520, fontSize: '0.78rem' }}>
        <thead>
          <tr><th></th>{cols.map((c) => <th key={c} style={{ fontWeight: 600, color: 'var(--ink-2)', padding: '2px 4px', textAlign: 'center' }}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r}>
              <th style={{ textAlign: 'left', fontWeight: 500, paddingRight: 8, whiteSpace: 'nowrap' }}>{r}</th>
              {cols.map((c) => {
                const v = value(r, c)
                const s = scale(v)
                return (
                  <td key={c} onMouseMove={(e) => t.show(e, <><b>{r} · {c}</b><br />{fmt(v)}</>)} onMouseLeave={t.hide}
                    style={{ background: s.bg, color: s.fg, textAlign: 'center', padding: '8px 4px', borderRadius: 4, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                    {fmt(v)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {t.node}
    </div>
  )
}

// Grouped bars (created / closed) plus a net-open line on the same count axis.
export function FlowChart({ data, height = 240 }) {
  const t = useTip()
  const W = 640, H = height, m = { l: 40, r: 16, t: 14, b: 28 }
  const iw = W - m.l - m.r, ih = H - m.t - m.b
  const mx = niceMax(Math.max(...data.flatMap((d) => [d.created, d.closed, d.net])))
  const bw = iw / data.length
  const y = (v) => m.t + ih - (v / mx) * ih
  const cx = (i) => m.l + bw * i + bw / 2
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${cx(i)},${y(d.net)}`).join(' ')
  const ticks = [0, mx / 4, mx / 2, (3 * mx) / 4, mx]
  const barW = Math.min(14, bw / 3)
  return (
    <div ref={t.ref} style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Issues created, closed and net open by month">
        {ticks.map((v) => (
          <g key={v}>
            <line x1={m.l} x2={W - m.r} y1={y(v)} y2={y(v)} stroke="var(--grid)" />
            <text x={m.l - 8} y={y(v) + 4} textAnchor="end" fontSize="10.5" fill="var(--muted)">{Math.round(v)}</text>
          </g>
        ))}
        {data.map((d, i) => (
          <g key={d.label} onMouseMove={(e) => t.show(e, <><b>{d.label}</b><br />Created: {d.created}<br />Closed: {d.closed}<br />Net open: {d.net}</>)} onMouseLeave={t.hide}>
            <rect x={m.l + bw * i} y={m.t} width={bw} height={ih} fill="transparent" />
            <rect x={cx(i) - barW - 1} y={y(d.created)} width={barW} height={y(0) - y(d.created)} rx="3" fill="var(--s1)" />
            <rect x={cx(i) + 1} y={y(d.closed)} width={barW} height={y(0) - y(d.closed)} rx="3" fill="var(--s2)" />
            <text x={cx(i)} y={H - 8} textAnchor="middle" fontSize="10.5" fill="var(--muted)">{d.label}</text>
          </g>
        ))}
        <path d={line} fill="none" stroke="var(--s3)" strokeWidth="2" pointerEvents="none" />
        {data.map((d, i) => <circle key={i} cx={cx(i)} cy={y(d.net)} r="4" fill="var(--s3)" stroke="var(--surface)" strokeWidth="2" pointerEvents="none" />)}
        <text x={cx(data.length - 1)} y={y(data[data.length - 1].net) - 10} textAnchor="middle" fontSize="11.5" fontWeight="600" fill="var(--ink)">{data[data.length - 1].net}</text>
      </svg>
      {t.node}
    </div>
  )
}

// Horizontal stacked bars. keys are ordered; colors are an ordinal ramp.
export function StackedBars({ data, keys, colors, labelW = 130 }) {
  const t = useTip()
  const mx = niceMax(Math.max(...data.map((d) => keys.reduce((a, k) => a + (d[k] || 0), 0))))
  return (
    <div ref={t.ref} style={{ position: 'relative' }} className="stack">
      {data.map((d) => {
        const total = keys.reduce((a, k) => a + (d[k] || 0), 0)
        return (
          <div key={d.label} style={{ display: 'grid', gridTemplateColumns: `${labelW}px minmax(0,1fr) 34px`, gap: 10, alignItems: 'center' }}>
            <span className="small" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.label}</span>
            <div style={{ display: 'flex', gap: 2, height: 16 }}>
              {keys.map((k, i) => d[k] ? (
                <div key={k} onMouseMove={(e) => t.show(e, <><b>{d.label}</b><br />{k}: {d[k]}</>)} onMouseLeave={t.hide}
                  style={{ width: `${(d[k] / mx) * 100}%`, background: colors[i], borderRadius: i === keys.length - 1 || !keys.slice(i + 1).some((kk) => d[kk]) ? '0 4px 4px 0' : 0 }} />
              ) : null)}
            </div>
            <span className="small" style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{total}</span>
          </div>
        )
      })}
      {t.node}
    </div>
  )
}

export function Sparkline({ values, color = 'var(--s1)', w = 90, h = 26 }) {
  const mn = Math.min(...values), mx = Math.max(...values)
  const x = (i) => (i / (values.length - 1)) * (w - 4) + 2
  const y = (v) => h - 3 - ((v - mn) / (mx - mn || 1)) * (h - 6)
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ')
  return (
    <svg width={w} height={h} aria-hidden>
      <path d={`${d} L${x(values.length - 1)},${h} L${x(0)},${h} Z`} fill={color} fillOpacity="0.12" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" />
      <circle cx={x(values.length - 1)} cy={y(values[values.length - 1])} r="2.6" fill={color} />
    </svg>
  )
}
