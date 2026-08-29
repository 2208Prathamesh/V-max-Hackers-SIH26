import voiceService from '../services/voice/voiceService.js';
import { successResponse } from '../utils/response.js';

/**
 * Transcribe audio to text (Whisper STT processing)
 */
export const transcribe = async (req, res, next) => {
  try {
    const { audioBase64, mimeType, language } = req.body || {};
    const result = await voiceService.transcribeAudio({
      audioBase64: audioBase64 || req.body?.text,
      mimeType,
      language
    });

    return successResponse(res, result, 'Audio transcribed successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Synthesize speech from text (Piper TTS processing)
 */
export const synthesize = async (req, res, next) => {
  try {
    const { text, language } = req.body || {};
    const result = await voiceService.synthesizeSpeech({
      text: text || req.query.text,
      language: language || req.query.language || 'en'
    });

    return successResponse(res, result, 'Speech synthesis profile prepared', 200);
  } catch (error) {
    next(error);
  }
};

export default {
  transcribe,
  synthesize
};
