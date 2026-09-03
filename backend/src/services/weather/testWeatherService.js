import { getWeather } from './weatherService.js'

async function test () {
  try {
    console.log('Fetching complete weather data...\n')

    const result = await getWeather(31.1, 77.17)

    console.log('=================================')
    console.log('WEATHER SERVICE API TEST')
    console.log('=================================\n')

    console.log('LOCATION:')
    console.log(result.location)

    console.log('\nFORECAST:')
    console.log(JSON.stringify(result.forecast, null, 2))

    console.log('\nMODELS:')
    console.log(JSON.stringify(result.models, null, 2))

    console.log('\nIMD OBSERVATION:')
    console.log(JSON.stringify(result.observations?.imd, null, 2))

    console.log('\nOTHER DATA:')
    console.log({
      airQuality: !!result.airQuality,
      elevation: !!result.elevation,
      flood: !!result.flood,
      marine: !!result.marine
    })

    console.log('\n=================================')
    console.log('TEST COMPLETE')
    console.log('=================================')
  } catch (error) {
    console.error('\nWEATHER SERVICE TEST FAILED:')
    console.error(error)
  }
}

test()
