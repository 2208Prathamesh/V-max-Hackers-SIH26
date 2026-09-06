import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";

import { useWeather } from "../context/WeatherContext";

import {
  Send,
  Sparkles,
  Bot,
  User,
  MapPin,
  Plus,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from "lucide-react";

import { WeatherIcon } from "../components/common/WeatherIcon";

import {
  createSpeechRecognizer,
  speakText,
  stopSpeaking,
} from "../services/speechService";

export const ChatPage = () => {
  const {
    conversations,
    activeConversationId,
    sendChatMessage,
    createNewChat,
    formatTemp,
  } = useWeather();

  const [inputText, setInputText] = useState("");

  const [isListening, setIsListening] = useState(false);

  const [isSpeaking, setIsSpeaking] = useState(false);

  const [voiceError, setVoiceError] = useState("");

  const messagesEndRef = useRef(null);

  const recognitionRef = useRef(null);

  /*
   * Used to identify whether the current question
   * came from voice.
   *
   * Voice question  → automatically speak AI answer
   * Typed question  → don't automatically speak
   */
  const voiceRequestRef = useRef(false);

  const activeConv =
    conversations.find(
      (c) => c.id === activeConversationId
    ) || conversations[0];

  /*
   * Scroll chat to bottom
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [activeConv?.messages]);

  /*
   * Stop current speech
   */
  const handleStopSpeaking = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  /*
   * Speak WeatherGPT response
   */
  const handleSpeak = useCallback(
    (text) => {
      if (!text?.trim()) return;

      setVoiceError("");

      speakText(
        text,
        "en-IN",
        () => {
          setIsSpeaking(true);
        },
        () => {
          setIsSpeaking(false);
        },
        (error) => {
          setIsSpeaking(false);
          setVoiceError(error);
        }
      );
    },
    []
  );

  /*
   * Automatically speak only the response
   * generated from a voice question.
   */
  useEffect(() => {
    if (!activeConv?.messages?.length) return;

    const lastMessage =
      activeConv.messages[
        activeConv.messages.length - 1
      ];

    if (
      voiceRequestRef.current &&
      lastMessage?.sender === "assistant" &&
      lastMessage?.text
    ) {
      voiceRequestRef.current = false;

      handleSpeak(lastMessage.text);
    }
  }, [activeConv?.messages, handleSpeak]);

  /*
   * Send typed message
   */
  const handleSend = (e) => {
    e?.preventDefault();

    if (!inputText.trim()) return;

    /*
     * This is NOT a voice request.
     */
    voiceRequestRef.current = false;

    /*
     * Stop any existing speech.
     */
    handleStopSpeaking();

    sendChatMessage(inputText);

    setInputText("");
  };

  /*
   * Start voice recognition
   */
  const handleVoiceInput = () => {
    setVoiceError("");

    /*
     * If already listening,
     * clicking microphone again stops it.
     */
    if (isListening) {
      stopListening();
      return;
    }

    try {
      const recognition = createSpeechRecognizer();

      recognitionRef.current = recognition;

      /*
       * Recognition started
       */
      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError("");
      };

      /*
       * Speech recognized
       */
      recognition.onresult = (event) => {
        const transcript =
          event.results?.[0]?.[0]?.transcript?.trim();

        setIsListening(false);

        recognitionRef.current = null;

        if (!transcript) {
          setVoiceError(
            "I could not understand your voice. Please try again."
          );
          return;
        }

        /*
         * Show recognized text temporarily
         */
        setInputText(transcript);

        /*
         * Mark this request as a voice request.
         * The AI response will automatically be spoken.
         */
        voiceRequestRef.current = true;

        /*
         * Stop currently speaking response
         */
        handleStopSpeaking();

        /*
         * Send voice question to WeatherGPT
         */
        sendChatMessage(transcript);

        /*
         * Clear input after sending
         */
        setInputText("");
      };

      /*
       * Recognition error
       */
      recognition.onerror = (event) => {
        console.error(
          "Speech recognition error:",
          event.error
        );

        setIsListening(false);

        recognitionRef.current = null;

        /*
         * Ignore normal abort
         */
        if (event.error === "aborted") {
          return;
        }

        let message =
          "Unable to recognize your voice. Please try again.";

        if (event.error === "not-allowed") {
          message =
            "Microphone permission was denied. Please allow microphone access.";
        } else if (event.error === "no-speech") {
          message =
            "No speech detected. Please speak again.";
        } else if (event.error === "audio-capture") {
          message =
            "No microphone was found. Please check your microphone.";
        }

        setVoiceError(message);
      };

      /*
       * Recognition ended
       */
      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      /*
       * Start microphone
       */
      recognition.start();
    } catch (error) {
      console.error(
        "Unable to start speech recognition:",
        error
      );

      setIsListening(false);
      recognitionRef.current = null;

      setVoiceError(
        error.message ||
          "Voice input is not supported in this browser."
      );
    }
  };

  /*
   * Stop voice recognition
   */
  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
    } catch (error) {
      console.error(
        "Error stopping recognition:",
        error
      );
    }

    recognitionRef.current = null;

    setIsListening(false);
  };

  /*
   * Create new chat
   */
  const handleNewChat = () => {
    stopListening();
    handleStopSpeaking();

    voiceRequestRef.current = false;

    setInputText("");
    setVoiceError("");

    createNewChat();
  };

  /*
   * Cleanup when leaving page
   */
  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch (error) {
        console.error(error);
      }

      recognitionRef.current = null;

      stopSpeaking();
    };
  }, []);

  /*
   * Sample questions
   */
  const samplePrompts = [
    "Will it rain tomorrow in Pune?",
    "Show cyclone track in Bay of Bengal",
    "What is the AQI in Delhi right now?",
    "Best time to visit Himachal Pradesh?",
    "Weekend forecast for Lonavala trip",
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white dark:bg-[#151F32] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-card overflow-hidden">

      {/* =====================================================
          CHAT HEADER
      ====================================================== */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>

          <div>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">

              <span>
                {activeConv?.title ||
                  "WeatherGPT Assistant"}
              </span>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-600">
                Online • Radar Connected
              </span>

            </h3>

            <p className="text-xs text-slate-400">
              Powered by high-precision IMD &
              ECMWF satellite data
            </p>

          </div>

        </div>

        <button
          onClick={handleNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-semibold transition"
        >
          <Plus className="w-3.5 h-3.5" />

          <span>New Chat</span>
        </button>

      </div>

      {/* =====================================================
          MESSAGES
      ====================================================== */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Empty chat */}
        {(!activeConv?.messages ||
          activeConv.messages.length === 0) && (

          <div className="max-w-xl mx-auto text-center py-12 space-y-4">

            <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
              <Bot className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              How can WeatherGPT help you today?
            </h3>

            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Ask any question about weather forecasts,
              precipitation probabilities, severe storm
              alerts, or travel safety advisories.
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
                  className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium transition text-left"
                >
                  "{prompt}"
                </button>

              ))}

            </div>

          </div>
        )}

        {/* =====================================================
            CHAT MESSAGES
        ====================================================== */}

        {activeConv?.messages?.map(
          (msg, index) => {

            const isUser =
              msg.sender === "user";

            return (
              <div
                key={index}
                className={`flex items-start gap-3.5 ${
                  isUser
                    ? "flex-row-reverse"
                    : ""
                }`}
              >

                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold shrink-0 shadow-xs ${
                    isUser
                      ? "bg-blue-600 text-white"
                      : "bg-slate-900 dark:bg-slate-800 text-blue-400 border border-slate-700/60"
                  }`}
                >
                  {isUser ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                <div
                  className={`space-y-2 max-w-xl ${
                    isUser
                      ? "items-end"
                      : "items-start"
                  }`}
                >

                  {/* Message */}
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      isUser
                        ? "bg-blue-600 text-white rounded-tr-xs"
                        : "bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-xs"
                    }`}
                  >

                    <p className="whitespace-pre-line">
                      {msg.text}
                    </p>

                  </div>

                  {/* =================================================
                      VOICE OUTPUT BUTTON
                  ================================================== */}
                  {!isUser && msg.text && (

                    <div className="flex items-center gap-2 px-1">

                      <button
                        type="button"
                        onClick={() => {

                          if (isSpeaking) {
                            handleStopSpeaking();
                          } else {
                            handleSpeak(msg.text);
                          }

                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-100 dark:border-blue-900 transition"
                        title={
                          isSpeaking
                            ? "Stop speaking"
                            : "Read answer aloud"
                        }
                      >

                        {isSpeaking ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            Listen
                          </>
                        )}

                      </button>

                    </div>

                  )}

                  {/* =================================================
                      WEATHER CARD
                  ================================================== */}

                  {msg.cardData && (

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900 shadow-md space-y-3">

                      <div className="flex items-center justify-between">

                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">

                          <MapPin className="w-3.5 h-3.5 text-blue-600" />

                          <span>
                            {msg.cardData.city}
                          </span>

                        </div>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600">
                          {msg.cardData.condition}
                        </span>

                      </div>

                      <div className="flex items-center justify-between">

                        <div className="text-2xl font-black text-slate-900 dark:text-white">
                          {formatTemp(
                            msg.cardData.temp
                          )}
                        </div>

                        <WeatherIcon
                          condition={
                            msg.cardData.condition
                          }
                          className="w-8 h-8"
                        />

                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-500">

                        <div>
                          Rain:{" "}
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {msg.cardData.rainProb}
                          </span>
                        </div>

                        <div>
                          Humidity:{" "}
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {msg.cardData.humidity}
                          </span>
                        </div>

                        <div>
                          Wind:{" "}
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {msg.cardData.wind}
                          </span>
                        </div>

                      </div>

                    </div>

                  )}

                  <span className="text-[10px] text-slate-400 block px-1">
                    {msg.time}
                  </span>

                </div>

              </div>
            );
          }
        )}

        <div ref={messagesEndRef} />

      </div>

      {/* =====================================================
          VOICE STATUS
      ====================================================== */}

      {(isListening ||
        isSpeaking ||
        voiceError) && (

        <div className="px-6 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30">

          {isListening && (

            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400">

              <span className="relative flex h-2.5 w-2.5">

                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />

                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600" />

              </span>

              Listening... Speak your question

            </div>

          )}

          {isSpeaking && !isListening && (

            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">

              <Volume2 className="w-3.5 h-3.5 animate-pulse" />

              WeatherGPT is speaking...

            </div>

          )}

          {voiceError && (

            <div className="text-xs font-medium text-red-500">
              {voiceError}
            </div>

          )}

        </div>

      )}

      {/* =====================================================
          SUGGESTIONS
      ====================================================== */}

      <div className="px-6 py-2 bg-slate-50/50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">

        <span className="text-[10px] font-semibold text-slate-400 shrink-0">
          Suggestions:
        </span>

        {samplePrompts.slice(0, 3).map(
          (p, i) => (

            <button
              key={i}
              onClick={() => {
                setInputText(p);
              }}
              className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-blue-50 text-slate-600 dark:text-slate-400 hover:text-blue-600 rounded-lg text-[11px] border border-slate-200 dark:border-slate-700 whitespace-nowrap transition"
            >
              {p}
            </button>

          )
        )}

      </div>

      {/* =====================================================
          INPUT AREA
      ====================================================== */}

      <form
        onSubmit={handleSend}
        className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#151F32] flex items-center gap-3"
      >

        {/* TEXT INPUT */}

        <input
          type="text"
          placeholder={
            isListening
              ? "Listening..."
              : "Ask WeatherGPT about rainfall, forecast, temperature, or travel safety..."
          }
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            setVoiceError("");
          }}
          disabled={isListening}
          className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner disabled:opacity-60"
        />

        {/* =================================================
            MICROPHONE BUTTON
        ================================================== */}

        <button
          type="button"
          onClick={handleVoiceInput}
          className={`p-3 rounded-2xl shadow-md transition ${
            isListening
              ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
              : "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
          }`}
          title={
            isListening
              ? "Stop listening"
              : "Ask using voice"
          }
        >

          {isListening ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}

        </button>

        {/* =================================================
            SEND BUTTON
        ================================================== */}

        <button
          type="submit"
          disabled={!inputText.trim() || isListening}
          className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl shadow-md shadow-blue-500/20 transition cursor-pointer"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>

      </form>

    </div>
  );
};