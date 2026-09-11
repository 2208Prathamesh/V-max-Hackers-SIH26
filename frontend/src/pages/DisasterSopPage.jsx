import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useWeather } from '../context/WeatherContext';
import {
  ShieldAlert,
  Zap,
  Waves,
  Wind,
  CloudRain,
  Sun,
  Mountain,
  HeartPulse,
  PhoneCall,
  AlertTriangle,
  XCircle,
  Search,
  Building,
  Droplets,
  Snowflake,
  Bug,
  ArrowLeft,
  CheckCircle2,
  Clock
} from 'lucide-react';

// ============================================================================
// 1. VERIFIED EMERGENCY DISASTER RESPONDER HELPLINES
// ============================================================================
const EMERGENCY_HOTLINES = [
  {
    id: 'national',
    title: 'National Emergency',
    titleMr: 'राष्ट्रीय आपत्कालीन सेवा',
    number: '112',
    dept: 'Unified Police, Fire & Medical',
    deptMr: 'पोलीस, अग्निशामक व रुग्णवाहिका',
    color: 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
  },
  {
    id: 'ndrf',
    title: 'Disaster Relief (NDRF / SDMA)',
    titleMr: 'आपत्ती प्रतिसाद (NDRF / SDMA)',
    number: '1070',
    altNumber: '1077',
    dept: 'State & District Disaster Control Room',
    deptMr: 'राज्य व जिल्हा आपत्ती नियंत्रण कक्ष',
    color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
  },
  {
    id: 'ambulance',
    title: 'Emergency Medical Ambulance',
    titleMr: 'तातडीची रुग्णवाहिका सेवा',
    number: '108',
    altNumber: '102',
    dept: 'Govt Trauma & Resuscitation Fleet',
    deptMr: 'शासकीय तातडीची आरोग्य सेवा',
    color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
  },
  {
    id: 'pmfby',
    title: 'Crop Insurance Claim (72h)',
    titleMr: 'पंतप्रधान पीक विमा (७२ तास)',
    number: '14447',
    dept: 'Mandatory 72h Damage Intimation',
    deptMr: '७२ तासांत नुकसान भरपाई पूर्वसूचना',
    color: 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
  },
  {
    id: 'kisan',
    title: 'Kisan Call Center (Agro Help)',
    titleMr: 'किसान कॉल सेंटर (कृषी सल्ला)',
    number: '1800-180-1551',
    dept: 'Agronomist Emergency Advice',
    deptMr: 'टोल-फ्री कृषी व पीक नुकसान सल्ला',
    color: 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
  },
  {
    id: 'snakebite',
    title: 'Snakebite Registry & ASV Locator',
    titleMr: 'सर्पदंश मदत व लस उपलब्धता',
    number: '1800-116-117',
    altNumber: '108',
    dept: 'Anti-Snake Venom (ASV) Hospital Network',
    deptMr: 'जवळचे प्रतिसर्पविष केंद्र माहिती',
    color: 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300'
  },
  {
    id: 'power',
    title: 'Electrical Hazard / Live Wire',
    titleMr: 'महावितरण वीज दुर्घटना कक्ष',
    number: '1912',
    altNumber: '1800-233-3435',
    dept: 'MSEDCL Urgent Line Disconnection',
    deptMr: 'तारा तुटणे / विजेचा धक्का तक्रार',
    color: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300'
  },
  {
    id: 'animal',
    title: 'Livestock & Veterinary Emergency',
    titleMr: 'पशू संवर्धन व जनावरे उपचार',
    number: '1962',
    dept: 'Mobile Veterinary Emergency Unit',
    deptMr: 'फिरते पशुवैद्यकीय पथक',
    color: 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300'
  }
];

// ============================================================================
// 2. COMPREHENSIVE DISASTER SAFETY OPERATING PROCEDURES (SOPs)
// ============================================================================
const SOP_CATEGORIES = [
  // 1. FLOODS & DAM WATER RELEASE
  {
    id: 'flood',
    nameEn: 'Floods & Dam Water Release',
    nameMr: 'पूर व धरण विसर्ग सुरक्षा कार्यप्रणाली',
    icon: Waves,
    themeColor: 'from-blue-600 to-cyan-600',
    accentColor: 'text-blue-500',
    badgeColor: 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    quickRuleEn: 'Turn Around, Don’t Drown! 6 inches of moving water knocks an adult down; 12 inches sweeps away a tractor or SUV.',
    quickRuleMr: 'सावधान! वाहत्या पाण्याचा ६ इंची प्रवाह माणसाला पाडतो; १२ इंची प्रवाह ट्रॅक्टर किंवा जीप वाहून नेतो.',
    hotline: { name: 'Disaster Relief / Taluka Control', number: '1077', alt: '1070' },
    phases: {
      before: {
        en: [
          'Monitor dam discharge schedules from Irrigation Dept (Khadakwasla, Koyna, Radhanagari, Jayakwadi).',
          'Elevate harvested produce, fertilizers, and pesticide sacks to high concrete plinths above flood markers.',
          'Unhitch submersible electric pumps and lift motors out of riverbed flood plains.',
          'Store land documents (7/12 extracts, Aadhaar, bank passbooks) in sealed waterproof zip bags.'
        ],
        mr: [
          'पाटबंधारे विभागाच्या धरण विसर्ग घोषणांकडे (खडकवासला, कोयना, राधानगरी, जायकवाडी) बारीक लक्ष ठेवा.',
          'काढणी केलेले धान्य, खते व कीटकनाशकांच्या गोण्या उंचावरच्या सुरक्षित सिमेंट कट्ट्यावर हलवा.',
          'नदीकाठावरील विद्युत मोटारी, पंप व केबल्स पाण्याच्या पातळीच्या वर सुरक्षित काढून घ्या.',
          'जमिनीचे ७/१२, आधार कार्ड, बँक पासबुक वॉटरप्रूफ प्लास्टिक पिशवीत सील करून ठेवा.'
        ]
      },
      during: {
        en: [
          'NEVER CROSS SUBMERGED CAUSEWAYS: Low-level bridges (riverside causeways) collapse or hide invisible scouring pits.',
          'DISCONNECT MAIN ELECTRICAL BREAKER: Switch off home and farm main electrical supply before water ingresses.',
          'EVACUATE UPWARD: Shift family and vulnerable livestock to pre-designated village flood relief centers.',
          'UNTIE LIVESTOCK: Never keep cows/buffaloes tethered tightly in barns; untied animals can swim to higher ground.',
          'SIGNAL RESCUE TEAMS: If stranded on a rooftop, wave a brightly colored cloth or flash a torch in 3-pulse intervals.'
        ],
        mr: [
          'पाण्याखाली गेलेले पूल कधीही ओलांडू नका: पाण्याचा वेग दिसण्यापेक्षा तीव्र असतो आणि खाली रस्ता खचलेला असू शकतो.',
          'घरात पाणी शिरण्यापूर्वी मेन वीज स्वीच बंद करा: शॉर्ट सर्किटमुळे पाण्यात वीज प्रवाह उतरण्याचा धोका टाळा.',
          'उंच सुरक्षित ठिकाणी स्थलांतर करा: ग्रामपंचायतीने ठरवलेल्या पूर निवारण केंद्रात तात्काळ जा.',
          'जनावरांचे दोर मोकळे सोडा: गोठ्यात जनावरांना बांधून ठेवू नका; दोर सोडल्यास ते पोहून उंच जागी स्वतःचा जीव वाचवू शकतात.',
          'मदतीसाठी इशारा करा: छतावर अडकल्यास लाल/पिवळे कापड हलवून किंवा रात्री टॉर्चने ३ वेळा प्रकाश चमकवून इशारा करा.'
        ]
      },
      after: {
        en: [
          'BOIL ALL DRINKING WATER: Vigorously boil water for 5 minutes or use 1 Halazone/Chlorine tablet per 10L to prevent cholera and leptospirosis.',
          'DO NOT ENERGIZE WET ELECTRICAL PANELS: Have certified wiremen inspect circuit breakers before turning power back on.',
          'DOCUMENT CROP DAMAGE WITHIN 72 HOURS: Photograph submerged field acres and submit claim on PMFBY helpline (14447) or Agri Dept portal.',
          'WATCH FOR REPTILE INTRUSIONS: Snakes seek refuge in dry house corners, stacks of hay, and tool sheds after flood recedes.'
        ],
        mr: [
          'पिण्याचे पाणी किमान ५ मिनिटे उकळूनच प्या किंवा क्लोरीन गोळ्या वापरा: लेप्टोस्पायरोसिस व कॉलरा रोखण्यासाठी दक्षता घ्या.',
          'ओले झालेले वीज मीटर व स्टार्टर स्वतः चालू करू नका: वायरमनकडून तपासणी झाल्यावरच वीज पुरवठा सुरू करा.',
          '७२ तासांच्या आत पीक नुकसानीची नोंद करा: शेताचे फोटो काढून १४४४७ किंवा कृषी विभागाच्या पोर्टलवर पूर्वसूचना द्या.',
          'सापांपासून सावधान राहा: पूर ओसरल्यावर साप घरांच्या कोपऱ्यात, गवताच्या गंजीत किंवा शेडमध्ये आश्रय घेतात.'
        ]
      },
      donts: {
        en: [
          'DO NOT drive vehicles or tractors through rushing floodwaters; tires act as floats and vehicles flip easily.',
          'DO NOT allow children to play or swim in floodwater due to open inspection chambers and contaminated runoff.',
          'DO NOT eat food or grain sacks that have directly touched flood waters.',
          'DO NOT touch snapped overhead cables hanging near waterlogged fields.'
        ],
        mr: [
          'पाण्यातून गाडी किंवा ट्रॅक्टर नेण्याचा धोका पत्करू नका; वाहने सहज वाहून उलटतात.',
          'मुलांना पुराच्या पाण्यात खेळू किंवा पोहू देऊ नका; गटारे व विषारी जंतूंचा मोठा धोका असतो.',
          'पुराचे पाणी लागलेले अन्नपदार्थ किंवा धान्य खाऊ नका.',
          'पाण्यात पडलेल्या किंवा लोंबकळणाऱ्या विजेच्या तारांना चुकूनही हात लावू नका.'
        ]
      }
    }
  },

  // 2. EARTHQUAKE & STRUCTURAL TREMORS
  {
    id: 'earthquake',
    nameEn: 'Earthquake & Tremors',
    nameMr: 'भूकंप व भूगर्भीय हादरे सुरक्षा कार्यप्रणाली',
    icon: Building,
    themeColor: 'from-amber-600 to-stone-700',
    accentColor: 'text-amber-600',
    badgeColor: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    quickRuleEn: 'DROP, COVER, HOLD ON! Drop to hands & knees, cover head & neck under a sturdy table, and hold on firmly until shaking stops.',
    quickRuleMr: 'खाली वाका, डोके झाका, घट्ट धरा (Drop, Cover, Hold On)! गुडघ्यांवर खाली बसा, मजबूत टेबलखाली डोके झाका आणि हादरे थांबेपर्यंत घट्ट धरा.',
    hotline: { name: 'National Unified Emergency', number: '112', alt: '1070' },
    phases: {
      before: {
        en: [
          'Identify safe shelter zones in every room: Under solid wooden tables, heavy desks, or against interior load-bearing pillars.',
          'Fasten heavy furniture, steel cupboards, and wall-mounted overhead water storage tanks with L-brackets.',
          'Keep breakable heavy items and chemical containers on lower shelves with safety door latches.',
          'Keep sturdy shoes and a torch next to family beds for night evacuations without foot injuries.'
        ],
        mr: [
          'घरातील सुरक्षित जागा ओळखा: भक्कम लाकडी टेबलखाली किंवा अंतर्गत मजबूत खांबाजवळ.',
          'जड लोखंडी कपाटे, पुस्तकांचे रॅक व पाण्याच्या टाक्या स्क्रू-ब्रॅकेटने भिंतीला घट्ट जोडून घ्या.',
          'काचेच्या व जड वस्तू जमिनीलगतच्या खालच्या कपाटांमध्ये ठेवा.',
          'रात्रीसाठी बेडजवळ टॉर्च आणि मजबूत बूट हाताशी ठेवा जेणेकरून काचांवरून जाताना पाय कापणार नाहीत.'
        ]
      },
      during: {
        en: [
          'IF INDOORS: DROP to your hands and knees. COVER head and neck beneath a sturdy desk or interior corner. HOLD ON until shaking ceases.',
          'STAY CLEAR OF EXTERIOR WINDOWS, brick chimneys, loose tile overhangs, and hanging chandeliers.',
          'IF IN OPEN FIELD / FARM: Stay away from buildings, high-voltage transmission towers, stone fences, and deep well rims. Drop to the ground.',
          'IF DRIVING A TRACTOR / CAR: Pull over safely away from flyovers, power lines, and steep rock walls. Remain seated until tremors cease.'
        ],
        mr: [
          'घरामध्ये असल्यास: तात्काळ गुडघ्यांवर खाली बसा. डोके आणि मान मजबूत टेबलखाली झाका आणि टेबलचा पाय घट्ट धरून ठेवा. टेबल नसल्यास आतील भिंतीजवळ डोके हाताने झाकून बसा.',
          'खिडक्यांच्या काचा, आरसे, कौले आणि बाहेरील भिंतींपासून लांब राहा.',
          'शेतात किंवा मोकळ्या जागेत असल्यास: इमारती, विजेचे खांब, दगडी कुंपण आणि विहिरीच्या काठापासून लांब मोकळ्या मैदानात बसा.',
          'वाहन किंवा ट्रॅक्टर चालवत असल्यास: पूल किंवा विजेच्या तारा नसलेल्या रस्त्याच्या कडेला गाडी थांबवा आणि हादरे संपेपर्यंत आतच थांबा.'
        ]
      },
      after: {
        en: [
          'EXPECT AFTERSHOCKS: Secondary tremors often occur minutes or hours after the main quake; stay alert.',
          'CHECK FOR GAS & FUEL LEAKS: Turn off LPG cylinder valves immediately; do NOT operate light switches if smell is detected.',
          'INSPECT STRUCTURAL INTEGRITY: If walls show diagonal 45-degree shear cracks, evacuate premises immediately.',
          'USE WHISTLES TO SIGNAL RESCUERS: Shouting inhales dangerous airborne brick dust; blow a whistle repeatedly.'
        ],
        mr: [
          'दुय्यम हादऱ्यांसाठी (Aftershocks) तयार राहा: मुख्य भूकंपाच्या नंतरही काही मिनिटांत किंवा तासांत धक्के बसू शकतात.',
          'गॅस सिलिंडर व्हॉल्व्ह तात्काळ बंद करा: गॅस गळतीचा वास आल्यास वीज स्वीच चालू-बंद करू नका किंवा काडी पेटवू नका.',
          'घराच्या भिंती तपासा: भिंतींना तिरपे मोठे तडे गेले असल्यास घरात थांबू नका, मोकळ्या जागी सुरक्षित राहा.',
          'मदतीसाठी शिट्टी वाजवा: ढिगाऱ्याखाली अडकल्यास ओरडण्याने धूळ फुफ्फुसात जाते; शिट्टी वाजवून किंवा दगडावर दगड आपटून आवाज करा.'
        ]
      },
      donts: {
        en: [
          'DO NOT rush to staircases or building exits during active tremors; falling facade masonry causes the majority of fatalities.',
          'DO NOT use elevators or mechanical lifts; power grids trip instantly during quakes.',
          'DO NOT light matches or lighters until structural engineers verify zero fuel/gas line leaks.'
        ],
        mr: [
          'हादरे चालू असताना जिन्यावरून खाली धावू नका; इमारतीच्या बाहेर पडताना पडणाऱ्या विटा व काचांमुळे सर्वाधिक मृत्यू होतात.',
          'लिफ्टचा वापर चुकूनही करू नका.',
          'हादरे थांबल्यावर लगेच काडीपेटी, मेणबत्ती पेटवू नका किंवा वीज स्वीच चालू करू नका.'
        ]
      }
    }
  },

  // 3. CYCLONE & SEVERE GALE WINDS
  {
    id: 'cyclone',
    nameEn: 'Cyclone & Severe Gale Winds',
    nameMr: 'चक्रीवादळ व तीव्र वादळी वारे',
    icon: Wind,
    themeColor: 'from-sky-600 to-indigo-600',
    accentColor: 'text-sky-500',
    badgeColor: 'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    quickRuleEn: 'Beware the Eye of the Storm! When violent gales abruptly turn dead calm, do not go outside. The eye is passing; reverse gales hit with double velocity within minutes.',
    quickRuleMr: 'चक्रीवादळाचा डोळा: वारे अचानक पूर्ण शांत झाले तरी बाहेर पडू नका. वादळाचा केंद्रबिंदू पुढे जाताच उलट दिशेने दुप्पट वेगाने वादळ पुन्हा धडकते.',
    hotline: { name: 'State Disaster Management Room', number: '1070', alt: '112' },
    phases: {
      before: {
        en: [
          'Prune dead overhanging branches touching roofs or low-tension power cables.',
          'Secure loose galvanized iron (GI) roof sheets and tin sheds with heavy J-bolts and sandbags.',
          'Provide bamboo staking and prop supports for banana plantations, papaya orchards, and sugarcane.',
          'Fasten greenhouse / polyhouse curtains securely to prevent destructive wind billowing.'
        ],
        mr: [
          'घरावर किंवा विजेच्या तारांवर आलेल्या झाडांच्या सुक्या फांद्या वेळीच छाटून टाका.',
          'घरावरील व गोठ्यावरील पत्रे तारांनी, स्क्रूने व वाळूच्या गोण्यांनी घट्ट बांधून घ्या.',
          'केळीच्या बागा, पपई आणि ऊस पिकाला बांबूचे भक्कम टेकू द्या.',
          'पॉलीहाऊस व शेडनेटचे पडदे सैल न ठेवता वादळी वाऱ्यापूर्वी घट्ट बांधा.'
        ]
      },
      during: {
        en: [
          'RETREAT TO CENTRAL REINFORCED ROOM: Stay inside interior rooms with reinforced masonry away from glass panes.',
          'KEEP ALL DOORS AND SHUTTERS SECURELY LATCHED: An open windward door creates explosive aerodynamic roof uplift.',
          'DISCONNECT LPG CYLINDER REGULATOR: Turn off gas cylinder supply to prevent fires if roofing is damaged.',
          'KEEP TRACTORS & HARVESTERS SHELTERED: Park machinery in garage or behind windbreak shelterbelts, away from tall trees.'
        ],
        mr: [
          'घरातील सर्वात मजबूत खोलीत थांबा: खिडक्या नसलेल्या मध्यवर्ती खोलीत सुरक्षित आश्रय घ्या.',
          'सर्व दारे आणि खिडक्या घट्ट बंद ठेवा: वाऱ्याने आत शिरल्यास घराचे छप्पर उडण्याचा धोका वाढतो.',
          'घरगुती गॅस सिलिंडरचे रेग्युलेटर बंद करा.',
          'ट्रॅक्टर व कृषी यंत्रे मोठ्या झाडांपासून दूर सुरक्षित शेडमध्ये पार्क करा.'
        ]
      },
      after: {
        en: [
          'STAY CLEAR OF FALLEN WIRES: Treat all downed power lines as live until certified by electricity company staff.',
          'DRAIN EXCESS ORCHARD WATER: Make immediate trench channels to prevent root rot in pomegranate and citrus trees.',
          'REPORT ANIMAL CASUALTIES TO VETERINARY DISPENSARY: Contact helpline 1962 for prompt disposal and vaccination.'
        ],
        mr: [
          'तुटलेल्या विजेच्या तारांपासून लांब राहा: तारांमध्ये वीज प्रवाह सुरू असण्याची दाट शक्यता असते.',
          'फळबागांमधील साचलेले पाणी बाहेर काढा: डाळिंब व संत्रा बागांमध्ये पाणी साचल्यास मूळकुजव्या रोग होतो, लगेच चर काढा.',
          'जनावरांच्या दुखापतींची १९६२ वर नोंद करा: फिरत्या पशुवैद्यकीय पथकाची मदत घ्या.'
        ]
      },
      donts: {
        en: [
          'DO NOT venture outdoors during the deceptive calm of the storm center.',
          'DO NOT park vehicles or cattle beneath gulmohar, neem, or eucalyptus trees.',
          'DO NOT touch corrugated metal roofs that have been struck by utility poles.'
        ],
        mr: [
          'वादळ अचानक थांबले तरी घराबाहेर पडू नका; वादळाचा दुसरा भाग अधिक तीव्र असतो.',
          'मोठ्या झाडांखाली किंवा कच्च्या पत्र्यांच्या शेडखाली उभे राहू नका.',
          'विजेचा खांब पडलेल्या पत्र्यांच्या शेडला हात लावू नका.'
        ]
      }
    }
  },

  // 4. LIGHTNING & THUNDERSTORMS
  {
    id: 'lightning',
    nameEn: 'Lightning & Thunderstorms',
    nameMr: 'वीज व मेघगर्जना सुरक्षा कार्यप्रणाली',
    icon: Zap,
    themeColor: 'from-amber-500 to-yellow-500',
    accentColor: 'text-amber-500',
    badgeColor: 'bg-yellow-100 dark:bg-yellow-950/80 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    quickRuleEn: 'The 30-30 Rule: If time from flash to thunder is under 30 seconds, immediately take shelter inside a pucca building. Wait 30 minutes after last thunder before resuming field work.',
    quickRuleMr: '३०-३० नियम: वीज चमकणे आणि गडगडाट यातील अंतर ३० सेकंदांपेक्षा कमी असल्यास लगेच पक्क्या घरात जा. शेवटचा गडगडाट थांबल्यानंतर ३० मिनिटांनीच शेतात काम सुरू करा.',
    hotline: { name: 'Emergency Medical Service', number: '108', alt: '1912' },
    phases: {
      before: {
        en: [
          'Halt field operations when dark cumulonimbus thunderclouds form overhead.',
          'Identify the nearest pucca (concrete) building or fully enclosed metal-roof vehicle for shelter.',
          'Switch off irrigation pump starters and unplug television and inverter devices.',
          'Never plan open field spraying or harvesting when thunderstorms are nowcasted.'
        ],
        mr: [
          'आकाशात उंच गडद काळे ढग जमा होताच शेतातील कामे त्वरित थांबवा.',
          'जवळच्या पक्क्या सिमेंटच्या घराचा किंवा बंदिस्त गाडीचा तात्काळ आसरा घ्या.',
          'विहिरीचे मोटार पंप आणि घरातील वीज उपकरणे बंद करून प्लग काढा.',
          'विजेचा इशारा दिला असताना खुल्या शेतात खुरपणी किंवा फवारणी करू नका.'
        ]
      },
      during: {
        en: [
          'LIGHTNING CROUCH (If caught in open): Squat low on balls of feet, tuck head between knees, cover ears. NEVER lie flat on the ground.',
          'AVOID LONE TREES: Tall isolated trees in farm fields act as lightning attractors and ground step-voltage conductors.',
          'STAY AWAY FROM METAL OBJECTS: Step away from tractor metal frames, wire fencing, shade net poles, and irrigation pipes.',
          'DISMOUNT TWO-WHEELERS IMMEDIATELY: Motorcycles and open carts offer zero electrical insulation.',
          'INDOOR SAFETY: Avoid touching metal plumbing taps, wired landline telephones, and reinforced concrete walls.'
        ],
        mr: [
          'विजेची बैठक (खुल्या मैदानात असल्यास): पायाच्या चवड्यांवर खाली वाका, गुडघ्यांवर डोके टेकवा आणि दोन्ही हातांनी कान झाका. जमिनीवर कधीही सपाट झोपू नका.',
          'एकट्या मोठ्या झाडाखाली उभे राहू नका: झाडावर वीज पडण्याची दाट शक्यता असते आणि ती जमिनीतून शरीरात प्रवेश करते.',
          'धातूच्या वस्तूंपासून लांब राहा: ट्रॅक्टर, तारांचे कुंपण, शेडनेटचे लोखंडी खांब आणि पाईपलाईनपासून २० फूट लांब राहा.',
          'दुचाकीवरून तात्काळ उतरा: उघड्या वाहनांवर विजेचा मोठा धोका असतो.',
          'घरामध्ये असल्यास: नळाचे पाणी, धातूचे जिने आणि खिडक्यांना स्पर्श करू नका.'
        ]
      },
      after: {
        en: [
          'LIGHTNING VICTIMS CARRY NO ELECTRICAL CHARGE: It is 100% safe to touch and administer first aid immediately.',
          'COMMENCE HANDS-ONLY CPR: If victim is unresponsive and not breathing, push hard and fast at chest center (100-120 bpm). Call 108.',
          'CHECK FOR EXIT WOUNDS & BURNS: Treat singed skin with clean sterile dressings while waiting for emergency ambulance.'
        ],
        mr: [
          'वीज पडलेल्या व्यक्तीमध्ये कोणताही विद्युत प्रवाह शिल्लक नसतो: त्यांना तात्काळ हात लावून प्रथमोपचार करणे १००% सुरक्षित आहे.',
          'तात्काळ सीपीआर (CPR) द्या: व्यक्ती श्वास घेत नसल्यास छातीच्या मध्यभागी दोन्ही हातांनी जोरात दर मिनिटाला १००-१२० वेळा दाबा. १०८ ला कॉल करा.',
          'भाजलेल्या जागेवर स्वच्छ मलमपट्टी करा आणि तात्काळ रुग्णालयात हलवा.'
        ]
      },
      donts: {
        en: [
          'DO NOT hold umbrellas with metal tips upright in agricultural fields.',
          'DO NOT crowd together: Maintain at least 15 feet separation between family members when running for shelter.',
          'DO NOT bathe, shower, or wash dishes during severe lightning storms.'
        ],
        mr: [
          'लोखंडी टोक असलेली छत्री शेतात उघडून चालू नका.',
          'समुहाने एकत्र उभे राहू नका: वीज कडाडत असताना एकमेकांपासून किमान १५ फूट अंतर ठेवा.',
          'विजेच्या गडगडाटात नळाच्या पाण्यात हात धुणे किंवा आंघोळ करणे टाळा.'
        ]
      }
    }
  },

  // 5. SEVERE DROUGHT & CROP WATER SCARCITY
  {
    id: 'drought',
    nameEn: 'Severe Drought & Crop Water Scarcity',
    nameMr: 'तीव्र दुष्काळ व पीक पाणी टंचाई कार्यप्रणाली',
    icon: Droplets,
    themeColor: 'from-amber-700 to-yellow-600',
    accentColor: 'text-amber-700',
    badgeColor: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    quickRuleEn: 'Prioritize Perennial Orchards! When water reserves drop below 30%, thin 50% of the fruit load immediately to preserve tree longevity.',
    quickRuleMr: 'फळबागा वाचवण्यास प्रथम प्राधान्य द्या! पाणी ३०% खाली गेल्यास फळांची ५०% विरळणी करा जेणेकरून झाडे जिवंत राहतील.',
    hotline: { name: 'Kisan Agricultural Call Center', number: '1800-180-1551', alt: '14447' },
    phases: {
      before: {
        en: [
          'Line farm ponds (shet tale) with 500-micron UV-stabilized geomembrane sheets to stop seepage loss.',
          'Apply 10-15 cm organic straw/trash mulch across sugarcane, banana, and pomegranate root basins.',
          'Schedule pulse drip irrigation strictly during night hours (10:00 PM to 5:00 AM) to slash solar evaporation.',
          'Install sub-surface drip lateral lines to deliver water directly to root zones.'
        ],
        mr: [
          'शेततळ्याला ५०० मायक्रॉन प्लास्टिक अस्तरीकरण करून भूगर्भात पाण्याचा निचरा होणे थांबवा.',
          'ऊस, डाळिंब व केळीच्या बुंध्याशी १०-१५ सेमी जाडीचे उसाचे पाचट किंवा भुशाचे आच्छादन (Mulching) करा.',
          'बाष्पीभवन टाळण्यासाठी फक्त रात्रीच्या वेळी (रात्री १० ते पहाटे ५) ठिबक सिंचनाने पाणी द्या.',
          'मुळांच्या कक्षेत थेट पाणी पोहोचवण्यासाठी उप-पृष्ठीय ठिबक सिंचनाचा वापर करा.'
        ]
      },
      during: {
        en: [
          'SPRAY ANTI-TRANSPIRANTS: Apply 5% kaolin spray to reflect excess solar radiation and cut transpiration by 30%.',
          'PRUNE WATER SHOOTS: Trim unproductive vegetative suckers to reduce crop water consumption.',
          'ALTERNATE FURROW WATERING: Water alternate furrows in cotton and maize crops to conserve 40% water.',
          'LIVESTOCK FODDER ENRICHMENT: Treat dry straw/fodder with 2% urea-jaggery-mineral solution to maintain nutritional intake.'
        ],
        mr: [
          'बाष्पोत्सर्जन रोधक फवारणी: झाडांच्या पानांवर ५% केओलिन (पांढरी माती) फवारा, यामुळे बाष्पीभवन ३०% कमी होते.',
          'अनावश्यक फांद्यांची छाटणी करा: झाडांची पाण्याची गरज कमी करण्यासाठी अतिरिक्त फांद्या व पाने काढून टाका.',
          'एक आड एक सरी सिंचन: कपाशी आणि मका पिकात एका आड एक सरीने पाणी देऊन ४०% पाण्याची बचत करा.',
          'जनावरांच्या चाऱ्याचे नियोजन: कोरडा चारा २% युरिया-गुळाच्या मिश्रणाने प्रक्रिया करून पौष्टिक बनवा.'
        ]
      },
      after: {
        en: [
          'DEEP CHISEL PLOWING: After drought breaks, perform deep chisel plowing across contours to maximize monsoon recharge.',
          'SOIL ORGANIC AMENDMENTS: Incorporate well-decomposed farmyard manure (FYM) and green manuring crops (dhaincha/sunhemp).'
        ],
        mr: [
          'पावसाळ्यापूर्वी खोल नांगरणी: पावसाचे पाणी जमिनीत मुरावे यासाठी उताराला आडवी खोल नांगरणी करा.',
          'सेंद्रिय खतांचा वापर: शेणखत व ताग-धैंचा यांसारखी हिरवळीची खते जमिनीत मिसळून ओलावा धरून ठेवण्याची क्षमता वाढवा.'
        ]
      },
      donts: {
        en: [
          'DO NOT flood-irrigate open furrows during peak midday heat (over 60% evaporates immediately).',
          'DO NOT sow water-intensive seasonal crops during extended dry spells.',
          'DO NOT run dry borewell pumps continuously causing motor burnout.'
        ],
        mr: [
          'दुपारच्या कडक उन्हात पाटाने मोकळे पाणी सोडू नका (६०% पाणी वाफ होऊन उडून जाते).',
          'दुष्काळी परिस्थितीत जास्त पाणी लागणाऱ्या पिकांची पेरणी करू नका.',
          'पाणी नसताना बोअरवेल जास्त वेळ चालवून मोटार जळू देऊ नका.'
        ]
      }
    }
  },

  // 6. SEVERE HAILSTORM & SQUALL
  {
    id: 'hailstorm',
    nameEn: 'Severe Hailstorm & Squall',
    nameMr: 'गारपीट व अचानक वादळ सुरक्षा',
    icon: CloudRain,
    themeColor: 'from-cyan-600 to-blue-700',
    accentColor: 'text-cyan-500',
    badgeColor: 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    quickRuleEn: 'Protect Head & Neck Immediately! Falling hailstones at 80-120 km/h cause severe concussions and skull trauma.',
    quickRuleMr: 'डोके व मान सर्वात आधी सुरक्षित करा! ताशी ८० ते १२० किमी वेगाने पडणाऱ्या गारा प्राणघातक ठरू शकतात.',
    hotline: { name: 'PMFBY 72-Hour Loss Claim', number: '14447', alt: '108' },
    phases: {
      before: {
        en: [
          'Check anti-hail net tension across grape vineyards and high-density pomegranate orchards.',
          'Keep thick cotton tarpaulins and heavy gunny sacks ready to shield livestock pens.',
          'Clear roof valley gutters so piled hail does not create roof ponding and sudden structural collapse.'
        ],
        mr: [
          'द्राक्ष व डाळिंब बागांमधील गारपीट प्रतिबंधक जाळ्यांची (Anti-hail nets) तपासणी करा.',
          'जनावरे झाकण्यासाठी जाड ताडपत्री व गोणपाटाची पोती तयार ठेवा.',
          'छतावरील पाण्याचा निचरा मोकळा ठेवा जेणेकरून गारांचा भार छतावर साचणार नाही.'
        ]
      },
      during: {
        en: [
          'SHELTER BENEATH CONCRETE ROOF: Tin and asbestos roof sheets can be shattered by large hailstones.',
          'BRING LIVESTOCK UNDER SOLID COVER: Cover exposed cattle with thick gunny bags immediately.',
          'IF IN A CAR: Pull over safely beneath an overpass. Angle vehicle so hail impacts laminated windshield rather than side tempered glass.'
        ],
        mr: [
          'पक्क्या सिमेंटच्या छताखाली थांबा: पत्र्याचे छत गारांच्या जोरदार माऱ्याने फाटू शकते.',
          'जनावरांना सुरक्षित निवाऱ्यात आणा: उघड्यावरील जनावरांच्या पाठीवर जाड गोणपाट किंवा ताडपत्री टाका.',
          'गाडीत असल्यास: गाडी पुलाखाली किंवा सुरक्षित ठिकाणी थांबवा. खिडक्यांपासून तोंड दूर ठेवा.'
        ]
      },
      after: {
        en: [
          'CROP LOSS INTIMATION WITHIN 72 HOURS: Call PMFBY toll-free (14447) within 72 hours. Take geotagged photographs with local Talathi/Gram Sevak.',
          'ANTIFUNGAL RESCUE SPRAY: Apply copper oxychloride (COC 2.5g/L) to hail-bruised orchards to prevent bacterial canker infection.'
        ],
        mr: [
          '७२ तासांच्या आत विमा कंपनीला कळवा: १४४४७ या टोल-फ्री क्रमांकावर तक्रार नोंदवून पंचनाम्यासाठी कृषी सहाय्यक/तलाठी यांच्याशी संपर्क साधा.',
          'बुरशीनाशक फवारणी: गारांच्या माऱ्याने झाडांवर झालेल्या जखमा भरण्यासाठी कॉपर ऑक्सिक्लोराईड (२.५ ग्रॅम/लिटर) फवारा.'
        ]
      },
      donts: {
        en: [
          'DO NOT run outside to collect hailstones or photograph them during active strikes.',
          'DO NOT shelter under polyhouse plastic sheets during a hailstorm.',
          'DO NOT touch downed electrical cables snapped by hail-laden tree branches.'
        ],
        mr: [
          'गारा वेचण्यासाठी किंवा फोटो काढण्यासाठी उघड्यावर धावू नका.',
          'पॉलीहाऊस किंवा प्लास्टिक शेडखाली थांबू नका, ते गारांमुळे तुटू शकते.',
          'गारांच्या वजनाने झाडे पडून तुटलेल्या विजेच्या तारांना हात लावू नका.'
        ]
      }
    }
  },

  // 7. EXTREME HEATWAVE & SUNSTROKE
  {
    id: 'heat',
    nameEn: 'Extreme Heatwave & Sunstroke',
    nameMr: 'उष्णतेची तीव्र लाट व उष्माघात कार्यप्रणाली',
    icon: Sun,
    themeColor: 'from-orange-600 to-amber-600',
    accentColor: 'text-orange-500',
    badgeColor: 'bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    quickRuleEn: 'Cool the Core First! If someone collapses with hot, dry red skin and altered consciousness, apply ice/cold water to neck, armpits, and groin immediately and dial 108.',
    quickRuleMr: 'शरीर तात्काळ थंड करा! उष्माघाताने रुग्ण बेशुद्ध पडल्यास मान, बगला व जांघेत थंड पाण्याच्या पट्ट्या ठेवा आणि तात्काळ १०८ ला फोन करा.',
    hotline: { name: 'Emergency Medical Trauma', number: '108', alt: '102' },
    phases: {
      before: {
        en: [
          'Shift heavy farm labor, spraying, and weeding to early mornings (6:00 AM - 10:30 AM) and evenings (4:30 PM - 7:00 PM).',
          'Provide 80-100 liters of cool, clean drinking water per dairy animal daily; paint shed roofs white to reflect thermal radiation.',
          'Keep Oral Rehydration Salts (ORS), lemon juice, raw mango panna, and buttermilk stocked in farm houses.'
        ],
        mr: [
          'शेतातील कष्टाची कामे व फवारणी सकाळी ६ ते १०:३० आणि संध्याकाळी ४:३० ते ७ या वेळेतच करा.',
          'प्रत्येक दुभत्या जनावरासाठी दररोज ८० ते १०० लिटर थंड पिण्याच्या पाण्याची सोय करा; गोठ्याच्या छतावर चुना लावा.',
          'ओआरएस (ORS), लिंबू पाणी, कैऱ्यांचे पन्हे व ताक मुबलक प्रमाणात तयार ठेवा.'
        ]
      },
      during: {
        en: [
          'FREQUENT HYDRATION: Drink water every 20 minutes even if not thirsty; avoid caffeinated drinks and alcohol.',
          'WEAR LOOSE, LIGHT-COLORED COTTON CLOTHING: Use wide-brim hats or cloth wraps (gamchha) to cover head and neck completely.',
          'HEATSTROKE EMERGENCY FIRST AID: Move victim to shade. Remove outer clothes. Sponge body with cold water. Place ice packs on neck and armpits. Call 108.'
        ],
        mr: [
          'दर २० मिनिटांनी पाणी प्या: तहान नसली तरी सतत पाणी पीत राहा; चहा-कॉफी टाळा.',
          'सुती सैल पांढरे कपडे वापरा: डोके, मान व कान झाकण्यासाठी रुमाल किंवा टोपीचा वापर करा.',
          'उष्माघात प्रथमोपचार: रुग्णाला सावलीत आणा. कपडे सैल करा. अंगावर थंड पाण्याचे बोळे ठेवा. मान व बगलेत बर्फाच्या पट्ट्या ठेवा. १०८ वर कॉल करा.'
        ]
      },
      after: {
        en: [
          'GRADUAL RE-HYDRATION: Sip electrolyte solutions slowly; do not gulp large volumes of ice-cold water instantly.',
          'REST UNDER VENTILATION: Avoid strenuous field exertion for at least 48 hours following heat exhaustion.'
        ],
        mr: [
          'हळूहळू पाणी प्या: एकदम जास्त थंड पाणी पिण्याऐवजी हळूहळू घोट-घोट इलेक्ट्रोलाईट पाणी प्या.',
          'किमान ४८ तास कडक उन्हात जाणे टाळा व विश्रांती घ्या.'
        ]
      },
      donts: {
        en: [
          'DO NOT leave children, seniors, or pets inside locked parked cars even for 5 minutes (internal temps reach 55°C).',
          'DO NOT give fluids by mouth to an unconscious or vomiting victim.',
          'DO NOT work in open fields between 11:30 AM and 3:30 PM during Red heat advisories.'
        ],
        mr: [
          'लहान मुलांना किंवा जनावरांना बंद गाडीत ५ मिनिटेही ठेवू नका (गाडीचे तापमान ५५°C पर्यंत पोहोचते).',
          'बेशुद्ध व्यक्तीच्या तोंडात पाणी ओतण्याचा प्रयत्न करू नका; श्वासनलिकेत पाणी जाऊन मृत्यू होऊ शकतो.',
          'दुपारी ११:३० ते ३:३० या वेळेत उघड्या शेतात काम करू नका.'
        ]
      }
    }
  },

  // 8. GHAT LANDSLIDE & ROCKFALL
  {
    id: 'landslide',
    nameEn: 'Ghat Landslide & Rockfall',
    nameMr: 'दरड कोसळणे व घाट रस्ता सुरक्षा कार्यप्रणाली',
    icon: Mountain,
    themeColor: 'from-stone-600 to-amber-700',
    accentColor: 'text-stone-500',
    badgeColor: 'bg-stone-100 dark:bg-stone-950/80 text-stone-800 dark:text-stone-300 border-stone-200 dark:border-stone-800',
    quickRuleEn: 'Run Perpendicular to the Slide Path! Mud and boulders travel directly downhill along the fall line; run laterally to solid ridges.',
    quickRuleMr: 'दरडीच्या मार्गाला काटकोनात (बाजूला) पळा! चिखल व दगड उताराच्या दिशेने सरळ खाली येतात, तिच्या समोर खाली धावू नका.',
    hotline: { name: 'District Police & Traffic Control', number: '112', alt: '1077' },
    phases: {
      before: {
        en: [
          'Check district police advisories before traveling through Western Ghat passes (Tamhini, Varandha, Bhor, Malshej).',
          'Watch for hillside early warning signs: New plaster fissures in slope homes, tilted electric poles, sudden muddy spring discharges.',
          'Ensure slope drainage weep holes in retaining walls are free of silt and vegetation.'
        ],
        mr: [
          'ताम्हिणी, वरंधा, भोर, माळशेज घाटातून प्रवास करण्यापूर्वी पोलीस/आपत्ती कक्षाचे अपडेट तपासा.',
          'डोंगराळ भागातील पूर्वलक्षणे ओळखा: घराच्या भिंतींना तडे जाणे, विजेचे खांब कलणे, जमिनीतून अचानक गढूळ पाण्याचे झरे फुटणे.',
          'संरक्षक भिंतींमधील पाण्याचा निचरा होणारे छिद्र (Weep holes) मोकळे ठेवा.'
        ]
      },
      during: {
        en: [
          'HEAR ROARING RUMBLE: A faint deep rumbling sound that swells rapidly indicates an oncoming debris flow. Flee to high, solid ground.',
          'IF IN VEHICLE ON GHAT ROAD: Unfasten seatbelt, unlock all doors, and abandon vehicle immediately if rockfall starts hitting roadway.',
          'CURL INTO A PROTECTIVE BALL: If debris flow catches you and escape is impossible, curl tight with hands protecting head and neck.'
        ],
        mr: [
          'गडगडाटाचा मोठा आवाज ऐकू आल्यास: दरड खाली येण्यापूर्वी खोल आवाज होतो, तात्काळ दोन्ही बाजूंना उंच जागेवर पळा.',
          'घाटात गाडीवर दगड पडू लागल्यास: गाडी थांबवून सीटबेल्ट काढा, दरवाजे उघडा आणि डोंगराच्या उलट बाजूला सुरक्षित व्हा.',
          'अडकून पडल्यास: डोके आणि मान दोन्ही हातांनी झाकून शरीराची घट्ट गुंडाळी करा.'
        ]
      },
      after: {
        en: [
          'AVOID RESIDUAL SLIDES: Secondary slope failures occur frequently after initial collapse; keep away from slope toe.',
          'REPORT BLOCKED GHAT PASSES TO TRAFFIC POLICE (112): Provide exact kilometer milestones to accelerate heavy earthmover deployment.'
        ],
        mr: [
          'पुन्हा दरड कोसळण्याचा धोका: पहिला भाग कोसळल्यानंतर बाकीचा भागही खाली येऊ शकतो; डोंगराच्या पायथ्याशी जाऊ नका.',
          '११२ वर घाट रस्ता बंद झाल्याची माहिती द्या: जेसीबी व आपत्कालीन पथक पाठवण्यासाठी नेमका किलोमीटर फलक सांगा.'
        ]
      },
      donts: {
        en: [
          'DO NOT stop vehicles under blind ghat cliffs during torrential downpours to click photos of seasonal waterfalls.',
          'DO NOT return to an evacuated hillside house until certified safe by Geological Survey of India (GSI) or SDMA.'
        ],
        mr: [
          'मुसळधार पावसात घाटातील वळणांवर धबधब्यांजवळ सेल्फी काढण्यासाठी गाडी थांबवू नका.',
          'प्रशासनाने अधिकृत सुरक्षित घोषित करेपर्यंत दरडप्रवण घराजवळ पुन्हा जाऊ नका.'
        ]
      }
    }
  },

  // 9. PESTICIDE POISONING & AGROCHEMICAL ACCIDENTS
  {
    id: 'chemical',
    nameEn: 'Pesticide Poisoning & Chemical Accidents',
    nameMr: 'कीटकनाशक विषबाधा व शेती रसायने कार्यप्रणाली',
    icon: Bug,
    themeColor: 'from-lime-600 to-emerald-700',
    accentColor: 'text-lime-600',
    badgeColor: 'bg-lime-100 dark:bg-lime-950/80 text-lime-800 dark:text-lime-300 border-lime-200 dark:border-lime-800',
    quickRuleEn: 'Flush Skin & Eyes for 15 Continuous Minutes! Strip pesticide-soaked clothes immediately. Never induce vomiting in an unconscious victim!',
    quickRuleMr: 'त्वचा व डोळे १५ मिनिटे सतत पाण्याने धुवा! औषध सांडलेले कपडे तात्काळ काढा. बेशुद्ध रुग्णाला उलट्या करू देऊ नका!',
    hotline: { name: 'Emergency Medical Ambulance', number: '108', alt: '1800-180-1551' },
    phases: {
      before: {
        en: [
          'Mandatory Personal Protective Equipment (PPE): Rubber gloves, eye goggles, certified mask, full-sleeve suit, and gumboots during mixing.',
          'Never spray against the wind direction; always spray walking with wind at your back.',
          'Store all chemical bottles inside locked, ventilated cabinets well away from cattle feed and grain sacks.'
        ],
        mr: [
          'फवारणी करताना सुरक्षा साधने (PPE): रबरी हातमोजे, मास्क, डोळ्यांचा चष्मा आणि गमबूट सक्तीने वापरा.',
          'वाऱ्याच्या उलट दिशेने कधीही फवारणी करू नका; नेहमी वाऱ्याच्या दिशेने पुढे चाला.',
          'कीटकनाशकांच्या बाटल्या जनावरे व अन्नधान्यापासून दूर कुलूपबंद कपाटात ठेवा.'
        ]
      },
      during: {
        en: [
          'SKIN EXPOSURE: Strip off soaked clothes. Wash skin, hair, and nails with soap and running water for 15 minutes.',
          'EYE SPLASH: Hold eyelids wide open and flush with clean, gentle running water for 15 continuous minutes. Rush to hospital.',
          'CHEMICAL INHALATION: Move victim immediately to fresh breezy air. Loosen collar and waist belt. Keep airway unobstructed.',
          'TAKE THE ORIGINAL CHEMICAL BOTTLE/LABEL to the doctor so specific antidotes (Atropine, PAM) can be given without delay.'
        ],
        mr: [
          'अंगावर औषध सांडल्यास: कपडे तात्काळ काढून टाका. साबण आणि पाण्याने त्वचा, डोके व नखे १५ मिनिटे स्वच्छ धुवा.',
          'डोळ्यात औषध उडाल्यास: डोळ्यांच्या पापण्या उघड्या धरून १५ मिनिटे सतत स्वच्छ पाण्याने धुवा.',
          'विषारी वायू पोटात गेल्यास: रुग्णाला मोकळ्या, हवेशीर जागेत आणा. कपडे सैल करा.',
          'रुग्णालयात जाताना औषधाची मूळ बाटली सोबत न्या, जेणेकरून डॉक्टर अचूक उतारा (Antidote) देऊ शकतील.'
        ]
      },
      after: {
        en: [
          'PUNCH HOLES IN EMPTY CANS: Never reuse empty pesticide cans for storing drinking water, milk, or cooking oil; crush and bury safely.',
          'WASH SPRAY CLOTHES SEPARATELY: Wash spraying work clothes separately from family laundry using detergent.'
        ],
        mr: [
          'रिकामे डबे नष्ट करा: रिकामे औषधांचे डबे पिण्याच्या पाण्यासाठी किंवा धान्यासाठी कधीही वापरू नका; ते फोडून जमिनीत पुरा.',
          'फवारणीचे कपडे वेगळे धुवा: घरच्या कपड्यांसोबत न धुता वेगळे धुवा आणि साबणाने आंघोळ करा.'
        ]
      },
      donts: {
        en: [
          'DO NOT blow through clogged spray nozzles with your mouth! Use a thin wire or grass stem.',
          'DO NOT smoke, chew tobacco, or eat snacks while spraying chemicals.',
          'DO NOT wash spray tanks in open village drinking water wells or community ponds.'
        ],
        mr: [
          'स्प्रेअरचा नोझल तुंबल्यास तोंडाने फुंक मारू नका! काडी किंवा बारीक तारेचा वापर करा.',
          'फवारणी करताना तंबाखू खाणे, बिडी पिणे किंवा पाणी पिणे टाळा.',
          'फवारणीचे पंप पिण्याच्या विहिरीजवळ किंवा गावाच्या तलावात धुवू नका.'
        ]
      }
    }
  },

  // 10. EMERGENCY FIRST AID, CPR & SNAKEBITE
  {
    id: 'firstaid',
    nameEn: 'Emergency First Aid, CPR & Snakebite',
    nameMr: 'प्रथमोपचार, सीपीआर व सर्पदंश उपचार',
    icon: HeartPulse,
    themeColor: 'from-rose-600 to-pink-600',
    accentColor: 'text-rose-500',
    badgeColor: 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    quickRuleEn: 'Snakebite Golden Protocol: IMMOBILIZE LIMB like a bone fracture! DO NOT tie tourniquets, DO NOT cut skin, DO NOT suck venom. Rush to nearest PHC with ASV!',
    quickRuleMr: 'सर्पदंश नियम: हात किंवा पाय फ्रॅक्चरसारखा स्थिर ठेवा! दोरीने घट्ट बांधू नका, ब्लेडने कापू नका, तोंडाने विष ओढू नका. तात्काळ प्राथमिक आरोग्य केंद्रात (PHC) न्या!',
    hotline: { name: 'National Snakebite Registry & ASV', number: '1800-116-117', alt: '108' },
    phases: {
      before: {
        en: [
          'Always wear knee-high rubber boots and carry a long bamboo stick with a torch while walking in flooded fields at night.',
          'Maintain a stocked First Aid kit: Sterile gauze rolls, betadine, paracetamol, ORS packets, roll of adhesive tape, burn ointment.',
          'Know which nearest Taluka Hospital or PHC maintains cold-chain Anti-Snake Venom (ASV) stocks.'
        ],
        mr: [
          'पुराच्या पाण्यात किंवा रात्री शेतात जाताना रबरी गमबूट घाला आणि हातात लांब काठी व टॉर्च ठेवा.',
          'प्रथमोपचार पेटी सज्ज ठेवा: अँटीसेप्टिक डेटॉल/बिटाडीन, निर्जंतुक बँडेज पट्ट्या, ओआरएस, वेदनाशामक गोळ्या, चिकटपट्टी, भाजल्याची मलम.',
          'तालुक्यातील कोणत्या प्राथमिक आरोग्य केंद्रात सर्पदंश लस (ASV) उपलब्ध आहे याची आधीच माहिती ठेवा.'
        ]
      },
      during: {
        en: [
          'SNAKEBITE PROTOCOL: Keep victim completely still and calm (running accelerates venom circulation). Splint bitten limb with a piece of wood. Transport lying flat to hospital.',
          'HANDS-ONLY CPR (Unresponsive person): Place heel of hand in chest center. Push hard and fast at 100-120 compressions/min until medical help arrives.',
          'ELECTRICAL SHOCK RESCUE: DO NOT touch victim directly. Use dry wood, dry bamboo pole, or dry rubber hose to push victim away from wire.'
        ],
        mr: [
          'सर्पदंश प्रथमोपचार: रुग्णाला शांत ठेवा आणि हालचाल करू देऊ नका (पळण्याने विष वेगाने पसरते). दंश झालेला भाग लाकडी पट्टी लावून स्थिर बांधा. रुग्णाला झोपवूनच रुग्णालयात न्या.',
          'सीपीआर (श्वास बंद पडलेल्या व्यक्तीसाठी): छातीच्या मध्यभागी दोन्ही हातांचे पंजे ठेवून दर मिनिटाला १०० ते १२० वेळा जोरात दाबा.',
          'विजेचा धक्का बसल्यास: रुग्णाला थेट हात लावू नका. सुक्या लाकडाने, बांबूने किंवा कोरड्या दोरीने रुग्णाला विजेच्या तारेपासून वेगळे करा.'
        ]
      },
      after: {
        en: [
          'MONITOR URINE OUTPUT & BREATHING: Report difficulty swallowing, eyelid drooping, or bleeding gums to emergency doctor immediately.',
          'VACCINATION: Administer tetanus toxoid injection within 24 hours of any puncture or laceration injury.'
        ],
        mr: [
          'लक्षणे डॉक्टरांना सांगा: गिळायला त्रास होणे, पापण्या जड होणे किंवा हिरड्यांतून रक्त येणे ही महत्त्वाची लक्षणे डॉक्टरांना सांगा.',
          'धनुर्वात (Tetanus) लस: जखम झाल्यास २४ तासांच्या आत धनुर्वात प्रतिबंधक इंजेक्शन टोचून घ्या.'
        ]
      },
      donts: {
        en: [
          'DO NOT make incision cuts over fang puncture wounds; it causes fatal hemorrhaging.',
          'DO NOT apply tight tourniquet ropes that cut off arterial blood supply; this causes gangrene and limb amputation.',
          'DO NOT apply cow dung, butter, or kerosene to burn wounds; flush only with clean cool running water.'
        ],
        mr: [
          'सर्पदंशाच्या ठिकाणी ब्लेडने कापू नका किंवा दोरीने रक्तप्रवाह पूर्ण बंद होईल इतके घट्ट बांधू नका.',
          'तोंडाने विष ओढण्याचा प्रयत्न करू नका.',
          'भाजलेल्या त्वचेवर टूथपेस्ट, तूप किंवा शेण लावू नका; फक्त स्वच्छ पाण्याने धुवा.'
        ]
      }
    }
  }
];

// ============================================================================
// 3. MAIN COMPONENT: DISASTER SAFETY STANDARD OPERATING PROCEDURES (SOP)
// ============================================================================
export const DisasterSopPage = () => {
  const { language } = useLanguage();
  const { setCurrentPage } = useWeather();

  // Active SOP category - Default to FLOOD as requested
  const [activeTabId, setActiveTabId] = useState('flood');

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('');

  const isMr = language === 'mr';

  // Active category selection
  const activeCategory = useMemo(() => {
    return SOP_CATEGORIES.find((c) => c.id === activeTabId) || SOP_CATEGORIES[0];
  }, [activeTabId]);

  // Filtered categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return SOP_CATEGORIES;
    const q = searchQuery.toLowerCase();
    return SOP_CATEGORIES.filter((c) => {
      const matchEn = c.nameEn.toLowerCase().includes(q) || c.quickRuleEn.toLowerCase().includes(q);
      const matchMr = c.nameMr.toLowerCase().includes(q) || c.quickRuleMr.toLowerCase().includes(q);
      return matchEn || matchMr;
    });
  }, [searchQuery]);

  return (
    <div className="space-y-6 pb-16 select-none animate-fadeIn max-w-7xl mx-auto">
      {/* =========================================================================
          1. CLEAN PROFESSIONAL HEADER & DIRECT NAVIGATION
          ========================================================================= */}
      <div className="bg-white dark:bg-[#121316] p-5 sm:p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setCurrentPage('alerts')}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer flex items-center gap-1 text-xs font-bold"
              title="Return to Active Alerts"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isMr ? 'लाईव्ह अलर्ट्सकडे जा' : 'Back to Alerts'}</span>
            </button>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
              NDMA / SDMA Guidelines
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-500 shrink-0" />
            <span>{isMr ? 'आपत्ती व्यवस्थापन सुरक्षा कार्यप्रणाली (SOP)' : 'Disaster Safety Standard Operating Procedures (SOP)'}</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
            {isMr
              ? 'पूर, भूकंप, चक्रीवादळ, वीज व शेती आपत्तींसाठी अधिकृत व प्रमाणित आपत्कालीन जीवनरक्षक कृती नियम.'
              : 'Standardized operational emergency protocols for citizens, farmers, and first responders during meteorological and geophysical disasters.'}
          </p>
        </div>

        {/* Search Bar for Rapid Action Retrieval */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              isMr
                ? 'आपत्ती किंवा लक्षण शोधा (पूर, भूकंप, वीज, साप)...'
                : 'Search hazard (flood, earthquake, lightning)...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* =========================================================================
          2. EMERGENCY RESPONDER HELPLINES DIRECT DIAL TRAY
          ========================================================================= */}
      <div className="bg-white dark:bg-[#121316] p-4 sm:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-rose-500" />
            <h2 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              {isMr ? 'तातडीचे आपत्कालीन संपर्क क्रमांक' : 'Immediate Emergency Responder Contacts'}
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-500">24x7 Toll-Free</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {EMERGENCY_HOTLINES.map((h) => (
            <a
              key={h.id}
              href={`tel:${h.number.replace(/-/g, '')}`}
              className={`p-3 rounded-2xl border transition flex flex-col justify-between group cursor-pointer ${h.color} hover:scale-[1.01] shadow-2xs`}
            >
              <div>
                <span className="text-[11px] font-bold block truncate">
                  {isMr ? h.titleMr : h.title}
                </span>
                <span className="text-sm sm:text-base font-black tracking-tight group-hover:underline block mt-0.5">
                  📞 {h.number}
                </span>
              </div>
              <span className="text-[9px] font-medium opacity-80 block mt-1 truncate">
                {isMr ? h.deptMr : h.dept}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* =========================================================================
          3. CATEGORY SWITCHER PILLS (ALL HAZARDS DIRECTLY ACCESSIBLE VIA WRAP)
          ========================================================================= */}
      <div className="flex flex-wrap items-center gap-2">
        {filteredCategories.map((c) => {
          const Icon = c.icon;
          const isActive = c.id === activeTabId;
          return (
            <button
              key={c.id}
              onClick={() => setActiveTabId(c.id)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer border ${
                isActive
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-md'
                  : 'bg-white dark:bg-[#121316] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-yellow-400 dark:text-blue-600' : c.accentColor}`} />
              <span>{isMr ? c.nameMr : c.nameEn}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          4. ACTIVE SOP OPERATIONAL CARD
          ========================================================================= */}
      <div className="space-y-6">
        {/* Category Header Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#121316] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${activeCategory.themeColor} text-white flex items-center justify-center shadow-sm shrink-0`}>
                <activeCategory.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {isMr ? activeCategory.nameMr : activeCategory.nameEn}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${activeCategory.badgeColor}`}>
                    Active Protocol
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isMr ? 'अधिकृत राष्ट्रीय आपत्ती व्यवस्थापन प्राधिकरणाची मानक कार्यप्रणाली' : 'Official National Disaster Management Authority Standard Operating Procedure'}
                </p>
              </div>
            </div>

            {/* Direct Dial Hotline Pill for this Specific Disaster */}
            {activeCategory.hotline && (
              <a
                href={`tel:${activeCategory.hotline.number}`}
                className="px-4 py-2 rounded-2xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-black flex items-center gap-2 transition cursor-pointer self-start sm:self-auto shadow-2xs"
              >
                <PhoneCall className="w-4 h-4 text-rose-600 animate-pulse" />
                <span>
                  {activeCategory.hotline.name}: <strong>{activeCategory.hotline.number}</strong>
                </span>
              </a>
            )}
          </div>

          {/* Golden Life-Saving Rule Callout Box */}
          <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400 block">
                {isMr ? 'सर्वोच्च जीवनरक्षक नियम' : 'Primary Life-Saving Rule'}
              </span>
              <p className="text-xs sm:text-sm font-bold text-rose-950 dark:text-rose-100 mt-0.5 leading-relaxed">
                {isMr ? activeCategory.quickRuleMr : activeCategory.quickRuleEn}
              </p>
            </div>
          </div>
        </div>

        {/* 3-Column Structured Operational Action Phases */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Phase 1: Preparation & Early Action */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#121316] border border-blue-200/90 dark:border-blue-900/60 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 text-xs font-black flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-blue-950 dark:text-blue-300 uppercase tracking-wider">
                  {isMr ? 'पूर्वसूचना व पूर्वतयारी' : 'Phase 1: Pre-Disaster Early Action'}
                </h3>
                <span className="text-[10px] text-slate-400 block">Before the Impact</span>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              {(isMr ? activeCategory.phases.before.mr : activeCategory.phases.before.en).map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Phase 2: During the Disaster (Active Life-Saving Protocol) */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#121316] border border-emerald-200/90 dark:border-emerald-900/60 shadow-xs space-y-3 ring-1 ring-emerald-500/20">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 text-xs font-black flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-emerald-950 dark:text-emerald-300 uppercase tracking-wider">
                  {isMr ? 'संकटाच्या वेळी (जीव वाचवणारी कृती)' : 'Phase 2: Active Survival Protocol'}
                </h3>
                <span className="text-[10px] text-slate-400 block">During the Event</span>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
              {(isMr ? activeCategory.phases.during.mr : activeCategory.phases.during.en).map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Phase 3: Post-Disaster Health, Salvage & PMFBY Relief Claims */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#121316] border border-purple-200/90 dark:border-purple-900/60 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 text-xs font-black flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-purple-950 dark:text-purple-300 uppercase tracking-wider">
                  {isMr ? 'संकटानंतर आरोग्य, भरपाई व पुनर्प्राप्ती' : 'Phase 3: Recovery, Health & Claims'}
                </h3>
                <span className="text-[10px] text-slate-400 block">After the Hazard</span>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              {(isMr ? (activeCategory.phases.after?.mr || activeCategory.phases.before.mr) : (activeCategory.phases.after?.en || activeCategory.phases.before.en)).map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <Clock className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Critical Mistakes Section (What NOT To Do) */}
        <div className="p-5 sm:p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/60 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-rose-200/60 dark:border-rose-900/50 pb-2.5">
            <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <h3 className="text-xs sm:text-sm font-black text-rose-950 dark:text-rose-200 uppercase tracking-wider">
              {isMr ? 'काय करू नये (प्राणघातक चुका)' : 'Critical Fatal Mistakes (What NOT To Do)'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-rose-950 dark:text-rose-200">
            {(isMr ? activeCategory.phases.donts.mr : activeCategory.phases.donts.en).map((dont, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-white dark:bg-[#121316] border border-rose-200/80 dark:border-rose-900/40 flex items-start gap-2.5 shadow-2xs">
                <span className="w-4 h-4 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-600 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  ✕
                </span>
                <span className="leading-relaxed font-medium">{dont}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisasterSopPage;
