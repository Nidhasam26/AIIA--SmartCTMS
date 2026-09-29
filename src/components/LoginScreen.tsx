import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle,
  ClipboardList,
  Eye,
  KeyRound,
  Lock,
  Mail,
  Settings,
  ShieldCheck,
  Stethoscope,
  User as UserIcon,
} from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { users } from '../data/seed'
import { useAppStore } from '../store/appStore'

const roleDescriptions: Record<string, string> = {
  'Principal Investigator': 'Protocol design, subject consent, study oversight, and safety reporting.',
  'Study Coordinator': 'Site operations, participant tracking, and data query management.',
  'Monitor (CRA)': 'Site monitoring, milestone tracking, and source data verification.',
  'Ethics Committee (IEC)': 'Independent ethical clearance, continuation reviews, and protocol amendments.',
  'PV Officer': 'Adverse event triage, safety signal detection, and regulatory pharmacovigilance.',
  'DSMB': 'Blinded independent aggregate safety monitoring and trend analysis.',
  'Leadership': 'Portfolio RAG oversight, executive compliance score, and milestone governance.',
  'Regulator': 'Read-only inspection of study registries and immutable audit logs.',
  'System Admin': 'Platform configuration, KPI thresholds, and security administration.',
}

function getRoleIcon(role: string) {
  switch (role) {
    case 'Principal Investigator':
      return <Stethoscope size={15} className="shrink-0 text-teal-400" />
    case 'Study Coordinator':
      return <ClipboardList size={15} className="shrink-0 text-teal-400" />
    case 'Ethics Committee (IEC)':
      return <ShieldCheck size={15} className="shrink-0 text-teal-400" />
    case 'PV Officer':
      return <Activity size={15} className="shrink-0 text-teal-400" />
    case 'Leadership':
      return <BarChart3 size={15} className="shrink-0 text-teal-400" />
    case 'Monitor (CRA)':
    case 'DSMB':
    case 'Regulator':
      return <Eye size={15} className="shrink-0 text-teal-400" />
    case 'System Admin':
      return <Settings size={15} className="shrink-0 text-teal-400" />
    default:
      return <ShieldCheck size={15} className="shrink-0 text-teal-400" />
  }
}

/**
 * Custom Hero Illustration for AIIA SmartCTMS
 * Artwork: Custom handcrafted SVG vector composition combining Clinical Research motifs
 * (DNA double helix, molecular pharmacophore rings, EKG cardiac pulse, clinical data flow nodes)
 * with Ayurvedic motifs (botanical sacred leaf venation, herbal sprigs, equilibrium balance geometry).
 * Palette: Glowing teal (#14b8a6, #22d3ee) and deep emerald slate (#0f766e, #0d141c) on dark canvas.
 * License: Custom project original asset (MIT license / proprietary to AIIA SmartCTMS).
 */
function ClinicalAyurvedaHeroGraphic({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-teal-500/20 bg-gradient-to-br from-[#0d141c]/95 via-[#09151c]/90 to-[#071318]/95 p-5 shadow-2xl backdrop-blur-md ${className}`}
      aria-label="AIIA SmartCTMS Clinical and Ayurvedic Research Motif Hero Graphic"
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-teal-500/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-cyan-500/10 blur-2xl" />
      <svg
        viewBox="0 0 540 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-auto text-teal-400"
      >
        <defs>
          <linearGradient id="tealCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
          <linearGradient id="leafGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0f766e" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Background Grid & Precision Matrix */}
        <g opacity="0.15">
          <line x1="20" y1="35" x2="520" y2="35" stroke="#14b8a6" strokeWidth="0.8" strokeDasharray="4 4" />
          <line x1="20" y1="90" x2="520" y2="90" stroke="#14b8a6" strokeWidth="0.8" strokeDasharray="4 4" />
          <line x1="20" y1="145" x2="520" y2="145" stroke="#14b8a6" strokeWidth="0.8" strokeDasharray="4 4" />
          <line x1="80" y1="15" x2="80" y2="165" stroke="#14b8a6" strokeWidth="0.8" strokeDasharray="4 4" />
          <line x1="270" y1="15" x2="270" y2="165" stroke="#14b8a6" strokeWidth="0.8" strokeDasharray="4 4" />
          <line x1="460" y1="15" x2="460" y2="165" stroke="#14b8a6" strokeWidth="0.8" strokeDasharray="4 4" />
        </g>

        {/* Ayurvedic Botanical Motif (Herbal Leaf Sprig Silhouette & Venation on Left) */}
        <g transform="translate(35, 15)">
          {/* Main Ayurvedic Leaf */}
          <path
            d="M45 130 C18 105 14 55 45 15 C76 55 72 105 45 130 Z"
            fill="url(#leafGrad)"
            stroke="url(#tealCyanGrad)"
            strokeWidth="1.8"
          />
          {/* Leaf Central Vein (Medhya / Prana Axis) */}
          <path d="M45 130 L45 15" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          {/* Side Veins */}
          <path d="M45 105 Q32 95 28 82" stroke="#14b8a6" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M45 105 Q58 95 62 82" stroke="#14b8a6" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M45 78 Q32 70 30 56" stroke="#14b8a6" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M45 78 Q58 70 60 56" stroke="#14b8a6" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M45 52 Q34 45 33 35" stroke="#14b8a6" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M45 52 Q56 45 57 35" stroke="#14b8a6" strokeWidth="1.2" strokeLinecap="round" />
          {/* Secondary Herbal Bud */}
          <path
            d="M70 115 C84 102 88 75 75 62 C62 75 66 102 70 115 Z"
            fill="#0f766e"
            fillOpacity="0.25"
            stroke="#14b8a6"
            strokeWidth="1.2"
          />
          {/* Herb Sprig Silhouette & Calibration Node */}
          <circle cx="45" cy="15" r="3.5" fill="#22d3ee" />
        </g>

        {/* Central Clinical Trial Motif: Molecular Pharmacophore Benzene Rings & Cardiac Pulse */}
        <g transform="translate(145, 25)">
          {/* Hexagonal Molecular Pharmacophore Node 1 */}
          <polygon points="35,22 57,9 79,22 79,48 57,61 35,48" fill="#0d141c" stroke="#14b8a6" strokeWidth="1.5" opacity="0.9" />
          <circle cx="57" cy="35" r="10" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          <circle cx="35" cy="22" r="2.5" fill="#22d3ee" />
          <circle cx="57" cy="9" r="2.5" fill="#14b8a6" />
          <circle cx="79" cy="22" r="2.5" fill="#22d3ee" />
          <circle cx="79" cy="48" r="2.5" fill="#14b8a6" />
          <circle cx="57" cy="61" r="2.5" fill="#22d3ee" />
          <circle cx="35" cy="48" r="2.5" fill="#14b8a6" />

          {/* Molecular Interconnect Bond */}
          <line x1="79" y1="35" x2="110" y2="35" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
          <line x1="79" y1="39" x2="110" y2="39" stroke="#14b8a6" strokeWidth="1" strokeLinecap="round" opacity="0.6" />

          {/* Hexagonal Molecular Node 2 */}
          <polygon points="110,22 132,9 154,22 154,48 132,61 110,48" fill="#0d141c" stroke="#22d3ee" strokeWidth="1.5" opacity="0.9" />
          <circle cx="132" cy="35" r="2.5" fill="#22d3ee" />
          <circle cx="110" cy="22" r="2.5" fill="#14b8a6" />
          <circle cx="132" cy="9" r="2.5" fill="#22d3ee" />
          <circle cx="154" cy="22" r="2.5" fill="#14b8a6" />
          <circle cx="154" cy="48" r="2.5" fill="#22d3ee" />
          <circle cx="132" cy="61" r="2.5" fill="#14b8a6" />

          {/* Clinical Vital Pulse Rhythm line */}
          <path
            d="M5 95 L40 95 L48 82 L58 118 L70 72 L82 104 L92 95 L170 95"
            stroke="#22d3ee"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
        </g>

        {/* Right Section: Continuous DNA Double Helix Spiral with Base Pairs & Clinical Protocol Nodes */}
        <g transform="translate(340, 20)">
          {/* DNA Strand 1 (Sine Wave) */}
          <path
            d="M10 35 Q35 0 60 35 T110 35 T160 35"
            stroke="url(#tealCyanGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* DNA Strand 2 (Cosine Wave) */}
          <path
            d="M10 70 Q35 105 60 70 T110 70 T160 70"
            stroke="#14b8a6"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.85"
          />
          {/* DNA Base Pairs Connectors */}
          <line x1="20" y1="42" x2="20" y2="63" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <line x1="40" y1="24" x2="40" y2="81" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <line x1="60" y1="35" x2="60" y2="70" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <line x1="85" y1="51" x2="85" y2="54" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <line x1="110" y1="35" x2="110" y2="70" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <line x1="135" y1="24" x2="135" y2="81" stroke="#14b8a6" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <line x1="155" y1="42" x2="155" y2="63" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />

          {/* Base Pair Nucleotide Nodes */}
          <circle cx="20" cy="42" r="2.5" fill="#22d3ee" />
          <circle cx="20" cy="63" r="2.5" fill="#14b8a6" />
          <circle cx="40" cy="24" r="3" fill="#22d3ee" />
          <circle cx="40" cy="81" r="3" fill="#14b8a6" />
          <circle cx="135" cy="24" r="3" fill="#22d3ee" />
          <circle cx="135" cy="81" r="3" fill="#14b8a6" />
          <circle cx="160" cy="35" r="3.5" fill="#22d3ee" />
          <circle cx="160" cy="70" r="3.5" fill="#14b8a6" />

          {/* Calibration Ring Accent */}
          <circle cx="85" cy="52" r="30" stroke="#14b8a6" strokeWidth="0.8" strokeDasharray="2 4" opacity="0.4" />
        </g>

        {/* Status Legend text inside SVG */}
        <g opacity="0.6">
          <text x="45" y="165" fill="#94a3b8" fontSize="8.5" fontFamily="monospace" letterSpacing="0.1em">AYURVEDA PRAKRITI PHARMACOGNOSY</text>
          <circle cx="225" cy="162" r="2" fill="#14b8a6" />
          <text x="235" y="165" fill="#94a3b8" fontSize="8.5" fontFamily="monospace" letterSpacing="0.1em">CDSCO / GCP-ASU PROTOCOL DATA ENGINE</text>
        </g>
      </svg>
    </div>
  )
}

export function LoginScreen() {
  const navigate = useNavigate()
  const setActiveUser = useAppStore((state) => state.setActiveUser)

  const [selectedUserId, setSelectedUserId] = useState<string>(users[0].id)
  const [email, setEmail] = useState<string>(users[0].email)
  const [password, setPassword] = useState<string>('demo-pass-2026')
  const [mfaCode, setMfaCode] = useState<string>('582914')
  const [step, setStep] = useState<'credentials' | 'mfa' | 'new_request'>('credentials')
  const [errorMessage, setErrorMessage] = useState<string>('')

  // New user request state
  const [reqName, setReqName] = useState('')
  const [reqEmail, setReqEmail] = useState('')
  const [reqRole, setReqRole] = useState(users[0].role)
  const [reqDept, setReqDept] = useState('')
  const [reqSubmitted, setReqSubmitted] = useState(false)

  const selectedUser = users.find((u) => u.id === selectedUserId) ?? users[0]

  const handleSelectUser = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      setSelectedUserId(user.id)
      setEmail(user.email)
      setErrorMessage('')
    }
  }

  const handleCredentialsSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setErrorMessage('Please enter an email address.')
      return
    }
    if (!password.trim()) {
      setErrorMessage('Please enter a password.')
      return
    }
    setErrorMessage('')
    setStep('mfa')
  }

  const handleMfaSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!mfaCode.trim()) {
      setErrorMessage('Please enter the 6-digit MFA code.')
      return
    }
    setErrorMessage('')
    setActiveUser(selectedUser.id)
    navigate('/')
  }

  const handleNewRequestSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!reqName.trim() || !reqEmail.trim()) {
      setErrorMessage('Name and email are required.')
      return
    }
    setErrorMessage('')
    setReqSubmitted(true)
  }

  return (
    <div className="relative min-h-screen bg-[#0a0f14] px-4 py-8 text-slate-100 flex flex-col justify-between overflow-hidden">
      {/* Subtle background pattern (dot grid & mesh in dark teal) behind login screen */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 10%, rgba(20, 184, 166, 0.15), transparent 45%), radial-gradient(rgba(20, 184, 166, 0.2) 1px, transparent 1px)`,
          backgroundSize: '100% 100%, 28px 28px',
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        {/* Top bar header */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-600 px-3 py-1.5 font-bold text-white tracking-wider shadow-sm shadow-teal-950">AIIA</div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] font-semibold text-teal-400">SmartCTMS</div>
              <div className="text-sm font-semibold text-slate-200">Clinical Trial Management System</div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-teal-500/30 bg-teal-950/40 px-3 py-1.5 text-xs text-teal-300">
            <ShieldCheck size={15} />
            <span>Data hosted in India (design intent)</span>
          </div>
        </header>

        {/* Hero Illustration Banner */}
        {step === 'credentials' && (
          <div className="mb-6">
            <ClinicalAyurvedaHeroGraphic />
          </div>
        )}

        {/* Main Content Area */}
        {step === 'credentials' && (
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left Column: Sign in form & Abstract SVG Line-art Illustration */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-[#0d141c]/90 p-6 shadow-xl backdrop-blur-md">
              <div>
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-teal-400 font-semibold">Authentication</div>
                    <h1 className="mt-1 text-2xl font-bold text-white">Clinical sign in</h1>
                    <p className="mt-1 text-xs text-slate-400">
                      Select a persona card or enter clinical credentials. Accepts any values for prototype demo.
                    </p>
                  </div>

                  {/* Abstract SVG Line Art Icon (Ayurvedic botanical motif + Clinical node network) */}
                  <div className="hidden sm:block shrink-0 p-2 rounded-xl bg-slate-900/80 border border-slate-800" title="Ayurvedic Botanical & Clinical Trial Funnel Motif">
                    <svg width="48" height="48" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-teal-400">
                      {/* Central Stem & Veins */}
                      <path d="M28 48V10M28 10C16 14 12 28 28 36M28 10C40 14 44 28 28 36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M28 20L20 25M28 26L36 31M28 32L18 38M28 38L38 44" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
                      {/* Clinical Trial Nodes */}
                      <circle cx="28" cy="10" r="2.5" fill="#14b8a6" />
                      <circle cx="20" cy="25" r="2" fill="#22d3ee" />
                      <circle cx="36" cy="31" r="2" fill="#22d3ee" />
                      <circle cx="18" cy="38" r="2" fill="#14b8a6" />
                      <circle cx="38" cy="44" r="2" fill="#14b8a6" />
                      <circle cx="28" cy="48" r="3" fill="#0f766e" stroke="#14b8a6" strokeWidth="1.5" />
                    </svg>
                  </div>
                </div>

                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Clinical email
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-3 text-slate-500" />
                      <input
                        type="email"
                        aria-label="Clinical email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@aiia.in"
                        className="w-full rounded-lg border border-slate-700/80 bg-slate-950/80 py-2.5 pl-10 pr-3 text-sm text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-3 text-slate-500" />
                      <input
                        type="password"
                        aria-label="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full rounded-lg border border-slate-700/80 bg-slate-950/80 py-2.5 pl-10 pr-3 text-sm text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-400">
                    <div className="font-medium text-slate-300">Selected persona</div>
                    <div className="mt-1 text-teal-400 font-semibold">{selectedUser.name}</div>
                    <div className="text-slate-400">{selectedUser.role}</div>
                  </div>

                  {errorMessage && (
                    <p role="alert" className="text-xs text-rose-400 font-medium">
                      {errorMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-400 transition"
                  >
                    <span>Continue to MFA</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              </div>

              <div className="mt-6 border-t border-slate-800/80 pt-4 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStep('new_request')
                    setReqSubmitted(false)
                    setErrorMessage('')
                  }}
                  className="text-teal-400 hover:text-teal-300 underline font-medium"
                >
                  New user request
                </button>
                <span className="text-slate-500">2-Factor Authentication required</span>
              </div>
            </div>

            {/* Right Column: Persona selector cards grid (all 9 roles) with Lucide Icons */}
            <div className="lg:col-span-7">
              <div className="mb-3">
                <div className="text-xs uppercase tracking-[0.2em] text-teal-400 font-semibold">Quick switch</div>
                <h2 className="text-lg font-bold text-white">Sign in as persona</h2>
                <p className="text-xs text-slate-400">Select any role below to prefill credentials and explore scoped permissions.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {users.map((user) => {
                  const isSelected = user.id === selectedUserId
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleSelectUser(user.id)}
                      className={`text-left rounded-xl border p-3.5 transition flex flex-col justify-between ${
                        isSelected
                          ? 'border-teal-500 bg-teal-950/40 ring-1 ring-teal-500'
                          : 'border-slate-800/80 bg-[#0d141c]/80 hover:border-slate-700 hover:bg-[#0f1722]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {getRoleIcon(user.role)}
                            <span className={`text-xs font-bold truncate ${isSelected ? 'text-teal-300' : 'text-slate-200'}`}>
                              {user.role}
                            </span>
                          </div>
                          {isSelected && <span className="h-2 w-2 shrink-0 rounded-full bg-teal-400 shadow-sm shadow-teal-400" />}
                        </div>
                        <div className="mt-1 text-xs font-medium text-slate-400">{user.name}</div>
                        <p className="mt-2 text-xs text-slate-400 line-clamp-3 leading-relaxed">
                          {roleDescriptions[user.role] ?? 'Trial participant and regulatory operations.'}
                        </p>
                      </div>
                      <div className="mt-3 text-[10px] text-slate-500 font-mono">
                        {user.email}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* MFA Step */}
        {step === 'mfa' && (
          <div className="mx-auto max-w-md rounded-2xl border border-slate-800/80 bg-[#0d141c]/95 p-8 shadow-2xl backdrop-blur-md">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-950/80 border border-teal-500/40 text-teal-400">
                <KeyRound size={24} />
              </div>
              <h2 className="text-2xl font-bold text-white">Two-Factor Authentication</h2>
              <p className="mt-1 text-xs text-slate-400">
                Mock MFA step: enter any 6-digit security code to verify session.
              </p>
            </div>

            <div className="mb-5 rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Signing in as:</span>
                <span className="font-semibold text-teal-400">{selectedUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Clinical role:</span>
                <span>{selectedUser.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account:</span>
                <span className="font-mono text-slate-400">{email}</span>
              </div>
            </div>

            <form onSubmit={handleMfaSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 text-center">
                  6-digit verification code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  aria-label="6-digit verification code"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="123456"
                  className="w-full text-center tracking-[0.4em] font-mono text-xl rounded-lg border border-slate-700 bg-slate-950 py-3 text-white focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {errorMessage && (
                <p role="alert" className="text-xs text-rose-400 text-center font-medium">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-400 transition"
              >
                Verify MFA & Sign in
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('credentials')
                  setErrorMessage('')
                }}
                className="w-full flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-slate-200 py-1"
              >
                <ArrowLeft size={14} />
                <span>Back to persona selection</span>
              </button>
            </form>
          </div>
        )}

        {/* New user request form */}
        {step === 'new_request' && (
          <div className="mx-auto max-w-lg rounded-2xl border border-slate-800/80 bg-[#0d141c]/95 p-8 shadow-2xl backdrop-blur-md">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-[0.2em] text-teal-400 font-semibold">Access provisioning</div>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">Design preview only</span>
              </div>
              <h2 className="mt-1 text-2xl font-bold text-white">New user request</h2>
              <p className="mt-1 text-xs text-slate-400">
                Submit an onboarding request for clinical trial management access. This preview does not persist accounts.
              </p>
            </div>

            {reqSubmitted ? (
              <div className="rounded-xl border border-teal-500/40 bg-teal-950/40 p-6 text-center space-y-3">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-teal-800/50 text-teal-400">
                  <CheckCircle size={22} />
                </div>
                <div className="text-base font-semibold text-teal-300">Request submitted for review</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your request for {reqName} ({reqRole}) has been queued for institutional review by the System Administrator.
                </p>
                <div className="text-[11px] text-slate-400 italic">
                  Note: This is a design preview only - does not create real account.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('credentials')
                    setReqSubmitted(false)
                  }}
                  className="mt-4 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-500 transition"
                >
                  Return to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleNewRequestSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Full name
                  </label>
                  <div className="relative">
                    <UserIcon size={16} className="absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      aria-label="Full name"
                      value={reqName}
                      onChange={(e) => setReqName(e.target.value)}
                      placeholder="Dr. Rajesh Sharma"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-10 pr-3 text-sm text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Institutional email
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3 text-slate-500" />
                    <input
                      type="email"
                      aria-label="Institutional email"
                      value={reqEmail}
                      onChange={(e) => setReqEmail(e.target.value)}
                      placeholder="rajesh.sharma@aiia.in"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-10 pr-3 text-sm text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Requested clinical role
                  </label>
                  <select
                    aria-label="Requested clinical role"
                    value={reqRole}
                    onChange={(e) => setReqRole(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 px-3 text-sm text-slate-100 focus:border-teal-500 focus:outline-none"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.role}>
                        {u.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Department / Institution
                  </label>
                  <input
                    type="text"
                    aria-label="Department or Institution"
                    value={reqDept}
                    onChange={(e) => setReqDept(e.target.value)}
                    placeholder="e.g. Department of Kayachikitsa, AIIA"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 px-3 text-sm text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div className="text-[11px] text-slate-400">
                  (Design preview only - does not create real account)
                </div>

                {errorMessage && (
                  <p role="alert" className="text-xs text-rose-400 font-medium">
                    {errorMessage}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('credentials')
                      setErrorMessage('')
                    }}
                    className="w-1/2 rounded-lg border border-slate-700 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 rounded-lg bg-teal-600 py-2 text-xs font-semibold text-white hover:bg-teal-500 transition"
                  >
                    Submit request
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Footer text */}
      <footer className="relative z-10 mt-8 border-t border-slate-800/80 pt-4 text-center text-xs text-slate-500">
        <p>Prototype. Synthetic data. Does not file with CTRI/CDSCO.</p>
      </footer>
    </div>
  )
}
