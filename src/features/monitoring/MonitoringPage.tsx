import { useState } from 'react'
import { AlertTriangle, CheckCircle, CheckSquare, ClipboardCheck, FileCheck, FileText, Plus, ShieldCheck, UserCheck } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import type { MonitoringFinding, MonitoringReport } from '../../types'

export function MonitoringPage() {
  const studies = useAppStore((state) => state.studies)
  const monitoringReports = useAppStore((state) => state.monitoringReports)
  const saveMonitoringReport = useAppStore((state) => state.saveMonitoringReport)
  const activeRole = useAppStore((state) => state.activeRole)

  const [selectedStudyId, setSelectedStudyId] = useState<string>(studies[0]?.id ?? 'study-1')
  const [selectedSiteId, setSelectedSiteId] = useState<string>('site-s1')
  const [visitType, setVisitType] = useState<'Site Initiation Visit (SIV)' | 'Interim Monitoring Visit (IMV)' | 'Close-Out Visit (COV)'>('Interim Monitoring Visit (IMV)')
  const [sdvProgress, setSdvProgress] = useState<number>(85)
  const [consentVerifiedCount, setConsentVerifiedCount] = useState<number>(85)
  const [drugAccountabilityOk, setDrugAccountabilityOk] = useState<boolean>(true)
  const [craSummary, setCraSummary] = useState<string>('On-site interim monitoring completed. Source data verified against electronic eCRF logs. Decoction room temperature records maintained without breach.')
  const [auditReason, setAuditReason] = useState<string>('Routine GCP monitoring visit report submission with site verification checklist')
  const [findingsList, setFindingsList] = useState<MonitoringFinding[]>([])
  const [newFindingCategory, setNewFindingCategory] = useState<MonitoringFinding['category']>('Source Data Verification')
  const [newFindingDesc, setNewFindingDesc] = useState<string>('')
  const [newFindingSeverity, setNewFindingSeverity] = useState<MonitoringFinding['severity']>('Minor')
  const [newFindingAssigned, setNewFindingAssigned] = useState<string>('Site Study Coordinator')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')

  // SIV Readiness Checklist state
  const [sivChecklist, setSivChecklist] = useState({
    protocolTraining: true,
    gcpAsuCertificates: true,
    pharmacyTemperatureControl: true,
    investigatorSiteFile: true,
    unblindingEmergencyPouch: true,
    iecApprovalArchived: true,
  })

  const currentStudy = studies.find((s) => s.id === selectedStudyId) ?? studies[0]
  const studySites = currentStudy?.sites ?? []
  const reportsForStudy = monitoringReports.filter((r) => r.studyId === selectedStudyId)

  const filteredReports = reportsForStudy.filter((rep) => {
    const term = searchTerm.toLowerCase()
    return rep.craName.toLowerCase().includes(term) ||
      rep.visitType.toLowerCase().includes(term) ||
      rep.craSummary.toLowerCase().includes(term) ||
      rep.id.toLowerCase().includes(term)
  })

  const handleAddFinding = () => {
    if (!newFindingDesc.trim()) return
    const finding: MonitoringFinding = {
      id: `FND-${Date.now().toString().slice(-4)}`,
      category: newFindingCategory,
      description: newFindingDesc.trim(),
      severity: newFindingSeverity,
      status: 'Open',
      assignedTo: newFindingAssigned.trim() || 'Site Team',
    }
    setFindingsList([...findingsList, finding])
    setNewFindingDesc('')
  }

  const handleRemoveFinding = (id: string) => {
    setFindingsList(findingsList.filter((f) => f.id !== id))
  }

  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!craSummary.trim()) {
      setErrorMessage('CRA executive summary is required.')
      return
    }

    if (!auditReason.trim()) {
      setErrorMessage('Audit reason is required for submitting monitoring trip report.')
      return
    }

    setIsSubmitting(true)
    const reportId = `MON-${new Date().getFullYear()}-${String(monitoringReports.length + 1).padStart(2, '0')}`

    const report: MonitoringReport = {
      id: reportId,
      studyId: selectedStudyId,
      siteId: selectedSiteId,
      craName: activeRole === 'Monitor (CRA)' ? 'Vikram Singh (Lead CRA)' : `${activeRole} Verified`,
      visitType,
      visitDate: new Date().toISOString(),
      sdvProgressPercent: Number(sdvProgress),
      consentVerifiedCount: Number(consentVerifiedCount),
      drugAccountabilityVerified: drugAccountabilityOk,
      findings: findingsList,
      craSummary: craSummary.trim(),
      status: 'Submitted',
    }

    try {
      await saveMonitoringReport(report, auditReason)
      setSuccessMessage(`Monitoring report ${reportId} (${visitType}) successfully logged and signed.`)
      setFindingsList([])
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit monitoring report.')
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
              <ClipboardCheck size={20} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Site Monitoring (CRA) & Trip Reports</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Source data verification (SDV) tracking, SIV readiness checklists, and GCP-ASU monitoring trip dossiers.
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

      {/* SIV Readiness & SDV Status Banner */}
      <div className="rounded-xl border border-teal-200/80 bg-teal-50/50 p-5 dark:border-teal-900/50 dark:bg-teal-950/20 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h3 className="font-semibold text-teal-900 dark:text-teal-200 flex items-center gap-2">
              <ShieldCheck size={18} className="text-teal-600 dark:text-teal-400" />
              Site Initiation Visit (SIV) Readiness Protocol Checklist
            </h3>
            <p className="text-xs text-teal-700 dark:text-teal-400 mt-1">
              GCP-ASU & CDSCO Mandatory pre-activation verifications for Ayurvedic investigational sites.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-100/70 dark:bg-teal-950/50 px-3 py-1.5 rounded-lg border border-teal-200/80 dark:border-teal-900/40">
            <CheckCircle size={14} />
            <span>Site Activated & Certified</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 text-xs">
          <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 cursor-pointer shadow-sm">
            <input
              type="checkbox"
              checked={sivChecklist.protocolTraining}
              onChange={(e) => setSivChecklist({ ...sivChecklist, protocolTraining: e.target.checked })}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span>Investigator Protocol & eCRF Training</span>
          </label>
          <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 cursor-pointer shadow-sm">
            <input
              type="checkbox"
              checked={sivChecklist.gcpAsuCertificates}
              onChange={(e) => setSivChecklist({ ...sivChecklist, gcpAsuCertificates: e.target.checked })}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span>GCP-ASU Clinical Certificates Archived</span>
          </label>
          <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 cursor-pointer shadow-sm">
            <input
              type="checkbox"
              checked={sivChecklist.pharmacyTemperatureControl}
              onChange={(e) => setSivChecklist({ ...sivChecklist, pharmacyTemperatureControl: e.target.checked })}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span>Herbal Storage Temp Log (15-25 deg C)</span>
          </label>
          <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 cursor-pointer shadow-sm">
            <input
              type="checkbox"
              checked={sivChecklist.investigatorSiteFile}
              onChange={(e) => setSivChecklist({ ...sivChecklist, investigatorSiteFile: e.target.checked })}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span>Investigator Site File (ISF Binder)</span>
          </label>
          <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 cursor-pointer shadow-sm">
            <input
              type="checkbox"
              checked={sivChecklist.unblindingEmergencyPouch}
              onChange={(e) => setSivChecklist({ ...sivChecklist, unblindingEmergencyPouch: e.target.checked })}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span>Emergency Unblinding Envelope Enclosed</span>
          </label>
          <label className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 cursor-pointer shadow-sm">
            <input
              type="checkbox"
              checked={sivChecklist.iecApprovalArchived}
              onChange={(e) => setSivChecklist({ ...sivChecklist, iecApprovalArchived: e.target.checked })}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span>IEC Ethics Approval Letter on File</span>
          </label>
        </div>
      </div>

      {/* Main Grid: New Monitoring Trip Report & History Dossiers */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Form to log new trip report */}
        <div className="rounded-xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80 lg:col-span-1">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 font-semibold text-slate-900 dark:text-slate-100 dark:border-slate-800">
            <FileCheck size={18} className="text-teal-600 dark:text-teal-400" />
            <span>Generate CRA Visit Report</span>
          </div>

          <form onSubmit={handleSaveReport} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Investigational Site
              </label>
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
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
                Monitoring Visit Type
              </label>
              <select
                value={visitType}
                onChange={(e) => setVisitType(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="Site Initiation Visit (SIV)">Site Initiation Visit (SIV)</option>
                <option value="Interim Monitoring Visit (IMV)">Interim Monitoring Visit (IMV)</option>
                <option value="Close-Out Visit (COV)">Close-Out Visit (COV)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  SDV Progress (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={sdvProgress}
                  onChange={(e) => setSdvProgress(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  ICFs Verified (Qty)
                </label>
                <input
                  type="number"
                  min={0}
                  value={consentVerifiedCount}
                  onChange={(e) => setConsentVerifiedCount(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={drugAccountabilityOk}
                  onChange={(e) => setDrugAccountabilityOk(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Herbal IP Drug Accountability & Balance Verified</span>
              </label>
            </div>

            {/* Findings Section */}
            <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Monitoring Action Findings ({findingsList.length})
              </label>

              {findingsList.map((f) => (
                <div key={f.id} className="mt-2 flex items-start justify-between rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{f.category} ({f.severity})</div>
                    <div className="text-slate-600 dark:text-slate-400">{f.description}</div>
                    <div className="text-[10px] text-slate-500">Assigned: {f.assignedTo}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFinding(f.id)}
                    className="text-xs text-rose-600 hover:text-rose-800"
                  >
                    Remove
                  </button>
                </div>
              ))}

              <div className="mt-3 space-y-2 rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newFindingCategory}
                    onChange={(e) => setNewFindingCategory(e.target.value as any)}
                    className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="Informed Consent">Informed Consent</option>
                    <option value="Source Data Verification">Source Data Verification</option>
                    <option value="Drug Accountability">Drug Accountability</option>
                    <option value="Safety / AE Reporting">Safety / AE Reporting</option>
                    <option value="Regulatory Binder">Regulatory Binder</option>
                  </select>
                  <select
                    value={newFindingSeverity}
                    onChange={(e) => setNewFindingSeverity(e.target.value as any)}
                    className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="Minor">Minor Finding</option>
                    <option value="Major">Major Finding</option>
                    <option value="Critical">Critical Finding</option>
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Finding description..."
                  value={newFindingDesc}
                  onChange={(e) => setNewFindingDesc(e.target.value)}
                  className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
                <input
                  type="text"
                  placeholder="Assigned to (e.g. Study Coordinator)..."
                  value={newFindingAssigned}
                  onChange={(e) => setNewFindingAssigned(e.target.value)}
                  className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
                />
                <button
                  type="button"
                  onClick={handleAddFinding}
                  className="flex items-center gap-1 rounded bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200"
                >
                  <Plus size={12} /> Add Finding Action
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                CRA Executive Visit Summary <span className="text-red-500">*</span>
              </label>
              <textarea
                value={craSummary}
                onChange={(e) => setCraSummary(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Audit Reason <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={auditReason}
                onChange={(e) => setAuditReason(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
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
              <FileCheck size={16} />
              {isSubmitting ? 'Signing Report...' : 'Sign & Submit Monitoring Report'}
            </button>
          </form>
        </div>

        {/* Right Column: Historical Monitoring Trip Reports */}
        <div className="rounded-xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80 lg:col-span-2">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-3 sm:flex-row sm:items-center dark:border-slate-800">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">CRA Monitoring Trip Reports & Audit Dossiers</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Completed monitoring records for {currentStudy.title}.
              </p>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search trip reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {filteredReports.length === 0 ? (
              <div className="rounded-lg border border-slate-200 p-8 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 flex flex-col items-center justify-center gap-2">
                <FileText size={22} className="text-slate-400 dark:text-slate-500" />
                <span>No monitoring reports found for this study.</span>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition hover:bg-slate-50 dark:border-slate-800/80 dark:bg-slate-850/40 dark:hover:bg-slate-800/60 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-teal-600 dark:text-teal-400" />
                      <span className="font-bold text-slate-900 dark:text-slate-100">{report.id}</span>
                      <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-800 dark:bg-slate-700 dark:text-slate-200">
                        {report.visitType}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <UserCheck size={14} />
                      <span>{report.craName}</span>
                      <span>|</span>
                      <span>{new Date(report.visitDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-slate-700 dark:text-slate-300">
                    {report.craSummary}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <CheckSquare size={14} className="text-teal-500" />
                      <span>SDV Progress: <strong>{report.sdvProgressPercent}%</strong></span>
                    </div>
                    <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <span>ICFs Verified: <strong>{report.consentVerifiedCount}</strong></span>
                    </div>
                    <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <span>Drug Accountability: <strong className="text-teal-600 dark:text-teal-400">{report.drugAccountabilityVerified ? 'Verified OK' : 'Discrepancy'}</strong></span>
                    </div>
                  </div>

                  {report.findings.length > 0 && (
                    <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-700/50">
                      <div className="text-[11px] font-semibold text-slate-600 uppercase dark:text-slate-400">
                        Action Items & Findings ({report.findings.length})
                      </div>
                      <div className="mt-1 space-y-1.5">
                        {report.findings.map((f) => (
                          <div
                            key={f.id}
                            className="flex items-start justify-between rounded bg-white p-2 text-xs border border-slate-200 dark:bg-slate-900 dark:border-slate-800 shadow-sm"
                          >
                            <div className="flex items-start gap-2">
                              <AlertTriangle
                                size={14}
                                className={
                                  f.severity === 'Critical'
                                    ? 'text-rose-600'
                                    : f.severity === 'Major'
                                    ? 'text-amber-600'
                                    : 'text-slate-500'
                                }
                              />
                              <div>
                                <div className="font-semibold text-slate-800 dark:text-slate-200">
                                  [{f.category}] {f.description}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  Assigned to: {f.assignedTo}
                                </div>
                              </div>
                            </div>
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                f.status === 'Resolved'
                                  ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {f.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
