export interface FieldAnalysis {
  fieldName: string
  inferredType?: string
  patterns: string[]
}

export function analyzeFieldName(fieldName: string): FieldAnalysis {
  const lowerFieldName = fieldName.toLowerCase()
  const patterns: string[] = []

  if (lowerFieldName.includes('email')) patterns.push('email')
  if (lowerFieldName.includes('phone')) patterns.push('phone')
  if (lowerFieldName.includes('url') || lowerFieldName.includes('website')) patterns.push('url')
  if (lowerFieldName.includes('name')) patterns.push('name')
  if (lowerFieldName.includes('address')) patterns.push('address')
  if (lowerFieldName.includes('city')) patterns.push('city')
  if (lowerFieldName.includes('country')) patterns.push('country')
  if (lowerFieldName.includes('zip') || lowerFieldName.includes('postal')) patterns.push('zip')

  let inferredType: string | undefined
  if (patterns.includes('email')) inferredType = 'email'
  else if (patterns.includes('phone')) inferredType = 'phone'
  else if (patterns.includes('url')) inferredType = 'url'

  return {
    fieldName,
    inferredType,
    patterns
  }
}