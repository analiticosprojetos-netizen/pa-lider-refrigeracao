/**
 * Formata um texto para "Title Case" (Primeira letra maiúscula)
 * com exceção para preposições comuns.
 */
export const formatToTitleCase = (text: string): string => {
  if (!text) return ''
  
  // Preposições que devem ficar em minúsculas
  const prepositions = ['de', 'da', 'do', 'dos', 'das', 'e', 'o', 'a', 'em', 'com', 'por']
  
  const words = text.split(' ')
  
  const formattedWords = words.map((word, index) => {
    // Se a palavra estiver vazia (múltiplos espaços), mantém
    if (word.length === 0) return ''
    
    const lowerWord = word.toLowerCase()
    
    // A primeira palavra sempre tem inicial maiúscula.
    // As demais apenas se não forem preposições.
    if (index > 0 && prepositions.includes(lowerWord)) {
      return lowerWord
    }
    
    return lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1)
  })
  
  return formattedWords.join(' ')
}
