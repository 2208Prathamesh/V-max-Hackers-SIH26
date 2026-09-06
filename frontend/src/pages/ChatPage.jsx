import React, { useState, useRef, useEffect } from 'react';
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

export const ChatPage = () => {
  const {
    conversations,
    activeConversationId,
    sendChatMessage,
    createNewChat,
    formatTemp,
    addToast
  } = useWeather();
  const { language, setLanguage, t, supportedLanguages } = useLanguage();

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [playingMessageIndex, setPlayingMessageIndex] = useState(null);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId) || conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  // Speech Recognition Language Mapping
  const speechLangMap = {
    hi: 'hi-IN',
    mr: 'mr-IN',
    bn: 'bn-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    en: 'en-IN'
  };

  // Real Microphone Speech Recognition (Web Speech API)
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      addToast(t('voiceError'), 'warning');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = speechLangMap[language] || 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        addToast(t('listening'), 'info');
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          addToast('Microphone permission denied. Please allow mic access in your browser.', 'warning');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
      setIsListening(false);
      addToast(t('voiceError'), 'warning');
    }
  };

  // Clean Markdown & Formatting for Smooth Human-like Speech
  const cleanTextForSpeech = (rawText) => {
    return (rawText || '')
      .replace(/[*#_`~]/g, '') // remove markdown symbols
      .replace(/https?:\/\/\S+/g, '') // remove URLs
      .replace(/[🚨⚠️🌧️☀️🌾🌱📞💡•]/g, ' ') // remove emojis that make robotic sounds
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Natural Human-Like Text-to-Speech
  const handleSpeak = (text, msgIndex) => {
    if (playingMessageIndex === msgIndex) {
      window.speechSynthesis?.cancel();
      setPlayingMessageIndex(null);
      return;
    }

    if (!('speechSynthesis' in window)) {
      addToast('Speech synthesis not supported in this browser.', 'warning');
      return;
    }

    window.speechSynthesis.cancel();
    const cleanContent = cleanTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(cleanContent);

    const targetLangCode = speechLangMap[language] || 'en-IN';
    utterance.lang = targetLangCode;
    utterance.rate = 0.92; // Natural, comfortable conversational speaking pace
    utterance.pitch = 1.05; // Slightly warmer, lively tone

    // Pick best natural Indian voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        (v.lang === targetLangCode || v.lang.replace('_', '-').startsWith(language)) &&
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('India') || v.name.includes('Heera') || v.name.includes('Kalpana') || v.name.includes('Hemant'))
    ) || voices.find((v) => v.lang === targetLangCode || v.lang.replace('_', '-').startsWith(language)) || voices.find((v) => v.lang.includes('IN'));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onend = () => setPlayingMessageIndex(null);
    utterance.onerror = () => setPlayingMessageIndex(null);

    setPlayingMessageIndex(msgIndex);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText);
    setInputText('');
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

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
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Languages className="w-3.5 h-3.5 text-blue-500" />
            <select
              value={language}
              onChange={(e) => handleChatLanguageChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {supportedLanguages.map((l) => (
                <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                  {l.flag} {l.name} ({l.nativeName})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={createNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('newChat')}</span>
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {(!activeConv?.messages || activeConv.messages.length === 0) && (
          <div className="max-w-xl mx-auto text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
              <Bot className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('chat')}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {t('chatHeroDescription')}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {samplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputText(prompt);
                    sendChatMessage(prompt);
                  }}
                  className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium transition text-left"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Bubbles */}
        {activeConv?.messages?.map((msg, index) => {
          const isUser = msg.sender === 'user';
          const isPlaying = playingMessageIndex === index;

          return (
            <div
              key={index}
              className={`flex items-start gap-3.5 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold shrink-0 shadow-xs ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 dark:bg-slate-800 text-blue-400 border border-slate-700/60'
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
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Natural TTS Voice Button */}
                  {!isUser && (
                    <button
                      onClick={() => handleSpeak(msg.text, index)}
                      className={`mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition border ${
                        isPlaying
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-blue-500'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                          <span>{t('stopVoice')}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-blue-500" />
                          <span>{t('piperVoice')}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <span className="text-[10px] text-slate-400 block px-1">{msg.time}</span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar with Real Microphone STT Button */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#151F32] flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSpeechRecognition}
          className={`p-3 rounded-2xl border transition flex items-center justify-center ${
            isListening
              ? 'bg-rose-500 text-white border-rose-600 animate-pulse ring-4 ring-rose-500/30'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700'
          }`}
          title="Real Microphone Speech Recognition"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          placeholder={isListening ? t('listening') : t('askPlaceholder')}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl shadow-md shadow-blue-500/20 transition cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default ChatPage;
