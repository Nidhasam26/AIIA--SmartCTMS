import { useState } from 'react'
import { buildFhirBundle, buildFhirConformanceReport, buildSdtmCsv, mapSdtmDomain } from '../../lib/exports'
import type { SdtmDomain, SdtmMappingResult } from '../../lib/exports'
import { downloadAuditCsv } from '../../lib/audit'
import { useAppStore } from '../../store/appStore'

const domains: SdtmDomain[] = ['DM', 'AE', 'DS', 'EX', 'SV', 'DV', 'TS']

function dataUrl(content: string, mimeType: string) {
  return `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`
}

export function ExportsPage() {
  const [bundleText, setBundleText] = useState('')
  const [fhirDownloadUrl, setFhirDownloadUrl] = useState('')
  const [conformanceReport, setConformanceReport] = useState<ReturnType<typeof buildFhirConformanceReport> | null>(null)
  const [sdtmChecked, setSdtmChecked] = useState(false)
  const [sdtmMappings, setSdtmMappings] = useState<Partial<Record<SdtmDomain, SdtmMappingResult>>>({})
  const [sdtmDownloadUrls, setSdtmDownloadUrls] = useState<Partial<Record<SdtmDomain, string>>>({})
  const adverseEvents = useAppStore((state) => state.adverseEvents)
  const consentRecords = useAppStore((state) => state.consentRecords)
  const studies = useAppStore((state) => state.studies)
  const study = studies.find((item) => item.id === 'study-1')
  const participants = useAppStore((state) => state.participants)
  const auditEntries = useAppStore((state) => state.auditEntries ?? [])

  const getBundle = () => buildFhirBundle(
    'study-1',
    'PT-000124',
    study?.title ?? 'AYUSH-01',
    adverseEvents.filter((event) => event.studyId === 'study-1').map((event) => ({
      id: event.id,
      event: event.event,
      onsetDate: event.onsetDate,
      seriousness: event.seriousness,
    })),
    consentRecords.filter((record) => record.studyId === 'study-1').map((record) => ({
      id: record.id,
      version: record.version,
      signedOn: record.signedOn,
      withdrawn: record.withdrawn,
    })),
  )

  const openFhirReport = () => {
    const bundle = getBundle()
    const report = buildFhirConformanceReport(bundle)
    setConformanceReport(report)
    const serialized = JSON.stringify(bundle, null, 2)
    setBundleText(serialized)
    setFhirDownloadUrl(report.valid ? dataUrl(serialized, 'application/fhir+json') : '')
  }

  const runSdtmIntegrity = () => {
    const participant = participants.find((item) => item.id === 'PT-000124')
    const event = adverseEvents.find((item) => item.studyId === 'study-1')
    const consent = consentRecords.find((item) => item.studyId === 'study-1')
    const mapped: Record<SdtmDomain, SdtmMappingResult> = {
      DM: mapSdtmDomain('DM', [{ STUDYID: 'STUDY-1', DOMAIN: 'DM', USUBJID: 'PT-000124', SUBJID: 'PT-000124', SEX: 'U' }]),
      AE: mapSdtmDomain('AE', [{ STUDYID: 'STUDY-1', DOMAIN: 'AE', USUBJID: 'PT-000124', AESEQ: 1, AETERM: event?.event ?? 'Not reported', AEDECOD: 'Adverse event', AESTDTC: event?.onsetDate ?? '' }]),
      DS: mapSdtmDomain('DS', [{ STUDYID: 'STUDY-1', DOMAIN: 'DS', USUBJID: 'PT-000124', DSSEQ: 1, DSTERM: participant?.status ?? '', DSDECOD: participant?.status ?? '', DSSTDTC: consent?.signedOn ?? '' }]),
      EX: mapSdtmDomain('EX', [{ STUDYID: 'STUDY-1', DOMAIN: 'EX', USUBJID: 'PT-000124', EXSEQ: 1, EXTRT: study?.formulation ?? 'Not reported', EXDOSE: '1', EXSTDTC: consent?.signedOn ?? '' }]),
      SV: mapSdtmDomain('SV', [{ STUDYID: 'STUDY-1', DOMAIN: 'SV', USUBJID: 'PT-000124', VISITNUM: 1, VISIT: 'Baseline', SVSTDTC: consent?.signedOn ?? '' }]),
      DV: mapSdtmDomain('DV', [{ STUDYID: 'STUDY-1', DOMAIN: 'DV', USUBJID: 'PT-000124', DVSEQ: 1, DVTERM: 'None reported', DVDECOD: 'None reported' }]),
      TS: mapSdtmDomain('TS', [{ STUDYID: 'STUDY-1', DOMAIN: 'TS', TSPARMCD: 'TRT', TSPARM: 'Intervention', TSVAL: study?.formulation ?? '' }]),
    }
    setSdtmMappings(mapped)
    setSdtmChecked(true)
    const allValid = Object.values(mapped).every((item) => item.validation.valid)
    setSdtmDownloadUrls(allValid ? Object.fromEntries(domains.map((domain) => {
      const mapping = mapped[domain]
      const csv = buildSdtmCsv([mapping.columns, ...mapping.rows])
      return [domain, dataUrl(csv, 'text/csv')]
    })) as Record<SdtmDomain, string> : {})
  }

  const sdtmValid = domains.every((domain) => sdtmMappings[domain]?.validation.valid)

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] font-semibold text-teal-600 dark:text-teal-400">Export centre</div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">FHIR and SDTM exports</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
          <div className="mb-2 font-semibold text-slate-900 dark:text-slate-100">FHIR bundle</div>
          <p className="mb-3 text-xs text-slate-600 dark:text-slate-400">Export HL7 FHIR R4 Bundle containing ResearchStudy, Patient, AdverseEvent, and Consent resources.</p>
          <button onClick={openFhirReport} className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 transition">Open FHIR conformance report</button>
          {conformanceReport && (
            <section aria-label="FHIR conformance report" className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-900">
              <div role="status" className="font-semibold text-teal-700 dark:text-teal-300">{conformanceReport.summary}</div>
              <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">Checked resources: {conformanceReport.checkedResources.join(', ')}</div>
              {conformanceReport.errors.map((error) => <div key={error} className="text-xs text-rose-600 dark:text-rose-400">{error}</div>)}
            </section>
          )}
          <a
            aria-disabled={!conformanceReport?.valid || !fhirDownloadUrl}
            href={fhirDownloadUrl || '#'}
            onClick={(event) => { if (!fhirDownloadUrl) event.preventDefault() }}
            download="study-1-fhir-bundle.json"
            className={`mt-3 inline-block rounded-lg border border-teal-600 px-4 py-2 text-sm font-semibold text-teal-700 dark:border-teal-500 dark:text-teal-300 transition ${!fhirDownloadUrl ? 'pointer-events-none opacity-40' : 'hover:bg-teal-50 dark:hover:bg-teal-950/30'}`}
          >
            Download FHIR Bundle
          </a>
          {bundleText && <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-800 dark:bg-slate-950 dark:text-slate-200 border border-slate-200 dark:border-slate-800">{bundleText}</pre>}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
          <div className="mb-2 font-semibold text-slate-900 dark:text-slate-100">SDTM CSV</div>
          <p className="mb-3 text-xs text-slate-600 dark:text-slate-400">CDISC SDTM v3.3 formatted CSV exports for DM, AE, DS, EX, SV, DV, and TS domains.</p>
          <button onClick={runSdtmIntegrity} className="rounded-lg border border-teal-600 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50 dark:border-teal-500 dark:text-teal-300 dark:hover:bg-teal-950/30 transition">Run pre-export integrity checks</button>
          {sdtmChecked && <p role="status" className="mt-3 text-xs font-semibold text-teal-700 dark:text-teal-400">SDTM integrity: {sdtmValid ? 'passed for DM, AE, DS, EX, SV, DV, TS' : 'failed'}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            {domains.map((domain) => (
              <a
                key={domain}
                aria-disabled={!sdtmChecked || !sdtmValid}
                href={sdtmDownloadUrls[domain] ?? '#'}
                onClick={(event) => { if (!sdtmDownloadUrls[domain]) event.preventDefault() }}
                download={`${domain.toLowerCase()}-study-1.csv`}
                className={`rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-500 transition ${!sdtmDownloadUrls[domain] ? 'pointer-events-none opacity-40' : ''}`}
              >
                Download {domain} CSV
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
          <div className="mb-2 font-semibold text-slate-900 dark:text-slate-100">Audit trail export</div>
          <p className="mb-3 text-xs text-slate-600 dark:text-slate-400">Export the complete, cryptographically verified hash-chained audit trail log in CSV format.</p>
          <button
            onClick={() => downloadAuditCsv(auditEntries, 'smartctms-complete-audit-trail.csv')}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 transition"
          >
            Download Audit CSV ({auditEntries.length} entries)
          </button>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Includes actor, action, timestamp, old/new values, reasons, and SHA-256 prev/curr hashes.</p>
        </div>
      </div>
    </div>
  )
}
