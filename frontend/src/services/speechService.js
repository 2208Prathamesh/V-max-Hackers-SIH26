const getSpeechRecognition = () => {
  if (typeof window === 'undefined') return null

  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

export const createSpeechRecognizer = (options = {}) => {
  const SpeechRecognition = getSpeechRecognition()

  if (!SpeechRecognition) {
    throw new Error(
      'Speech recognition is not supported in this browser. Please use Google Chrome.'
    )
  }

  const recognition = new SpeechRecognition()

  recognition.continuous =
    options.continuous !== undefined ? options.continuous : true
  recognition.interimResults =
    options.interimResults !== undefined ? options.interimResults : true
  recognition.lang = options.lang || 'en-IN'
  recognition.maxAlternatives = options.maxAlternatives || 1

  return recognition
}

export const speakText = (
  text,
  language = 'en-IN',
  onStart,
  onEnd,
  onError
) => {
  if (typeof window === 'undefined') return

  if (!('speechSynthesis' in window)) {
    onError?.('Text-to-Speech is not supported in this browser.')
    return
  }

  if (!text?.trim()) return

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)

  utterance.lang = language
  utterance.rate = 1
  utterance.pitch = 1
  utterance.volume = 1

  utterance.onstart = () => {
    onStart?.()
  }

  utterance.onend = () => {
    onEnd?.()
  }

  utterance.onerror = event => {
    console.error('Speech synthesis error:', event)
    onError?.('Unable to speak the response.')
  }

  window.speechSynthesis.speak(utterance)
}

export const stopSpeaking = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}
