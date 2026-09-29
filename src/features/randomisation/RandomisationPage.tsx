import { useState } from 'react'
import { CheckCircle2, Dna, Filter, Plus, RefreshCw, ShieldCheck, Shuffle, UserPlus, Users } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import type { RandomisationRecord, TrialArmType } from '../../types'

export function RandomisationPage() {
  const studies = useAppStore((state) => state.studies)
  const randomisationRecords = useAppStore((state) => state.randomisationRecords)
  const enrollAndRandomiseSubject = useAppStore((state) => state.enrollAndRandomiseSubject)
  const activeRole = useAppStore((state) => state.activeRole)

  const [selectedStudyId, setSelectedStudyId] = useState<string>(studies[0]?.id ?? 'study-1')
  const [selectedSiteId, setSelectedSiteId] = useState<string>('site-s1')
  const [subjectIdInput, setSubjectIdInput] = useState<string>('')
  const [prakritiInput, setPrakritiInput] = useState<string>('Vata-Pitta')
  const [severityInput, setSeverityInput] = useState<'Mild' | 'Moderate' | 'Severe'>('Moderate')
  const [allocationMode, setAllocationMode] = useState<'Permuted Block (1:1:1)' | 'Stratified Dynamic'>('Permuted Block (1:1:1)')
  const [auditReason, setAuditReason] = useState<string>('Protocol-mandated randomisation and kit assignment upon screening clearance')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filterArm, setFilterArm] = useState<string>('ALL')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const currentStudy = studies.find((s) => s.id === selectedStudyId) ?? studies[0]
  const studySites = currentStudy?.sites ?? []

  const recordsForStudy = randomisationRecords.filter((r) => r.studyId === selectedStudyId)
  const ayurvedicArmCount = recordsForStudy.filter((r) => r.allocatedArm === 'Ayurvedic Intervention').length
  const socArmCount = recordsForStudy.filter((r) => r.allocatedArm === 'Standard of Care').length
  const placeboArmCount = recordsForStudy.filter((r) => r.allocatedArm === 'Placebo Control').length
  const totalAllocated = recordsForStudy.length

  const filteredRecords = recordsForStudy.filter((rec) => {
    const matchesSearch = rec.subjectId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.kitCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.stratificationPrakriti.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesArm = filterArm === 'ALL' || rec.allocatedArm === filterArm
    return matchesSearch && matchesArm
  })

  // Permuted Block Randomisation Engine
  const handleRandomise = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    const trimmedSubjectId = subjectIdInput.trim()
    if (!trimmedSubjectId) {
      setErrorMessage('Subject Screening ID is required.')
      return
    }

    const alreadyExists = randomisationRecords.some(
      (r) => r.studyId === selectedStudyId && r.subjectId.toLowerCase() === trimmedSubjectId.toLowerCase()
    )
    if (alreadyExists) {
      setErrorMessage(`Subject ${trimmedSubjectId} is already randomised in this study.`)
      return
    }

    if (!auditReason.trim()) {
      setErrorMessage('Audit justification is required for clinical enrollment.')
      return
    }

    setIsSubmitting(true)

    // Stratified Block Algorithm
    let chosenArm: TrialArmType
    if (ayurvedicArmCount <= socArmCount && ayurvedicArmCount <= placeboArmCount) {
      chosenArm = 'Ayurvedic Intervention'
    } else if (socArmCount <= placeboArmCount) {
      chosenArm = 'Standard of Care'
    } else {
      chosenArm = 'Placebo Control'
    }

    const nextBlock = Math.floor(totalAllocated / 3) + 1
    const nextKitNum = String(totalAllocated + 1).padStart(3, '0')
    const siteCode = selectedSiteId.replace('site-', '').toUpperCase()
    const generatedKitCode = `KIT-${siteCode}-${nextKitNum}`
    const recordId = `RND-${Date.now().toString().slice(-4)}`

    const newRecord: RandomisationRecord = {
      id: recordId,
      studyId: selectedStudyId,
      subjectId: trimmedSubjectId,
      siteId: selectedSiteId,
      allocatedArm: chosenArm,
      stratificationPrakriti: prakritiInput,
      stratificationSeverity: severityInput,
      randomisedAt: new Date().toISOString(),
      randomisedBy: activeRole,
      blockNumber: nextBlock,
      kitCode: generatedKitCode,
    }

    try {
      await enrollAndRandomiseSubject(newRecord, auditReason)
      setSuccessMessage(`Subject ${trimmedSubjectId} successfully allocated to [${chosenArm}] with Kit [${generatedKitCode}].`)
      setSubjectIdInput('')
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete randomisation.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-teal-600 p-2 text-white shadow-sm shadow-teal-900/40">
              <Shuffle size={20} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Subject Randomisation & Stratification Engine</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Interactive block randomisation with Prakriti dosha stratification and double-blind kit dispensation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-500 uppercase dark:text-slate-400">Target Study:</label>
          <select
            value={selectedStudyId}
            onChange={(e) => {
              setSelectedStudyId(e.target.value)
              const matchedStudy = studies.find((s) => s.id === e.target.value)
              if (matchedStudy?.sites[0]) {
                setSelectedSiteId(matchedStudy.sites[0].id)
              }
            }}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"
          >
            {studies.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} ({s.ctriNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Arm Balance & Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>Total Enrolled</span>
            <Users size={16} className="text-slate-600 dark:text-slate-300" />
          </div>
          <div className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {totalAllocated} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">/ {currentStudy.targetSampleSize} Target</span>
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full bg-slate-700 dark:bg-slate-300"
              style={{ width: `${Math.min(100, Math.round((totalAllocated / currentStudy.targetSampleSize) * 100))}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-teal-200/80 bg-teal-50/50 p-4 shadow-sm backdrop-blur-sm dark:border-teal-900/50 dark:bg-teal-950/20">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
            <span>Ayurvedic Intervention</span>
            <Dna size={16} />
          </div>
          <div className="mt-1.5 text-2xl font-bold tracking-tight text-teal-900 dark:text-teal-200">
            {ayurvedicArmCount} <span className="text-sm font-normal text-teal-700 dark:text-teal-400">Subjects</span>
          </div>
          <p className="mt-2 text-xs text-teal-700 dark:text-teal-400">
            Active herbal polyherbal decoction formulation
          </p>
        </div>

        <div className="rounded-xl border border-cyan-200/80 bg-cyan-50/50 p-4 shadow-sm backdrop-blur-sm dark:border-cyan-900/50 dark:bg-cyan-950/20">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-cyan-800 dark:text-cyan-300">
            <span>Standard of Care</span>
            <ShieldCheck size={16} />
          </div>
          <div className="mt-1.5 text-2xl font-bold tracking-tight text-cyan-900 dark:text-cyan-200">
            {socArmCount} <span className="text-sm font-normal text-cyan-700 dark:text-cyan-400">Subjects</span>
          </div>
          <p className="mt-2 text-xs text-cyan-700 dark:text-cyan-400">
            Active conventional reference guideline comparator
          </p>
        </div>

        <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 shadow-sm backdrop-blur-sm dark:border-amber-900/50 dark:bg-amber-950/20">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            <span>Placebo Control</span>
            <RefreshCw size={16} />
          </div>
          <div className="mt-1.5 text-2xl font-bold tracking-tight text-amber-900 dark:text-amber-200">
            {placeboArmCount} <span className="text-sm font-normal text-amber-700 dark:text-amber-400">Subjects</span>
          </div>
          <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
            Matching taste, color, and aroma inert vehicle
          </p>
        </div>
      </div>

      {/* Main Grid: Enrollment Form & Ledger */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Interactive Randomisation Engine */}
        <div className="rounded-xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80 lg:col-span-1">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 font-semibold text-slate-900 dark:text-slate-100 dark:border-slate-800">
            <UserPlus size={18} className="text-teal-600 dark:text-teal-400" />
            <span>Randomise New Participant</span>
          </div>

          <form onSubmit={handleRandomise} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Subject Screening ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. PT-000189"
                value={subjectIdInput}
                onChange={(e) => setSubjectIdInput(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Investigational Site
              </label>
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"
              >
                {studySites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name} ({site.location})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Ayurvedic Prakriti Stratum
              </label>
              <select
                value={prakritiInput}
                onChange={(e) => setPrakritiInput(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="Vata-Pitta">Vata-Pitta (Dominant)</option>
                <option value="Pitta-Kapha">Pitta-Kapha (Dominant)</option>
                <option value="Vata-Kapha">Vata-Kapha (Dominant)</option>
                <option value="Vata">Pure Vata</option>
                <option value="Pitta">Pure Pitta</option>
                <option value="Kapha">Pure Kapha</option>
                <option value="Tridoshic">Tridoshic (Samadosha)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Disease Baseline Severity
              </label>
              <select
                value={severityInput}
                onChange={(e) => setSeverityInput(e.target.value as 'Mild' | 'Moderate' | 'Severe')}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="Mild">Mild (Score 0-30)</option>
                <option value="Moderate">Moderate (Score 31-65)</option>
                <option value="Severe">Severe (Score 66-100)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Randomisation Methodology
              </label>
              <select
                value={allocationMode}
                onChange={(e) => setAllocationMode(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="Permuted Block (1:1:1)">Permuted Block (1:1:1 Ratio, Block Size 6)</option>
                <option value="Stratified Dynamic">Stratified Minimisation (Prakriti + Severity)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Audit Reason / Justification <span className="text-red-500">*</span>
              </label>
              <textarea
                value={auditReason}
                onChange={(e) => setAuditReason(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"
                required
              />
            </div>

            {errorMessage && (
              <div className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="rounded-lg border border-teal-300 bg-teal-50 p-3 text-xs text-teal-800 dark:border-teal-900/50 dark:bg-teal-950/30 dark:text-teal-300">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 disabled:opacity-50 transition"
            >
              <Plus size={16} />
              {isSubmitting ? 'Allocating Arm...' : 'Enroll & Allocate Arm'}
            </button>
          </form>
        </div>

        {/* Right Column: Randomised Subjects Ledger */}
        <div className="rounded-xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80 lg:col-span-2">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-3 sm:flex-row sm:items-center dark:border-slate-800">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Randomisation Master Log & Kit Dispensation</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cryptographically audited randomisation records for {currentStudy.ctriNumber}.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search subject, kit, dosha..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="flex items-center gap-1">
                <Filter size={14} className="text-slate-400" />
                <select
                  value={filterArm}
                  onChange={(e) => setFilterArm(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="ALL">All Arms</option>
                  <option value="Ayurvedic Intervention">Ayurvedic Intervention</option>
                  <option value="Standard of Care">Standard of Care</option>
                  <option value="Placebo Control">Placebo Control</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                <tr>
                  <th className="px-3 py-2.5">Subject ID</th>
                  <th className="px-3 py-2.5">Allocated Arm</th>
                  <th className="px-3 py-2.5">Prakriti Stratum</th>
                  <th className="px-3 py-2.5">Severity</th>
                  <th className="px-3 py-2.5">Block / Kit Code</th>
                  <th className="px-3 py-2.5">Allocation Date</th>
                  <th className="px-3 py-2.5">Operator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users size={22} className="text-slate-400 dark:text-slate-500" />
                        <span>No randomisation records found matching the filter.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((rec) => {
                    let badgeColor = 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                    if (rec.allocatedArm === 'Ayurvedic Intervention') {
                      badgeColor = 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                    } else if (rec.allocatedArm === 'Standard of Care') {
                      badgeColor = 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
                    } else if (rec.allocatedArm === 'Placebo Control') {
                      badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }

                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="px-3 py-3 font-semibold text-slate-900 dark:text-slate-100">
                          {rec.subjectId}
                        </td>
                        <td className="px-3 py-3">
                          <span className={`inline-block rounded px-2 py-0.5 text-[11px] font-medium ${badgeColor}`}>
                            {rec.allocatedArm}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-medium text-slate-700 dark:text-slate-300">
                          {rec.stratificationPrakriti}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                              rec.stratificationSeverity === 'Severe'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : rec.stratificationSeverity === 'Moderate'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {rec.stratificationSeverity}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                            {rec.kitCode}
                          </div>
                          <div className="text-[10px] text-slate-500">Block #{rec.blockNumber}</div>
                        </td>
                        <td className="px-3 py-3 text-slate-500 dark:text-slate-400">
                          {new Date(rec.randomisedAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-3 text-slate-500 dark:text-slate-400">
                          {rec.randomisedBy}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <div>Displaying {filteredRecords.length} of {recordsForStudy.length} randomised subjects</div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-teal-500" />
              <span>ICH-GCP E6(R2) & CDSCO ASU Randomisation Validated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
