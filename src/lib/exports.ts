export interface SdtmValidationResult {
  valid: boolean
  errors: string[]
}

export type SdtmDomain = 'DM' | 'AE' | 'DS' | 'EX' | 'SV' | 'DV' | 'TS'

export const SDTM_MANDATORY_VARIABLES: Record<SdtmDomain, string[]> = {
  DM: ['STUDYID', 'DOMAIN', 'USUBJID', 'SUBJID', 'SEX'],
  AE: ['STUDYID', 'DOMAIN', 'USUBJID', 'AESEQ', 'AETERM', 'AEDECOD', 'AESTDTC'],
  DS: ['STUDYID', 'DOMAIN', 'USUBJID', 'DSSEQ', 'DSTERM', 'DSDECOD', 'DSSTDTC'],
  EX: ['STUDYID', 'DOMAIN', 'USUBJID', 'EXSEQ', 'EXTRT', 'EXDOSE', 'EXSTDTC'],
  SV: ['STUDYID', 'DOMAIN', 'USUBJID', 'VISITNUM', 'VISIT', 'SVSTDTC'],
  DV: ['STUDYID', 'DOMAIN', 'USUBJID', 'DVSEQ', 'DVTERM', 'DVDECOD'],
  TS: ['STUDYID', 'DOMAIN', 'TSPARMCD', 'TSPARM', 'TSVAL'],
}

export interface SdtmMappingResult {
  columns: string[]
  rows: string[][]
  validation: SdtmValidationResult
}

export function mapSdtmDomain(domain: SdtmDomain, records: Array<Record<string, string | number | null | undefined>>): SdtmMappingResult {
  const required = SDTM_MANDATORY_VARIABLES[domain]
  const columns = [...new Set([...required, ...records.flatMap((record) => Object.keys(record))])]
  const rows = records.map((record) => columns.map((column) => record[column] == null ? '' : String(record[column])))
  const errors = records.flatMap((record, index) => required
    .filter((variable) => record[variable] == null || String(record[variable]).trim() === '')
    .map((variable) => `Record ${index + 1} is missing mandatory ${domain}.${variable}.`))

  return { columns, rows, validation: { valid: errors.length === 0, errors } }
}

export interface FhirBundle {
  resourceType: 'Bundle'
  type: 'collection'
  entry: Array<{ resource: Record<string, unknown> }>
}

export function buildFhirBundle(
  studyId: string,
  subjectId: string,
  studyTitle = 'AYUSH-01',
  adverseEvents: Array<{ id: string; event: string; onsetDate: string; seriousness: string }> = [],
  consents: Array<{ id: string; version: string; signedOn: string; withdrawn: boolean }> = [],
): FhirBundle {
  return {
    resourceType: 'Bundle',
    type: 'collection',
    entry: [
      {
        resource: {
          resourceType: 'ResearchStudy',
          id: studyId,
          title: studyTitle,
          status: 'active',
        },
      },
      {
        resource: {
          resourceType: 'ResearchSubject',
          id: subjectId,
          status: 'candidate',
          study: { reference: `ResearchStudy/${studyId}` },
        },
      },
      ...adverseEvents.map((event) => ({
        resource: {
          resourceType: 'AdverseEvent',
          id: event.id,
          actuality: 'actual',
          subject: { reference: `ResearchSubject/${subjectId}` },
          date: event.onsetDate,
          seriousness: event.seriousness,
          text: { status: 'generated', div: event.event },
        },
      })),
      ...consents.map((consent) => ({
        resource: {
          resourceType: 'Consent',
          id: consent.id,
          status: consent.withdrawn ? 'inactive' : 'active',
          scope: { coding: [{ code: 'research' }] },
          dateTime: consent.signedOn,
          sourceReference: { reference: `DocumentReference/${consent.version}` },
        },
      })),
    ],
  }
}

export function buildSdtmCsv(rows: string[][]) {
  const header = rows[0] ?? []
  const body = rows.slice(1)
  const encode = (value: string) => /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value
  return [header, ...body].map((row) => row.map(encode).join(',')).join('\n')
}

export function validateSdtmRows(rows: string[][]): SdtmValidationResult {
  const errors: string[] = []
  const [header, ...body] = rows

  if (!header?.length) return { valid: false, errors: ['A header row is required.'] }
  if (header.some((column) => !column.trim())) errors.push('Column names cannot be empty.')
  if (new Set(header).size !== header.length) errors.push('Column names must be unique.')

  for (const required of ['STUDYID', 'DOMAIN', 'USUBJID']) {
    if (!header.includes(required)) errors.push(`Required SDTM column ${required} is missing.`)
  }

  body.forEach((row, index) => {
    if (row.length !== header.length) errors.push(`Row ${index + 2} has ${row.length} values for ${header.length} columns.`)
    for (const required of ['STUDYID', 'DOMAIN', 'USUBJID']) {
      const columnIndex = header.indexOf(required)
      if (columnIndex >= 0 && !row[columnIndex]?.trim()) {
        errors.push(`Row ${index + 2} is missing ${required}.`)
      }
    }
  })

  return { valid: errors.length === 0, errors }
}

export function validateFhirBundle(bundle: FhirBundle) {
  const errors: string[] = []
  if (bundle.resourceType !== 'Bundle') errors.push('FHIR resourceType must be Bundle.')
  if (bundle.type !== 'collection') errors.push('FHIR bundle type must be collection.')
  if (!bundle.entry.length) errors.push('FHIR bundle must contain at least one entry.')
  if (!bundle.entry.some((entry) => entry.resource.resourceType === 'ResearchStudy')) {
    errors.push('FHIR bundle must include a ResearchStudy resource.')
  }
  if (!bundle.entry.some((entry) => entry.resource.resourceType === 'ResearchSubject')) {
    errors.push('FHIR bundle must include a ResearchSubject resource.')
  }
  if (!bundle.entry.some((entry) => entry.resource.resourceType === 'AdverseEvent')) {
    errors.push('FHIR bundle must include an AdverseEvent resource.')
  }
  if (!bundle.entry.some((entry) => entry.resource.resourceType === 'Consent')) {
    errors.push('FHIR bundle must include a Consent resource.')
  }
  return { valid: errors.length === 0, errors }
}

export function buildFhirConformanceReport(bundle: FhirBundle) {
  const validation = validateFhirBundle(bundle)
  return {
    ...validation,
    checkedResources: bundle.entry.map((entry) => String(entry.resource.resourceType ?? 'unknown')),
    summary: validation.valid ? 'FHIR bundle conformance passed.' : `FHIR bundle conformance failed: ${validation.errors.join(' ')}`,
  }
}
