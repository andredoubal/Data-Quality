export const PRIORITY_CRITERIA = [
  { id: 'impact', label: 'Business impact', w: 0.3, scale: ['None', 'Minor inconvenience', 'Report caveat needed', 'Wrong decision or rework', 'Pay, benefits or safety affected'] },
  { id: 'reg', label: 'Regulatory / compliance risk', w: 0.2, scale: ['None', 'Internal policy', 'Audit observation likely', 'Audit finding', 'Regulatory breach / fine'] },
  { id: 'cde', label: 'Element criticality', w: 0.2, scale: ['Not catalogued', 'Standard element', 'Standard, widely used', 'Tier 2 CDE', 'Tier 1 CDE'] },
  { id: 'scale', label: 'Scale (records affected)', w: 0.15, scale: ['< 10', '10–100', '100–1,000', '1,000–5,000', '> 5,000 or all'] },
  { id: 'urgency', label: 'Urgency', w: 0.15, scale: ['No deadline', 'Next quarter', 'Next month', 'Next payroll / report cycle', 'Immediate'] },
]

export const SLA = { Critical: 5, High: 15, Medium: 30, Low: 60 }

export function priorityScore(values) {
  const s = PRIORITY_CRITERIA.reduce((acc, c) => acc + (values[c.id] || 1) * c.w, 0)
  return Math.round(s * 20)
}
export function priorityOf(score) {
  return score >= 80 ? 'Critical' : score >= 60 ? 'High' : score >= 40 ? 'Medium' : 'Low'
}
