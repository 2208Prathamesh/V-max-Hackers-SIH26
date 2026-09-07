import React, { useState, useEffect } from 'react'
import { useWeather } from '../context/WeatherContext'
import { useTheme } from '../context/ThemeContext'
import { api } from '../services/api'
import {
  MapPin,
  BarChart3,
  CalendarDays,
  ChevronDown,
  Download,
  ThermometerSun,
  CloudRain,
  Leaf,
  Snowflake,
  Info,
  Search
} from 'lucide-react'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts'

const temperatureData = [
  { month: 'Jan', max: 29, avg: 21, min: 14 },
  { month: 'Feb', max: 32, avg: 23, min: 15 },
  { month: 'Mar', max: 35, avg: 26, min: 17 },
  { month: 'Apr', max: 38, avg: 28, min: 18 },
  { month: 'May', max: 37, avg: 28, min: 19 },
  { month: 'Jun', max: 33, avg: 25, min: 18 },
  { month: 'Jul', max: 30, avg: 22, min: 15 },
  { month: 'Aug', max: 28, avg: 21, min: 14 },
  { month: 'Sep', max: 27, avg: 21, min: 14 },
  { month: 'Oct', max: 28, avg: 22, min: 14 },
  { month: 'Nov', max: 30, avg: 23, min: 15 },
  { month: 'Dec', max: 31, avg: 23, min: 15 }
]

const rainfallData = [
  { year: '2016', rainfall: 580 },
  { year: '2017', rainfall: 420 },
  { year: '2018', rainfall: 650 },
  { year: '2019', rainfall: 950 },
  { year: '2020', rainfall: 620 },
  { year: '2021', rainfall: 680 },
  { year: '2022', rainfall: 1020 },
  { year: '2023', rainfall: 690 },
  { year: '2024', rainfall: 750 },
  { year: '2025', rainfall: 620 }
]

const extremeData = [
  { year: '2016', heat: 18, heavy: 7, veryHeavy: 3 },
  { year: '2017', heat: 16, heavy: 6, veryHeavy: 2 },
  { year: '2018', heat: 19, heavy: 8, veryHeavy: 3 },
  { year: '2019', heat: 24, heavy: 7, veryHeavy: 4 },
  { year: '2020', heat: 19, heavy: 8, veryHeavy: 4 },
  { year: '2021', heat: 25, heavy: 9, veryHeavy: 3 },
  { year: '2022', heat: 19, heavy: 7, veryHeavy: 4 },
  { year: '2023', heat: 20, heavy: 8, veryHeavy: 3 },
  { year: '2024', heat: 21, heavy: 8, veryHeavy: 4 },
  { year: '2025', heat: 25, heavy: 9, veryHeavy: 4 }
]

function Card ({ children, className = '' }) {
  return (
    <div
      className={`bg-white dark:bg-[#151F32] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm ${className}`}
    >
      {children}
    </div>
  )
}

function Filter ({ icon: Icon, title, value }) {
  return (
    <div className='flex-1'>
      <div className='text-xs font-medium text-slate-600 dark:text-slate-400 mb-2'>
        {title}
      </div>

      <div className='h-12 border border-slate-200 dark:border-slate-800 rounded-xl px-3 flex items-center justify-between bg-white dark:bg-[#151F32]'>
        <div className='flex items-center gap-2'>
          <Icon size={18} className='text-blue-600 dark:text-blue-400' />
          <span className='text-sm text-slate-700 dark:text-slate-300'>
            {value}
          </span>
        </div>

        <ChevronDown size={17} className='text-slate-500 dark:text-slate-600' />
      </div>
    </div>
  )
}

function Insight ({ icon: Icon, title, children, color }) {
  return (
    <div className={`rounded-xl p-4 ${color} dark:bg-slate-800/40`}>
      <div className='flex gap-3'>
        <div className='w-11 h-11 rounded-xl bg-white/70 dark:bg-slate-700/50 flex items-center justify-center'>
          <Icon size={23} className='text-slate-800 dark:text-slate-200' />
        </div>

        <div className='flex-1'>
          <h4 className='font-semibold text-slate-800 dark:text-slate-200'>
            {title}
          </h4>
          <p className='text-sm text-slate-600 dark:text-slate-400 mt-1 leading-5'>
            {children}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ClimateHistorical () {
  const { selectedMapLocation, addToast, formatTemp } = useWeather()
  const { isDark } = useTheme()

  const [historicalData, setHistoricalData] = useState([])
  const [climateTrends, setClimateTrends] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Aggregation utility: Daily raw data -> Monthly aggregates
  const aggregateMonthlyData = daily => {
    if (!daily || !daily.temperature_2m_max) return []

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ]
    const monthlyStats = Array.from({ length: 12 }, () => ({
      max: [],
      avg: [],
      min: []
    }))

    daily.time.forEach((time, index) => {
      const month = new Date(time).getMonth()
      monthlyStats[month].max.push(daily.temperature_2m_max[index])
      monthlyStats[month].avg.push(daily.temperature_2m_mean[index])
      monthlyStats[month].min.push(daily.temperature_2m_min[index])
    })

    return months.map((month, i) => ({
      month,
      max: Math.max(...monthlyStats[i].max),
      avg:
        monthlyStats[i].avg.reduce((a, b) => a + b, 0) /
        monthlyStats[i].avg.length,
      min: Math.min(...monthlyStats[i].min)
    }))
  }

  useEffect(() => {
    let isMounted = true // to avoid state updates after unmount
    const timeoutPromise = ms =>
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), ms)
      )
    const fetchData = async () => {
      if (!selectedMapLocation) {
        console.log('[CLIMATE DEBUG] No selected location, aborting fetch')
        return
      }

      console.log('[CLIMATE DEBUG] Request start')
      const startTime = Date.now()
      setIsLoading(true)
      try {
        const lat = selectedMapLocation.lat ?? selectedMapLocation.latitude
        const lon = selectedMapLocation.lng ?? selectedMapLocation.longitude
        const cityName = selectedMapLocation.city
        console.log('[CLIMATE DEBUG] API call start for history')
        const historyPromise = api.climateHistory({
          city: cityName,
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        })
        const historyRes = await Promise.race([
          historyPromise,
          timeoutPromise(10000)
        ])
        console.log('[CLIMATE DEBUG] History response received')
        if (historyRes?.data && isMounted) {
          setHistoricalData(aggregateMonthlyData(historyRes.data))
          console.log('[CLIMATE DEBUG] Historical data state updated')
        }

        console.log('[CLIMATE DEBUG] API call start for trends')
        const trendsPromise = api.climateTrends({ city: cityName })
        const trendsRes = await Promise.race([
          trendsPromise,
          timeoutPromise(10000)
        ])
        console.log('[CLIMATE DEBUG] Trends response received')
        if (trendsRes?.data && isMounted) {
          setClimateTrends(trendsRes.data)
          console.log('[CLIMATE DEBUG] Climate trends state updated')
        }
      } catch (error) {
        console.error('[CLIMATE DEBUG] Fetch error:', error)
        addToast(error.message || 'Failed to load climate data', 'warning')
      } finally {
        if (isMounted) setIsLoading(false)
        console.log(
          `[CLIMATE DEBUG] Loading set to false after ${
            Date.now() - startTime
          }ms`
        )
      }
    }
    fetchData()
    return () => {
      isMounted = false
      console.log(
        '[CLIMATE DEBUG] Component unmounted, canceling pending updates'
      )
    }
  }, [selectedMapLocation])

  return (
    <div className='min-h-screen bg-[#f5f8fc] dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 relative'>
      {isLoading && (
        <div className='absolute inset-0 z-50 bg-white/60 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center'>
          <div className='flex flex-col items-center gap-3'>
            <div className='w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin' />
            <p className='text-sm font-medium text-slate-600 dark:text-slate-400'>
              Fetching climate data...
            </p>
          </div>
        </div>
      )}

      {/* TOP HEADER */}
      <header className='h-24 bg-white dark:bg-[#151F32] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8'>
        <div>
          <h1 className='text-3xl font-bold text-slate-900 dark:text-white'>
            Climate & Historical Data
          </h1>

          <p className='text-slate-500 dark:text-slate-400 mt-1'>
            Explore long-term weather patterns, trends, and climate insights for
            a more informed tomorrow.
          </p>
        </div>

        <div className='flex items-center gap-5'>
          <div className='w-11 h-11 rounded-full bg-[#54739f] text-white flex items-center justify-center font-semibold'>
            S
          </div>
        </div>
      </header>

      {/* TABS */}
      <div className='px-8 bg-white dark:bg-[#151F32] border-b border-slate-200 dark:border-slate-800'>
        <div className='flex gap-8'>
          <button className='py-4 border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'>
            Historical Weather
          </button>

          <button className='py-4 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition'>
            Climate Trends
          </button>

          <button className='py-4 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition'>
            Comparisons
          </button>

          <button className='py-4 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition'>
            Extreme Events
          </button>
        </div>
      </div>

      <main className='p-7 space-y-6'>
        {/* FILTERS */}
        <Card className='p-4'>
          <div className='flex items-end gap-5'>
            <Filter
              icon={MapPin}
              title='Location'
              value={selectedMapLocation?.city || 'Loading...'}
            />

            <Filter
              icon={BarChart3}
              title='Data Type'
              value='Temperature & Rainfall'
            />

            <Filter
              icon={CalendarDays}
              title='Time Range'
              value='Last 20 Years'
            />

            <Filter
              icon={BarChart3}
              title='Aggregation'
              value='Yearly/Monthly'
            />
          </div>
        </Card>

        {/* MAIN ROW */}
        <div className='grid grid-cols-[2fr_0.85fr] gap-6'>
          {/* TEMPERATURE */}
          <Card className='p-5'>
            <div className='flex items-start justify-between mb-5'>
              <div>
                <h2 className='text-xl font-bold'>
                  Average Monthly Temperature (
                  {selectedMapLocation?.city || 'Selected Location'})
                </h2>

                <p className='text-slate-500'>2016 – 2025</p>
              </div>

              <button className='border border-slate-200 rounded-xl px-4 py-2 flex gap-2 items-center text-sm'>
                <Download size={17} />
                Download
                <ChevronDown size={15} />
              </button>
            </div>

            <div className='h-[310px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={historicalData}>
                  <CartesianGrid
                    strokeDasharray='2 4'
                    stroke={isDark ? '#334155' : '#e5e7eb'}
                  />

                  <XAxis
                    dataKey='month'
                    tick={{ fill: isDark ? '#94a3b8' : '#475569' }}
                  />

                  <YAxis
                    domain={[5, 45]}
                    tick={{ fill: isDark ? '#94a3b8' : '#475569' }}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#151F32' : '#fff',
                      borderColor: isDark ? '#334155' : '#e5e7eb',
                      color: isDark ? '#fff' : '#000'
                    }}
                  />

                  <Line
                    type='monotone'
                    dataKey='max'
                    stroke='#ef6461'
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    name='Max Temp'
                  />

                  <Line
                    type='monotone'
                    dataKey='avg'
                    stroke='#3478d5'
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    name='Avg Temp'
                  />

                  <Line
                    type='monotone'
                    dataKey='min'
                    stroke='#42a878'
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    name='Min Temp'
                  />

                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* INSIGHTS */}
          <Card className='p-5'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl font-bold'>Key Climate Insights</h2>

              <Info size={19} className='text-slate-500' />
            </div>

            <div className='space-y-2'>
              <Insight
                icon={ThermometerSun}
                title='Temperature Trend'
                color='bg-red-50'
              >
                {climateTrends?.climateShift.warmingTrendDetected
                  ? `Average temperature has increased by ${climateTrends.climateShift.temperatureShiftC}°C over the long term.`
                  : `Temperature has remained stable with a shift of ${
                      climateTrends?.climateShift.temperatureShiftC || 0
                    }°C.`}
              </Insight>

              <Insight
                icon={CloudRain}
                title='Annual Rainfall'
                color='bg-blue-50'
              >
                Average annual rainfall is{' '}
                {climateTrends?.baselineNormals.avgAnnualRainfallMm || '--'} mm.
              </Insight>

              <Insight
                icon={Leaf}
                title='Precipitation Shift'
                color='bg-green-50'
              >
                Annual rainfall has changed by{' '}
                {climateTrends?.climateShift.rainfallChangePercent || 0}%
                compared to the baseline.
              </Insight>

              <Insight
                icon={Snowflake}
                title='Baseline Temp'
                color='bg-indigo-50'
              >
                The baseline average annual temperature is{' '}
                {climateTrends?.baselineNormals.avgAnnualTemperatureC || '--'}
                °C.
              </Insight>
            </div>
          </Card>
        </div>

        {/* LOWER ROW */}
        <div className='grid grid-cols-3 gap-6'>
          {/* RAINFALL */}
          <Card className='p-5'>
            <div className='flex justify-between mb-5'>
              <h2 className='font-bold text-lg'>Annual Rainfall</h2>

              <button className='border rounded-lg p-2'>
                <Download size={16} />
              </button>
            </div>

            <div className='h-[220px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={climateTrends?.yearlyTrends || []}>
                  <CartesianGrid
                    strokeDasharray='2 4'
                    stroke={isDark ? '#334155' : '#e5e7eb'}
                  />

                  <XAxis
                    dataKey='year'
                    tick={{ fill: isDark ? '#94a3b8' : '#475569' }}
                  />

                  <YAxis tick={{ fill: isDark ? '#94a3b8' : '#475569' }} />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#151F32' : '#fff',
                      borderColor: isDark ? '#334155' : '#e5e7eb',
                      color: isDark ? '#fff' : '#000'
                    }}
                  />

                  <Bar
                    dataKey='annualRainfallMm'
                    fill='#66a4e8'
                    radius={[4, 4, 0, 0]}
                    name='Annual Rainfall (mm)'
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* EXTREME WEATHER */}
          <Card className='p-5 col-span-1'>
            <div className='flex justify-between mb-5'>
              <h2 className='font-bold text-lg'>
                Extreme Weather Days (Per Year)
              </h2>

              <button className='border rounded-lg p-2'>
                <Download size={16} />
              </button>
            </div>

            <div className='h-[220px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={climateTrends?.yearlyTrends || []}>
                  <CartesianGrid
                    strokeDasharray='2 4'
                    stroke={isDark ? '#334155' : '#e5e7eb'}
                  />

                  <XAxis
                    dataKey='year'
                    tick={{ fill: isDark ? '#94a3b8' : '#475569' }}
                  />

                  <YAxis tick={{ fill: isDark ? '#94a3b8' : '#475569' }} />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#151F32' : '#fff',
                      borderColor: isDark ? '#334155' : '#e5e7eb',
                      color: isDark ? '#fff' : '#000'
                    }}
                  />

                  <Bar
                    dataKey='extremeHeatDays'
                    fill='#f4a261'
                    name='Heatwave Days (> 40°C)'
                  />

                  <Bar
                    dataKey='heavyRainDays'
                    fill='#3478d5'
                    name='Heavy Rainfall Days (> 50 mm)'
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* COMPARISON */}
          <Card className='p-5'>
            <div className='flex justify-between'>
              <h2 className='font-bold text-lg'>Climate Comparison</h2>

              <ChevronDown size={18} />
            </div>

            <div className='mt-8 flex items-end justify-around h-[190px]'>
              {[
                ['Pune', '24.1°C', 'bg-blue-400'],
                ['Mumbai', '27.2°C', 'bg-green-400'],
                ['Bengaluru', '25.6°C', 'bg-orange-300'],
                ['Delhi', '28.4°C', 'bg-red-400']
              ].map(([city, temp, color]) => (
                <div
                  key={city}
                  className='flex flex-col items-center justify-end h-full'
                >
                  <span className='font-bold mb-2'>{temp}</span>

                  <div
                    className={`${color} w-12 rounded-t-lg`}
                    style={{
                      height: `${parseFloat(temp) * 5}px`
                    }}
                  />

                  <span className='text-sm mt-2'>{city}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
