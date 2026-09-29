// Scoring logic per dimension, and a library of rule patterns with a ZATCA example for each.
// In the equations: B = rows evaluated, C = columns the rule type is applied to.
export const SCORING = [
  { dim: 'Completeness', logic: '% of non-null values', vars: ['A = null values in columns with a not-null constraint', 'B = total rows', 'C = columns with a not-null constraint'], eq: '(1 − A ÷ (B × C)) × 100', kind: 'fail' },
  { dim: 'Validity', logic: '% of values that meet the expected standard (length, format, pattern, allowed list)', vars: ['A = values that break the data standard', 'B = total rows', 'C = columns with a data standard applied'], eq: '(1 − A ÷ (B × C)) × 100', kind: 'fail' },
  { dim: 'Timeliness', logic: '% of records received or updated within the expected time frame', vars: ['A = records received or updated within the time frame', 'B = records expected'], eq: '(A ÷ B) × 100', kind: 'pass2' },
  { dim: 'Consistency', logic: '% of values that agree across sources', vars: ['A = values of the same column that agree across sources', 'B = values of that column compared across sources'], eq: '(A ÷ B) × 100', kind: 'pass2' },
  { dim: 'Uniqueness', logic: '% of values that are unique in the column', vars: ['A = unique values in columns with a unique constraint', 'B = total rows', 'C = columns with a unique constraint'], eq: '(A ÷ (B × C)) × 100', kind: 'pass' },
  { dim: 'Accuracy', logic: '% of values that conform to a business rule or trusted source', vars: ['A = values that pass the business rules', 'B = total rows', 'C = columns with business rules applied'], eq: '(A ÷ (B × C)) × 100', kind: 'pass' },
]

export const LIBRARY = {
  Completeness: [
    ['Mandatory fields', 'All fields flagged as mandatory or critical must have values.', 'Importer TIN, HS code and customs value on every FASAH import declaration line.'],
    ['Missing values count', 'Periodically count missing values to spot patterns in what is missing.', 'Weekly count of blank buyer VAT numbers by EGS vendor shows one ERP causing 70% of gaps.'],
    ['Referential completeness', 'Referenced records must exist (foreign keys).', 'Every seller VAT number on a FATOORA invoice exists in the ZATCA taxpayer registry.'],
    ['Data collection completeness', 'All expected sources or channels have delivered.', 'Every customs port (land, sea, air) sent its daily FASAH declaration feed; one port missing means investigate.'],
    ['Time-series completeness', 'No gaps in sequential data.', 'A SAMA exchange rate exists for every currency and every calendar day, holidays included.'],
  ],
  Validity: [
    ['Conformance to schemas', 'Data conforms to the defined data model or schema.', 'Every e-invoice is valid UBL 2.1 XML against the ZATCA schema before clearance.'],
    ['Range constraints', 'Values fall inside allowed ranges.', 'VAT rate is 15% (standard) or 0% (zero-rated / exempt); gross weight > 0 kg; invoice issue date not in the future.'],
    ['Enumeration validation', 'Fields with a fixed list only contain allowed values.', 'Invoice type code is 388 (tax invoice), 381 (credit note) or 383 (debit note); HS code in the tariff in force.'],
    ['Format & pattern', 'Values follow the required length and pattern.', 'VAT number: 15 digits, starts and ends with 3 (^3[0-9]{13}3$); HS code: 12 digits.'],
    ['Relationship integrity', 'Relationships between entities are maintained.', 'Every declaration line belongs to an existing declaration header in FASAH.'],
  ],
  Timeliness: [
    ['Data arrival time', 'Time for data to arrive from source to target within a threshold.', 'FATOORA invoices land in the warehouse within 1 hour of clearance.'],
    ['Data update frequency', 'Data refreshes at the expected frequency.', 'SAMA exchange rates loaded every business day by 10:00.'],
    ['Data reporting lag', 'Delay between data availability and its reporting.', 'Simplified invoices reported to FATOORA within 24 hours of issue.'],
    ['Data aging', 'Flag records older than a maximum age.', 'Declarations stuck in "pending payment" for more than 30 days.'],
    ['Data latency', 'Delay in processing pipelines stays within limits.', 'Hourly e-invoice pipeline completes in under 20 minutes.'],
  ],
  Consistency: [
    ['Standard formats', 'Dates, phone numbers and addresses use one format.', 'All dates stored as Gregorian ISO 8601 (YYYY-MM-DD); Hijri dates kept in a separate field.'],
    ['Value consistency', 'The same data has the same value everywhere it appears.', 'Taxpayer legal name identical in the ZATCA registry, FASAH importer profile and FATOORA onboarding.'],
    ['Harmonized units', 'Measurements use consistent units.', 'Weights in kilograms, values in SAR after conversion, never mixed with pounds or USD.'],
    ['Reconciliation', 'Values match across related datasets.', 'Output VAT in the VAT return reconciles to VAT on the taxpayer’s FATOORA e-invoices; import VAT in FASAH matches the tax ledger.'],
    ['Enumeration values', 'Categorical values are consistent, with no spelling variants.', 'Country codes are ISO alpha-2 everywhere ("SA", never "KSA" or "Saudi").'],
  ],
  Uniqueness: [
    ['Duplicate detection', 'Detect and remove duplicate records.', 'Same invoice loaded twice after a batch replay.'],
    ['Unique ID verification', 'Identifiers are unique.', 'Invoice UUID, FASAH declaration number and VAT number are each unique.'],
    ['Consistent key generation', 'Key-generating mechanisms work without error.', 'Each EGS unit increments its invoice counter (ICV) without repeats or resets.'],
    ['Redundancy checks', 'No redundant entries or fields.', 'One active VAT registration per commercial registration (CR) number.'],
    ['Historical uniqueness', 'Records stay unique across history.', 'A deregistered VAT number is never reissued to another taxpayer.'],
  ],
  Accuracy: [
    ['Verification checks', 'Verify against trusted sources or benchmarks.', 'Importer CR number verified against the Ministry of Commerce register.'],
    ['Error rate measurement', 'Track the error rate over time.', 'Monthly % of FASAH declarations amended after post-clearance audit.'],
    ['Outlier detection', 'Flag values outside expected ranges.', 'Unit customs value per kg far below the historical range for the same HS code (undervaluation risk).'],
    ['Spelling & text', 'Text is free from spelling errors.', 'Goods descriptions and Arabic/English trade names without obvious misspellings.'],
    ['Rounding rules', 'Consistent rounding where applicable.', 'Invoice VAT = taxable amount × 15%, rounded to 2 decimals at invoice level (±0.01).'],
  ],
}
