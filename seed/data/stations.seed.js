/**
 * Weather Observation Stations seed dataset
 * Moved from hardcoded METRO_STATIONS array in mapLayerService.js
 * Stations are geospatial reference points — live weather is fetched at runtime.
 */
export const stationsSeedData = [
  { name: 'Pune', latitude: 18.5204, longitude: 73.8567, state: 'Maharashtra', country: 'India', stationType: 'metro' },
  { name: 'Mumbai', latitude: 19.0760, longitude: 72.8777, state: 'Maharashtra', country: 'India', stationType: 'metro' },
  { name: 'Delhi', latitude: 28.6139, longitude: 77.2090, state: 'Delhi', country: 'India', stationType: 'metro' },
  { name: 'Bengaluru', latitude: 12.9716, longitude: 77.5946, state: 'Karnataka', country: 'India', stationType: 'metro' },
  { name: 'Kolkata', latitude: 22.5726, longitude: 88.3639, state: 'West Bengal', country: 'India', stationType: 'metro' },
  { name: 'Chennai', latitude: 13.0827, longitude: 80.2707, state: 'Tamil Nadu', country: 'India', stationType: 'metro' },
  { name: 'Hyderabad', latitude: 17.3850, longitude: 78.4867, state: 'Telangana', country: 'India', stationType: 'metro' },
  { name: 'Ahmedabad', latitude: 23.0225, longitude: 72.5714, state: 'Gujarat', country: 'India', stationType: 'metro' },
  { name: 'Jaipur', latitude: 26.9124, longitude: 75.7873, state: 'Rajasthan', country: 'India', stationType: 'metro' },
  { name: 'Guwahati', latitude: 26.1445, longitude: 91.7362, state: 'Assam', country: 'India', stationType: 'metro' },
  { name: 'Nagpur', latitude: 21.1458, longitude: 79.0882, state: 'Maharashtra', country: 'India', stationType: 'metro' },
  { name: 'Bhopal', latitude: 23.2599, longitude: 77.4126, state: 'Madhya Pradesh', country: 'India', stationType: 'metro' },
  { name: 'Srinagar', latitude: 34.0837, longitude: 74.7973, state: 'Jammu & Kashmir', country: 'India', stationType: 'metro' },
  { name: 'Kochi', latitude: 9.9312, longitude: 76.2673, state: 'Kerala', country: 'India', stationType: 'coastal' }
];
