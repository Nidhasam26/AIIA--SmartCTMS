import { Activity, Check, CheckCircle2, ClipboardList, FolderOpen, Plus, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useAppStore } from '../../store/appStore'
import type { BaselineVisitData, ECRFRecord, FollowUpVisitData, PrakritiAssessmentData } from '../../types'

export function ECRFPage() {
  const studies = useAppStore((state) => state.studies)
  const participants = useAppStore((state) => state.participants)
  const ecrfRecords = useAppStore((state) => state.ecrfRecords)
  const saveEcrfRecord = useAppStore((state) => state.saveEcrfRecord)
  const activeRole = useAppStore((state) => state.activeRole)

  const [selectedStudyId, setSelectedStudyId] = useState<string>('study-1')
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('PT-000124')
  const [activeFormModal, setActiveFormModal] = useState<'baseline' | 'prakriti' | 'followup' | null>(null)
  const [auditReason, setAuditReason] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')

  // Baseline form state
  const [baselineForm, setBaselineForm] = useState<BaselineVisitData>({
    age: 54,
    gender: 'Female',
    heightCm: 162,
    weightKg: 68,
    systolicBp: 128,
    diastolicBp: 82,
    pulseRate: 74,
    temperatureF: 98.4,
    medicalHistory: 'Primary bilateral knee osteoarthritis diagnosed 3 years ago. No previous joint surgery.',
    inclusionCriteriaMet: true,
    baselineScore: 68,
  })

  // Prakriti form state
  const [prakritiForm, setPrakritiForm] = useState<PrakritiAssessmentData>({
    bodyFrame: 'Thin/Light (Vata)',
    skinType: 'Dry/Rough (Vata)',
    agniType: 'Irregular/Vishamagni (Vata)',
    sleepPattern: 'Light/Interrupted (Vata)',
    dominantDosha: 'Vata-Pitta',
    vataScore: 60,
    pittaScore: 25,
    kaphaScore: 15,
  })

  // Follow-up form state
  const [followUpForm, setFollowUpForm] = useState<FollowUpVisitData>({
    visitNumber: 2,
    visitDate: new Date().toISOString().split('T')[0],
    systolicBp: 122,
    diastolicBp: 78,
    pulseRate: 72,
    treatmentCompliancePercent: 96,
    dosageAdministered: 'Polyherbal capsule 500mg BD after meals with warm water',
    clinicalScore: 42,
    adverseEventsReported: false,
    aeNotes: 'No new adverse symptoms reported at this visit.',
    investigatorNotes: 'Knee joint mobility improved. Morning stiffness duration decreased to 15 mins.',
  })

  const study = studies.find((s) => s.id === selectedStudyId) ?? studies[0]
  const studyParticipants = useMemo(
    () => participants.filter((p) => p.studyId === selectedStudyId),
    [participants, selectedStudyId]
  )

  const subjectRecords = useMemo(
    () => ecrfRecords.filter((r) => r.studyId === selectedStudyId && r.subjectId === selectedSubjectId),
    [ecrfRecords, selectedStudyId, selectedSubjectId]
  )

  const calculatePrakritiScore = (frame: string, skin: string, agni: string, sleep: string) => {
    let vata = 0
    let pitta = 0
    let kapha = 0

    const items = [frame, skin, agni, sleep]
    for (const item of items) {
      if (item.includes('Vata')) vata += 25
      else if (item.includes('Pitta')) pitta += 25
      else if (item.includes('Kapha')) kapha += 25
    }

    let dominant: PrakritiAssessmentData['dominantDosha'] = 'Vata'
    if (vata >= 50 && pitta >= 25) dominant = 'Vata-Pitta'
    else if (pitta >= 50 && kapha >= 25) dominant = 'Pitta-Kapha'
    else if (vata >= 50 && kapha >= 25) dominant = 'Vata-Kapha'
    else if (pitta > vata && pitta > kapha) dominant = 'Pitta'
    else if (kapha > vata && kapha > pitta) dominant = 'Kapha'
    else if (vata === pitta && pitta === kapha) dominant = 'Tridoshic'

    return { vataScore: vata, pittaScore: pitta, kaphaScore: kapha, dominantDosha: dominant }
  }

  const handleSaveBaseline = async (e: FormEvent) => {
    e.preventDefault()
    if (!auditReason.trim()) {
      setErrorMessage('Enter an audit reason before saving eCRF clinical record.')
      return
    }

    const record: ECRFRecord = {
      id: `CRF-B-${Date.now().toString().slice(-4)}`,
      studyId: selectedStudyId,
      subjectId: selectedSubjectId,
      visitType: 'Baseline',
      visitTitle: 'Visit 1: Baseline Demographics & Vitals',
      recordedBy: activeRole,
      recordedAt: new Date().toISOString(),
      status: 'Completed',
      baseline: baselineForm,
    }

    await saveEcrfRecord(record, auditReason.trim())
    setSuccessMessage('Baseline Visit eCRF record saved and cryptographically logged.')
    setActiveFormModal(null)
    setAuditReason('')
    setErrorMessage('')
  }

  const handleSavePrakriti = async (e: FormEvent) => {
    e.preventDefault()
    if (!auditReason.trim()) {
      setErrorMessage('Enter an audit reason before saving eCRF clinical record.')
      return
    }

    const scores = calculatePrakritiScore(prakritiForm.bodyFrame, prakritiForm.skinType, prakritiForm.agniType, prakritiForm.sleepPattern)
    const record: ECRFRecord = {
      id: `CRF-P-${Date.now().toString().slice(-4)}`,
      studyId: selectedStudyId,
      subjectId: selectedSubjectId,
      visitType: 'Prakriti',
      visitTitle: 'Ayurvedic Prakriti Assessment Form',
      recordedBy: activeRole,
      recordedAt: new Date().toISOString(),
      status: 'Completed',
      prakriti: {
        ...prakritiForm,
        ...scores,
      },
    }

    await saveEcrfRecord(record, auditReason.trim())
    setSuccessMessage('Prakriti Assessment eCRF scored and cryptographically logged.')
    setActiveFormModal(null)
    setAuditReason('')
    setErrorMessage('')
  }

  const handleSaveFollowUp = async (e: FormEvent) => {
    e.preventDefault()
    if (!auditReason.trim()) {
      setErrorMessage('Enter an audit reason before saving eCRF clinical record.')
      return
    }

    const record: ECRFRecord = {
      id: `CRF-F-${Date.now().toString().slice(-4)}`,
      studyId: selectedStudyId,
      subjectId: selectedSubjectId,
      visitType: 'Follow-up',
      visitTitle: `Visit ${followUpForm.visitNumber}: Clinical Follow-up & Compliance`,
      recordedBy: activeRole,
      recordedAt: new Date().toISOString(),
      status: 'Completed',
      followUp: followUpForm,
    }

    await saveEcrfRecord(record, auditReason.trim())
    setSuccessMessage(`Follow-up Visit ${followUpForm.visitNumber} eCRF saved and cryptographically logged.`)
    setActiveFormModal(null)
    setAuditReason('')
    setErrorMessage('')
  }

  const bmi = (baselineForm.weightKg / Math.pow(baselineForm.heightCm / 100, 2)).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Data Capture</div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Electronic Case Report Forms (eCRF)</h1>
          <p className="text-xs text-slate-500 mt-1">
            Standards-aligned clinical data capture for baseline visits, Ayurvedic Prakriti assessment, and treatment follow-ups.
          </p>
        </div>

        {/* Study and Subject selector */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Study:
            <select
              aria-label="Select study for eCRF"
              value={selectedStudyId}
              onChange={(e) => setSelectedStudyId(e.target.value)}
              className="ml-1 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs dark:border-slate-800 dark:bg-[#0d141c]/80 dark:text-slate-200"
            >
              {studies.map((s) => (
                <option key={s.id} value={s.id}>{s.id.toUpperCase()}: {s.title.substring(0, 30)}...</option>
              ))}
            </select>
          </label>

          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Subject ID:
            <select
              aria-label="Select subject for eCRF"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="ml-1 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-mono dark:border-slate-800 dark:bg-[#0d141c]/80 dark:text-slate-200"
            >
              {studyParticipants.map((p) => (
                <option key={p.id} value={p.id}>{p.id} ({p.status} - {p.arm})</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {successMessage && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-teal-500/30 bg-teal-50 p-3.5 text-xs text-teal-900 dark:border-teal-500/20 dark:bg-teal-950/40 dark:text-teal-200 shadow-sm">
          <CheckCircle2 size={16} className="text-teal-600 dark:text-teal-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Action Cards: Quick intake launchers */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-teal-500/10 px-2.5 py-1 text-[11px] font-semibold text-teal-700 dark:text-teal-300">Visit 1</span>
              <Activity size={16} className="text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Baseline Visit eCRF</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              Demographics, height/weight, vital signs, inclusion/exclusion criteria, and baseline disease scores.
            </p>
          </div>
          <button
            onClick={() => {
              setActiveFormModal('baseline')
              setErrorMessage('')
              setSuccessMessage('')
            }}
            className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700 shadow-sm transition"
          >
            <Plus size={14} />
            <span>Open Baseline eCRF</span>
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-800 dark:text-amber-300">Ayurveda Special</span>
              <Sparkles size={16} className="text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Prakriti Scoring eCRF</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              Standardized assessment of physical frame, agni, skin texture, sleep, and automated dosha calculation.
            </p>
          </div>
          <button
            onClick={() => {
              setActiveFormModal('prakriti')
              setErrorMessage('')
              setSuccessMessage('')
            }}
            className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700 shadow-sm transition"
          >
            <Plus size={14} />
            <span>Score Prakriti eCRF</span>
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold text-sky-700 dark:text-sky-300">Periodic Visits</span>
              <ClipboardList size={16} className="text-sky-600 dark:text-sky-400" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Clinical Follow-up eCRF</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              Treatment adherence, drug accountability, outcome progression score, and safety AE screening.
            </p>
          </div>
          <button
            onClick={() => {
              setActiveFormModal('followup')
              setErrorMessage('')
              setSuccessMessage('')
            }}
            className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700 shadow-sm transition"
          >
            <Plus size={14} />
            <span>Record Follow-up eCRF</span>
          </button>
        </div>
      </div>

      {/* Existing eCRF Records Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80 backdrop-blur-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Subject eCRF Record History ({subjectRecords.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Completed and audited case report forms for Subject <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{selectedSubjectId}</span> ({study.title}).
            </p>
          </div>
          <span className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            GCP-ASU eSource Standards-Aligned
          </span>
        </div>

        {subjectRecords.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center gap-2">
            <FolderOpen size={24} className="text-slate-400 dark:text-slate-500" />
            <span>No eCRF entries recorded yet for {selectedSubjectId}. Click any of the cards above to record data.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
              <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900/60 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-2.5 font-semibold text-xs uppercase tracking-wider">CRF ID</th>
                  <th className="px-4 py-2.5 font-semibold text-xs uppercase tracking-wider">Module / Visit</th>
                  <th className="px-4 py-2.5 font-semibold text-xs uppercase tracking-wider">Recorded By</th>
                  <th className="px-4 py-2.5 font-semibold text-xs uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2.5 font-semibold text-xs uppercase tracking-wider">Key Clinical Summary</th>
                  <th className="px-4 py-2.5 font-semibold text-xs uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {subjectRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-teal-600 dark:text-teal-400">{r.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{r.visitTitle}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{r.recordedBy}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{new Date(r.recordedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300">
                      {r.visitType === 'Baseline' && r.baseline && (
                        <span>Age: {r.baseline.age}y | BP: {r.baseline.systolicBp}/{r.baseline.diastolicBp} | Baseline Score: {r.baseline.baselineScore}/100</span>
                      )}
                      {r.visitType === 'Prakriti' && r.prakriti && (
                        <span>Dominant: <strong className="text-teal-600 dark:text-teal-400">{r.prakriti.dominantDosha}</strong> (V:{r.prakriti.vataScore}% P:{r.prakriti.pittaScore}% K:{r.prakriti.kaphaScore}%)</span>
                      )}
                      {r.visitType === 'Follow-up' && r.followUp && (
                        <span>Adherence: {r.followUp.treatmentCompliancePercent}% | Score: {r.followUp.clinicalScore}/100 | AE: {r.followUp.adverseEventsReported ? 'Yes' : 'None'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-md bg-teal-500/10 px-2 py-0.5 text-xs font-medium text-teal-700 dark:text-teal-300 border border-teal-500/20">
                        <Check size={12} />
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Baseline Visit Form */}
      {activeFormModal === 'baseline' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-baseline-title">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 text-slate-800 dark:text-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase text-teal-600 dark:text-teal-400 tracking-wider">Module 1</span>
                <h2 id="modal-baseline-title" className="text-lg font-bold">Baseline Visit eCRF Intake</h2>
                <div className="text-xs text-slate-500">Subject: {selectedSubjectId} | Study: {selectedStudyId.toUpperCase()}</div>
              </div>
              <button onClick={() => setActiveFormModal(null)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs hover:bg-slate-50 dark:border-slate-700">Close</button>
            </div>

            <form onSubmit={handleSaveBaseline} className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Age (years)</label>
                  <input
                    type="number"
                    min="18"
                    max="90"
                    value={baselineForm.age}
                    onChange={(e) => setBaselineForm({ ...baselineForm, age: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Gender</label>
                  <select
                    value={baselineForm.gender}
                    onChange={(e) => setBaselineForm({ ...baselineForm, gender: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Height (cm)</label>
                  <input
                    type="number"
                    min="100"
                    max="220"
                    value={baselineForm.heightCm}
                    onChange={(e) => setBaselineForm({ ...baselineForm, heightCm: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    min="30"
                    max="200"
                    value={baselineForm.weightKg}
                    onChange={(e) => setBaselineForm({ ...baselineForm, weightKg: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Calculated BMI</label>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {bmi} kg/m2
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Temperature (F)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={baselineForm.temperatureF}
                    onChange={(e) => setBaselineForm({ ...baselineForm, temperatureF: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Vitals */}
              <div className="grid gap-3 sm:grid-cols-3 border-t border-slate-200 pt-3 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-medium mb-1">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    min="80"
                    max="220"
                    value={baselineForm.systolicBp}
                    onChange={(e) => setBaselineForm({ ...baselineForm, systolicBp: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    min="50"
                    max="140"
                    value={baselineForm.diastolicBp}
                    onChange={(e) => setBaselineForm({ ...baselineForm, diastolicBp: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Pulse Rate (bpm)</label>
                  <input
                    type="number"
                    min="40"
                    max="160"
                    value={baselineForm.pulseRate}
                    onChange={(e) => setBaselineForm({ ...baselineForm, pulseRate: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Relevant Medical History</label>
                <textarea
                  rows={2}
                  value={baselineForm.medicalHistory}
                  onChange={(e) => setBaselineForm({ ...baselineForm, medicalHistory: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Baseline Symptom / Disease Severity Score (0-100 VAS / WOMAC)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={baselineForm.baselineScore}
                    onChange={(e) => setBaselineForm({ ...baselineForm, baselineScore: Number(e.target.value) })}
                    className="w-full"
                  />
                  <span className="w-12 text-center text-sm font-bold text-teal-600 dark:text-teal-400">
                    {baselineForm.baselineScore}
                  </span>
                </div>
              </div>

              {/* Mandatory Audit Reason */}
              <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
                <label className="block text-xs font-semibold mb-1">
                  Reason for eCRF Clinical Record Submission <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Baseline visit completed per protocol schedule"
                  value={auditReason}
                  onChange={(e) => setAuditReason(e.target.value)}
                  className="w-full rounded-lg border border-teal-300 bg-teal-50/40 px-3 py-2 text-xs dark:border-teal-700 dark:bg-teal-950/20"
                  required
                />
              </div>

              {errorMessage && <p role="alert" className="text-xs text-red-500">{errorMessage}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveFormModal(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium hover:bg-slate-50 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 shadow-sm"
                >
                  Save Baseline eCRF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Prakriti Assessment Form */}
      {activeFormModal === 'prakriti' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-prakriti-title">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 text-slate-800 dark:text-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <div>
                <span className="text-xs uppercase font-semibold text-amber-600 tracking-wider">Module 2</span>
                <h2 id="modal-prakriti-title" className="text-lg font-bold">Ayurvedic Prakriti Assessment eCRF</h2>
                <div className="text-xs text-slate-500">Subject: {selectedSubjectId} | Protocol: Standardized Ayush Assessment</div>
              </div>
              <button onClick={() => setActiveFormModal(null)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs hover:bg-slate-50 dark:border-slate-700">Close</button>
            </div>

            <form onSubmit={handleSavePrakriti} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">1. Sharira Pramana (Physical Body Frame)</label>
                <select
                  value={prakritiForm.bodyFrame}
                  onChange={(e) => setPrakritiForm({ ...prakritiForm, bodyFrame: e.target.value as any })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="Thin/Light (Vata)">Thin, light, lean, prominent joints (Vata dominant)</option>
                  <option value="Medium/Muscular (Pitta)">Medium build, proportionate, muscular tone (Pitta dominant)</option>
                  <option value="Broad/Solid (Kapha)">Broad frame, well-developed, heavy, solid (Kapha dominant)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">2. Sparsha & Twak (Skin Quality & Texture)</label>
                <select
                  value={prakritiForm.skinType}
                  onChange={(e) => setPrakritiForm({ ...prakritiForm, skinType: e.target.value as any })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="Dry/Rough (Vata)">Dry, rough, cool to touch, crack prone (Vata dominant)</option>
                  <option value="Warm/Oily (Pitta)">Warm, pinkish/reddish tone, oily T-zone, mole prone (Pitta dominant)</option>
                  <option value="Smooth/Cool/Thick (Kapha)">Smooth, moist, lustrous, thick, cool (Kapha dominant)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">3. Agni & Koshtha (Digestive Capacity & Bowel Pattern)</label>
                <select
                  value={prakritiForm.agniType}
                  onChange={(e) => setPrakritiForm({ ...prakritiForm, agniType: e.target.value as any })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="Irregular/Vishamagni (Vata)">Vishamagni: Irregular appetite, variable digestion, constipation prone (Vata)</option>
                  <option value="Sharp/Tikshnagni (Pitta)">Tikshnagni: Intense appetite, quick digestion, frequent loose stools (Pitta)</option>
                  <option value="Slow/Mandagni (Kapha)">Mandagni: Low but steady appetite, slow digestion, heavy feeling (Kapha)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">4. Nidra (Sleep Duration & Pattern)</label>
                <select
                  value={prakritiForm.sleepPattern}
                  onChange={(e) => setPrakritiForm({ ...prakritiForm, sleepPattern: e.target.value as any })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="Light/Interrupted (Vata)">Light sleep, easily disturbed, 5-6 hours (Vata)</option>
                  <option value="Moderate (Pitta)">Moderate uninterrupted sleep, 6-7 hours, vivid dreams (Pitta)</option>
                  <option value="Deep/Heavy (Kapha)">Deep, heavy, prolonged sleep, difficulty waking (Kapha)</option>
                </select>
              </div>

              {/* Dynamic Score Calculator Preview */}
              {(() => {
                const s = calculatePrakritiScore(prakritiForm.bodyFrame, prakritiForm.skinType, prakritiForm.agniType, prakritiForm.sleepPattern)
                return (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-950 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-200">
                    <div className="flex items-center justify-between font-semibold">
                      <span>Automated Prakriti Calculation:</span>
                      <span className="rounded bg-amber-200 px-2 py-0.5 text-xs text-amber-900 dark:bg-amber-900 dark:text-amber-100">
                        {s.dominantDosha}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded bg-white/80 p-1.5 dark:bg-slate-800">Vata: {s.vataScore}%</div>
                      <div className="rounded bg-white/80 p-1.5 dark:bg-slate-800">Pitta: {s.pittaScore}%</div>
                      <div className="rounded bg-white/80 p-1.5 dark:bg-slate-800">Kapha: {s.kaphaScore}%</div>
                    </div>
                  </div>
                )
              })()}

              {/* Mandatory Audit Reason */}
              <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
                <label className="block text-xs font-semibold mb-1">
                  Reason for eCRF Assessment Record <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Standardized Prakriti assessment completed at screening visit"
                  value={auditReason}
                  onChange={(e) => setAuditReason(e.target.value)}
                  className="w-full rounded-lg border border-teal-300 bg-teal-50/40 px-3 py-2 text-xs dark:border-teal-700 dark:bg-teal-950/20"
                  required
                />
              </div>

              {errorMessage && <p role="alert" className="text-xs text-red-500">{errorMessage}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveFormModal(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium hover:bg-slate-50 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 shadow-sm"
                >
                  Save & Lock Prakriti eCRF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Follow-Up Visit Form */}
      {activeFormModal === 'followup' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-followup-title">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 text-slate-800 dark:text-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
              <div>
                <span className="text-xs uppercase font-semibold text-blue-600 tracking-wider">Module 3</span>
                <h2 id="modal-followup-title" className="text-lg font-bold">Clinical Follow-up & Compliance eCRF</h2>
                <div className="text-xs text-slate-500">Subject: {selectedSubjectId} | Treatment Schedule</div>
              </div>
              <button onClick={() => setActiveFormModal(null)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs hover:bg-slate-50 dark:border-slate-700">Close</button>
            </div>

            <form onSubmit={handleSaveFollowUp} className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium mb-1">Visit Number</label>
                  <select
                    value={followUpForm.visitNumber}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, visitNumber: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value={2}>Visit 2 (Week 4)</option>
                    <option value={3}>Visit 3 (Week 8)</option>
                    <option value={4}>Visit 4 (Week 12 - Final Visit)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Visit Date</label>
                  <input
                    type="date"
                    value={followUpForm.visitDate}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, visitDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                    required
                  />
                </div>
              </div>

              {/* Vitals */}
              <div className="grid gap-3 sm:grid-cols-3 border-t border-slate-200 pt-3 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-medium mb-1">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={followUpForm.systolicBp}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, systolicBp: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={followUpForm.diastolicBp}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, diastolicBp: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Pulse Rate (bpm)</label>
                  <input
                    type="number"
                    value={followUpForm.pulseRate}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, pulseRate: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Compliance & Dosage */}
              <div>
                <label className="block text-xs font-medium mb-1">Treatment Adherence & Compliance (%)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={followUpForm.treatmentCompliancePercent}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, treatmentCompliancePercent: Number(e.target.value) })}
                    className="w-full"
                  />
                  <span className="w-12 text-center text-sm font-bold text-teal-600 dark:text-teal-400">
                    {followUpForm.treatmentCompliancePercent}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Dosage Administered & Accounted</label>
                <input
                  type="text"
                  value={followUpForm.dosageAdministered}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, dosageAdministered: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Clinical Outcome / Disease Severity Score (0-100 VAS / WOMAC)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={followUpForm.clinicalScore}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, clinicalScore: Number(e.target.value) })}
                    className="w-full"
                  />
                  <span className="w-12 text-center text-sm font-bold text-teal-600 dark:text-teal-400">
                    {followUpForm.clinicalScore}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Investigator Clinical Remarks</label>
                <textarea
                  rows={2}
                  value={followUpForm.investigatorNotes}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, investigatorNotes: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              {/* Mandatory Audit Reason */}
              <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
                <label className="block text-xs font-semibold mb-1">
                  Reason for eCRF Clinical Record Submission <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Scheduled periodic follow-up visit completed"
                  value={auditReason}
                  onChange={(e) => setAuditReason(e.target.value)}
                  className="w-full rounded-lg border border-teal-300 bg-teal-50/40 px-3 py-2 text-xs dark:border-teal-700 dark:bg-teal-950/20"
                  required
                />
              </div>

              {errorMessage && <p role="alert" className="text-xs text-red-500">{errorMessage}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveFormModal(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium hover:bg-slate-50 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 shadow-sm"
                >
                  Save Follow-up eCRF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
