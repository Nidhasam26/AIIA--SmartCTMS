import { describe, expect, it } from 'vitest'
import { buildFhirBundle, buildFhirConformanceReport, buildSdtmCsv, mapSdtmDomain, SDTM_MANDATORY_VARIABLES, validateFhirBundle, validateSdtmRows } from './exports'
import type { SdtmDomain } from './exports'

describe('FHIR and SDTM export helpers', () => {
  it.each(Object.entries(SDTM_MANDATORY_VARIABLES) as Array<[SdtmDomain, string[]]>)('maps SDTM %s domain with mandatory variables', (domain, mandatory) => {
    const record = Object.fromEntries(mandatory.map((variable) => [variable, variable === 'DOMAIN' ? domain : `VALUE-${variable}`]))
    const mapped = mapSdtmDomain(domain, [record])
    expect(mapped.validation.valid).toBe(true)
    expect(mapped.columns).toEqual(expect.arrayContaining(mandatory))
    expect(mapped.rows[0]).toHaveLength(mapped.columns.length)
  })

  it('rejects an SDTM record missing a mandatory variable', () => {
    const mapped = mapSdtmDomain('DM', [{ STUDYID: 'S1', DOMAIN: 'DM', USUBJID: 'P1' }])
    expect(mapped.validation.valid).toBe(false)
    expect(mapped.validation.errors).toContain('Record 1 is missing mandatory DM.SUBJID.')
  })

  it('maps FHIR ResearchStudy, ResearchSubject, AdverseEvent, and Consent resources', () => {
    const bundle = buildFhirBundle('study-1', 'PT-000124', 'AYUSH-01: Study', [
      { id: 'AE-10', event: 'Nausea', onsetDate: '2026-09-28', seriousness: 'Serious' },
    ], [
      { id: 'C-1', version: 'ICF-3', signedOn: '2026-09-01', withdrawn: false },
    ])
    expect(bundle.resourceType).toBe('Bundle')
    expect(bundle.entry.map((entry) => entry.resource.resourceType)).toEqual(['ResearchStudy', 'ResearchSubject', 'AdverseEvent', 'Consent'])
    expect(bundle.entry[0]?.resource).toMatchObject({ title: 'AYUSH-01: Study', id: 'study-1' })
    expect(bundle.entry[1]?.resource).toMatchObject({ study: { reference: 'ResearchStudy/study-1' } })
    expect(buildFhirConformanceReport(bundle)).toMatchObject({ valid: true, summary: 'FHIR bundle conformance passed.' })
  })

  it('creates SDTM CSV output', () => {
    const csv = buildSdtmCsv([
      ['STUDYID', 'USUBJID'],
      ['STUDY-1', 'PT-000124'],
    ])
    expect(csv).toContain('STUDYID,USUBJID')
    expect(csv).toContain('STUDY-1,PT-000124')
    expect(validateSdtmRows([
      ['STUDYID', 'DOMAIN', 'USUBJID'],
      ['STUDY-1', 'DM', 'PT-000124'],
    ]).valid).toBe(true)
  })

  it('quotes and escapes SDTM CSV values and flags pre-export integrity errors', () => {
    expect(buildSdtmCsv([['STUDYID', 'DOMAIN', 'USUBJID', 'NOTE'], ['S1', 'AE', 'P1', 'pain, "severe"']]))
      .toContain('S1,AE,P1,"pain, ""severe"""')
    const validation = validateSdtmRows([
      ['STUDYID', 'USUBJID'],
      ['S1'],
    ])
    expect(validation.valid).toBe(false)
    expect(validation.errors).toContain('Required SDTM column DOMAIN is missing.')
    expect(validation.errors).toContain('Row 2 has 1 values for 2 columns.')
  })

  it('reports FHIR conformance failure when required resource types are missing', () => {
    const incomplete = buildFhirBundle('study-1', 'PT-000124')
    const report = validateFhirBundle(incomplete)
    expect(report.valid).toBe(false)
    expect(report.errors).toContain('FHIR bundle must include an AdverseEvent resource.')
    expect(report.errors).toContain('FHIR bundle must include a Consent resource.')
  })
})
