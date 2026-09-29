import { useMemo, useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { Link } from 'react-router-dom'
import { SearchX } from 'lucide-react'

function HeaderIllustrationBand() {
  return (
    <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-80 overflow-hidden opacity-20 dark:opacity-25" aria-hidden="true">
      <svg
        viewBox="0 0 320 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full object-cover text-teal-400"
      >
        <line x1="0" y1="20" x2="320" y2="20" stroke="#14b8a6" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
        <line x1="0" y1="60" x2="320" y2="60" stroke="#14b8a6" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
        
        {/* Botanical leaf motif */}
        <g transform="translate(30, 8)">
          <path d="M28 58 C10 46 8 22 28 4 C48 22 46 46 28 58 Z" stroke="#14b8a6" strokeWidth="1.2" fill="#0f766e" fillOpacity="0.15" />
          <path d="M28 58 L28 4" stroke="#22d3ee" strokeWidth="1" strokeLinecap="round" />
          <path d="M28 42 Q18 36 16 28" stroke="#14b8a6" strokeWidth="0.8" />
          <path d="M28 42 Q38 36 40 28" stroke="#14b8a6" strokeWidth="0.8" />
          <circle cx="28" cy="4" r="2" fill="#22d3ee" />
        </g>

        {/* Pulse / Heartbeat rhythm line */}
        <path
          d="M80 40 L110 40 L116 28 L124 54 L132 20 L140 50 L148 40 L170 40"
          stroke="#22d3ee"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* DNA Helix strand snippet */}
        <g transform="translate(175, 8)">
          <path d="M10 25 Q35 5 60 25 T110 25" stroke="#14b8a6" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M10 45 Q35 65 60 45 T110 45" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.8" />
          <line x1="20" y1="28" x2="20" y2="42" stroke="#14b8a6" strokeWidth="1" opacity="0.6" />
          <line x1="35" y1="15" x2="35" y2="55" stroke="#22d3ee" strokeWidth="1" opacity="0.6" />
          <line x1="60" y1="25" x2="60" y2="45" stroke="#14b8a6" strokeWidth="1" opacity="0.6" />
          <line x1="85" y1="15" x2="85" y2="55" stroke="#22d3ee" strokeWidth="1" opacity="0.6" />
          <circle cx="35" cy="15" r="2" fill="#22d3ee" />
          <circle cx="35" cy="55" r="2" fill="#14b8a6" />
          <circle cx="85" cy="15" r="2" fill="#14b8a6" />
          <circle cx="85" cy="55" r="2" fill="#22d3ee" />
        </g>
      </svg>
    </div>
  )
}

export function PortfolioPage() {
  const studies = useAppStore((state) => state.studies)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [pi, setPi] = useState('')
  const [department, setDepartment] = useState('')
  const [phase, setPhase] = useState('')
  const [site, setSite] = useState('')

  const options = useMemo(() => ({
    statuses: [...new Set(studies.map((study) => study.status))],
    pis: [...new Set(studies.map((study) => study.pi))],
    departments: [...new Set(studies.map((study) => study.department))],
    phases: [...new Set(studies.map((study) => study.phase))],
    sites: [...new Set(studies.flatMap((study) => study.sites.map((item) => item.name)))],
  }), [studies])

  const filteredStudies = studies.filter((study) => {
    const normalizedSearch = search.trim().toLowerCase()
    const matchesSearch = !normalizedSearch || `${study.title} ${study.ctriNumber} ${study.pi} ${study.department}`.toLowerCase().includes(normalizedSearch)
    return matchesSearch
      && (!status || study.status === status)
      && (!pi || study.pi === pi)
      && (!department || study.department === department)
      && (!phase || study.phase === phase)
      && (!site || study.sites.some((item) => item.name === site))
  })

  const clearFilters = () => {
    setSearch('')
    setStatus('')
    setPi('')
    setDepartment('')
    setPhase('')
    setSite('')
  }

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
        <div
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(circle at 80% 20%, rgba(20, 184, 166, 0.25), transparent 60%), radial-gradient(rgba(20, 184, 166, 0.3) 1px, transparent 1px)`,
            backgroundSize: '100% 100%, 20px 20px',
          }}
        />
        <HeaderIllustrationBand />
        <div className="relative z-10">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">Study registry</div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Portfolio overview</h1>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <label className="grid gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">Search
          <input aria-label="Search studies" value={search} onChange={(event) => setSearch(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100" placeholder="Study, CTRI, PI or department" />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">Status
          <select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"><option value="">All statuses</option>{options.statuses.map((value) => <option key={value}>{value}</option>)}</select>
        </label>
        <label className="grid gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">Principal investigator
          <select aria-label="Filter by PI" value={pi} onChange={(event) => setPi(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"><option value="">All PIs</option>{options.pis.map((value) => <option key={value}>{value}</option>)}</select>
        </label>
        <label className="grid gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">Department
          <select aria-label="Filter by department" value={department} onChange={(event) => setDepartment(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"><option value="">All departments</option>{options.departments.map((value) => <option key={value}>{value}</option>)}</select>
        </label>
        <label className="grid gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">Phase
          <select aria-label="Filter by phase" value={phase} onChange={(event) => setPhase(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"><option value="">All phases</option>{options.phases.map((value) => <option key={value}>{value}</option>)}</select>
        </label>
        <label className="grid gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400">Site
          <select aria-label="Filter by site" value={site} onChange={(event) => setSite(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"><option value="">All sites</option>{options.sites.map((value) => <option key={value}>{value}</option>)}</select>
        </label>
      </div>

      <div className="flex items-center justify-between gap-4 text-sm"><p role="status" className="text-xs text-slate-500 dark:text-slate-400">Showing {filteredStudies.length} of {studies.length} studies</p><button onClick={clearFilters} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition">Clear filters</button></div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white/95 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
          <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3 font-medium">Study</th>
              <th className="px-4 py-3 font-medium">CTRI</th>
              <th className="px-4 py-3 font-medium">Phase</th>
              <th className="px-4 py-3 font-medium">Sites</th>
              <th className="px-4 py-3 font-medium">Target</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900/60">
            {filteredStudies.map((study) => (
              <tr key={study.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                <td className="px-4 py-3">
                  <Link to={`/study/${study.id}`} className="font-semibold text-teal-600 dark:text-teal-400 hover:underline">{study.title}</Link>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{study.ctriNumber}</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{study.phase}</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{study.sites.length}</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{study.enrolled}/{study.targetSampleSize}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${study.status === 'Active' ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' : study.status === 'At Risk' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'}`}>
                    {study.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStudies.length === 0 && (
          <div role="status" className="p-8 text-center text-sm text-slate-600 dark:text-slate-400 flex flex-col items-center justify-center gap-2">
            <SearchX size={24} className="text-slate-400 dark:text-slate-500" />
            <span>No studies match these filters.</span>
          </div>
        )}
      </div>
    </div>
  )
}
