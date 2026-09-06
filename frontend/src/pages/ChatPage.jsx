import React, { useState, useRef, useEffect } from 'react'
import { useWeather } from '../context/WeatherContext'
import {
  Send,
  Sparkles,
  Bot,
  User,
  MapPin,
  Wind,
  Droplets,
  CloudRain,
  Plus,
  Compass,
  RefreshCw
} from 'lucide-react'
import { WeatherIcon } from '../components/common/WeatherIcon'

export const ChatPage = () => {
  const {
    conversations,
    activeConversationId,
    sendChatMessage,
    createNewChat,
    formatTemp,
    formatWind,
    addToast
  } = useWeather()
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef(null)

  const activeConv =
    conversations.find(c => c.id === activeConversationId) || conversations[0]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConv?.messages])

  const handleSend = async e => {
    e?.preventDefault()
    if (!inputText.trim()) return
    const message = inputText
    setInputText('')
    try {
      await sendChatMessage(message)
    } catch (error) {
      addToast(error.message || 'Could not send message', 'warning')
    }
  }

  const samplePrompts = [
    'Will it rain tomorrow in Pune?',
    'Show cyclone track in Bay of Bengal',
    'What is the AQI in Delhi right now?',
    'Best time to visit Himachal Pradesh?',
    'Weekend forecast for Lonavala trip'
  ]

  return (
    <div className='h-[calc(100vh-140px)] flex flex-col bg-white dark:bg-[#151F32] rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-card overflow-hidden'>
      {/* Chat Header */}
      <div className='px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white flex items-center justify-center shadow-md shadow-blue-500/20'>
            <Sparkles className='w-5 h-5' />
          </div>
          <div>
            <h3 className='text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2'>
              <span>{activeConv?.title || 'WeatherGPT Assistant'}</span>
              <span className='px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-600'>
                Online • Radar Connected
              </span>
            </h3>
            <p className='text-xs text-slate-400'>
              Powered by high-precision IMD & ECMWF satellite data
            </p>
          </div>
        </div>

        <button
          onClick={createNewChat}
          className='flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-semibold transition'
        >
          <Plus className='w-3.5 h-3.5' />
          <span>New Chat</span>
        </button>
      </div>

      {/* Messages Stream */}
      <div className='flex-1 overflow-y-auto p-6 space-y-6'>
        {/* Welcome Box if empty */}
        {(!activeConv?.messages || activeConv.messages.length === 0) && (
          <div className='max-w-xl mx-auto text-center py-12 space-y-4'>
            <div className='w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner'>
              <Bot className='w-8 h-8' />
            </div>
            <h3 className='text-lg font-bold text-slate-900 dark:text-white'>
              How can WeatherGPT help you today?
            </h3>
            <p className='text-xs text-slate-500 max-w-sm mx-auto leading-relaxed'>
              Ask any question about weather forecasts, precipitation
              probabilities, severe storm alerts, or travel safety advisories.
            </p>

            <div className='flex flex-wrap items-center justify-center gap-2 pt-2'>
              {samplePrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputText(prompt)
                    sendChatMessage(prompt).catch(error =>
                      addToast(
                        error.message || 'Could not send message',
                        'warning'
                      )
                    )
                  }}
                  className='px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium transition text-left'
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Render Messages */}
        {activeConv?.messages?.map((msg, index) => {
          const isUser = msg.sender === 'user'
          return (
            <div
              key={index}
              className={`flex items-start gap-3.5 ${
                isUser ? 'flex-row-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold shrink-0 shadow-xs ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 dark:bg-slate-800 text-blue-400 border border-slate-700/60'
                }`}
              >
                {isUser ? (
                  <User className='w-4 h-4' />
                ) : (
                  <Bot className='w-4 h-4' />
                )}
              </div>

              {/* Bubble */}
              <div
                className={`space-y-2 max-w-xl ${
                  isUser ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-xs'
                  }`}
                >
                  <p className='whitespace-pre-line'>{msg.text}</p>
                </div>

                {/* Weather Data Card inside chat bubble if attached */}
                {msg.cardData && (
                  <div className='p-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900 shadow-md space-y-3'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white'>
                        <MapPin className='w-3.5 h-3.5 text-blue-600' />
                        <span>{msg.cardData.city}</span>
                      </div>
                      <span className='text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600'>
                        {msg.cardData.condition}
                      </span>
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='text-2xl font-black text-slate-900 dark:text-white'>
                        {formatTemp(msg.cardData.temp)}
                      </div>
                      <WeatherIcon
                        condition={msg.cardData.condition}
                        className='w-8 h-8'
                      />
                    </div>

                    <div className='grid grid-cols-3 gap-2 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-500'>
                      <div>
                        Rain:{' '}
                        <span className='font-bold text-slate-800 dark:text-slate-200'>
                          {msg.cardData.rainProb}
                        </span>
                      </div>
                      <div>
                        Humidity:{' '}
                        <span className='font-bold text-slate-800 dark:text-slate-200'>
                          {msg.cardData.humidity}
                        </span>
                      </div>
                      <div>
                        Wind:{' '}
                        <span className='font-bold text-slate-800 dark:text-slate-200'>
                          {msg.cardData.wind}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <span className='text-[10px] text-slate-400 block px-1'>
                  {msg.time}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Action Chips */}
      <div className='px-6 py-2 bg-slate-50/50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none'>
        <span className='text-[10px] font-semibold text-slate-400 shrink-0'>
          Suggestions:
        </span>
        {samplePrompts.slice(0, 3).map((p, i) => (
          <button
            key={i}
            onClick={() => {
              setInputText(p)
            }}
            className='px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-blue-50 text-slate-600 dark:text-slate-400 hover:text-blue-600 rounded-lg text-[11px] border border-slate-200 dark:border-slate-700 whitespace-nowrap transition'
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <form
        onSubmit={handleSend}
        className='p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#151F32] flex items-center gap-3'
      >
        <input
          type='text'
          placeholder='Ask WeatherGPT about rainfall, forecast, temperature, or travel safety...'
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          className='flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner'
        />
        <button
          type='submit'
          disabled={!inputText.trim()}
          className='p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl shadow-md shadow-blue-500/20 transition cursor-pointer'
        >
          <Send className='w-4 h-4' />
        </button>
      </form>
    </div>
  )
}
