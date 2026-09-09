import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useWeather } from '../context/WeatherContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  Send,
  Sparkles,
  Bot,
  User,
  MapPin,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Plus,
  Compass,
  Languages,
  Loader2
} from 'lucide-react';
import { WeatherIcon } from '../components/common/WeatherIcon';
import {
  createSpeechRecognizer,
  speakText,
  stopSpeaking
} from '../services/speechService';

export const ChatPage = () => {
  const {
    conversations,
    activeConversationId,
    sendChatMessage,
    isSending,
    createNewChat,
    formatTemp,
    addToast
  } = useWeather();
  const { language, setLanguage, t, supportedLanguages } = useLanguage();

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [playingMessageIndex, setPlayingMessageIndex] = useState(null);
  const [voiceError, setVoiceError] = useState('');

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const voiceRequestRef = useRef(false);
  const silenceTimerRef = useRef(null);
  const accumulatedTranscriptRef = useRef('');
  const hasSubmittedRef = useRef(false);
  const sendChatMessageRef = useRef(sendChatMessage);

  useEffect(() => {
    sendChatMessageRef.current = sendChatMessage;
  }, [sendChatMessage]);

  const activeConv = conversations.find((c) => c.id === activeConversationId) || conversations[0];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConv?.messages]);

  const speechLangMap = {
    hi: 'hi-IN',
    mr: 'mr-IN',
    bn: 'bn-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    en: 'en-IN'
  };

  const handleStopSpeaking = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
    setPlayingMessageIndex(null);
  }, []);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const cleanupRecognition = useCallback(() => {
    clearSilenceTimer();
    if (recognitionRef.current) {
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, [clearSilenceTimer]);

  const startSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      const finalTranscript = accumulatedTranscriptRef.current.trim();
      if (finalTranscript && !hasSubmittedRef.current) {
        hasSubmittedRef.current = true;
        cleanupRecognition();
        setInputText('');
        voiceRequestRef.current = true;
        sendChatMessageRef.current(finalTranscript);
      } else {
        cleanupRecognition();
      }
    }, 3000);
  }, [clearSilenceTimer, cleanupRecognition]);

  const handleVoiceInput = () => {
    setVoiceError('');

    if (isListening) {
      const manualTranscript = accumulatedTranscriptRef.current.trim();
      cleanupRecognition();
      if (manualTranscript && !hasSubmittedRef.current) {
        hasSubmittedRef.current = true;
        setInputText('');
        voiceRequestRef.current = true;
        sendChatMessage(manualTranscript);
      }
      return;
    }

    handleStopSpeaking();
    accumulatedTranscriptRef.current = '';
    hasSubmittedRef.current = false;

    let recognizer;
    try {
      const langCode = speechLangMap[language] || 'en-IN';
      recognizer = createSpeechRecognizer({
        continuous: true,
        interimResults: true,
        lang: langCode
      });
    } catch (err) {
      setVoiceError(err.message || 'Speech recognition not available.');
      addToast(t('voiceError') || 'Speech recognition not available', 'warning');
      return;
    }

    recognizer.onresult = (event) => {
      let currentSessionTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentSessionTranscript += event.results[i][0].transcript;
      }
      accumulatedTranscriptRef.current = currentSessionTranscript;
      setInputText(currentSessionTranscript);
      startSilenceTimer();
    };

    recognizer.onerror = (event) => {
      if (event.error !== 'no-speech') {
        setVoiceError(`Voice error: ${event.error}`);
      }
      cleanupRecognition();
    };

    recognizer.onend = () => {
      if (isListening && !hasSubmittedRef.current) {
        try {
          recognizer.start();
        } catch {
          cleanupRecognition();
        }
      }
    };

    recognitionRef.current = recognizer;
    try {
      recognizer.start();
      setIsListening(true);
      startSilenceTimer();
    } catch (err) {
      setVoiceError('Could not access microphone.');
      cleanupRecognition();
    }
  };

  const handleSpeak = (text, index) => {
    if (playingMessageIndex === index) {
      handleStopSpeaking();
      return;
    }
    handleStopSpeaking();
    setPlayingMessageIndex(index);
    const langCode = speechLangMap[language] || 'en-IN';
    speakText(
      text,
      langCode,
      () => setIsSpeaking(true),
      () => {
        setIsSpeaking(false);
        setPlayingMessageIndex(null);
      },
      () => {
        setIsSpeaking(false);
        setPlayingMessageIndex(null);
      }
    );
  };

  // Auto-speak response if question was asked via voice
  const lastMsg = activeConv?.messages?.[activeConv.messages.length - 1];
  useEffect(() => {
    if (voiceRequestRef.current && lastMsg?.sender === 'assistant' && lastMsg?.status !== 'loading' && lastMsg?.status !== 'error') {
      voiceRequestRef.current = false;
      const langCode = speechLangMap[language] || 'en-IN';
      speakText(
        lastMsg.text,
        langCode,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    }
  }, [lastMsg, language]);

  const samplePrompts = [
    language === 'hi'
      ? 'क्या आज पुणे में बारिश होगी?'
      : language === 'mr'
      ? 'पुण्यात आज पाऊस पडेल का?'
      : language === 'bn'
      ? 'কলকাতায় আজকের আবহাওয়া কেমন?'
      : language === 'ta'
      ? 'சென்னையில் இன்று மழை பெய்யுமா?'
      : language === 'te'
      ? 'హైదరాబాద్‌లో ఈరోజు వర్షం పడుతుందా?'
      : 'Will it rain today in Pune?',
    language === 'hi'
      ? 'कपास की फसल के लिए सिंचाई और छिड़काव सलाह'
      : language === 'mr'
      ? 'कापूस आणि सोयाबीन पिकासाठी खत व पाणी सल्ला'
      : 'Crop advisory for cotton and soybean this week',
    language === 'hi'
      ? 'मुंबई के लिए 7 दिनों का मौसम पूर्वानुमान'
      : language === 'mr'
      ? 'मुंबई आणि पुण्यासाठी पुढील ७ दिवसांचा अंदाज'
      : 'Compare ECMWF vs NOAA GFS forecast for Mumbai',
    language === 'hi'
      ? 'आज के सरकारी मौसम विभाग (IMD) अलर्ट दिखाएं'
      : language === 'mr'
      ? 'आजचे हवामान विभागाचे (IMD) अधिकृत इशारे दाखवा'
      : 'Show official IMD weather warnings for today'
  ];

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;
    voiceRequestRef.current = false;
    handleStopSpeaking();
    const text = inputText.trim();
    setInputText('');
    sendChatMessage(text);
  };

  const handleChatLanguageChange = (newLang) => {
    setLanguage(newLang);
    api.updateSettings({ language: newLang }).catch(() => {});
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white dark:bg-[#151F32] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{activeConv?.title || 'WeatherGPT AI Assistant'}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                {t('zeroHallucinationBadge')}
              </span>
            </h3>
            <p className="text-xs text-slate-400">{t('conversationalAiSubtitle')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Chat-specific Language Picker */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <Languages className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <select
              value={language}
              onChange={(e) => handleChatLanguageChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              {supportedLanguages.map((lang) => (
                <option key={lang.code} value={lang.code} className="dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                  {lang.flag} {lang.nativeName}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              handleStopSpeaking();
              createNewChat();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('newChat')}</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {(!activeConv?.messages || activeConv.messages.length === 0) && (
          <div className="max-w-xl mx-auto text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
              <Bot className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('chat')}
            </h3>

            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {t('chatHeroDescription') ||
                'Ask any question about weather forecasts, precipitation probabilities, severe storm alerts, or travel safety advisories.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {samplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    voiceRequestRef.current = false;
                    handleStopSpeaking();
                    sendChatMessage(prompt);
                  }}
                  className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium transition text-left cursor-pointer"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        )}

        {activeConv?.messages?.map((msg, index) => {
          const isUser = msg.sender === 'user';
          const isPlaying = playingMessageIndex === index;

          return (
            <div
              key={msg.id || index}
              className={`flex items-start gap-3.5 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold shrink-0 shadow-xs ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-slate-700/60'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Bubble Body */}
              <div className={`space-y-2 max-w-xl ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-xs'
                      : msg.status === 'error'
                      ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-tl-xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Natural TTS Voice Button */}
                  {!isUser && msg.status !== 'loading' && msg.status !== 'error' && (
                    <button
                      onClick={() => handleSpeak(msg.text, index)}
                      className={`mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition border cursor-pointer ${
                        isPlaying
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-blue-500'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{t('stopReading')}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{t('listenResponse')}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Weather card attachment */}
                {msg.cardData && (
                  <div className="p-3.5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800/80 dark:to-blue-950/40 rounded-2xl border border-blue-100 dark:border-slate-700 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {msg.cardData.city}
                        </span>
                      </div>
                      <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                        {formatTemp(msg.cardData.temp)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-blue-100/60 dark:border-slate-700/60 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">{t('humidity')}</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {msg.cardData.humidity ?? '--'}%
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">{t('wind')}</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {msg.cardData.wind ?? '--'} km/h
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">{t('precipitation')}</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {msg.cardData.rainProb ?? 0} mm
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <span className="text-[10px] text-slate-400 px-1 block">
                  {msg.time}
                </span>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Status indicator */}
      {(isListening || isSpeaking || voiceError) && (
        <div className="px-6 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 flex items-center justify-between">
          {isListening && (
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600" />
              </span>
              <span>{t('listening') || 'Listening... Speak your question'}</span>
            </div>
          )}

          {isSpeaking && !isListening && (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
              <span>WeatherGPT is speaking...</span>
            </div>
          )}

          {voiceError && (
            <div className="text-xs font-medium text-red-500">{voiceError}</div>
          )}

          {isSpeaking && (
            <button
              onClick={handleStopSpeaking}
              className="text-[11px] font-semibold text-rose-500 hover:underline cursor-pointer"
            >
              {t('stopReading')}
            </button>
          )}
        </div>
      )}

      {/* Suggestions Bar */}
      <div className="px-6 py-2 bg-slate-50/50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-semibold text-slate-400 shrink-0">
          {t('suggestions') || 'Suggestions'}:
        </span>

        {samplePrompts.slice(0, 3).map((p, i) => (
          <button
            key={i}
            onClick={() => {
              setInputText(p);
            }}
            className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-blue-50 text-slate-600 dark:text-slate-400 hover:text-blue-600 rounded-lg text-[11px] border border-slate-200 dark:border-slate-700 whitespace-nowrap transition cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSend}
        className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#151F32] flex items-center gap-3"
      >
        <input
          type="text"
          placeholder={
            isListening
              ? t('listening')
              : isSending
              ? 'WeatherGPT is thinking...'
              : t('askPlaceholder') || 'Ask WeatherGPT about rainfall, forecast, temperature...'
          }
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            setVoiceError('');
          }}
          disabled={isListening || isSending}
          className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner disabled:opacity-60"
        />

        {/* Microphone Button */}
        <button
          type="button"
          onClick={handleVoiceInput}
          disabled={isSending}
          className={`p-3 rounded-2xl shadow-md transition cursor-pointer ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20'
              : 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950'
          } disabled:opacity-50`}
          title={isListening ? 'Stop listening' : 'Ask using voice'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim() || isListening || isSending}
          className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center justify-center"
          title="Send message"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatPage;
