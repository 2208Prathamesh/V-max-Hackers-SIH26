/**
 * IMD District Weather Warnings seed dataset
 * Moved from hardcoded IMD_ACTIVE_DISTRICT_DATABASE in imdService.js
 * Uses dynamic timestamps so warnings remain active after seeding.
 */
export const getImdWarningsSeedData = () => {
  const now = Date.now();
  return [
    {
      district: 'Pune',
      state: 'Maharashtra',
      warningLevel: 'Orange',
      action: 'Be Prepared',
      hazard: 'Heavy to very heavy rainfall with gusty winds',
      validFrom: new Date(now),
      validTo: new Date(now + 48 * 3600 * 1000),
      advice: 'Avoid ghat roads and low-lying river bank areas due to waterlogging potential.',
      issuedBy: 'Regional Meteorological Centre, Mumbai',
      status: 'active'
    },
    {
      district: 'Mumbai',
      state: 'Maharashtra',
      warningLevel: 'Orange',
      action: 'Be Prepared',
      hazard: 'Heavy to very heavy rainfall & high tide advisory',
      validFrom: new Date(now),
      validTo: new Date(now + 24 * 3600 * 1000),
      advice: 'Fishermen are advised not to venture along and off Maharashtra-Goa coasts.',
      issuedBy: 'Regional Meteorological Centre, Mumbai',
      status: 'active'
    },
    {
      district: 'Ratnagiri',
      state: 'Maharashtra',
      warningLevel: 'Red',
      action: 'Take Action',
      hazard: 'Extremely heavy rainfall & squally winds up to 65 kmph',
      validFrom: new Date(now),
      validTo: new Date(now + 36 * 3600 * 1000),
      advice: 'High alert for flash flooding and landslide prone hill slopes.',
      issuedBy: 'IMD Coastal Warning Center',
      status: 'active'
    },
    {
      district: 'Delhi',
      state: 'Delhi NCR',
      warningLevel: 'Yellow',
      action: 'Be Updated',
      hazard: 'Moderate thunderstorm with lightning and light rain',
      validFrom: new Date(now),
      validTo: new Date(now + 18 * 3600 * 1000),
      advice: 'Take shelter in safe structures during lightning strikes.',
      issuedBy: 'Regional Meteorological Centre, New Delhi',
      status: 'active'
    },
    {
      district: 'Chennai',
      state: 'Tamil Nadu',
      warningLevel: 'Yellow',
      action: 'Be Updated',
      hazard: 'Isolated heavy rain with localized thunderstorms',
      validFrom: new Date(now),
      validTo: new Date(now + 24 * 3600 * 1000),
      advice: 'Keep updated with city nowcasts.',
      issuedBy: 'Regional Meteorological Centre, Chennai',
      status: 'active'
    },
    {
      district: 'Kolkata',
      state: 'West Bengal',
      warningLevel: 'Yellow',
      action: 'Be Updated',
      hazard: 'Thunderstorm accompanied with lightning and gusty wind',
      validFrom: new Date(now),
      validTo: new Date(now + 24 * 3600 * 1000),
      advice: 'Avoid taking shelter under tall trees during lightning.',
      issuedBy: 'Regional Meteorological Centre, Kolkata',
      status: 'active'
    },
    {
      district: 'Guwahati',
      state: 'Assam',
      warningLevel: 'Orange',
      action: 'Be Prepared',
      hazard: 'Very heavy rainfall and river flooding in Brahmaputra basin',
      validFrom: new Date(now),
      validTo: new Date(now + 48 * 3600 * 1000),
      advice: 'Move to higher ground if near river banks. Keep emergency kit ready.',
      issuedBy: 'Regional Meteorological Centre, Guwahati',
      status: 'active'
    },
    {
      district: 'Kochi',
      state: 'Kerala',
      warningLevel: 'Yellow',
      action: 'Be Updated',
      hazard: 'Heavy rainfall and strong surface winds along coastal belt',
      validFrom: new Date(now),
      validTo: new Date(now + 36 * 3600 * 1000),
      advice: 'Fishermen advised caution. Avoid venturing into rough seas.',
      issuedBy: 'Regional Meteorological Centre, Thiruvananthapuram',
      status: 'active'
    }
  ];
};
