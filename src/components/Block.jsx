import { useState } from 'react'
import { Workflow, Boxes, Lightbulb, FileSpreadsheet, ArrowRight } from 'lucide-react'
import { PageHead, Tabs } from './ui.jsx'

// Shared layout for every building-block page: summary strip, then Process / Framework / Example tabs.
export default function Block({ icon, title, lead, facts, process, framework, example, templates = [], go }) {
  const [tab, setTab] = useState('process')
  return (
    <>
      <PageHead eyebrow="Chapter 4 · Building block" icon={icon} title={title} lead={lead} />
      {facts && (
        <div className="grid g4">
          {facts.map(([k, v]) => (
            <div key={k} className="card flat stack" style={{ gap: 4 }}>
              <span className="eyebrow" style={{ color: 'var(--muted)' }}>{k}</span>
              <span style={{ fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
      )}
      <Tabs
        tabs={[
          { id: 'process', label: 'Process', icon: Workflow },
          { id: 'framework', label: 'Framework', icon: Boxes },
          { id: 'example', label: 'Example', icon: Lightbulb },
        ]}
        active={tab}
        onChange={setTab}
      />
      <div className="stack" style={{ gap: 24 }}>
        {tab === 'process' && process}
        {tab === 'framework' && framework}
        {tab === 'example' && example}
      </div>
      {templates.length > 0 && (
        <div className="card tint row between">
          <div className="row"><FileSpreadsheet size={18} color="var(--accent-ink)" /><span><b>Templates for this step:</b> {templates.join(' · ')}</span></div>
          <button className="btn sm" onClick={() => go('templates')}>Open templates <ArrowRight size={13} /></button>
        </div>
      )}
    </>
  )
}
