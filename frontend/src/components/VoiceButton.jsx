import { useEffect, useState } from "react";

import {
  createSpeechRecognizer,
  speakText,
  stopSpeaking,
} from "../services/speechService";

const VoiceButton = ({
  onTranscript,
  responseText,
}) => {
  const [isListening, setIsListening] =
    useState(false);

  const [isSpeaking, setIsSpeaking] =
    useState(false);

  const [error, setError] =
    useState("");

  // ===============================
  // Start Voice Recognition
  // ===============================

  const startListening = () => {
    setError("");

    try {
      const recognition =
        createSpeechRecognizer();

      recognition.onstart = () => {
        console.log(
          "🎤 Voice recognition started"
        );

        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript =
          event.results[0][0].transcript;

        console.log(
          "📝 User said:",
          transcript
        );

        setIsListening(false);

        if (onTranscript) {
          onTranscript(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.error(
          "❌ Speech recognition error:",
          event.error
        );

        setIsListening(false);

        setError(
          `Voice error: ${event.error}`
        );
      };

      recognition.onend = () => {
        console.log(
          "🎤 Voice recognition ended"
        );

        setIsListening(false);
      };

      recognition.start();

    } catch (error) {
      console.error(
        "❌ Voice recognition failed:",
        error
      );

      setError(error.message);
      setIsListening(false);
    }
  };


  // ===============================
  // Speak WeatherGPT Response
  // ===============================

  const handleSpeak = () => {
    if (!responseText) return;

    stopSpeaking();

    setIsSpeaking(true);

    speakText(
      responseText,
      "en-IN"
    );

    // Approximate speaking completion
    const estimatedTime =
      Math.max(
        responseText.length * 60,
        2000
      );

    setTimeout(() => {
      setIsSpeaking(false);
    }, estimatedTime);
  };


  // ===============================
  // Stop Speaking
  // ===============================

  const handleStopSpeaking = () => {
    stopSpeaking();

    setIsSpeaking(false);
  };


  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);


  return (
    <div className="voice-container">

      {/* Microphone */}

      <button
        type="button"
        onClick={startListening}
        disabled={isListening}
        title="Speak to WeatherGPT"
      >
        {isListening
          ? "🔴 Listening..."
          : "🎤 Speak"}
      </button>


      {/* Speak Response */}

      {responseText && (
        <button
          type="button"
          onClick={
            isSpeaking
              ? handleStopSpeaking
              : handleSpeak
          }
        >
          {isSpeaking
            ? "⏹ Stop"
            : "🔊 Listen"}
        </button>
      )}


      {/* Error */}

      {error && (
        <p className="voice-error">
          {error}
        </p>
      )}

    </div>
  );
};

export default VoiceButton;