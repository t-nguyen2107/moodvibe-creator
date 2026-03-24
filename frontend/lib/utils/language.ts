/**
 * Detect language from query text
 */

export function detectLanguage(query: string): string {
  const vietnameseRegex = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i
  const koreanRegex = /[ㄱ-ㅣ가-힣]/

  if (vietnameseRegex.test(query)) return 'vi'
  if (koreanRegex.test(query)) return 'ko'
  if (/[\u0400-\u04FF]/.test(query)) return 'ru' // Cyrillic (Russian)
  if (/[\u0600-\u06FF]/.test(query)) return 'ar' // Arabic
  if (/[\u4E00-\u9FFF]/.test(query)) return 'zh' // Chinese
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(query)) return 'ja' // Japanese
  if (/[ñáéíóúü]/i.test(query)) return 'es' // Spanish

  // Default to English
  return 'en'
}
