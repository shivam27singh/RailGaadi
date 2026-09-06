import { Train, Station, Route, StationTimelineItem, Weather, RouteRainForecast, ElevationData, NearbyPlacesResponse } from '@railgaddi/types';

export interface TrainDataRecord {
  train: Train;
  stations: Station[];
  timeline: StationTimelineItem[];
  routeCoordinates: [number, number][]; // [longitude, latitude]
  elevation: ElevationData;
  weatherMap: Record<string, Weather>;
  routeForecast: RouteRainForecast[];
  nearbyPlaces: NearbyPlacesResponse;
  currentStationIndex: number; // 0-based index for simulation starting point
  delayMinutes: number;
}

// 1. Stations catalogue
export const STATIONS: Record<string, Station> = {
  NDLS: { id: 'NDLS', code: 'NDLS', name: 'New Delhi', latitude: 28.6427, longitude: 77.2201, city: 'Delhi', state: 'Delhi', elevationMeters: 216 },
  MTJ: { id: 'MTJ', code: 'MTJ', name: 'Mathura Junction', latitude: 27.4924, longitude: 77.6737, city: 'Mathura', state: 'Uttar Pradesh', elevationMeters: 177 },
  AGC: { id: 'AGC', code: 'AGC', name: 'Agra Cantt', latitude: 27.1591, longitude: 77.9944, city: 'Agra', state: 'Uttar Pradesh', elevationMeters: 167 },
  GWL: { id: 'GWL', code: 'GWL', name: 'Gwalior Junction', latitude: 26.2183, longitude: 78.1828, city: 'Gwalior', state: 'Madhya Pradesh', elevationMeters: 212 },
  VGLJ: { id: 'VGLJ', code: 'VGLJ', name: 'Virangana Lakshmibai (Jhansi)', latitude: 25.4484, longitude: 78.5685, city: 'Jhansi', state: 'Uttar Pradesh', elevationMeters: 258 },
  BPL: { id: 'BPL', code: 'BPL', name: 'Bhopal Junction', latitude: 23.2687, longitude: 77.4116, city: 'Bhopal', state: 'Madhya Pradesh', elevationMeters: 505 },
  RKMP: { id: 'RKMP', code: 'RKMP', name: 'Rani Kamalapati', latitude: 23.2185, longitude: 77.4377, city: 'Bhopal', state: 'Madhya Pradesh', elevationMeters: 496 },

  KOTA: { id: 'KOTA', code: 'KOTA', name: 'Kota Junction', latitude: 25.2233, longitude: 75.8648, city: 'Kota', state: 'Rajasthan', elevationMeters: 253 },
  RTM: { id: 'RTM', code: 'RTM', name: 'Ratlam Junction', latitude: 23.3361, longitude: 75.0406, city: 'Ratlam', state: 'Madhya Pradesh', elevationMeters: 494 },
  BRC: { id: 'BRC', code: 'BRC', name: 'Vadodara Junction', latitude: 22.3107, longitude: 73.1812, city: 'Vadodara', state: 'Gujarat', elevationMeters: 36 },
  ST: { id: 'ST', code: 'ST', name: 'Surat', latitude: 21.2049, longitude: 72.8407, city: 'Surat', state: 'Gujarat', elevationMeters: 17 },
  BVI: { id: 'BVI', code: 'BVI', name: 'Borivali', latitude: 19.2291, longitude: 72.8574, city: 'Mumbai', state: 'Maharashtra', elevationMeters: 14 },
  MMCT: { id: 'MMCT', code: 'MMCT', name: 'Mumbai Central', latitude: 18.9696, longitude: 72.8193, city: 'Mumbai', state: 'Maharashtra', elevationMeters: 10 },

  CNB: { id: 'CNB', code: 'CNB', name: 'Kanpur Central', latitude: 26.4537, longitude: 80.3512, city: 'Kanpur', state: 'Uttar Pradesh', elevationMeters: 127 },
  PRYJ: { id: 'PRYJ', code: 'PRYJ', name: 'Prayagraj Junction', latitude: 25.4448, longitude: 81.8333, city: 'Prayagraj', state: 'Uttar Pradesh', elevationMeters: 97 },
  DDU: { id: 'DDU', code: 'DDU', name: 'Pt. Deen Dayal Upadhyaya Jn', latitude: 25.2818, longitude: 83.1189, city: 'Mughalsarai', state: 'Uttar Pradesh', elevationMeters: 79 },
  GAYA: { id: 'GAYA', code: 'GAYA', name: 'Gaya Junction', latitude: 24.8028, longitude: 85.0069, city: 'Gaya', state: 'Bihar', elevationMeters: 117 },
  DHN: { id: 'DHN', code: 'DHN', name: 'Dhanbad Junction', latitude: 23.7915, longitude: 86.4294, city: 'Dhanbad', state: 'Jharkhand', elevationMeters: 227 },
  ASN: { id: 'ASN', code: 'ASN', name: 'Asansol Junction', latitude: 23.6871, longitude: 86.9746, city: 'Asansol', state: 'West Bengal', elevationMeters: 106 },
  HWH: { id: 'HWH', code: 'HWH', name: 'Howrah Junction', latitude: 22.5839, longitude: 88.3426, city: 'Kolkata', state: 'West Bengal', elevationMeters: 12 },
  BSB: { id: 'BSB', code: 'BSB', name: 'Varanasi Junction', latitude: 25.3284, longitude: 82.9862, city: 'Varanasi', state: 'Uttar Pradesh', elevationMeters: 83 }
};

// 2. Trains Dataset
export const TRAINS_DATA: Record<string, TrainDataRecord> = {
  // Train 1: 12951 NDLS -> MMCT (Mumbai Rajdhani)
  '12951': {
    train: {
      id: '12951',
      number: '12951',
      name: 'Mumbai Rajdhani Express',
      type: 'Rajdhani Express',
      sourceStation: STATIONS.NDLS,
      destinationStation: STATIONS.MMCT,
      departureTime: '16:55',
      arrivalTime: '08:35',
      totalDurationFormatted: '15h 40m',
      runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    stations: [STATIONS.NDLS, STATIONS.KOTA, STATIONS.RTM, STATIONS.BRC, STATIONS.ST, STATIONS.BVI, STATIONS.MMCT],
    currentStationIndex: 2, // Approaching or just passed Ratlam
    delayMinutes: 8,
    timeline: [
      {
        station: STATIONS.NDLS,
        scheduledArrival: 'Source',
        scheduledDeparture: '16:55',
        actualDeparture: '16:55',
        platform: '1',
        delayMinutes: 0,
        distanceFromOriginKm: 0,
        status: 'COMPLETED',
        haltDurationMinutes: 0
      },
      {
        station: STATIONS.KOTA,
        scheduledArrival: '20:55',
        actualArrival: '20:58',
        scheduledDeparture: '21:05',
        actualDeparture: '21:07',
        platform: '1',
        delayMinutes: 2,
        distanceFromOriginKm: 466,
        status: 'COMPLETED',
        haltDurationMinutes: 10
      },
      {
        station: STATIONS.RTM,
        scheduledArrival: '00:15',
        actualArrival: '00:23',
        scheduledDeparture: '00:18',
        actualDeparture: '00:26',
        platform: '4',
        delayMinutes: 8,
        distanceFromOriginKm: 732,
        status: 'CURRENT',
        haltDurationMinutes: 3
      },
      {
        station: STATIONS.BRC,
        scheduledArrival: '03:48',
        scheduledDeparture: '03:56',
        platform: '2',
        delayMinutes: 8,
        distanceFromOriginKm: 993,
        status: 'UPCOMING',
        haltDurationMinutes: 8
      },
      {
        station: STATIONS.ST,
        scheduledArrival: '05:13',
        scheduledDeparture: '05:18',
        platform: '1',
        delayMinutes: 6,
        distanceFromOriginKm: 1123,
        status: 'UPCOMING',
        haltDurationMinutes: 5
      },
      {
        station: STATIONS.BVI,
        scheduledArrival: '08:08',
        scheduledDeparture: '08:10',
        platform: '7',
        delayMinutes: 4,
        distanceFromOriginKm: 1356,
        status: 'UPCOMING',
        haltDurationMinutes: 2
      },
      {
        station: STATIONS.MMCT,
        scheduledArrival: '08:35',
        scheduledDeparture: 'Destination',
        platform: '5',
        delayMinutes: 4,
        distanceFromOriginKm: 1386,
        status: 'UPCOMING',
        haltDurationMinutes: 0
      }
    ],
    // High-resolution realistic railway route coordinates [lon, lat]
    routeCoordinates: [
      [77.2201, 28.6427], // New Delhi
      [77.2415, 28.5821], // Hazrat Nizamuddin
      [77.3012, 28.3842], // Faridabad
      [77.4021, 28.1250], // Palwal
      [77.6737, 27.4924], // Mathura Jn
      [77.7210, 27.1820], // Bharatpur
      [77.0125, 26.9850], // Bayana
      [76.7214, 26.5412], // Gangapur City
      [76.3541, 25.9984], // Sawai Madhopur
      [75.8648, 25.2233], // Kota Junction
      [75.8320, 24.8941], // Dakaniya Talav
      [75.8112, 24.5210], // Ramganj Mandi
      [75.7890, 24.1500], // Shamgarh
      [75.4820, 23.7540], // Nagda Jn
      [75.0406, 23.3361], // Ratlam Junction
      [74.5210, 22.9510], // Meghnagar
      [74.2541, 22.8412], // Dahod
      [73.6120, 22.5020], // Godhra Jn
      [73.1812, 22.3107], // Vadodara Junction
      [73.0012, 21.6840], // Bharuch Jn (Narmada River)
      [72.8407, 21.2049], // Surat (Tapi River)
      [72.9210, 20.8540], // Navsari
      [72.9320, 20.6120], // Valsad
      [72.8120, 19.8210], // Palghar
      [72.8210, 19.4520], // Vasai Road
      [72.8574, 19.2291], // Borivali
      [72.8193, 18.9696]  // Mumbai Central
    ],
    elevation: {
      highestElevationMeters: 494,
      lowestElevationMeters: 10,
      currentElevationMeters: 460,
      highestPointLocation: 'Near Ratlam Junction / Malwa Plateau',
      available: true,
      points: [
        { distanceKm: 0, elevationMeters: 216, stationName: 'New Delhi' },
        { distanceKm: 141, elevationMeters: 177, stationName: 'Mathura Jn' },
        { distanceKm: 300, elevationMeters: 260 },
        { distanceKm: 466, elevationMeters: 253, stationName: 'Kota Jn' },
        { distanceKm: 600, elevationMeters: 380 },
        { distanceKm: 732, elevationMeters: 494, stationName: 'Ratlam Jn' },
        { distanceKm: 850, elevationMeters: 310 },
        { distanceKm: 993, elevationMeters: 36, stationName: 'Vadodara Jn' },
        { distanceKm: 1123, elevationMeters: 17, stationName: 'Surat' },
        { distanceKm: 1356, elevationMeters: 14, stationName: 'Borivali' },
        { distanceKm: 1386, elevationMeters: 10, stationName: 'Mumbai Central' }
      ]
    },
    weatherMap: {
      NDLS: { stationId: 'NDLS', stationName: 'New Delhi', temperatureC: 32, condition: 'Clear', description: 'Sunny & Warm', icon: 'sun', humidityPercentage: 48, windSpeedKmph: 12, rainProbabilityPercentage: 5, updatedAt: new Date().toISOString() },
      KOTA: { stationId: 'KOTA', stationName: 'Kota Junction', temperatureC: 30, condition: 'Clear', description: 'Pleasant evening', icon: 'moon', humidityPercentage: 52, windSpeedKmph: 10, rainProbabilityPercentage: 10, updatedAt: new Date().toISOString() },
      RTM: { stationId: 'RTM', stationName: 'Ratlam Junction', temperatureC: 27, condition: 'Partly Cloudy', description: 'Cool breeze', icon: 'cloud-moon', humidityPercentage: 64, windSpeedKmph: 14, rainProbabilityPercentage: 15, updatedAt: new Date().toISOString() },
      BRC: { stationId: 'BRC', stationName: 'Vadodara Junction', temperatureC: 28, condition: 'Clear', description: 'Clear sky', icon: 'sun', humidityPercentage: 70, windSpeedKmph: 12, rainProbabilityPercentage: 10, updatedAt: new Date().toISOString() },
      ST: { stationId: 'ST', stationName: 'Surat', temperatureC: 29, condition: 'Cloudy', description: 'Humid breeze', icon: 'cloud', humidityPercentage: 78, windSpeedKmph: 18, rainProbabilityPercentage: 25, updatedAt: new Date().toISOString() },
      BVI: { stationId: 'BVI', stationName: 'Borivali', temperatureC: 28, condition: 'Light Rain', description: 'Passing showers', icon: 'cloud-rain', humidityPercentage: 84, windSpeedKmph: 20, rainProbabilityPercentage: 65, updatedAt: new Date().toISOString() },
      MMCT: { stationId: 'MMCT', stationName: 'Mumbai Central', temperatureC: 28, condition: 'Light Rain', description: 'Coastal showers likely', icon: 'cloud-rain', humidityPercentage: 86, windSpeedKmph: 22, rainProbabilityPercentage: 70, updatedAt: new Date().toISOString() }
    },
    routeForecast: [
      { stationName: 'Surat', rainProbabilityPercentage: 25, etaHoursAndMinutes: '4h 30m', summary: 'Scattered clouds, dry tracks' },
      { stationName: 'Borivali', rainProbabilityPercentage: 65, etaHoursAndMinutes: '7h 15m', summary: 'Light rain expected near Mumbai arrival' },
      { stationName: 'Mumbai Central', rainProbabilityPercentage: 70, etaHoursAndMinutes: '7h 45m', summary: 'Monsoon showers in coastal corridor' }
    ],
    nearbyPlaces: {
      rivers: [
        { id: 'chambal', name: 'Chambal River Bridge', category: 'RIVER', description: 'Iconic deep ravine rail viaduct spanning the perennial Chambal River near Kota.', latitude: 25.2100, longitude: 75.8450, distanceFromTrackKm: 0.1, nearStationName: 'Kota Junction' },
        { id: 'narmada', name: 'Golden Narmada River Bridge', category: 'RIVER', description: 'Historic twin rail bridges crossing the sacred Narmada river at Bharuch.', latitude: 21.6840, longitude: 73.0012, distanceFromTrackKm: 0.1, nearStationName: 'Bharuch Junction' },
        { id: 'tapi', name: 'Tapi River Crossing', category: 'RIVER', description: 'Major river separating northern Surat from the commercial diamond hub.', latitude: 21.2050, longitude: 72.8410, distanceFromTrackKm: 0.2, nearStationName: 'Surat' }
      ],
      lakes: [
        { id: 'kishore-sagar', name: 'Kishore Sagar Lake', category: 'LAKE', description: 'Artificial lake built in 1346 featuring the picturesque Jagmandir Palace in Kota.', latitude: 25.1760, longitude: 75.8480, distanceFromTrackKm: 4.2, nearStationName: 'Kota Junction' }
      ],
      mountains: [
        { id: 'mukundara', name: 'Mukundara Hills & Tiger Reserve', category: 'MOUNTAIN', description: 'Rugged Vindhyan escarpments flanking the rail alignment between Kota and Jhalawar.', latitude: 24.8100, longitude: 75.9800, distanceFromTrackKm: 12.0, nearStationName: 'Ramganj Mandi' },
        { id: 'sanjay-gandhi-hills', name: 'Borivali National Park Ridges', category: 'MOUNTAIN', description: 'Green tropical forest hills surrounding the northern entrance to Mumbai.', latitude: 19.2200, longitude: 72.8900, distanceFromTrackKm: 3.5, nearStationName: 'Borivali' }
      ],
      bridges: [
        { id: 'chambal-viaduct', name: 'Chambal High-Speed Viaduct', category: 'BRIDGE', description: 'Long pre-stressed concrete railway bridge designed for 160 km/h Rajdhani runs.', latitude: 25.2150, longitude: 75.8420, distanceFromTrackKm: 0.0, nearStationName: 'Kota Junction' }
      ],
      tunnels: [
        { id: 'dara-pass', name: 'Dara Pass Rock Cut', category: 'TUNNEL', description: 'Historic railway passage cut through sandstone cliffs of the Mukundara gorge.', latitude: 24.7800, longitude: 75.8500, distanceFromTrackKm: 0.0, nearStationName: 'Dara' }
      ],
      monuments: [
        { id: 'laxmi-vilas', name: 'Laxmi Vilas Palace', category: 'MONUMENT', description: 'Magnificent Gaekwad royal palace, 4 times the size of Buckingham Palace.', latitude: 22.2934, longitude: 73.1906, distanceFromTrackKm: 3.8, nearStationName: 'Vadodara Junction' },
        { id: 'garadia-mahadev', name: 'Garadia Mahadev Canyon', category: 'MONUMENT', description: 'Breath-taking horseshoe gorge carved by the Chambal River.', latitude: 25.1200, longitude: 75.6800, distanceFromTrackKm: 18.0, nearStationName: 'Kota Junction' }
      ],
      cities: [
        { id: 'kota', name: 'Kota', category: 'CITY', description: 'Education and industrial hub on the banks of Chambal river.', latitude: 25.2233, longitude: 75.8648, distanceFromTrackKm: 0.5, nearStationName: 'Kota Junction' },
        { id: 'vadodara', name: 'Vadodara (Baroda)', category: 'CITY', description: 'Cultural capital of Gujarat known for art, architecture, and garba festivals.', latitude: 22.3107, longitude: 73.1812, distanceFromTrackKm: 0.5, nearStationName: 'Vadodara Junction' },
        { id: 'surat', name: 'Surat', category: 'CITY', description: 'The Silk and Diamond city of India, one of the fastest growing urban centres.', latitude: 21.2049, longitude: 72.8407, distanceFromTrackKm: 0.5, nearStationName: 'Surat' }
      ],
      featuredCrossing: {
        id: 'narmada',
        name: 'Crossing Narmada River',
        category: 'RIVER',
        description: 'Approaching the historic bridge across the holy Narmada river at Bharuch.',
        latitude: 21.6840,
        longitude: 73.0012,
        distanceFromTrackKm: 0.0,
        nearStationName: 'Bharuch Junction'
      }
    }
  },

  // Train 2: 12301 HWH -> NDLS (Howrah Rajdhani)
  '12301': {
    train: {
      id: '12301',
      number: '12301',
      name: 'Howrah Rajdhani Express',
      type: 'Rajdhani Express',
      sourceStation: STATIONS.HWH,
      destinationStation: STATIONS.NDLS,
      departureTime: '16:50',
      arrivalTime: '10:05',
      totalDurationFormatted: '17h 15m',
      runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    },
    stations: [STATIONS.HWH, STATIONS.ASN, STATIONS.DHN, STATIONS.GAYA, STATIONS.DDU, STATIONS.PRYJ, STATIONS.CNB, STATIONS.NDLS],
    currentStationIndex: 5, // Near Prayagraj / Kanpur
    delayMinutes: 12,
    timeline: [
      { station: STATIONS.HWH, scheduledArrival: 'Source', scheduledDeparture: '16:50', actualDeparture: '16:50', platform: '9', delayMinutes: 0, distanceFromOriginKm: 0, status: 'COMPLETED', haltDurationMinutes: 0 },
      { station: STATIONS.ASN, scheduledArrival: '18:57', scheduledDeparture: '19:00', actualDeparture: '19:02', platform: '4', delayMinutes: 2, distanceFromOriginKm: 200, status: 'COMPLETED', haltDurationMinutes: 3 },
      { station: STATIONS.DHN, scheduledArrival: '19:50', scheduledDeparture: '19:55', actualDeparture: '19:58', platform: '2', delayMinutes: 3, distanceFromOriginKm: 259, status: 'COMPLETED', haltDurationMinutes: 5 },
      { station: STATIONS.GAYA, scheduledArrival: '22:19', scheduledDeparture: '22:22', actualDeparture: '22:28', platform: '1', delayMinutes: 6, distanceFromOriginKm: 458, status: 'COMPLETED', haltDurationMinutes: 3 },
      { station: STATIONS.DDU, scheduledArrival: '00:45', scheduledDeparture: '00:55', actualDeparture: '01:05', platform: '6', delayMinutes: 10, distanceFromOriginKm: 663, status: 'COMPLETED', haltDurationMinutes: 10 },
      { station: STATIONS.PRYJ, scheduledArrival: '02:43', scheduledDeparture: '02:45', actualDeparture: '02:57', platform: '1', delayMinutes: 12, distanceFromOriginKm: 816, status: 'CURRENT', haltDurationMinutes: 2 },
      { station: STATIONS.CNB, scheduledArrival: '04:50', scheduledDeparture: '04:55', platform: '1', delayMinutes: 12, distanceFromOriginKm: 1010, status: 'UPCOMING', haltDurationMinutes: 5 },
      { station: STATIONS.NDLS, scheduledArrival: '10:05', scheduledDeparture: 'Destination', platform: '14', delayMinutes: 10, distanceFromOriginKm: 1451, status: 'UPCOMING', haltDurationMinutes: 0 }
    ],
    routeCoordinates: [
      [88.3426, 22.5839], // Howrah
      [87.9540, 23.2320], // Barddhaman
      [87.3110, 23.4980], // Durgapur
      [86.9746, 23.6871], // Asansol
      [86.4294, 23.7915], // Dhanbad
      [85.6710, 24.1840], // Parasnath
      [85.5210, 24.3210], // Koderma
      [85.0069, 24.8028], // Gaya
      [84.1840, 24.9540], // Dehri On Sone (Son River)
      [83.1189, 25.2818], // Pt DD Upadhyaya (Mughalsarai)
      [82.9862, 25.3284], // Varanasi bypass
      [82.5640, 25.1480], // Mirzapur
      [81.8333, 25.4448], // Prayagraj Junction (Triveni Sangam)
      [80.8210, 25.9240], // Fatehpur
      [80.3512, 26.4537], // Kanpur Central
      [79.0210, 26.7820], // Etawah
      [78.2340, 27.2140], // Tundla
      [77.9210, 27.8820], // Aligarh
      [77.6840, 28.3210], // Ghaziabad
      [77.2201, 28.6427]  // New Delhi
    ],
    elevation: {
      highestElevationMeters: 380,
      lowestElevationMeters: 12,
      currentElevationMeters: 97,
      highestPointLocation: 'Parasnath Hill section (Jharkhand plateau)',
      available: true,
      points: [
        { distanceKm: 0, elevationMeters: 12, stationName: 'Howrah Jn' },
        { distanceKm: 200, elevationMeters: 106, stationName: 'Asansol' },
        { distanceKm: 259, elevationMeters: 227, stationName: 'Dhanbad' },
        { distanceKm: 380, elevationMeters: 380, stationName: 'Parasnath' },
        { distanceKm: 458, elevationMeters: 117, stationName: 'Gaya' },
        { distanceKm: 663, elevationMeters: 79, stationName: 'Pt DD Upadhyaya' },
        { distanceKm: 816, elevationMeters: 97, stationName: 'Prayagraj' },
        { distanceKm: 1010, elevationMeters: 127, stationName: 'Kanpur Central' },
        { distanceKm: 1451, elevationMeters: 216, stationName: 'New Delhi' }
      ]
    },
    weatherMap: {
      HWH: { stationId: 'HWH', stationName: 'Howrah Junction', temperatureC: 31, condition: 'Humid', description: 'Warm and humid evening', icon: 'sun', humidityPercentage: 80, windSpeedKmph: 10, rainProbabilityPercentage: 15, updatedAt: new Date().toISOString() },
      PRYJ: { stationId: 'PRYJ', stationName: 'Prayagraj Junction', temperatureC: 27, condition: 'Clear', description: 'Cool starry night near Sangam', icon: 'moon', humidityPercentage: 62, windSpeedKmph: 8, rainProbabilityPercentage: 5, updatedAt: new Date().toISOString() },
      CNB: { stationId: 'CNB', stationName: 'Kanpur Central', temperatureC: 28, condition: 'Partly Cloudy', description: 'Mild breeze along Ganges', icon: 'cloud-moon', humidityPercentage: 60, windSpeedKmph: 9, rainProbabilityPercentage: 10, updatedAt: new Date().toISOString() },
      NDLS: { stationId: 'NDLS', stationName: 'New Delhi', temperatureC: 30, condition: 'Sunny', description: 'Bright morning', icon: 'sun', humidityPercentage: 45, windSpeedKmph: 14, rainProbabilityPercentage: 0, updatedAt: new Date().toISOString() }
    },
    routeForecast: [
      { stationName: 'Kanpur Central', rainProbabilityPercentage: 10, etaHoursAndMinutes: '1h 55m', summary: 'Clear conditions ahead' },
      { stationName: 'New Delhi', rainProbabilityPercentage: 5, etaHoursAndMinutes: '7h 10m', summary: 'Sunny arrival in the capital' }
    ],
    nearbyPlaces: {
      rivers: [
        { id: 'ganga-pryj', name: 'Ganga & Yamuna Sangam', category: 'RIVER', description: 'Holy confluence of the Ganges, Yamuna, and mythical Saraswati rivers in Prayagraj.', latitude: 25.4280, longitude: 81.8840, distanceFromTrackKm: 5.2, nearStationName: 'Prayagraj Junction' },
        { id: 'son-river', name: 'Son River Bridge (Nehru Setu)', category: 'RIVER', description: 'One of the longest rail viaducts in India spanning the sandy Son river.', latitude: 24.9540, longitude: 84.1840, distanceFromTrackKm: 0.1, nearStationName: 'Dehri On Sone' },
        { id: 'hooghly', name: 'Hooghly River & Howrah Bridge', category: 'RIVER', description: 'Historic cantilever bridge connecting twin cities Kolkata and Howrah.', latitude: 22.5850, longitude: 88.3470, distanceFromTrackKm: 0.8, nearStationName: 'Howrah Junction' }
      ],
      lakes: [],
      mountains: [
        { id: 'parasnath', name: 'Shikharji (Parasnath Hills)', category: 'MOUNTAIN', description: 'Highest mountain peak in Jharkhand, supreme Jain pilgrimage site rising 1350m.', latitude: 23.9620, longitude: 86.1310, distanceFromTrackKm: 14.0, nearStationName: 'Parasnath' }
      ],
      bridges: [
        { id: 'curzon-bridge', name: 'Lord Curzon Ganga Rail Bridge', category: 'BRIDGE', description: 'Double-decker historical bridge over the Ganges at Prayagraj.', latitude: 25.4600, longitude: 81.8700, distanceFromTrackKm: 1.2, nearStationName: 'Prayagraj Junction' }
      ],
      tunnels: [],
      monuments: [
        { id: 'allahabad-fort', name: 'Akbar’s Allahabad Fort', category: 'MONUMENT', description: 'Massive Mughal fortress built by Emperor Akbar overlooking the Triveni Sangam.', latitude: 25.4310, longitude: 81.8780, distanceFromTrackKm: 4.8, nearStationName: 'Prayagraj Junction' },
        { id: 'bodh-gaya', name: 'Mahabodhi Temple Complex', category: 'MONUMENT', description: 'UNESCO World Heritage site marking the location where the Buddha attained Enlightenment.', latitude: 24.6960, longitude: 84.9910, distanceFromTrackKm: 12.0, nearStationName: 'Gaya Junction' }
      ],
      cities: [
        { id: 'prayagraj', name: 'Prayagraj (Allahabad)', category: 'CITY', description: 'Ancient pilgrim city known for the Kumbh Mela and Anand Bhavan.', latitude: 25.4448, longitude: 81.8333, distanceFromTrackKm: 0.5, nearStationName: 'Prayagraj Junction' },
        { id: 'kanpur', name: 'Kanpur', category: 'CITY', description: 'Major commercial and industrial metropolis on the banks of Ganga.', latitude: 26.4537, longitude: 80.3512, distanceFromTrackKm: 0.5, nearStationName: 'Kanpur Central' }
      ],
      featuredCrossing: {
        id: 'ganga-curzon',
        name: 'Crossing the Ganges Viaduct',
        category: 'RIVER',
        description: 'Crossing the sacred Ganga river near Prayagraj with sweeping views of the Sangam ghats.',
        latitude: 25.4450,
        longitude: 81.8400,
        distanceFromTrackKm: 0.0,
        nearStationName: 'Prayagraj Junction'
      }
    }
  },

  // Train 3: 22436 NDLS -> BSB (Vande Bharat Express)
  '22436': {
    train: {
      id: '22436',
      number: '22436',
      name: 'Vande Bharat Express',
      type: 'Vande Bharat Express',
      sourceStation: STATIONS.NDLS,
      destinationStation: STATIONS.BSB,
      departureTime: '06:00',
      arrivalTime: '14:00',
      totalDurationFormatted: '8h 00m',
      runningDays: ['Tue', 'Wed', 'Fri', 'Sat', 'Sun']
    },
    stations: [STATIONS.NDLS, STATIONS.CNB, STATIONS.PRYJ, STATIONS.BSB],
    currentStationIndex: 1, // Cruising at 130 km/h between NDLS and Kanpur
    delayMinutes: 0,
    timeline: [
      { station: STATIONS.NDLS, scheduledArrival: 'Source', scheduledDeparture: '06:00', actualDeparture: '06:00', platform: '16', delayMinutes: 0, distanceFromOriginKm: 0, status: 'COMPLETED', haltDurationMinutes: 0 },
      { station: STATIONS.CNB, scheduledArrival: '10:08', scheduledDeparture: '10:10', actualArrival: '10:08', platform: '1', delayMinutes: 0, distanceFromOriginKm: 441, status: 'CURRENT', haltDurationMinutes: 2 },
      { station: STATIONS.PRYJ, scheduledArrival: '12:08', scheduledDeparture: '12:10', platform: '6', delayMinutes: 0, distanceFromOriginKm: 635, status: 'UPCOMING', haltDurationMinutes: 2 },
      { station: STATIONS.BSB, scheduledArrival: '14:00', scheduledDeparture: 'Destination', platform: '1', delayMinutes: 0, distanceFromOriginKm: 759, status: 'UPCOMING', haltDurationMinutes: 0 }
    ],
    routeCoordinates: [
      [77.2201, 28.6427], // New Delhi
      [77.4410, 28.6720], // Ghaziabad
      [77.7210, 28.3840], // Dadri
      [78.0820, 27.9540], // Aligarh Jn
      [78.5840, 27.5210], // Hathras
      [78.9840, 27.2140], // Tundla Jn
      [79.0210, 26.7820], // Etawah
      [79.6840, 26.5410], // Phaphund
      [80.3512, 26.4537], // Kanpur Central
      [80.8210, 25.9240], // Fatehpur
      [81.4210, 25.6840], // Sirathu
      [81.8333, 25.4448], // Prayagraj Junction
      [82.4120, 25.3210], // Janghai
      [82.9862, 25.3284]  // Varanasi Junction
    ],
    elevation: {
      highestElevationMeters: 216,
      lowestElevationMeters: 83,
      currentElevationMeters: 127,
      highestPointLocation: 'Delhi Ridge / Indo-Gangetic Plain',
      available: true,
      points: [
        { distanceKm: 0, elevationMeters: 216, stationName: 'New Delhi' },
        { distanceKm: 130, elevationMeters: 187, stationName: 'Aligarh' },
        { distanceKm: 295, elevationMeters: 154, stationName: 'Etawah' },
        { distanceKm: 441, elevationMeters: 127, stationName: 'Kanpur Central' },
        { distanceKm: 635, elevationMeters: 97, stationName: 'Prayagraj' },
        { distanceKm: 759, elevationMeters: 83, stationName: 'Varanasi' }
      ]
    },
    weatherMap: {
      NDLS: { stationId: 'NDLS', stationName: 'New Delhi', temperatureC: 28, condition: 'Sunny', description: 'Clear skies', icon: 'sun', humidityPercentage: 45, windSpeedKmph: 12, rainProbabilityPercentage: 0, updatedAt: new Date().toISOString() },
      CNB: { stationId: 'CNB', stationName: 'Kanpur Central', temperatureC: 31, condition: 'Sunny', description: 'Bright morning', icon: 'sun', humidityPercentage: 50, windSpeedKmph: 10, rainProbabilityPercentage: 5, updatedAt: new Date().toISOString() },
      PRYJ: { stationId: 'PRYJ', stationName: 'Prayagraj Junction', temperatureC: 32, condition: 'Clear', description: 'Warm sunshine', icon: 'sun', humidityPercentage: 52, windSpeedKmph: 11, rainProbabilityPercentage: 5, updatedAt: new Date().toISOString() },
      BSB: { stationId: 'BSB', stationName: 'Varanasi Junction', temperatureC: 33, condition: 'Partly Cloudy', description: 'Warm afternoon', icon: 'cloud-sun', humidityPercentage: 55, windSpeedKmph: 12, rainProbabilityPercentage: 15, updatedAt: new Date().toISOString() }
    },
    routeForecast: [
      { stationName: 'Prayagraj', rainProbabilityPercentage: 5, etaHoursAndMinutes: '2h 00m', summary: 'Dry sunny tracks' },
      { stationName: 'Varanasi', rainProbabilityPercentage: 15, etaHoursAndMinutes: '3h 50m', summary: 'Clear run with occasional clouds' }
    ],
    nearbyPlaces: {
      rivers: [
        { id: 'yamuna-ndls', name: 'Yamuna River Viaduct', category: 'RIVER', description: 'Crossing the Yamuna near Delhi as the train accelerates towards Kanpur.', latitude: 28.6310, longitude: 77.2650, distanceFromTrackKm: 0.1, nearStationName: 'New Delhi' },
        { id: 'ganga-varanasi', name: 'The Sacred Ganga at Kashi', category: 'RIVER', description: 'Famous riverfront of Varanasi lined with ancient stone ghats.', latitude: 25.3100, longitude: 83.0100, distanceFromTrackKm: 3.5, nearStationName: 'Varanasi Junction' }
      ],
      lakes: [],
      mountains: [],
      bridges: [
        { id: 'kanpur-ganga', name: 'Ganga Bridge Kanpur', category: 'BRIDGE', description: 'Heavy freight and passenger rail bridge crossing the mighty Ganges.', latitude: 26.4680, longitude: 80.3750, distanceFromTrackKm: 2.0, nearStationName: 'Kanpur Central' }
      ],
      tunnels: [],
      monuments: [
        { id: 'kashi-vishwanath', name: 'Kashi Vishwanath Corridor', category: 'MONUMENT', description: 'Revered Jyotirlinga temple standing beside the sacred Ganges.', latitude: 25.3109, longitude: 83.0107, distanceFromTrackKm: 4.1, nearStationName: 'Varanasi Junction' },
        { id: 'sarnath', name: 'Dhamek Stupa at Sarnath', category: 'MONUMENT', description: 'Cylindrical stupa where Gautama Buddha gave his first sermon.', latitude: 25.3810, longitude: 83.0220, distanceFromTrackKm: 8.5, nearStationName: 'Varanasi Junction' }
      ],
      cities: [
        { id: 'varanasi', name: 'Varanasi (Kashi)', category: 'CITY', description: 'One of the oldest continuously inhabited cities in the world.', latitude: 25.3284, longitude: 82.9862, distanceFromTrackKm: 0.5, nearStationName: 'Varanasi Junction' }
      ],
      featuredCrossing: {
        id: 'yamuna-crossing',
        name: 'Cruising over Yamuna River',
        category: 'RIVER',
        description: 'Vande Bharat speeding at 130 km/h across the historic Yamuna railway bridge.',
        latitude: 28.6310,
        longitude: 77.2650,
        distanceFromTrackKm: 0.0,
        nearStationName: 'Ghaziabad'
      }
    }
  },

  // Train 4: 12002 NDLS -> RKMP (Bhopal Shatabdi)
  '12002': {
    train: {
      id: '12002',
      number: '12002',
      name: 'Bhopal Shatabdi Express',
      type: 'Shatabdi Express',
      sourceStation: STATIONS.NDLS,
      destinationStation: STATIONS.RKMP,
      departureTime: '06:00',
      arrivalTime: '14:40',
      totalDurationFormatted: '8h 40m',
      runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    stations: [STATIONS.NDLS, STATIONS.MTJ, STATIONS.AGC, STATIONS.GWL, STATIONS.VGLJ, STATIONS.BPL, STATIONS.RKMP],
    currentStationIndex: 2, // Near Agra / Gwalior
    delayMinutes: 3,
    timeline: [
      { station: STATIONS.NDLS, scheduledArrival: 'Source', scheduledDeparture: '06:00', actualDeparture: '06:00', platform: '1', delayMinutes: 0, distanceFromOriginKm: 0, status: 'COMPLETED', haltDurationMinutes: 0 },
      { station: STATIONS.MTJ, scheduledArrival: '07:19', scheduledDeparture: '07:20', actualArrival: '07:20', platform: '1', delayMinutes: 1, distanceFromOriginKm: 141, status: 'COMPLETED', haltDurationMinutes: 1 },
      { station: STATIONS.AGC, scheduledArrival: '07:50', scheduledDeparture: '07:55', actualArrival: '07:53', platform: '1', delayMinutes: 3, distanceFromOriginKm: 195, status: 'CURRENT', haltDurationMinutes: 5 },
      { station: STATIONS.GWL, scheduledArrival: '09:23', scheduledDeparture: '09:28', platform: '1', delayMinutes: 3, distanceFromOriginKm: 313, status: 'UPCOMING', haltDurationMinutes: 5 },
      { station: STATIONS.VGLJ, scheduledArrival: '10:45', scheduledDeparture: '10:50', platform: '1', delayMinutes: 2, distanceFromOriginKm: 411, status: 'UPCOMING', haltDurationMinutes: 5 },
      { station: STATIONS.BPL, scheduledArrival: '14:12', scheduledDeparture: '14:15', platform: '1', delayMinutes: 0, distanceFromOriginKm: 702, status: 'UPCOMING', haltDurationMinutes: 3 },
      { station: STATIONS.RKMP, scheduledArrival: '14:40', scheduledDeparture: 'Destination', platform: '1', delayMinutes: 0, distanceFromOriginKm: 708, status: 'UPCOMING', haltDurationMinutes: 0 }
    ],
    routeCoordinates: [
      [77.2201, 28.6427], // New Delhi
      [77.3012, 28.3842], // Faridabad
      [77.4021, 28.1250], // Palwal
      [77.6737, 27.4924], // Mathura Jn
      [77.9944, 27.1591], // Agra Cantt
      [78.0210, 26.8540], // Dholpur (Chambal River)
      [78.1828, 26.2183], // Gwalior Junction
      [78.3540, 25.8210], // Datia
      [78.5685, 25.4484], // Virangana Lakshmibai (Jhansi)
      [78.4820, 24.8910], // Lalitpur
      [78.2140, 24.1250], // Bina Jn
      [77.7840, 23.5410], // Vidisha
      [77.4116, 23.2687], // Bhopal Junction
      [77.4377, 23.2185]  // Rani Kamalapati
    ],
    elevation: {
      highestElevationMeters: 505,
      lowestElevationMeters: 167,
      currentElevationMeters: 170,
      highestPointLocation: 'Bhopal Plateau',
      available: true,
      points: [
        { distanceKm: 0, elevationMeters: 216, stationName: 'New Delhi' },
        { distanceKm: 141, elevationMeters: 177, stationName: 'Mathura' },
        { distanceKm: 195, elevationMeters: 167, stationName: 'Agra Cantt' },
        { distanceKm: 313, elevationMeters: 212, stationName: 'Gwalior' },
        { distanceKm: 411, elevationMeters: 258, stationName: 'Jhansi' },
        { distanceKm: 550, elevationMeters: 412, stationName: 'Bina' },
        { distanceKm: 702, elevationMeters: 505, stationName: 'Bhopal' },
        { distanceKm: 708, elevationMeters: 496, stationName: 'Rani Kamalapati' }
      ]
    },
    weatherMap: {
      NDLS: { stationId: 'NDLS', stationName: 'New Delhi', temperatureC: 29, condition: 'Sunny', description: 'Sunny', icon: 'sun', humidityPercentage: 45, windSpeedKmph: 12, rainProbabilityPercentage: 0, updatedAt: new Date().toISOString() },
      AGC: { stationId: 'AGC', stationName: 'Agra Cantt', temperatureC: 31, condition: 'Clear', description: 'Warm and bright near Taj', icon: 'sun', humidityPercentage: 54, windSpeedKmph: 10, rainProbabilityPercentage: 10, updatedAt: new Date().toISOString() },
      GWL: { stationId: 'GWL', stationName: 'Gwalior Junction', temperatureC: 32, condition: 'Sunny', description: 'Clear skies over fort', icon: 'sun', humidityPercentage: 48, windSpeedKmph: 14, rainProbabilityPercentage: 5, updatedAt: new Date().toISOString() },
      RKMP: { stationId: 'RKMP', stationName: 'Rani Kamalapati', temperatureC: 28, condition: 'Partly Cloudy', description: 'Pleasant evening', icon: 'cloud-sun', humidityPercentage: 62, windSpeedKmph: 15, rainProbabilityPercentage: 20, updatedAt: new Date().toISOString() }
    },
    routeForecast: [
      { stationName: 'Gwalior', rainProbabilityPercentage: 5, etaHoursAndMinutes: '1h 30m', summary: 'Sunny journey through Chambal ravines' },
      { stationName: 'Bhopal', rainProbabilityPercentage: 20, etaHoursAndMinutes: '6h 15m', summary: 'Passing evening clouds near Upper Lake' }
    ],
    nearbyPlaces: {
      rivers: [
        { id: 'yamuna-agra', name: 'Yamuna River & Taj Mahal', category: 'RIVER', description: 'Yamuna river flowing right behind the white marble monument of love.', latitude: 27.1750, longitude: 78.0422, distanceFromTrackKm: 4.5, nearStationName: 'Agra Cantt' },
        { id: 'chambal-dholpur', name: 'Chambal Ravines River Crossing', category: 'RIVER', description: 'Famous National Chambal Sanctuary with gharials, gangetic dolphins and rugged clay ravines.', latitude: 26.6900, longitude: 77.8900, distanceFromTrackKm: 0.2, nearStationName: 'Dholpur' },
        { id: 'betwa', name: 'Betwa River & Orchha Cenotaphs', category: 'RIVER', description: 'Scenic tributary of Yamuna bordered by majestic Bundela chhatris.', latitude: 25.3500, longitude: 78.6400, distanceFromTrackKm: 14.0, nearStationName: 'Jhansi' }
      ],
      lakes: [
        { id: 'bhojtal', name: 'Bhojtal (Upper Lake)', category: 'LAKE', description: 'Massive artificial lake in Bhopal built by Paramara Raja Bhoj in the 11th century.', latitude: 23.2500, longitude: 77.3400, distanceFromTrackKm: 7.0, nearStationName: 'Bhopal Junction' }
      ],
      mountains: [
        { id: 'gwalior-gopachal', name: 'Gopachal Rock Cut Cliffs', category: 'MOUNTAIN', description: 'Steep rocky hill fortress rising 100 meters above the central plains.', latitude: 26.2250, longitude: 78.1700, distanceFromTrackKm: 1.5, nearStationName: 'Gwalior Junction' }
      ],
      bridges: [
        { id: 'chambal-rail-bridge', name: 'Chambal Railway Bridge', category: 'BRIDGE', description: 'Dramatic bridge crossing the deep gorge between Rajasthan and Madhya Pradesh.', latitude: 26.6850, longitude: 77.8950, distanceFromTrackKm: 0.0, nearStationName: 'Dholpur' }
      ],
      tunnels: [],
      monuments: [
        { id: 'taj-mahal', name: 'Taj Mahal', category: 'MONUMENT', description: 'UNESCO World Heritage wonder of the world situated along the train corridor in Agra.', latitude: 27.1751, longitude: 78.0421, distanceFromTrackKm: 4.8, nearStationName: 'Agra Cantt' },
        { id: 'gwalior-fort', name: 'Gwalior Fort (Gibraltar of India)', category: 'MONUMENT', description: '8th-century impenetrable hill fortress with Man Mandir Palace.', latitude: 26.2300, longitude: 78.1700, distanceFromTrackKm: 2.0, nearStationName: 'Gwalior Junction' },
        { id: 'sanchi-stupa', name: 'Great Stupa at Sanchi', category: 'MONUMENT', description: 'Oldest stone structure in India commissioned by Emperor Ashoka in 3rd century BCE.', latitude: 23.4800, longitude: 77.7400, distanceFromTrackKm: 2.5, nearStationName: 'Vidisha' }
      ],
      cities: [
        { id: 'agra', name: 'Agra', category: 'CITY', description: 'Mughal historic capital famous for Taj Mahal and Petha.', latitude: 27.1591, longitude: 77.9944, distanceFromTrackKm: 0.5, nearStationName: 'Agra Cantt' },
        { id: 'gwalior', name: 'Gwalior', category: 'CITY', description: 'Historic princely city celebrated for classical music, Scindia palace, and architecture.', latitude: 26.2183, longitude: 78.1828, distanceFromTrackKm: 0.5, nearStationName: 'Gwalior Junction' },
        { id: 'bhopal', name: 'Bhopal', category: 'CITY', description: 'City of Lakes and capital of Madhya Pradesh with premier modern railway terminal.', latitude: 23.2185, longitude: 77.4377, distanceFromTrackKm: 0.5, nearStationName: 'Rani Kamalapati' }
      ],
      featuredCrossing: {
        id: 'taj-view',
        name: 'Approaching Agra & Yamuna Basin',
        category: 'MONUMENT',
        description: 'Shatabdi running parallel to Agra Cantt with views across the historic Mughal capital.',
        latitude: 27.1591,
        longitude: 77.9944,
        distanceFromTrackKm: 0.0,
        nearStationName: 'Agra Cantt'
      }
    }
  }
};
