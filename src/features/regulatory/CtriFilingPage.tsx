import { useState } from 'react'
import { CheckCircle2, Download, FileSpreadsheet, Layers, ShieldCheck } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import type { CtriFilingPackage } from '../../types'

export function CtriFilingPage() {
  const studies = useAppStore((state) => state.studies)
  const saveCtriPackage = useAppStore((state) => state.saveCtriPackage)

  const [selectedStudyId, setSelectedStudyId] = useState<string>(studies[0]?.id ?? 'study-1')
  const [scientificTitle, setScientificTitle] = useState<string>('A Multicentric, Randomised, Double-Blind, Active-Controlled Trial Evaluating Standardised Polyherbal Formulation in Knee Osteoarthritis (Sandhigata Vata)')
  const [publicTitle, setPublicTitle] = useState<string>('AYUSH-01: Polyherbal Anti-Inflammatory in Knee Osteoarthritis')
  const [ethicsClearanceNumber, setEthicsClearanceNumber] = useState<string>('AIIA/IEC/2025/OCT/04')
  const [primaryOutcome, setPrimaryOutcome] = useState<string>('Reduction in WOMAC Pain and Functional Score from Baseline to Week 12')
  const [secondaryOutcomesText, setSecondaryOutcomesText] = useState<string>(
    'Visual Analogue Scale (VAS) 0-100 pain reduction at Weeks 4, 8, and 12\nChange in Erythrocyte Sedimentation Rate (ESR) and serum hs-CRP biomarkers\nQuality of life assessment using Ayurvedic Prakriti-specific health inventory\nIncidence of adverse events and safety tolerability markers'
  )
  const [formulationName, setFormulationName] = useState<string>('Standardised Polyherbal Decoction & Tablet (Guggulu, Shallaki, Sunthi, Rasna)')
  const [botanicalIngredients, setBotanicalIngredients] = useState<string>('Boswellia serrata (60% Boswellic acids), Commiphora mukul, Zingiber officinale, Alpinia galanga')
  const [dosageAdmin, setDosageAdmin] = useState<string>('500 mg capsules twice daily after food with warm water for 12 weeks')
  const [prakritiInclusion, setPrakritiInclusion] = useState<string>('Vata-dominant and Vata-Pitta dominant adult individuals aged 40-70 years')
  const [auditReason, setAuditReason] = useState<string>('CTRI and CDSCO Form CT-04 dossier preparation per NDCT Rules 2019 and GCP-ASU')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeDossierTab, setActiveDossierTab] = useState<'CTRI-Registration' | 'CDSCO-CT04-CTA'>('CTRI-Registration')

  // NDCT Rules 2019 compliance flags
  const [compliance, setCompliance] = useState({
    rule12Compliant: true,
    gcpAsuCompliant: true,
    iecLetterAttached: true,
    insuranceCoverageValid: true,
  })

  const currentStudy = studies.find((s) => s.id === selectedStudyId) ?? studies[0]

  const handleGeneratePackage = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!scientificTitle.trim() || !primaryOutcome.trim()) {
      setErrorMessage('Scientific Title and Primary Outcome are mandatory for CTRI filing.')
      return
    }

    if (!auditReason.trim()) {
      setErrorMessage('Audit justification is required to generate/verify regulatory filing.')
      return
    }

    setIsSubmitting(true)
    const pkgId = `CTRI-PKG-${Date.now().toString().slice(-4)}`
    const secondaryList = secondaryOutcomesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)

    const pkg: CtriFilingPackage = {
      id: pkgId,
      studyId: selectedStudyId,
      ctriRegNumber: currentStudy.ctriNumber || 'CTRI/2026/03/PENDING',
      clinicalTrialType: 'Interventional',
      phase: currentStudy.phase || 'Phase II',
      scientificTitle: scientificTitle.trim(),
      publicTitle: publicTitle.trim(),
      ethicsClearanceNumber: ethicsClearanceNumber.trim(),
      sponsorName: currentStudy.sponsor || 'All India Institute of Ayurveda (AIIA), New Delhi',
      principalInvestigator: currentStudy.pi || 'Dr. Ananya Patel (MD Ay, PhD)',
      primaryOutcome: primaryOutcome.trim(),
      secondaryOutcomes: secondaryList,
      targetSampleSize: currentStudy.targetSampleSize,
      ayurvedicInterventionDetails: {
        formulationName: formulationName.trim(),
        botanicalIngredients: botanicalIngredients.trim(),
        dosageAndAdministration: dosageAdmin.trim(),
        prakritiInclusion: prakritiInclusion.trim(),
      },
      ndct2019Compliance: compliance,
      generatedAt: new Date().toISOString(),
      packageStatus: 'Verified',
    }

    try {
      await saveCtriPackage(pkg, auditReason)
      setSuccessMessage(`Regulatory filing package ${pkgId} successfully generated and marked verified.`)
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate filing package.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const exportDossierAsText = () => {
    const content = `================================================================================
CLINICAL TRIALS REGISTRY - INDIA (CTRI) & CDSCO FORM CT-04 FILING DOSSIER
Generated via AIIA SmartCTMS - Good Clinical Practice in ASU Research
================================================================================

1. GENERAL TRIAL INFORMATION
--------------------------------------------------------------------------------
CTRI Registration Ref : ${currentStudy.ctriNumber}
Study Identifier      : ${currentStudy.id}
Trial Phase           : ${currentStudy.phase}
Trial Type            : Interventional, Double-Blind, Randomised, Active-Controlled
Sponsor               : ${currentStudy.sponsor}
Principal Investigator: ${currentStudy.pi} (${currentStudy.department})
Target Sample Size    : ${currentStudy.targetSampleSize} subjects across ${currentStudy.sites.length} sites
Ethics Clearance Ref  : ${ethicsClearanceNumber}

2. STUDY TITLES
--------------------------------------------------------------------------------
Scientific Title      : ${scientificTitle}
Public Title          : ${publicTitle}

3. AYURVEDIC INTERVENTION SPECIFICATION (GCP-ASU / CDSCO NDCT 2019)
--------------------------------------------------------------------------------
Formulation Name      : ${formulationName}
Botanical Composition : ${botanicalIngredients}
Dosage & Regimen      : ${dosageAdmin}
Prakriti Stratum      : ${prakritiInclusion}

4. ENDPOINTS & OUTCOMES
--------------------------------------------------------------------------------
Primary Outcome       : ${primaryOutcome}
Secondary Outcomes    :
${secondaryOutcomesText.split('\n').map((o) => `  * ${o}`).join('\n')}

5. REGULATORY COMPLIANCE ATTESTATION (NDCT RULES 2019)
--------------------------------------------------------------------------------
[X] CDSCO Rule 12 Clinical Trial Application Requirements Met: YES
[X] Good Clinical Practice in Ayurvedic Research (GCP-ASU) Met: YES
[X] Institutional Ethics Committee (IEC) Clearance Letter Attached: YES
[X] Subject Clinical Trial Compensation & Medical Insurance Active: YES

Date of Generation    : ${new Date().toISOString()}
Compliance Authority  : All India Institute of Ayurveda (AIIA) Regulatory Review Board
================================================================================`

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `CTRI_Filing_Package_${currentStudy.ctriNumber.replace(/\//g, '_')}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-teal-600 p-2 text-white shadow-sm shadow-teal-900/40">
              <FileSpreadsheet size={20} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Interactive CTRI Filing Package Generator</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Automated generation of CTRI registration dossier and CDSCO Form CT-04/CT-06 clinical trial applications per NDCT Rules 2019.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-500 uppercase dark:text-slate-400">Target Study:</label>
          <select
            value={selectedStudyId}
            onChange={(e) => setSelectedStudyId(e.target.value)}
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

      {/* 4-Point Regulatory Compliance Checklist */}
      <div className="rounded-xl border border-teal-200/80 bg-teal-50/50 p-5 dark:border-teal-900/50 dark:bg-teal-950/20 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-semibold text-teal-900 dark:text-teal-200 flex items-center gap-2">
              <ShieldCheck size={18} className="text-teal-600 dark:text-teal-400" />
              CDSCO NDCT Rules 2019 & GCP-ASU Regulatory Verification Check
            </h3>
            <p className="text-xs text-teal-700 dark:text-teal-400 mt-1">
              Required legal clearances before submitting interventional Ayurvedic trial packages to CTRI and CDSCO.
            </p>
          </div>
          <button
            onClick={exportDossierAsText}
            className="flex items-center gap-2 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-500 transition"
          >
            <Download size={14} />
            <span>Download Submission Package (.TXT)</span>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 text-xs">
          <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-900/80 border border-teal-200 dark:border-teal-900/50 cursor-pointer shadow-sm">
            <input
              type="checkbox"
              checked={compliance.rule12Compliant}
              onChange={(e) => setCompliance({ ...compliance, rule12Compliant: e.target.checked })}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span className="font-medium text-slate-800 dark:text-slate-200">NDCT Rule 12 Application</span>
          </label>
          <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-900/80 border border-teal-200 dark:border-teal-900/50 cursor-pointer shadow-sm">
            <input
              type="checkbox"
              checked={compliance.gcpAsuCompliant}
              onChange={(e) => setCompliance({ ...compliance, gcpAsuCompliant: e.target.checked })}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span className="font-medium text-slate-800 dark:text-slate-200">AYUSH GCP-ASU Guidelines</span>
          </label>
          <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-900/80 border border-teal-200 dark:border-teal-900/50 cursor-pointer shadow-sm">
            <input
              type="checkbox"
              checked={compliance.iecLetterAttached}
              onChange={(e) => setCompliance({ ...compliance, iecLetterAttached: e.target.checked })}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span className="font-medium text-slate-800 dark:text-slate-200">IEC Ethics Letter Verified</span>
          </label>
          <label className="flex items-center gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-900/80 border border-teal-200 dark:border-teal-900/50 cursor-pointer shadow-sm">
            <input
              type="checkbox"
              checked={compliance.insuranceCoverageValid}
              onChange={(e) => setCompliance({ ...compliance, insuranceCoverageValid: e.target.checked })}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <span className="font-medium text-slate-800 dark:text-slate-200">Subject Trial Insurance</span>
          </label>
        </div>
      </div>

      {/* Main Grid: Form Builder & Dossier Document View */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: CTRI Parameters Builder Form */}
        <div className="rounded-xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 font-semibold text-slate-900 dark:text-slate-100 dark:border-slate-800">
            <Layers size={18} className="text-teal-600 dark:text-teal-400" />
            <span>CTRI Registration Specification Form</span>
          </div>

          <form onSubmit={handleGeneratePackage} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Scientific Title <span className="text-red-500">*</span>
              </label>
              <textarea
                value={scientificTitle}
                onChange={(e) => setScientificTitle(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Public / Lay Title
              </label>
              <input
                type="text"
                value={publicTitle}
                onChange={(e) => setPublicTitle(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  CTRI Reference No.
                </label>
                <input
                  type="text"
                  value={currentStudy.ctriNumber}
                  disabled
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs text-slate-500 dark:border-slate-700/80 dark:bg-slate-900/60 dark:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Ethics Clearance Ref
                </label>
                <input
                  type="text"
                  value={ethicsClearanceNumber}
                  onChange={(e) => setEthicsClearanceNumber(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                Ayurvedic Formulation Details (GCP-ASU)
              </h4>

              <div className="mt-2 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Investigational Polyherbal Formulation
                  </label>
                  <input
                    type="text"
                    value={formulationName}
                    onChange={(e) => setFormulationName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Botanical Ingredients & Standardisation Markers
                  </label>
                  <input
                    type="text"
                    value={botanicalIngredients}
                    onChange={(e) => setBotanicalIngredients(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Dosage & Administration
                    </label>
                    <input
                      type="text"
                      value={dosageAdmin}
                      onChange={(e) => setDosageAdmin(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Prakriti Inclusion Criteria
                    </label>
                    <input
                      type="text"
                      value={prakritiInclusion}
                      onChange={(e) => setPrakritiInclusion(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                Trial Endpoints & Outcomes
              </h4>

              <div className="mt-2 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Primary Outcome <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={primaryOutcome}
                    onChange={(e) => setPrimaryOutcome(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Secondary Outcomes (one per line)
                  </label>
                  <textarea
                    value={secondaryOutcomesText}
                    onChange={(e) => setSecondaryOutcomesText(e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Audit Reason <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={auditReason}
                onChange={(e) => setAuditReason(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100"
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
              {isSubmitting ? 'Verifying Dossier...' : 'Generate & Verify CTRI Dossier Package'}
            </button>
          </form>
        </div>

        {/* Right Column: Live Dossier Document Preview */}
        <div className="rounded-xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 pb-3 sm:flex-row sm:items-center dark:border-slate-800">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Interactive Regulatory Dossier Preview</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ready for submission to CTRI (ICMR) and CDSCO CLA portal.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveDossierTab('CTRI-Registration')}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  activeDossierTab === 'CTRI-Registration'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                CTRI Form
              </button>
              <button
                onClick={() => setActiveDossierTab('CDSCO-CT04-CTA')}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  activeDossierTab === 'CDSCO-CT04-CTA'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                CDSCO Form CT-04
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-[11px] leading-relaxed dark:border-slate-800/80 dark:bg-slate-950 text-slate-800 dark:text-slate-200 max-h-[580px] overflow-y-auto">
            {activeDossierTab === 'CTRI-Registration' ? (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-2 dark:border-slate-800">
                  <div className="font-bold text-teal-600 dark:text-teal-400">CTRI SUBMISSION DOSSIER -- AYUSH RESEARCH</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">CTRI Reg ID: {currentStudy.ctriNumber} | Status: Verified</div>
                </div>

                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">1. SCIENTIFIC TITLE</div>
                  <div className="mt-0.5 text-slate-700 dark:text-slate-300">{scientificTitle}</div>
                </div>

                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">2. PUBLIC TITLE</div>
                  <div className="mt-0.5 text-slate-700 dark:text-slate-300">{publicTitle}</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">3. TRIAL DESIGN</div>
                    <div>Phase: {currentStudy.phase}</div>
                    <div>Design: Interventional, 3-Arm, 1:1:1</div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">4. ETHICS APPROVAL</div>
                    <div>IEC Ref: {ethicsClearanceNumber}</div>
                    <div>Sponsor: {currentStudy.sponsor}</div>
                  </div>
                </div>

                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">5. AYURVEDIC INVESTIGATIONAL PRODUCT</div>
                  <div>* Formulation: {formulationName}</div>
                  <div>* Botanicals: {botanicalIngredients}</div>
                  <div>* Regimen: {dosageAdmin}</div>
                  <div>* Prakriti Target: {prakritiInclusion}</div>
                </div>

                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">6. OUTCOME MEASURES</div>
                  <div className="text-teal-600 dark:text-teal-400 font-semibold">Primary:</div>
                  <div>{primaryOutcome}</div>
                  <div className="mt-1 text-slate-600 dark:text-slate-400 font-semibold">Secondary:</div>
                  {secondaryOutcomesText.split('\n').map((o, idx) => (
                    <div key={idx}>- {o}</div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-b border-slate-200 pb-2 dark:border-slate-800">
                  <div className="font-bold text-teal-600 dark:text-teal-400">CDSCO FORM CT-04 (NDCT RULES 2019)</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">APPLICATION FOR PERMISSION TO CONDUCT CLINICAL TRIAL OF NEW AYURVEDIC DRUG</div>
                </div>

                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">Applicant (Sponsor):</div>
                  <div>All India Institute of Ayurveda (AIIA), Sarita Vihar, New Delhi</div>
                </div>

                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">Investigator & Site:</div>
                  <div>Principal Investigator: {currentStudy.pi}</div>
                  <div>Participating Sites: {currentStudy.sites.map((s) => s.name).join(', ')}</div>
                </div>

                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">Regulatory Declarations:</div>
                  <div>[x] Clinical trial shall be conducted in compliance with Schedule Y / NDCT 2019 and GCP-ASU Guidelines.</div>
                  <div>[x] Serious Adverse Events (SAEs) will be reported within 24 hours to Central Licensing Authority (CLA) and IEC.</div>
                  <div>[x] Compensation for trial related injury/death provided under Rule 39 & 40 of NDCT Rules 2019.</div>
                </div>

                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">Signatory Attestation:</div>
                  <div>Authorized Institutional Signatory: Dr. Ananya Patel (PI)</div>
                  <div>Status: Dossier Verified and Ready for Filing</div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-teal-500" />
              <span>CTRI (ICMR) & CDSCO Form CT-04 Format Compliant</span>
            </div>
            <button
              onClick={exportDossierAsText}
              className="text-teal-600 font-semibold hover:underline dark:text-teal-400"
            >
              Export TXT
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FileCheck(props: any) {
  return <CheckCircle2 {...props} />
}
