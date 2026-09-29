import { useEffect, useState } from 'react'
import {
  Compass, ShieldCheck, Siren, Orbit, Users, Star, Ruler, ListChecks, ScanSearch, Flag, GitBranch, Wrench,
  Activity, Waypoints, LayoutDashboard, TableProperties, FileSpreadsheet, BookOpen, Menu, X, Sun, Moon, Monitor, Gauge,
} from 'lucide-react'

import Home from './pages/Home.jsx'
import Proactive from './pages/Proactive.jsx'
import Reactive from './pages/Reactive.jsx'
import Framework from './pages/Framework.jsx'
import Roles from './pages/Roles.jsx'
import CDEs from './pages/blocks/CDEs.jsx'
import Dimensions from './pages/blocks/Dimensions.jsx'
import Rules from './pages/blocks/Rules.jsx'
import Profiling from './pages/blocks/Profiling.jsx'
import Issues from './pages/blocks/Issues.jsx'
import RCA from './pages/blocks/RCA.jsx'
import Remediation from './pages/blocks/Remediation.jsx'
import Monitoring from './pages/blocks/Monitoring.jsx'
import Sources from './pages/Sources.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Registry from './pages/Registry.jsx'
import Templates from './pages/Templates.jsx'
import Glossary from './pages/Glossary.jsx'

export const NAV = [
  { group: 'Start here', items: [{ id: 'home', label: 'Overview', icon: Compass, el: Home }] },
  {
    group: 'Foundations',
    items: [
      { id: 'proactive', label: 'Proactive Data Quality', icon: ShieldCheck, el: Proactive },
      { id: 'reactive', label: 'Reactive Data Quality', icon: Siren, el: Reactive },
      { id: 'framework', label: 'DQ Framework', icon: Orbit, el: Framework },
      { id: 'roles', label: 'Roles & Responsibilities', icon: Users, el: Roles },
    ],
  },
  {
    group: 'Building blocks',
    items: [
      { id: 'cdes', label: 'Critical Data Elements', icon: Star, el: CDEs },
      { id: 'dimensions', label: 'DQ Dimensions', icon: Ruler, el: Dimensions },
      { id: 'rules', label: 'Rules & Thresholds', icon: ListChecks, el: Rules },
      { id: 'profiling', label: 'Profiling & Baselining', icon: ScanSearch, el: Profiling },
      { id: 'issues', label: 'Issue ID & Prioritization', icon: Flag, el: Issues },
      { id: 'rca', label: 'Root Cause Analysis', icon: GitBranch, el: RCA },
      { id: 'remediation', label: 'Remediation & Plans', icon: Wrench, el: Remediation },
      { id: 'monitoring', label: 'Monitoring & Reporting', icon: Activity, el: Monitoring },
    ],
  },
  { group: 'Where issues come from', items: [{ id: 'sources', label: 'Sources of DQ Issues', icon: Waypoints, el: Sources }] },
  {
    group: 'Workbench',
    items: [
      { id: 'dashboard', label: 'DQ Dashboard', icon: LayoutDashboard, el: Dashboard },
      { id: 'registry', label: 'Issue Registry', icon: TableProperties, el: Registry },
      { id: 'templates', label: 'Templates', icon: FileSpreadsheet, el: Templates },
      { id: 'glossary', label: 'Glossary & Quiz', icon: BookOpen, el: Glossary },
    ],
  },
]
const ALL = NAV.flatMap((g) => g.items)

function readHash() {
  const h = (window.location.hash || '').replace('#', '')
  return ALL.some((i) => i.id === h) ? h : 'home'
}

function useTheme() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('dq-theme') || 'system' } catch { return 'system' }
  })
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', theme)
    try { localStorage.setItem('dq-theme', theme) } catch { /* storage unavailable */ }
  }, [theme])
  return [theme, setTheme]
}

export default function App() {
  const [page, setPage] = useState(readHash)
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useTheme()

  useEffect(() => {
    const on = () => setPage(readHash())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  const go = (id) => {
    if (window.location.hash !== '#' + id) window.location.hash = id
    setPage(id)
    setOpen(false)
    window.scrollTo({ top: 0 })
  }

  const current = ALL.find((i) => i.id === page) || ALL[0]
  const Page = current.el
  let n = 0

  return (
    <div className="shell">
      <div className="topbar">
        <button aria-label="Open navigation" onClick={() => setOpen(true)}><Menu size={22} /></button>
        <span className="brand-name">Data Quality Academy</span>
      </div>
      {open && <div className="drawer-back" style={{ zIndex: 45, background: 'transparent' }} onClick={() => setOpen(false)} />}
      <aside className={'rail' + (open ? ' open' : '')}>
        <div className="brand">
          <div className="brand-mark"><Gauge size={20} /></div>
          <div>
            <div className="brand-name">Data Quality Academy</div>
            <div className="brand-sub">Learn · Apply · Improve</div>
          </div>
          {open && (
            <button className="btn ghost sm" style={{ marginLeft: 'auto', color: '#fff' }} aria-label="Close navigation" onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          )}
        </div>
        {NAV.map((g) => (
          <nav className="nav-group" key={g.group} aria-label={g.group}>
            <div className="nav-label">{g.group}</div>
            {g.items.map((it) => {
              const Icon = it.icon
              n += 1
              return (
                <button key={it.id} className={'nav-item' + (page === it.id ? ' active' : '')} onClick={() => go(it.id)} aria-current={page === it.id ? 'page' : undefined}>
                  <Icon size={16} />
                  <span>{it.label}</span>
                  <span className="nav-num">{String(n).padStart(2, '0')}</span>
                </button>
              )
            })}
          </nav>
        ))}
        <div className="rail-foot">
          <div className="nav-label" style={{ padding: 0 }}>Theme</div>
          <div className="theme-switch" role="group" aria-label="Theme">
            <button className={theme === 'light' ? 'on' : ''} onClick={() => setTheme('light')}><Sun size={13} /> Light</button>
            <button className={theme === 'system' ? 'on' : ''} onClick={() => setTheme('system')}><Monitor size={13} /> Auto</button>
            <button className={theme === 'dark' ? 'on' : ''} onClick={() => setTheme('dark')}><Moon size={13} /> Dark</button>
          </div>
        </div>
      </aside>
      <main className="main">
        <div className="page" key={page}>
          <Page go={go} />
        </div>
      </main>
    </div>
  )
}
