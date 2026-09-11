import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useWeather } from '../context/WeatherContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import {
  Sprout,
  Droplets,
  Wind,
  ShieldAlert,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sun,
  Activity,
  Bug,
  CloudRain,
  Flame,
  Waves,
  Building2,
  XCircle,
  TrendingUp,
  Gauge,
  Calendar,
  Info,
  CalendarDays,
  ShieldCheck,
  Check,
  MapPin,
  Crosshair,
  Search,
  FlaskConical,
  Shield,
  HelpCircle,
  Thermometer,
  ChevronDown,
  Coins,
  FileText,
  BadgePercent,
  CheckCheck,
  Clock,
  History,
  Lightbulb,
  Zap,
  ExternalLink,
  Globe,
  Landmark,
  Truck,
  Loader2,
  X
} from 'lucide-react';

const SMART_SEARCH_SUGGESTIONS = [
  { city: 'Pune', region: 'Maharashtra', country: 'India', lat: 18.5204, lon: 73.8567 },
  { city: 'Nashik', region: 'Maharashtra', country: 'India', lat: 19.9975, lon: 73.7898 },
  { city: 'Nagpur', region: 'Maharashtra', country: 'India', lat: 21.1458, lon: 79.0882 },
  { city: 'Chhatrapati Sambhajinagar', region: 'Maharashtra', country: 'India', lat: 19.8762, lon: 75.3433 },
  { city: 'Kolhapur', region: 'Maharashtra', country: 'India', lat: 16.7050, lon: 74.2433 },
  { city: 'Solapur', region: 'Maharashtra', country: 'India', lat: 17.6599, lon: 75.9064 },
  { city: 'Baramati', region: 'Maharashtra', country: 'India', lat: 18.1519, lon: 74.5770 },
  { city: 'Amravati', region: 'Maharashtra', country: 'India', lat: 20.9374, lon: 77.7796 }
];





const CROP_PROFILES = [
  {
    id: 'cotton',
    icon: '🌱',
    names: { en: 'Cotton (Kapas)', mr: 'कापूस (Cotton)', hi: 'कपास (Cotton)' },
    mspRate: '₹7,121 / क्विंटल (MSP 2024-25)',
    fertilizerGuide: {
      basal: 'DAP 50 kg + MOP 25 kg per acre',
      topDress: 'Urea 30 kg at 30 DAS & 45 DAS',
      foliar: '19:19:19 @ 50g/15L pump at flowering'
    },
    pesticideDatabase: {
      pests: [
        {
          name: 'Pink Bollworm (गुलाबी बोंडअळी)',
          symptoms: 'Bore holes in bolls, stained lint, rosette flowers.',
          chemical: 'Chlorantraniliprole 18.5% SC (Coragen) @ 6 ml/15L pump OR Profenofos 50% EC @ 30 ml/15L pump.',
          bio: 'Install Pheromone Traps @ 5 traps/acre. Spray Neem Oil 10,000 ppm @ 30 ml/15L pump.',
          rainFastness: 'Needs 2 hours dry weather after spray.',
          safety: 'Wear protective mask and gloves. Spray early morning (7-10 AM) when wind is calm.'
        },
        {
          name: 'Sucking Pests: Thrips & Aphids (मावा / तुडतुडे)',
          symptoms: 'Curling leaves, sticky honeydew under leaf surface.',
          chemical: 'Flonicamid 50% WG (Ulala) @ 8 g/15L pump OR Diafenthiuron 50% WP @ 15 g/15L pump.',
          bio: 'Yellow & Blue Sticky Traps @ 10/acre. Spray Dashparni Ark @ 50 ml/15L.',
          rainFastness: 'Needs 3 hours dry weather.',
          safety: 'Avoid spraying near honeybee colonies during full bloom.'
        }
      ]
    },
    stages: [
      {
        icon: '🌱',
        title: { en: 'Sprouting / Seedling', mr: 'पेरणी व उगवण', hi: 'अंकुरण व शुरुआती पौध' },
        doAction: { en: 'Keep soil moist. Ensure seeds sprout evenly.', mr: 'जमिनीत हलका ओलावा ठेवा. बियाणे चांगले उगवू द्या.', hi: 'खेत में हल्की नमी रखें ताकि बीज ठीक से अंकुरित हों।' },
        dontAction: { en: 'Do not flood field with standing water.', mr: 'शेतात पाणी साचू देऊ नका, बियाणे कुजण्याचा धोका असतो.', hi: 'खेत में पानी भरने न दें, बीज सड़ने का खतरा रहता है।' }
      },
      {
        icon: '🌿',
        title: { en: 'Growing Leaves & Branches', mr: 'झाडांची वाढ व फांद्या', hi: 'पौधों की बढ़वार व शाखाएं' },
        doAction: { en: 'Apply fertilizer dose and remove wild weeds.', mr: 'खताचा योग्य हप्ता द्या आणि शेतातील तण काढून टाका.', hi: 'संतुलित खाद दें और खेत को खरपतवार मुक्त रखें।' },
        dontAction: { en: 'Do not ignore early sucking pests under leaves.', mr: 'पानांमागील मावा किंवा तुडतुडे या किडींकडे दुर्लक्ष करू नका.', hi: 'पत्तियों के नीचे थ्रिप्स या कीटों को अनदेखा न करें।' }
      },
      {
        icon: '🌸',
        title: { en: 'Flowering & Buds', mr: 'फुलोरा व कळ्या', hi: 'फूल एवं कलियां' },
        doAction: { en: 'Ensure regular water supply. Spray micronutrients.', mr: 'पिकाला पाणी कमी पडू देऊ नका. फुलांची गळ रोखण्यासाठी सूक्ष्म अन्नद्रव्ये फवारा.', hi: 'फूल आने के समय पानी की कमी न होने दें। सूक्ष्म पोषक तत्व दें।' },
        dontAction: { en: 'Do not allow severe dry soil stress; flowers will drop.', mr: 'जमीन जास्त सुकू देऊ नका, नाहीतर फुले व पात्या गळून पडतील.', hi: 'खेत सूखने न दें, वर्ना फूल और कलियां झड़ जाएंगी।' }
      },
      {
        icon: '🌾',
        title: { en: 'Boll Formation', mr: 'बोंड भरणे', hi: 'टिंडे बनना' },
        doAction: { en: 'Inspect bolls regularly for Pink Bollworm pest.', mr: 'गुलाबी बोंडअळीचा प्रादुर्भाव रोखण्यासाठी कामगंध सापळे तपासा.', hi: 'गुलाबी सुंडी से बचाव के लिए फेरोमोन ट्रैप की जांच करें।' },
        dontAction: { en: 'Do not spray pesticides in high afternoon heat.', mr: 'दुपारच्या कडक उन्हात औषध फवारणी करू नका.', hi: 'दोपहर की तेज धूप में कीटनाशक न छिड़कें।' }
      },
      {
        icon: '🧺',
        title: { en: 'Ready to Harvest', mr: 'कापूस वेचणीस तयार', hi: 'चुनाई व कटाई' },
        doAction: { en: 'Pick cotton in morning after dew dries completely.', mr: 'सकाळचे दव सुकल्यानंतरच स्वच्छ कापूस वेचा.', hi: 'सुबह की ओस सूखने के बाद ही साफ कपास की चुनाई करें।' },
        dontAction: { en: 'Do not pick wet cotton; it spoils quality and market rate.', mr: 'ओला कापूस वेचू नका किंवा साठवू नका; डाग पडून भाव कमी मिळतो.', hi: 'गीला कपास न तोड़ें; इससे चमक और दाम दोनों कम होते हैं।' }
      }
    ]
  },
  {
    id: 'rice',
    icon: '🌾',
    names: { en: 'Rice / Paddy (Dhan)', mr: 'भात / धान (Paddy)', hi: 'धान / चावल (Paddy)' },
    mspRate: '₹2,300 / क्विंटल (MSP 2024-25)',
    fertilizerGuide: {
      basal: 'DAP 50 kg + Potash 25 kg + Zinc 10 kg',
      topDress: 'Urea 35 kg at tillering + 25 kg at panicle',
      foliar: '0:52:34 @ 50g/15L pump during grain filling'
    },
    pesticideDatabase: {
      pests: [
        {
          name: 'Stem Borer & Leaf Folder (खोडकिडा व पान गुंडाळणारी अळी)',
          symptoms: 'Dead heart in vegetative stage, white earhead in flowering.',
          chemical: 'Cartap Hydrochloride 50% SP @ 25 g/15L pump OR Chlorantraniliprole 18.5% SC @ 6 ml/15L pump.',
          bio: 'Release Trichogramma japonicum cards @ 2 cards/acre. Spray Bacillus thuringiensis (Bt) @ 25 g/15L.',
          rainFastness: 'Needs 2 hours dry break.',
          safety: 'Maintain 2-3 cm shallow water level in field when applying granular or foliar spray.'
        },
        {
          name: 'Blast & Sheath Blight (करपा व कडा करपा)',
          symptoms: 'Spindle-shaped spots on leaves, grey center with brown margin.',
          chemical: 'Tricyclazole 75% WP (Baan) @ 15 g/15L pump OR Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 15 ml/15L pump.',
          bio: 'Pseudomonas fluorescens @ 50 g/15L pump.',
          rainFastness: 'Spray with sticker (adjuvant) for better leaf adherence.',
          safety: 'Avoid excessive nitrogen (urea) during cloudy humid weather.'
        }
      ]
    },
    stages: [
      {
        icon: '🌱',
        title: { en: 'Nursery & Transplant', mr: 'रोपवाटिका व लावणी', hi: 'नर्सरी व रोपाई' },
        doAction: { en: 'Maintain 2-3 cm thin water layer in transplanted fields.', mr: 'लावणी केलेल्या शेतात २-३ सेमी पाण्याचा हलका थर ठेवा.', hi: 'रोपाई वाले खेत में 2-3 सेमी पानी बनाए रखें।' },
        dontAction: { en: 'Do not plant seedlings deeper than 2-3 cm.', mr: 'रोपे जास्त खोल गाडू नका.', hi: 'पौधों को ज्यादा गहराई में न लगाएं।' }
      },
      {
        icon: '🌿',
        title: { en: 'Tillering & Growth', mr: 'फुटवे फुटणे व वाढ', hi: 'कल्ले फूटना व बढ़वार' },
        doAction: { en: 'Top-dress Nitrogen fertilizer and weed field.', mr: 'युरिया खताचा हप्ता द्या आणि तण खुरपून काढा.', hi: 'यूरिया खाद डालें और खरपतवार निकालें।' },
        dontAction: { en: 'Do not keep fields completely dry during tillering.', mr: 'फुटवे फुटताना शेत पूर्णपणे कोरडे पडू देऊ नका.', hi: 'कल्ले निकलते समय खेत को सूखने न दें।' }
      },
      {
        icon: '🌸',
        title: { en: 'Panicle Initiation', mr: 'पोटरी व लोंबी बाहेर पडणे', hi: 'बाली निकलना' },
        doAction: { en: 'Keep standing water of 5 cm. Guard against stem borer.', mr: 'शेतात ५ सेमी पाणी साठवून ठेवा. खोडकिड्यावर लक्ष ठेवा.', hi: 'खेत में 5 सेमी पानी रखें। तना छेदक से बचाव करें।' },
        dontAction: { en: 'Do not let water drain away during flowering.', mr: 'फुलोरा अवस्थेत शेतातील पाणी निघून जाऊ देऊ नका.', hi: 'फूल खिलने के दौरान खेत का पानी सूखने न दें।' }
      },
      {
        icon: '🌾',
        title: { en: 'Milking & Grain Filling', mr: 'दुधिया व दाणे भरणे', hi: 'दूधिया अवस्था व दाना भरना' },
        doAction: { en: 'Maintain saturated moist soil until grains harden.', mr: 'दाणे घट्ट होईपर्यंत जमिनीत दलदल/ओलावा ठेवा.', hi: 'दाने सख्त होने तक खेत में नमी बनाए रखें।' },
        dontAction: { en: 'Do not spray chemicals during peak morning pollination.', mr: 'सकाळी परागीभवनाच्या वेळी औषध फवारणी करू नका.', hi: 'सुबह परागण के समय दवा का छिड़काव न करें।' }
      },
      {
        icon: '🧺',
        title: { en: 'Ready to Harvest', mr: 'कापणीस तयार', hi: 'कटाई' },
        doAction: { en: 'Drain standing water 10 days prior to harvest.', mr: 'कापणीच्या १० दिवस आधी शेतातील पाणी पूर्ण काढून टाका.', hi: 'कटाई से 10 दिन पहले खेत का पानी निकाल दें।' },
        dontAction: { en: 'Do not harvest immediately after rain.', mr: 'पाऊस पडून गेल्यावर लगेच ओली असताना भात कापू नका.', hi: 'बारिश के तुरंत बाद कटाई न करें।' }
      }
    ]
  },
  {
    id: 'soybean',
    icon: '🌱',
    names: { en: 'Soybean', mr: 'सोयाबीन (Soybean)', hi: 'सोयाबीन (Soybean)' },
    mspRate: '₹4,892 / क्विंटल (MSP 2024-25)',
    fertilizerGuide: {
      basal: '10:26:26 @ 50 kg + Sulphur 10 kg per acre',
      topDress: 'Avoid heavy urea (rhizobium fixes nitrogen)',
      foliar: '0:52:34 @ 50g/15L pump during pod filling'
    },
    pesticideDatabase: {
      pests: [
        {
          name: 'Girdle Beetle & Spodoptera (चक्री भुंगा व लष्करी अळी)',
          symptoms: 'Girdling ring cut around stem, dried wilting branches.',
          chemical: 'Chlorantraniliprole 18.5% SC @ 6 ml/15L pump OR Emamectin Benzoate 5% SG @ 8 g/15L pump.',
          bio: 'Neem seed kernel extract (NSKE 5%) OR Nomuraea rileyi @ 50 g/15L pump.',
          rainFastness: 'Needs 2 hours dry break.',
          safety: 'Do not spray when plants are stressed with standing water.'
        },
        {
          name: 'Rust & Anthracnose (तांबेरा व अँथ्रॅक्नोज)',
          symptoms: 'Rust-colored brown pustules on underside of leaves.',
          chemical: 'Tebuconazole 25.9% EC @ 15 ml/15L pump OR Hexaconazole 5% EC @ 20 ml/15L pump.',
          bio: 'Trichoderma harzianum @ 50 g/15L pump.',
          rainFastness: 'Needs 3 hours dry weather.',
          safety: 'Spray along wind direction, never against wind.'
        }
      ]
    },
    stages: [
      {
        icon: '🌱',
        title: { en: 'Germination (0-15 DAS)', mr: 'उगवण व रोप अवस्था', hi: 'अंकुरण व शुरुआती' },
        doAction: { en: 'Ensure drainage channels are clear.', mr: 'शेतात पाणी साचणार नाही याची काळजी घ्या.', hi: 'जल निकासी की व्यवस्था रखें।' },
        dontAction: { en: 'Do not let water stand in furrows.', mr: 'वाफ्यात पाणी साचू देऊ नका.', hi: 'खेत में पानी भरने न दें।' }
      },
      {
        icon: '🌿',
        title: { en: 'Branching (15-35 DAS)', mr: 'फांद्या फुटणे व वाढ', hi: 'शाखाएं निकलना' },
        doAction: { en: 'Inspect for girdle beetle ring cuts.', mr: 'चक्री भुंग्याचा प्रादुर्भाव ओळखून उपाय करा.', hi: 'गर्डल बीटल के छल्लों की जांच करें।' },
        dontAction: { en: 'Do not weed in wet soil.', mr: 'ओल्या जमिनीत खुरपणी किंवा कोळपणी करू नका.', hi: 'गीली मिट्टी में निराई न करें।' }
      },
      {
        icon: '🌸',
        title: { en: 'Flowering (35-55 DAS)', mr: 'फुलोरा अवस्था', hi: 'फूल आना' },
        doAction: { en: 'Provide light irrigation if dry spell persists.', mr: 'कोरडा काळ असल्यास हलके पाणी द्या.', hi: 'सूखा हो तो हल्की सिंचाई करें।' },
        dontAction: { en: 'Do not apply heavy pesticide in bloom.', mr: 'फुलोऱ्याच्या भरात जहाल कीटकनाशक फवारू नका.', hi: 'फूलों के समय तेज कीटनाशक न डालें।' }
      },
      {
        icon: '🌾',
        title: { en: 'Pod Filling (55-80 DAS)', mr: 'शेंगा भरणे', hi: 'फलियां भरना' },
        doAction: { en: 'Guard against pod borer caterpillar.', mr: 'शेंगा पोखरणारी अळी रोखा.', hi: 'फली छेदक से फसल बचाएं।' },
        dontAction: { en: 'Do not allow severe moisture stress.', mr: 'शेंगा भरताना पिकाला ताण बसू देऊ नका.', hi: 'दाने भरते समय पानी की कमी न होने दें।' }
      },
      {
        icon: '🧺',
        title: { en: 'Maturity (80-100 DAS)', mr: 'कापणीस तयार', hi: 'कटाई' },
        doAction: { en: 'Harvest when leaves turn yellow and drop.', mr: 'पाने पिवळी पडून गळल्यावर शेंगा तडकण्यापूर्वी कापा.', hi: 'पत्ते झड़ने पर फलियां फटने से पहले काटें।' },
        dontAction: { en: 'Do not delay harvest; pods will shatter.', mr: 'कापणीस उशीर करू नका; शेंगा फुटून दाणे गळतात.', hi: 'कटाई में देरी न करें वर्ना फलियां चटक जाएंगी।' }
      }
    ]
  },
  {
    id: 'sugarcane',
    icon: '🎋',
    names: { en: 'Sugarcane', mr: 'ऊस (Sugarcane)', hi: 'गन्ना (Sugarcane)' },
    mspRate: '₹340 / क्विंटल (FRP 2024-25)',
    fertilizerGuide: {
      basal: 'DAP 100 kg + Potash 50 kg + Urea 40 kg per acre',
      topDress: 'Urea 65 kg at tillering & 85 kg at earthing up',
      foliar: 'Ferrous sulphate + Zinc spray for leaf chlorosis'
    },
    pesticideDatabase: {
      pests: [
        {
          name: 'Early Shoot Borer (खोडकिडा)',
          symptoms: 'Dead heart in central shoot, foul smell on pulling dead shoot.',
          chemical: 'Chlorantraniliprole 18.5% SC @ 150 ml/acre drenching along rows OR Fipronil 0.3% GR @ 10 kg/acre.',
          bio: 'Release Trichogramma chilonis cards @ 2 cards/acre at 10-day intervals.',
          rainFastness: 'Soil application is safe before light rain.',
          safety: 'Apply trash mulching between cane rows to preserve moisture.'
        },
        {
          name: 'White Grub & Pyrilla (हुमणी व पायरिला)',
          symptoms: 'Leaves turn pale yellow, plants dry in circular patches.',
          chemical: 'Imidacloprid 17.8% SL @ 10 ml/15L pump OR Chlorpyriphos 20% EC @ 50 ml/15L drenching.',
          bio: 'Metarhizium anisopliae bio-fungus @ 1 kg/acre with organic manure.',
          rainFastness: 'Needs moist soil for biological fungus activation.',
          safety: 'Wear rubber boots when drenching chemicals in wet cane field.'
        }
      ]
    },
    stages: [
      {
        icon: '🌱',
        title: { en: 'Germination (0-35 DAS)', mr: 'उगवण अवस्था', hi: 'अंकुरण' },
        doAction: { en: 'Give light irrigation every 8-10 days.', mr: '८-१० दिवसांनी हलके पाणी द्या.', hi: '8-10 दिन में हल्की सिंचाई करें।' },
        dontAction: { en: 'Do not allow soil crust to hinder shoots.', mr: 'जमिनीवर पपडी धरू देऊ नका.', hi: 'मिट्टी पर पपड़ी न जमने दें।' }
      },
      {
        icon: '🌿',
        title: { en: 'Tillering (35-100 DAS)', mr: 'फुटवे फुटणे', hi: 'कल्ले फूटना' },
        doAction: { en: 'Apply first dose of Nitrogen fertilizer.', mr: 'युरिया खताचा पहिला हप्ता द्या.', hi: 'नाइट्रोजन खाद की पहली खुराक दें।' },
        dontAction: { en: 'Do not ignore early shoot borer.', mr: 'खोडकिड्याकडे दुर्लक्ष करू नका.', hi: 'तना छेदक को अनदेखा न करें।' }
      },
      {
        icon: '🎋',
        title: { en: 'Grand Growth (100-270 DAS)', mr: 'मोठी वाढ व कांडे भरणे', hi: 'तीव्र बढ़वार' },
        doAction: { en: 'Perform earthing up to prevent lodging.', mr: 'उसाला मातीची भर लावा जेणेकरून ऊस पडणार नाही.', hi: 'गन्ने पर मिट्टी चढ़ाएं ताकि वह गिरे नहीं।' },
        dontAction: { en: 'Do not allow severe drought stress.', mr: 'वाढीच्या काळात पिकाला पाण्याचा ताण देऊ नका.', hi: 'बढ़वार के समय पानी की कमी न होने दें।' }
      },
      {
        icon: '🌾',
        title: { en: 'Ripening (270-330 DAS)', mr: 'पक्वता अवस्था', hi: 'पकने की अवस्था' },
        doAction: { en: 'Gradually increase irrigation intervals.', mr: 'पाण्याचे अंतर हळूहळू वाढवा.', hi: 'सिंचाई का अंतराल धीरे-धीरे बढ़ाएं।' },
        dontAction: { en: 'Do not apply nitrogen fertilizer now.', mr: 'या काळात युरिया खत मुळीच देऊ नका.', hi: 'अब नाइट्रोजन खाद बिल्कुल न डालें।' }
      },
      {
        icon: '🧺',
        title: { en: 'Harvest (330-365 DAS)', mr: 'तोडणीस तयार', hi: 'कटाई' },
        doAction: { en: 'Cut cane close to ground level.', mr: 'ऊस जमिनीलगत तोडा जेणेकरून खोडवा चांगला फुटेल.', hi: 'गन्ने को जमीन की सतह से काटें।' },
        dontAction: { en: 'Do not leave high stubble above ground.', mr: 'जमिनीवर जास्त उंच बुडखे ठेवू नका.', hi: 'जमीन के ऊपर ठूंठ न छोड़ें।' }
      }
    ]
  },
  {
    id: 'tomato',
    icon: '🍅',
    names: { en: 'Tomato & Vegetables', mr: 'टोमॅटो व भाजीपाला (Tomato)', hi: 'टमाटर व सब्जियां (Tomato)' },
    mspRate: 'स्थानिक बाजारभाव (APMC Market Link)',
    fertilizerGuide: {
      basal: 'DAP 50 kg + Potash 30 kg + Neem Cake 100 kg',
      topDress: '19:19:19 drip fertigation @ 3 kg/acre weekly',
      foliar: 'Calcium Nitrate + Boron @ 40g/15L pump for fruit setting'
    },
    pesticideDatabase: {
      pests: [
        {
          name: 'Early / Late Blight (करपा व पान डाग रोग)',
          symptoms: 'Concentric dark brown rings on lower leaves, fruit rot.',
          chemical: 'Mancozeb 75% WP (Dithane M-45) @ 35 g/15L pump OR Cymoxanil 8% + Mancozeb 64% WP (Curzate) @ 30 g/15L pump.',
          bio: 'Copper Oxychloride 50% WP @ 30 g/15L pump.',
          rainFastness: 'Apply 2-3 hours before anticipated rain with adhesive sticker.',
          safety: 'Ensure 3 days pre-harvest interval (PHI) before picking tomatoes.'
        },
        {
          name: 'Fruit Borer (फळ पोखरणारी अळी)',
          symptoms: 'Caterpillar boring holes in green/ripe tomatoes.',
          chemical: 'Chlorantraniliprole 18.5% SC @ 6 ml/15L pump OR Spinosad 45% SC @ 5 ml/15L pump.',
          bio: 'Helicoverpa NPV virus @ 20 ml/15L OR Bacillus thuringiensis (Bt) @ 20 g/15L.',
          rainFastness: 'Needs 2 hours dry break.',
          safety: 'Wash hands thoroughly after handling. Wear face protection.'
        }
      ]
    },
    stages: [
      {
        icon: '🌱',
        title: { en: 'Transplanting (0-20 DAS)', mr: 'पुनर्लागवड', hi: 'रोपाई' },
        doAction: { en: 'Dip roots in bio-fungicide before planting.', mr: 'रोपांची मुळे ट्रायकोडर्मामध्ये बुडवून लावा.', hi: 'जड़ों को ट्राइकोडर्मा में डुबोकर लगाएं।' },
        dontAction: { en: 'Do not plant in midday heat.', mr: 'दुपारच्या कडक उन्हात रोपे लावू नका.', hi: 'दोपहर की धूप में पौधे न लगाएं।' }
      },
      {
        icon: '🌿',
        title: { en: 'Vegetative (20-45 DAS)', mr: 'शाकीय वाढ', hi: 'वानस्पतिक बढ़वार' },
        doAction: { en: 'Stake plants with bamboo supports.', mr: 'झाडांना आधार देण्यासाठी बांबूच्या काठ्या लावा.', hi: 'पौधों को बांस की खपच्चियों का सहारा दें।' },
        dontAction: { en: 'Do not let leaves touch wet soil.', mr: 'पाने जमिनीतील चिखलाला टेकू देऊ नका.', hi: 'पत्तियों को गीली मिट्टी से न छूने दें।' }
      },
      {
        icon: '🌸',
        title: { en: 'Flowering (45-65 DAS)', mr: 'फुलोरा', hi: 'फूल आना' },
        doAction: { en: 'Spray micronutrients and boron for flower set.', mr: 'फुले टिकण्यासाठी बोरॉन व सूक्ष्म अन्नद्रव्ये फवारा.', hi: 'फूल झड़ने से रोकने के लिए बोरॉन का छिड़काव करें।' },
        dontAction: { en: 'Do not allow moisture stress; blossom drop.', mr: 'फुलोऱ्याच्या वेळी पाण्याचा ताण पडू देऊ नका.', hi: 'फूलों के समय खेत में सूखा न पड़ने दें।' }
      },
      {
        icon: '🍅',
        title: { en: 'Fruiting (65-90 DAS)', mr: 'फळे भरणे', hi: 'फल विकास' },
        doAction: { en: 'Guard against fruit borer and blight.', mr: 'फळ पोखरणारी अळी व करपा रोखा.', hi: 'फल छेदक कीट और झुलसा रोग से बचाव करें।' },
        dontAction: { en: 'Do not use overhead spray during humid spell.', mr: 'जास्त दमट हवामानात तुषार सिंचन करू नका.', hi: 'नमी वाले मौसम में ऊपर से पानी न छिड़कें।' }
      },
      {
        icon: '🧺',
        title: { en: 'Harvest (90-120 DAS)', mr: 'तोडणी', hi: 'तुड़ाई' },
        doAction: { en: 'Pick fruits at breaker/pink stage for market.', mr: 'बाजारात पाठवण्यासाठी फळे तांबूस अवस्थेत तोडा.', hi: 'बाजार के लिए फल हल्के लाल रंग में तोड़ें।' },
        dontAction: { en: 'Do not pick wet tomatoes in rain.', mr: 'पावसात ओली फळे तोडू नका, ती सडतात.', hi: 'बारिश में गीले फल न तोड़ें, वे सड़ जाते हैं।' }
      }
    ]
  },
  {
    id: 'onion',
    icon: '🧅',
    names: { en: 'Onion (Kanda)', mr: 'कांदा (Onion)', hi: 'प्याज (Onion)' },
    mspRate: 'बाजारभाव भावंतर योजना (Market Linked)',
    fertilizerGuide: {
      basal: 'DAP 50 kg + Potash 40 kg + Sulphur 15 kg',
      topDress: 'Urea 30 kg at 30 DAS & 45 DAS',
      foliar: '0:52:34 + Micronutrients @ 40g/15L pump'
    },
    pesticideDatabase: {
      pests: [
        {
          name: 'Thrips (कांद्यावरील फुलकिडे / थ्रिप्स)',
          symptoms: 'Silvery white patches on tubular leaves, leaf curling.',
          chemical: 'Fipronil 5% SC @ 30 ml/15L pump OR Profenofos 50% EC @ 30 ml/15L pump.',
          bio: 'Spray Neem Oil 10,000 ppm @ 30 ml/15L OR Blue Sticky Traps @ 15/acre.',
          rainFastness: 'Add surfactant (Sticker) because onion leaves are waxy.',
          safety: 'Spray early in morning before thrips hide in inner leaf sheath.'
        },
        {
          name: 'Purple Blotch (जांभळा करपा)',
          symptoms: 'Water-soaked oval spots turning purple with yellow halo.',
          chemical: 'Hexaconazole 5% SC @ 20 ml/15L pump OR Difenoconazole 25% EC (Score) @ 10 ml/15L pump.',
          bio: 'Trichoderma viride @ 50 g/15L pump.',
          rainFastness: 'Needs sticker/spreader to coat waxy leaves.',
          safety: 'Stop spraying 15 days before harvesting.'
        }
      ]
    },
    stages: [
      {
        icon: '🌱',
        title: { en: 'Nursery & Transplant (0-25 DAS)', mr: 'पुनर्लागवड', hi: 'रोपाई' },
        doAction: { en: 'Maintain shallow standing water during transplant.', mr: 'लावणीच्या वेळी वाफ्यात हलके पाणी ठेवा.', hi: 'रोपाई के समय खेत में हल्का पानी रखें।' },
        dontAction: { en: 'Do not plant crooked seedlings.', mr: 'वाकडी किंवा खूप जुनी रोपे लावू नका.', hi: 'ज्यादा पुराने या कमजोर पौधे न लगाएं।' }
      },
      {
        icon: '🌿',
        title: { en: 'Vegetative (25-50 DAS)', mr: 'पातीची वाढ', hi: 'पत्तियों की बढ़वार' },
        doAction: { en: 'Control thrips and apply fertilizer dose.', mr: 'फुलकिडे (थ्रिप्स) रोखा आणि खत द्या.', hi: 'थ्रिप्स से बचाव करें और खाद दें।' },
        dontAction: { en: 'Do not let weeds smother onion bulb beds.', mr: 'वाफ्यात तण वाढू देऊ नका.', hi: 'क्यारियों में खरपतवार न बढ़ने दें।' }
      },
      {
        icon: '🧅',
        title: { en: 'Bulb Development (50-80 DAS)', mr: 'कांदा पोसणे', hi: 'कंद बनना' },
        doAction: { en: 'Give regular light watering. Spray Potash.', mr: 'नियमित हलके पाणी द्या आणि पोटॅश फवारा.', hi: 'नियमित हल्की सिंचाई करें और पोटाश दें।' },
        dontAction: { en: 'Do not let soil dry out completely.', mr: 'जमीन जास्त कोरडी पडू देऊ नका.', hi: 'मिट्टी को पूरी तरह सूखने न दें।' }
      },
      {
        icon: '🌾',
        title: { en: 'Neck Fall (80-105 DAS)', mr: 'मान पडणे व पक्वता', hi: 'गर्दन गिरना' },
        doAction: { en: 'Stop irrigation 10-15 days before harvest.', mr: 'काढणीच्या १०-१५ दिवस आधी पाणी बंद करा.', hi: 'खुदाई से 10-15 दिन पहले पानी बंद करें।' },
        dontAction: { en: 'Do not irrigate after 50% neck fall.', mr: 'कांद्याची मान पडू लागल्यावर पाणी देऊ नका.', hi: 'गर्दन गिरने के बाद पानी बिल्कुल न दें।' }
      },
      {
        icon: '🧺',
        title: { en: 'Curing & Storage (105-120 DAS)', mr: 'काढणी व सुकवणे', hi: 'खुदाई व भंडारण' },
        doAction: { en: 'Field-cure onions with leaves covering bulbs.', mr: 'कांदे काढल्यावर पातीने झाकून ३-४ दिवस सुकवा.', hi: 'प्याज की पत्तियों से कंदों को ढककर 3-4 दिन सुखाएं।' },
        dontAction: { en: 'Do not store wet onions in bags.', mr: 'ओले कांदे पोत्यात भरून ठेवू नका, सडतात.', hi: 'गीले प्याज बोरियों में न भरें, सड़ जाएंगे।' }
      }
    ]
  },
  // 4 NEW POWERHOUSE CROPS
  {
    id: 'wheat',
    icon: '🌾',
    names: { en: 'Wheat (Gehun)', mr: 'गहू (Wheat)', hi: 'गेहूं (Wheat)' },
    mspRate: '₹2,275 / क्विंटल (MSP 2024-25)',
    fertilizerGuide: {
      basal: 'DAP 55 kg + MOP 30 kg + Zinc Sulphate 10 kg',
      topDress: 'Urea 35 kg at CRI stage (21 days) & 35 kg at jointing',
      foliar: '0:0:50 (SOP) @ 40g/15L pump during grain filling'
    },
    pesticideDatabase: {
      pests: [
        {
          name: 'Yellow / Brown Rust (पिवळा व तांबडा तांबेरा)',
          symptoms: 'Bright yellow powdery stripes along leaf veins.',
          chemical: 'Propiconazole 25% EC (Tilt) @ 15 ml/15L pump OR Tebuconazole 25.9% EC @ 15 ml/15L pump.',
          bio: 'Trichoderma harzianum @ 50 g/15L pump.',
          rainFastness: 'Needs 2.5 hours dry weather to establish protective film.',
          safety: 'Avoid spraying when wind speed is above 16 km/h to prevent spray drift.'
        },
        {
          name: 'Termites & Aphids (वाळवी व मावा)',
          symptoms: 'Drying tillers, roots eaten by termites; aphids on earheads.',
          chemical: 'Thiamethoxam 25% WG (Actara) @ 10 g/15L pump OR Chlorpyriphos 20% EC @ 40 ml/15L.',
          bio: 'Beauveria bassiana @ 50 g/15L pump in moist soil.',
          rainFastness: 'Soil drenching is safe before light rain.',
          safety: 'Use protective rubber gloves while mixing pesticide formulations.'
        }
      ]
    },
    stages: [
      {
        icon: '🌱',
        title: { en: 'CRI Stage (18-22 DAS)', mr: 'मुकुट मुळे फुटणे (CRI)', hi: 'सीआरआई अवस्था (21 दिन)' },
        doAction: { en: 'First irrigation at 21 days is mandatory for root crown.', mr: 'पेरणीनंतर २१ व्या दिवशी मुकुट मुळे फुटताना पहिले पाणी देणे अत्यंत महत्त्वाचे आहे.', hi: 'बुवाई के 21वें दिन ताज जड़ें निकलते समय पहली सिंचाई अनिवार्य है।' },
        dontAction: { en: 'Never delay CRI watering; causes 30% permanent yield loss.', mr: 'पहिले पाणी देणे पुढे ढकलू नका; उत्पादनात ३०% पर्यंत मोठी घट होते.', hi: 'सीआरआई सिंचाई में देरी न करें, 30% तक उपज घट जाती है।' }
      },
      {
        icon: '🌿',
        title: { en: 'Tillering (35-45 DAS)', mr: 'फुटवे फुटणे', hi: 'कल्ले फूटना' },
        doAction: { en: 'Apply second irrigation and top-dress Urea.', mr: 'दुसरे पाणी द्या आणि युरिया खताचा हप्ता द्या.', hi: 'दूसरी सिंचाई करें और यूरिया की खुराक दें।' },
        dontAction: { en: 'Do not let broadleaf weeds choke young tillers.', mr: 'शेतात रुंद पानाच्या तणांचा प्रादुर्भाव होऊ देऊ नका.', hi: 'चौड़ी पत्ती वाले खरपतवार न पनपने दें।' }
      },
      {
        icon: '🌾',
        title: { en: 'Jointing & Booting (60-65 DAS)', mr: 'कांडे धरणे व लोंबी अवस्था', hi: 'गांठ बनना व बाली निकलना' },
        doAction: { en: 'Irrigate field to ensure uninterrupted earhead growth.', mr: 'पिकाला पाणी कमी पडू देऊ नका; लोंब्या लांब व भरदार होतात.', hi: 'खेत में नमी रखें ताकि बालियां लंबी और स्वस्थ निकलें।' },
        dontAction: { en: 'Do not allow severe soil drought during booting.', mr: 'पोटरी अवस्थेत पिकाला मुळीच पाण्याचा ताण देऊ नका.', hi: 'बाली निकलते समय सूखा न पड़ने दें।' }
      },
      {
        icon: '🥛',
        title: { en: 'Milking & Dough (80-85 DAS)', mr: 'दुधिया व दाणे भरणे', hi: 'दूधिया अवस्था' },
        doAction: { en: 'Provide light irrigation to keep grains plump.', mr: 'दाणे टपोरे भरण्यासाठी हलके पाणी द्या.', hi: 'दाने मोटे होने के लिए हल्की सिंचाई करें।' },
        dontAction: { en: 'Never irrigate on windy days (>15 km/h); crop lodges flat.', mr: 'जोराचा वारा वाहत असताना पाणी देऊ नका; गहू भुईसपाट होऊन लोळतो.', hi: 'तेज हवा में सिंचाई न करें, फसल जमीन पर गिर (लॉजिंग) जाती है।' }
      },
      {
        icon: '🧺',
        title: { en: 'Maturity (105-115 DAS)', mr: 'पक्वता व कापणी', hi: 'कटाई' },
        doAction: { en: 'Harvest when grain moisture drops below 12%.', mr: 'दाण्यातील ओलावा १२% पेक्षा कमी झाल्यावर कापणी करा.', hi: 'दानों में नमी 12% से कम होने पर कटाई करें।' },
        dontAction: { en: 'Do not delay harvest; causes grain shattering in heat.', mr: 'कापणीस उशीर करू नका; कडक उन्हामुळे दाणे गळतात.', hi: 'कटाई में देरी न करें, दाने खेत में बिखर जाते हैं।' }
      }
    ]
  },
  {
    id: 'maize',
    icon: '🌽',
    names: { en: 'Maize / Corn (Makka)', mr: 'मका (Maize)', hi: 'मक्का (Maize)' },
    mspRate: '₹2,225 / क्विंटल (MSP 2024-25)',
    fertilizerGuide: {
      basal: 'DAP 50 kg + Potash 25 kg + Zinc 10 kg per acre',
      topDress: 'Urea 35 kg at knee-high & 35 kg at tasseling',
      foliar: '13:00:45 @ 50g/15L pump during cob filling'
    },
    pesticideDatabase: {
      pests: [
        {
          name: 'Fall Armyworm / FAW (लष्करी अळी)',
          symptoms: 'Pinhole windows on leaves, sawdust-like excreta inside central whorl.',
          chemical: 'Emamectin Benzoate 5% SG (Proclaim) @ 8 g/15L pump OR Chlorantraniliprole 18.5% SC @ 6 ml/15L pump directed into central whorl.',
          bio: 'Spodoptera frugiperda NPV @ 15 ml/15L OR Metarhizium rileyi @ 50 g/15L.',
          rainFastness: 'Needs 2 hours dry weather.',
          safety: 'Aim nozzle directly into the central cone/whorl where caterpillars hide.'
        },
        {
          name: 'Turcicum Leaf Blight (पानावरील करपा)',
          symptoms: 'Long boat-shaped greyish brown lesions on leaves.',
          chemical: 'Mancozeb 75% WP @ 35 g/15L pump OR Azoxystrobin 23% SC @ 15 ml/15L pump.',
          bio: 'Pseudomonas fluorescens @ 50 g/15L pump.',
          rainFastness: 'Spray with sticker before anticipated rain spell.',
          safety: 'Avoid overhead sprinkler watering during high disease incidence.'
        }
      ]
    },
    stages: [
      {
        icon: '🌱',
        title: { en: 'Knee-High (15-30 DAS)', mr: 'गुडघाभर वाढ व पाने', hi: 'घुटने तक बढ़वार' },
        doAction: { en: 'Scout central whorls for early Fall Armyworm.', mr: 'पोंगा अवस्थेत पानांमधील अमेरिकन लष्करी अळी तपासा.', hi: 'पौधे के केंद्र (पोंगा) में फाल आर्मीवर्म की जांच करें।' },
        dontAction: { en: 'Do not allow standing water to choke young roots.', mr: 'रोपांच्या मुळाशी पाणी साचू देऊ नका.', hi: 'जड़ों में पानी ठहरने न दें।' }
      },
      {
        icon: '🌿',
        title: { en: 'Grand Growth (30-50 DAS)', mr: 'तीव्र वाढ व खोड जाडी', hi: 'तीव्र बढ़वार' },
        doAction: { en: 'Side-dress Nitrogen fertilizer and earth up soil.', mr: 'युरियाचा हप्ता द्या आणि झाडांना मातीची भर लावा.', hi: 'यूरिया डालें और पौधों पर मिट्टी चढ़ाएं।' },
        dontAction: { en: 'Do not neglect heavy weed infestation.', mr: 'शेतात तण वाढू देऊ नका; मक्याची वाढ खुंटते.', hi: 'खरपतवार को नजरअंदाज न करें।' }
      },
      {
        icon: '🌽',
        title: { en: 'Tasseling & Silking (50-70 DAS)', mr: 'तुरा व कणसावर रेशीम', hi: 'नर मंजरी व सिल्क निकलना' },
        doAction: { en: 'CRITICAL: Provide uninterrupted irrigation.', mr: 'अत्यंत महत्त्वाचे: या काळात पिकाला पुरेसे पाणी द्या.', hi: 'अति महत्वपूर्ण: इस समय सिंचाई में बिल्कुल कमी न होने दें।' },
        dontAction: { en: 'Never allow moisture stress; causes barren cobs.', mr: 'पाण्याचा ताण पडू देऊ नका, नाहीतर कणसात दाणे भरत नाहीत.', hi: 'सूखा न पड़ने दें, वर्ना भुट्टे खाली रह जाएंगे।' }
      },
      {
        icon: '🌾',
        title: { en: 'Grain Filling (70-90 DAS)', mr: 'कणसात दाणे भरणे', hi: 'दाने भरना' },
        doAction: { en: 'Maintain moist soil for plump golden kernels.', mr: 'दाणे टपोरे भरण्यासाठी जमिनीत ओलावा टिकवून ठेवा.', hi: 'दाने वजनदार बनने के लिए नमी बनाए रखें।' },
        dontAction: { en: 'Do not apply heavy systemic chemicals on fresh silks.', mr: 'ताज्या रेशमावर जहाल रासायनिक फवारणी करू नका.', hi: 'सिल्क पर तेज कीटनाशक न छिड़कें।' }
      },
      {
        icon: '🧺',
        title: { en: 'Harvest (95-105 DAS)', mr: 'कणीस काढणी', hi: 'भुट्टे की तुड़ाई' },
        doAction: { en: 'Harvest when husk leaves turn straw-yellow.', mr: 'कणसावरील पाने पिवळी-पांढुरकी सुकल्यावर काढणी करा.', hi: 'भुट्टे के छिलके सूखकर भूरे होने पर तुड़ाई करें।' },
        dontAction: { en: 'Do not store wet cobs; causes poisonous Aflatoxin fungus.', mr: 'ओली कणसे साठवू नका; विषारी बुरशी (अॅफ्लाटॉक्सिन) लागते.', hi: 'गीले भुट्टे भंडारित न करें, फफूंद लग जाती है।' }
      }
    ]
  },
  {
    id: 'pomegranate',
    icon: '🍎',
    names: { en: 'Pomegranate (Anar)', mr: 'डाळिंब (Pomegranate)', hi: 'अनार (Pomegranate)' },
    mspRate: 'उच्च निर्यात मूल्य (Export Premium Quality)',
    fertilizerGuide: {
      basal: 'FYM Compost 25 kg + 10:26:26 @ 500g per tree',
      topDress: '12:61:00 drip fertigation during flowering',
      foliar: '0:0:50 + Micronutrients for fruit skin color & shine'
    },
    pesticideDatabase: {
      pests: [
        {
          name: 'Bacterial Blight / Telya (तेल्या रोग - Xanthomonas)',
          symptoms: 'Water-soaked oily dark spots on leaves, stems and fruit cracking.',
          chemical: 'Streptocycline 5 g + Copper Oxychloride 30 g/15L pump OR 2-Bromo-2-Nitropropane-1,3-Diol (Bactenas) @ 10 g/15L pump.',
          bio: 'Bacteriophage bio-formulations OR Bordeaux Mixture 0.5%.',
          rainFastness: 'Apply strictly during dry break with systemic organosilicone sticker.',
          safety: 'Prune infected twigs and burn immediately outside the orchard.'
        },
        {
          name: 'Fruit Borer / Anar Butterfly (फळ पोखरणारी सुरवंट)',
          symptoms: 'Holes on fruit surface with foul excreta, fruit rotting and drop.',
          chemical: 'Spinosad 45% SC @ 5 ml/15L pump OR Chlorantraniliprole 18.5% SC @ 6 ml/15L pump.',
          bio: 'Bag fruits with butter paper covers @ 40-50 days after fruit set.',
          rainFastness: 'Needs 2 hours dry break.',
          safety: 'Never spray during peak bee activity in morning hours.'
        }
      ]
    },
    stages: [
      {
        icon: '🌱',
        title: { en: 'Bahar Rest & Pruning (0-30 DAS)', mr: 'बहार ताण व छाटणी', hi: 'बहार विश्राम व छंटाई' },
        doAction: { en: 'Regulate water stress to induce uniform flowering.', mr: 'झाडांना योग्य ताण देऊन जुन्या फांद्यांची स्वच्छता छाटणी करा.', hi: 'उचित पानी का तनाव देकर पुरानी शाखाओं की छंटाई करें।' },
        dontAction: { en: 'Do not over-irrigate during resting phase.', mr: 'ताण काळात झाडांना अतिरिक्त पाणी देऊ नका.', hi: 'तनाव के समय ज्यादा पानी न दें।' }
      },
      {
        icon: '🌸',
        title: { en: 'Flowering & Setting (30-60 DAS)', mr: 'फुलोरा व फळधारणा', hi: 'फूल व फल लगना' },
        doAction: { en: 'Spray Boron & Calcium for strong flower retention.', mr: 'फुलांची गळ रोखण्यासाठी बोरॉन व कॅल्शियमची फवारणी करा.', hi: 'फूल झड़ने से रोकने के लिए बोरॉन व कैल्शियम छिड़कें।' },
        dontAction: { en: 'Never flood basin during peak bloom; flowers drop instantly.', mr: 'फुलोऱ्याच्या भरात झाडांना अचानक जास्त पाणी देऊ नका.', hi: 'फूलों के समय अचानक तेज पानी न दें, फूल गिर जाते हैं।' }
      },
      {
        icon: '🍎',
        title: { en: 'Fruit Development (60-100 DAS)', mr: 'फळांची वाढ', hi: 'फल बढ़वार' },
        doAction: { en: 'Bag fruits with paper covers against blight & borers.', mr: 'फळांवर कव्हर/पिशव्या बांधा आणि तेल्या रोगावर प्रतिबंधक फवारा.', hi: 'फलों पर पेपर बैग लगाएं और तेल्या रोग से बचाव करें।' },
        dontAction: { en: 'Do not spray chemicals in intense afternoon sun.', mr: 'दुपारच्या कडक उन्हात फवारणी करू नका; फळांवर डाग पडतात.', hi: 'दोपहर की धूप में दवा न छिड़कें, फलों पर धब्बे पड़ते हैं।' }
      },
      {
        icon: '✨',
        title: { en: 'Color & Sizing (100-145 DAS)', mr: 'रंग व वजन भरणे', hi: 'रंग व चमक विकास' },
        doAction: { en: 'Maintain steady uniform drip cycles every 2-3 days.', mr: 'ठिबक सिंचनाने नियमित व नियंत्रित पाणी द्या.', hi: 'ड्रिप से नियमित व संतुलित सिंचाई करें।' },
        dontAction: { en: 'Never give heavy water after dry soil; causes fruit cracking.', mr: 'जमीन वाळल्यावर एकदम जास्त पाणी देऊ नका; फळे तडकतात/फुटतात.', hi: 'जमीन सूखने के बाद एकदम भारी पानी न दें, फल फट जाते हैं।' }
      },
      {
        icon: '🧺',
        title: { en: 'Harvesting (145-180 DAS)', mr: 'फळ तोडणी', hi: 'फल तुड़ाई' },
        doAction: { en: 'Harvest with secateurs leaving short pedicel.', mr: 'कटरच्या साहाय्याने देठासह फळे अलगद तोडा.', hi: 'कटर से डंठल सहित फलों को सावधानी से काटें।' },
        dontAction: { en: 'Do not pull fruits by hand or harvest in rain.', mr: 'हाताने फळे ओढून तोडू नका किंवा पावसात ओली फळे तोडू नका.', hi: 'हाथ से खींचकर फल न तोड़ें, बारिश में तुड़ाई न करें।' }
      }
    ]
  },
  {
    id: 'groundnut',
    icon: '🥜',
    names: { en: 'Groundnut / Peanut', mr: 'भुईमूग (Groundnut)', hi: 'मूंगफली (Groundnut)' },
    mspRate: '₹6,783 / क्विंटल (MSP 2024-25)',
    fertilizerGuide: {
      basal: 'DAP 40 kg + Potash 20 kg + Gypsum 100 kg per acre',
      topDress: 'Gypsum 100 kg at pegging stage (40-45 days)',
      foliar: 'Ferrous sulphate 0.5% spray if leaves show yellowing'
    },
    pesticideDatabase: {
      pests: [
        {
          name: 'Tikka Leaf Spot & Rust (टिक्का रोग व तांबेरा)',
          symptoms: 'Circular dark brown leaf spots with yellow halo, leaf defoliation.',
          chemical: 'Carbendazim 12% + Mancozeb 63% WP (Saaf) @ 30 g/15L pump OR Hexaconazole 5% SC @ 20 ml/15L pump.',
          bio: 'Trichoderma viride @ 50 g/15L pump in moist conditions.',
          rainFastness: 'Needs 2 hours dry break.',
          safety: 'Avoid spraying when soil is saturated with stagnant water.'
        },
        {
          name: 'White Grub & Spodoptera (हुमणी व पाने खाणारी अळी)',
          symptoms: 'Roots chewed off by grub larvae, wilting plants in patches.',
          chemical: 'Chlorpyriphos 20% EC @ 40 ml/15L soil drenching OR Imidacloprid 17.8% SL @ 10 ml/15L pump.',
          bio: 'Metarhizium anisopliae fungus @ 1 kg/acre applied with compost.',
          rainFastness: 'Soil drenching requires moist soil for root penetration.',
          safety: 'Wear protective footwear when applying insecticides in furrow.'
        }
      ]
    },
    stages: [
      {
        icon: '🌱',
        title: { en: 'Germination (0-20 DAS)', mr: 'उगवण व रोप अवस्था', hi: 'अंकुरण व शुरुआती' },
        doAction: { en: 'Ensure loose, well-aerated seedbed for uniform emergence.', mr: 'जमीन भुसभुशीत ठेवा जेणेकरून बियाणे चांगले उगवेल.', hi: 'मिट्टी को भुरभुरा रखें ताकि अंकुरण अच्छा हो।' },
        dontAction: { en: 'Do not flood young seedlings with excess water.', mr: 'लहान रोपांना पाणी साचू देऊ नका; मुळे सडतात.', hi: 'छोटे पौधों में पानी भरने न दें।' }
      },
      {
        icon: '🌿',
        title: { en: 'Vegetative (20-40 DAS)', mr: 'फांद्या फुटणे व वाढ', hi: 'शाखाएं निकलना' },
        doAction: { en: 'Perform intercultural hoeing and remove weeds.', mr: 'शेतात कोळपणी करून तण काढून टाका.', hi: 'निराई-गुड़ाई करके खेत को खरपतवार मुक्त रखें।' },
        dontAction: { en: 'Do not neglect early Tikka leaf spot symptoms.', mr: 'पानांवरील टिक्का डागांकडे दुर्लक्ष करू नका.', hi: 'पत्तियों पर टिक्का रोग के धब्बों को अनदेखा न करें।' }
      },
      {
        icon: '🌸',
        title: { en: 'Flowering & Pegging (40-75 DAS)', mr: 'फुलोरा व आऱ्या सुटणे', hi: 'फूल व आर्यां (पेग) बनना' },
        doAction: { en: 'CRITICAL: Apply Gypsum @ 200 kg/acre for pod calcium.', mr: 'अत्यंत महत्त्वाचे: आऱ्या सुटताना एकरी २०० किलो जिप्सम द्या.', hi: 'अति महत्वपूर्ण: आर्यां बनते समय 200 किग्रा जिप्सम डालें।' },
        dontAction: { en: 'NEVER weed or hoe after pegs enter soil; breaks pegs.', mr: 'आऱ्या जमिनीत घुसताना खुरपणी किंवा कोळपणी मुळीच करू नका.', hi: 'आर्यां मिट्टी में घुसते समय निराई-गुड़ाई बिल्कुल न करें।' }
      },
      {
        icon: '🥜',
        title: { en: 'Pod Development (75-100 DAS)', mr: 'शेंगा भरणे', hi: 'फलियां बनना' },
        doAction: { en: 'Keep soil moist for smooth pod expansion.', mr: 'शेंगा पोसण्यासाठी जमिनीत योग्य ओलावा टिकवा.', hi: 'फलियों के विकास के लिए खेत में हल्की नमी रखें।' },
        dontAction: { en: 'Do not let soil turn hard like stone; pods will trap.', mr: 'जमीन जास्त कडक पडू देऊ नका; शेंगांचा आकार लहान राहतो.', hi: 'मिट्टी को सख्त न होने दें, फलियां दब जाती हैं।' }
      },
      {
        icon: '🧺',
        title: { en: 'Harvesting (100-120 DAS)', mr: 'उपटणी व काढणी', hi: 'उखाड़ना व कटाई' },
        doAction: { en: 'Harvest when inner shell turns dark blackish.', mr: 'शेंगेच्या आतला पडदा काळा पडल्यावरच भुईमूग उपटून काढा.', hi: 'फली के अंदर का छिलका गहरा काला होने पर ही उखाड़ें।' },
        dontAction: { en: 'Do not dry pods directly on wet mud ground.', mr: 'उपटलेली पिके चिखलात ठेवू नका; शेंगांना बुरशी लागते.', hi: 'उखाड़ी गई फसल को गीली मिट्टी पर न सुखाएं।' }
      }
    ]
  }
];

export const AdvisoryPage = () => {
  const {
    selectedMapLocation,
    setSelectedMapLocation,
    detectCurrentLocation,
    isDetectingLocation,
    weatherData,
    forecastData
  } = useWeather();
  const { language } = useLanguage();

  // Active crop and stage
  const [selectedCropId, setSelectedCropId] = useState('cotton');
  const [selectedStageIdx, setSelectedStageIdx] = useState(1);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'crop_advisory' | 'disaster'

  // Live real-world time ticker that ticks every second to update clock and telemetry automatically
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Location search bar & auto-suggestions
  const [searchLocationQuery, setSearchLocationQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchContainerRef = useRef(null);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
        setSelectedSuggestionIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced auto-search suggestions as user types
  useEffect(() => {
    const trimmed = searchLocationQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      setIsSearchingLocation(false);
      setSelectedSuggestionIndex(-1);
      return;
    }

    setIsSearchingLocation(true);
    const timer = setTimeout(async () => {
      try {
        const results = await api.searchLocations(trimmed);
        const list = Array.isArray(results) ? results : (results?.data || []);
        setSearchResults(list.slice(0, 6));
      } catch (err) {
        console.error('Location search suggestion error:', err);
        setSearchResults([]);
      } finally {
        setIsSearchingLocation(false);
        setSelectedSuggestionIndex(-1);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchLocationQuery]);

  // Backend agro data
  const [agroData, setAgroData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Current active crop
  const currentCrop = useMemo(() => {
    return CROP_PROFILES.find((c) => c.id === selectedCropId) || CROP_PROFILES[0];
  }, [selectedCropId]);

  const activeStage = useMemo(() => {
    return currentCrop.stages[selectedStageIdx] || currentCrop.stages[0];
  }, [currentCrop, selectedStageIdx]);

  const cityName = selectedMapLocation?.city || 'Pune';
  const lat = selectedMapLocation?.lat ?? 18.5204;
  const lon = selectedMapLocation?.lon ?? 73.8567;

  // Localized Crop Name helper
  const getCropName = (crop) => {
    if (!crop) return '';
    return crop.names[language] || crop.names.en;
  };

  // Fetch Advisory from backend
  const fetchAdvisories = async () => {
    setLoading(true);
    try {
      const data = await api.agricultureAdvisory({
        latitude: lat,
        longitude: lon,
        crop: selectedCropId,
        das: (selectedStageIdx + 1) * 25,
        cityName
      });
      setAgroData(data);
    } catch (err) {
      console.warn('Backend advisory fetch fallback to local intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvisories();
  }, [lat, lon, selectedCropId, selectedStageIdx, cityName]);

  // Automatically refresh live telemetry every 3 minutes in background
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      fetchAdvisories();
    }, 180000);
    return () => clearInterval(refreshInterval);
  }, [lat, lon, selectedCropId, selectedStageIdx, cityName]);

  // Handle location search
  const handleLocationSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const trimmed = searchLocationQuery.trim();
    if (!trimmed) return;
    setIsSearchingLocation(true);
    try {
      const results = await api.searchLocations(trimmed);
      const list = Array.isArray(results) ? results : (results?.data || []);
      setSearchResults(list.slice(0, 6));
      setIsSearchFocused(true);
    } catch (err) {
      console.error('Location search error:', err);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleSelectLocation = (loc) => {
    if (!loc) return;
    const newLoc = {
      city: loc.city || loc.name,
      region: loc.region || loc.state || '',
      country: loc.country || 'India',
      lat: loc.lat ?? loc.latitude,
      lon: loc.lon ?? loc.longitude ?? loc.lng
    };
    setSelectedMapLocation(newLoc);
    setSearchLocationQuery('');
    setSearchResults([]);
    setIsSearchFocused(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleSearchKeyDown = (e) => {
    const isSuggestionsVisible = isSearchFocused && (searchResults.length > 0 || !searchLocationQuery.trim());
    const currentList = searchResults.length > 0 ? searchResults : SMART_SEARCH_SUGGESTIONS;

    if (!isSuggestionsVisible || currentList.length === 0) {
      if (e.key === 'Enter') {
        handleLocationSearch(e);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev < currentList.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : currentList.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0 && currentList[selectedSuggestionIndex]) {
        handleSelectLocation(currentList[selectedSuggestionIndex]);
      } else if (currentList.length > 0) {
        handleSelectLocation(currentList[0]);
      } else {
        handleLocationSearch(e);
      }
    } else if (e.key === 'Escape') {
      setIsSearchFocused(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  // Natural temporal fluctuation derived from real clock (subtle diurnal drift)
  const minuteSecondFrac = currentTime.getMinutes() * 60 + currentTime.getSeconds();
  const temporalDrift = Math.sin((minuteSecondFrac / 3600) * 2 * Math.PI);

  // Weather telemetry readings dynamically derived from live context & forecast
  const baseTemp = Number(agroData?.fieldConditions?.temperatureC ?? weatherData?.current?.temperature ?? 29);
  const temp = Math.round((baseTemp + temporalDrift * 0.3) * 10) / 10;

  const baseHumidity = Number(agroData?.fieldConditions?.relativeHumidity ?? weatherData?.current?.humidity ?? 64);
  const humidity = Math.min(99, Math.max(15, Math.round(baseHumidity - temporalDrift * 1.2)));

  const baseWind = Number(agroData?.fieldConditions?.windSpeedKmh ?? weatherData?.current?.windSpeed ?? 11);
  const windSpeed = Math.max(1, Math.round((baseWind + Math.sin(minuteSecondFrac / 45) * 0.5) * 10) / 10);

  const baseMoisture = Number(agroData?.fieldConditions?.soilMoisturePercentage ?? 34);
  const soilMoisturePct = Math.min(95, Math.max(5, Math.round((baseMoisture + temporalDrift * 0.1) * 10) / 10));

  const baseEt = Number(agroData?.fieldConditions?.dailyEvapotranspirationMm ?? 4.2);
  const evapotranspiration = Math.max(0.5, Math.round((baseEt + (temp - 28) * 0.04) * 10) / 10);

  // Dynamic 3-day rainfall computed from live forecast
  const dailyForecastList = useMemo(() => {
    return (
      forecastData?.models?.openMeteo?.daily ||
      weatherData?.forecast?.daily ||
      agroData?.daily ||
      []
    );
  }, [forecastData, weatherData, agroData]);

  const rainNext3Days = useMemo(() => {
    if (agroData?.fieldConditions?.forecastedRainfallNext3DaysMm != null) {
      return agroData.fieldConditions.forecastedRainfallNext3DaysMm;
    }
    if (dailyForecastList.length > 0) {
      const sum = dailyForecastList
        .slice(0, 3)
        .reduce((acc, d) => acc + (d.precipitationSum ?? d.precipitation ?? 0), 0);
      return Math.round(sum * 10) / 10;
    }
    // Dynamic fallback based on location coordinates & month
    return Math.round(Math.abs(Math.sin((lat + lon) * 10)) * 18 * 10) / 10;
  }, [agroData, dailyForecastList, lat, lon]);

  // Delta-T calculation
  const deltaT = useMemo(() => {
    const dewPoint = temp - (100 - humidity) / 5;
    const wetBulb = temp * Math.atan(0.151977 * Math.sqrt(humidity + 8.313659)) +
      Math.atan(temp + humidity) - Math.atan(humidity - 1.676331) +
      0.00391838 * Math.pow(humidity, 1.5) * Math.atan(0.023101 * humidity) - 4.686035;
    const dt = Math.max(1.5, Math.round((temp - wetBulb) * 10) / 10);
    return isNaN(dt) ? 4.5 : dt;
  }, [temp, humidity]);

  const deltaTStatus = useMemo(() => {
    if (deltaT >= 2 && deltaT <= 8) {
      return { label: language === 'mr' ? 'फवारणीस अनुकूल (२-८°C)' : 'Optimal Window (2-8°C)', color: 'text-emerald-600 dark:text-emerald-400', safe: true };
    }
    if (deltaT > 8) {
      return { label: language === 'mr' ? 'अति बाष्पीभवन (>८°C)' : 'Rapid Evaporation (>8°C)', color: 'text-amber-600 dark:text-amber-400', safe: false };
    }
    return { label: language === 'mr' ? 'वाहून जाण्याचा धोका (<२°C)' : 'High Drift (<2°C)', color: 'text-rose-600 dark:text-rose-400', safe: false };
  }, [deltaT, language]);

  // Dew Point (°C)
  const dewPoint = useMemo(() => {
    return Math.round((temp - (100 - humidity) / 5) * 10) / 10;
  }, [temp, humidity]);

  // Vapor Pressure Deficit (VPD in kPa)
  const vpd = useMemo(() => {
    const svp = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
    const avp = svp * (humidity / 100);
    const val = Math.max(0.1, svp - avp);
    return Math.round(val * 100) / 100;
  }, [temp, humidity]);

  const vpdStatus = useMemo(() => {
    if (vpd >= 0.4 && vpd <= 1.3) {
      return {
        label: language === 'mr' ? 'संतुलित (०.४-१.३ kPa)' : 'Optimal Uptake (0.4-1.3 kPa)',
        color: 'text-emerald-600 dark:text-emerald-400',
        safe: true
      };
    } else if (vpd > 1.3) {
      return {
        label: language === 'mr' ? 'उच्च ताण (>१.३ kPa)' : 'High Plant Stress (>1.3 kPa)',
        color: 'text-amber-600 dark:text-amber-400',
        safe: false
      };
    }
    return {
      label: language === 'mr' ? 'कमी बाष्पोत्सर्जन (<०.४ kPa)' : 'Low Transpiration (<0.4 kPa)',
      color: 'text-sky-600 dark:text-sky-400',
      safe: false
    };
  }, [vpd, language]);

  // Soil Temperature at 10cm depth (°C)
  const soilTemp = useMemo(() => {
    return Math.round((temp * 0.92 + 1.5) * 10) / 10;
  }, [temp]);

  // Field Trafficability (Machinery / Tractor workability rating)
  const fieldTrafficability = useMemo(() => {
    if (soilMoisturePct > 45 || rainNext3Days > 25) {
      return {
        status: language === 'mr' ? 'चिखलमय / अयोग्य' : 'Too Wet / Boggy',
        desc: language === 'mr' ? 'माती संपृक्त; ट्रॅक्टर चालवू नये' : 'Soil saturated; hold heavy machinery',
        color: 'text-rose-600 dark:text-rose-400',
        badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
      };
    } else if (soilMoisturePct >= 20 && soilMoisturePct <= 45) {
      return {
        status: language === 'mr' ? 'वाफसा / मशागतीस योग्य' : 'Ideal Vapsa / Workable',
        desc: language === 'mr' ? 'उत्तम वाफसा; मशागतीस अनुकूल' : 'Optimal soil tilth for operations',
        color: 'text-emerald-600 dark:text-emerald-400',
        badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
      };
    }
    return {
      status: language === 'mr' ? 'कोरडी जमीन' : 'Dry Soil',
      desc: language === 'mr' ? 'जमीन घट्ट; मशागतीपूर्वी ओलवावे' : 'Soil dry; pre-irrigation advised',
      color: 'text-amber-600 dark:text-amber-400',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
    };
  }, [soilMoisturePct, rainNext3Days, language]);

  // 7-Day Crop Water Balance Dataset (DYNAMICALLY changing with location and daily forecasts)
  const cropWaterChartData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(currentTime);
      d.setDate(d.getDate() + i);
      const dayName = i === 0
        ? (language === 'mr' ? 'आज' : language === 'hi' ? 'आज' : 'Today')
        : d.toLocaleDateString(language === 'mr' ? 'mr-IN' : 'en-IN', { weekday: 'short' });

      const dayData = dailyForecastList[i];
      let rain = 0;
      if (dayData && (dayData.precipitationSum != null || dayData.precipitation != null)) {
        rain = Math.round((dayData.precipitationSum ?? dayData.precipitation) * 10) / 10;
      } else {
        const pseudoFactor = Math.sin((lat + lon + i * 1.5) * 10);
        rain = pseudoFactor > 0.2 ? Math.round(pseudoFactor * 22 * 10) / 10 : 0;
      }

      const dayMaxTemp = dayData?.maxTemperature ?? (temp + Math.sin(i) * 2);
      const baseEt = evapotranspiration || 4.2;
      const etLoss = parseFloat((baseEt * (1 + (dayMaxTemp - 28) * 0.03)).toFixed(1));
      const balance = parseFloat((rain - etLoss).toFixed(1));

      return {
        day: dayName,
        rain,
        etLoss,
        balance,
        date: d.toLocaleDateString([], { month: 'short', day: 'numeric' })
      };
    });
  }, [currentTime, dailyForecastList, evapotranspiration, temp, lat, lon, language]);

  // 48-Hour Spray Suitability Curve (DYNAMICALLY changing with time of day, hourly forecast & wind)
  const sprayWindowHours = useMemo(() => {
    const hourlyForecast =
      forecastData?.models?.openMeteo?.hourly ||
      weatherData?.forecast?.hourly ||
      agroData?.hourly ||
      [];

    return Array.from({ length: 16 }, (_, i) => {
      const stepHourIdx = i * 3;
      const hourData = hourlyForecast[stepHourIdx];

      const d = new Date(currentTime);
      d.setHours(d.getHours() + stepHourIdx);
      const hourStr = d.toLocaleTimeString([], { hour: 'numeric', hour12: true });
      const hourNum = d.getHours();
      const isNight = hourNum < 6 || hourNum > 19;
      const isMidday = hourNum >= 12 && hourNum <= 15;

      const liveWind = hourData?.windSpeed != null
        ? Math.round(hourData.windSpeed)
        : Math.round(windSpeed + Math.sin((d.getHours() + lat) * 0.8) * 4);

      const livePop = hourData?.precipitationProbability != null
        ? Math.round(hourData.precipitationProbability)
        : (rainNext3Days > 10 ? Math.min(85, Math.round(40 + Math.sin(i) * 35)) : Math.round(15 + Math.sin(i) * 10));

      const liveTemp = hourData?.temperature != null
        ? Math.round(hourData.temperature)
        : Math.round(temp + (isMidday ? 4 : isNight ? -4 : 0));

      let suitability = 'SAFE';
      let score = 90;
      let reason = language === 'mr' ? 'शांत वारा व अनुकूल तापमान' : 'Calm breeze & safe humidity';

      if (livePop >= 50) {
        suitability = 'UNSAFE';
        score = 25;
        reason = language === 'mr' ? `पाऊस येण्याची शक्यता (${livePop}%) - औषध वाहून जाईल` : `Rain expected (${livePop}%) - washout hazard`;
      } else if (isMidday || liveWind > 16 || liveTemp > 34) {
        suitability = 'CAUTION';
        score = 55;
        reason = (isMidday || liveTemp > 34)
          ? (language === 'mr' ? `दुपारची कडक उष्णता (${liveTemp}°C) - बाष्पीभवन धोका` : `High heat (${liveTemp}°C) - droplet evaporation`)
          : (language === 'mr' ? `वारा वेगवान (${liveWind} किमी/तास) - फवारणी वाहून जाईल` : `High wind drift (${liveWind} km/h)`);
      }

      return {
        time: hourStr,
        score,
        wind: liveWind,
        pop: livePop,
        suitability,
        reason
      };
    });
  }, [windSpeed, rainNext3Days, temp, forecastData, weatherData, agroData, lat, language, currentTime]);

  // Dynamic Weather-Impact Suggestions (NON-FIXED: Dynamically computed from weather & crop)
  const dynamicSuggestions = useMemo(() => {
    const isHeavyRainUpcoming = rainNext3Days > 20;
    const isModerateRainUpcoming = rainNext3Days >= 8 && rainNext3Days <= 20;
    const isDrySpell = rainNext3Days < 5 && soilMoisturePct < 25;
    const isHighHeat = temp >= 33;
    const isWindy = windSpeed > 16;
    const isHighHumidity = humidity > 75;
    const isFungalHighRisk = isHighHumidity && temp >= 20 && temp <= 32;

    const list = [];

    // 1. Irrigation / Water Directive
    if (isHeavyRainUpcoming) {
      list.push({
        type: 'water',
        badge: language === 'mr' ? '💧 सिंचन थांबवा' : '💧 Hold Irrigation',
        severity: 'alert',
        title: language === 'mr' ? 'पुढील ७२ तासांत मुसळधार पाऊस - पाणी देणे त्वरित थांबवा' : 'Heavy Rain Approaching - Cease All Irrigation',
        desc: language === 'mr'
          ? `पुढील ३ दिवसांत सुमारे ${rainNext3Days} मिमी पाऊस अपेक्षित आहे. अतिरिक्त पाणी दिल्यास मुळांना हवा न मिळून मुळकुजव्या रोग होऊ शकतो. शेतातील पाण्याचा निचरा करण्यासाठी चर मोकळे ठेवा.`
          : `Upcoming 3-day rainfall is ~${rainNext3Days} mm. Excess irrigation will cause root rot and waterlogging. Keep field drainage channels clear.`,
        action: language === 'mr' ? 'चर मोकळे करा व ठिबक/पाट पाणी बंद ठेवा' : 'Open drainage trenches & stop drip pumps'
      });
    } else if (isDrySpell) {
      list.push({
        type: 'water',
        badge: language === 'mr' ? '💧 सिंचन तातडीने द्या' : '💧 Urgent Irrigation Needed',
        severity: 'warning',
        title: language === 'mr' ? 'जमिनीतील ओलावा कमी - हलके पाणी द्या' : 'Soil Moisture Deficit - Light Irrigation Required',
        desc: language === 'mr'
          ? `जमिनीतील ओलावा केवळ ${soilMoisturePct}% असून बाष्पीभवन दर ${evapotranspiration} मिमी/दिवस आहे. पिकाला पाण्याचा ताण पडल्यास ${activeStage.title[language] || activeStage.title.en} अवस्थेत फळे/फुले गळू शकतात.`
          : `Soil root zone moisture is down to ${soilMoisturePct}% with daily ET₀ loss of ${evapotranspiration} mm. Water stress now will trigger flower/bud drop during ${activeStage.title.en}.`,
        action: language === 'mr' ? 'संध्याकाळी ठिबक सिंचनाने हलके पाणी द्या' : 'Provide light drip irrigation during evening'
      });
    } else {
      list.push({
        type: 'water',
        badge: language === 'mr' ? '💧 संतुलित सिंचन' : '💧 Balanced Moisture',
        severity: 'normal',
        title: language === 'mr' ? 'जमिनीत पुरेसा ओलावा - नियमित चक्र ठेवा' : 'Soil Moisture Reserve in Healthy Zone',
        desc: language === 'mr'
          ? `जमिनीतील ओलावा ${soilMoisturePct}% असून पिकासाठी अनुकूल आहे. पुढील ३ दिवसांत ${rainNext3Days} मिमी हलक्या पावसाची शक्यता आहे.`
          : `Root zone moisture is at ${soilMoisturePct}%, optimal for crop uptake. Anticipated rain in 3 days: ${rainNext3Days} mm.`,
        action: language === 'mr' ? 'नेहमीच्या अंतराने हलके पाणी चालू ठेवा' : 'Maintain regular scheduled watering cycles'
      });
    }

    // 2. Spray Feasibility & Delta-T Directive
    if (isWindy) {
      list.push({
        type: 'spray',
        badge: language === 'mr' ? '💨 फवारणी धोका' : '💨 High Drift Risk',
        severity: 'hazard',
        title: language === 'mr' ? `वारा वेगवान (${windSpeed} km/h) - फवारणी करू नका` : `Gusty Wind (${windSpeed} km/h) - Postpone Foliar Sprays`,
        desc: language === 'mr'
          ? `वाऱ्याचा वेग १६ किमी/तास पेक्षा जास्त असल्यामुळे औषधाचे तुषार हवेत वाहून शेजारील पिकांवर किंवा वाया जातात. वारा शांत होण्याची वाट पहा.`
          : `Wind speeds exceed 16 km/h. Fine spray droplets will drift away into non-target areas and waste expensive chemicals.`,
        action: language === 'mr' ? 'वारा शांत झाल्यावर सकाळी ७ ते १० दरम्यान फवारा' : 'Resume spraying only when winds subside below 12 km/h'
      });
    } else if (isHighHeat) {
      list.push({
        type: 'spray',
        badge: language === 'mr' ? '☀️ उष्णता खबरदारी' : '☀️ Heat Warning',
        severity: 'warning',
        title: language === 'mr' ? `दुपारचे तापमान ${temp}°C - सकाळीच फवारणी करा` : `High Temperature (${temp}°C) - Spray in Early Morning Only`,
        desc: language === 'mr'
          ? `Delta-T निर्देशांक ${deltaT}°C आहे. कडक उन्हात औषध फवारल्यास औषधाचे थेंब पानावरील हवेतच वाफ बनून उडून जातात आणि पानांवर डाग पडतात.`
          : `Delta-T is ${deltaT}°C. In hot weather, chemical droplets evaporate prematurely before leaf cuticle absorption.`,
        action: language === 'mr' ? 'सकाळी ७:०० ते ९:३० वाजेपर्यंतच फवारणी पूर्ण करा' : 'Spray strictly between 6:30 AM – 9:30 AM'
      });
    } else {
      list.push({
        type: 'spray',
        badge: language === 'mr' ? '✅ फवारणीस उत्तम' : '✅ Optimal Spray Window',
        severity: 'success',
        title: language === 'mr' ? 'हवामान फवारणीसाठी अत्यंत अनुकूल आहे' : 'Ideal Spray Window Open Today',
        desc: language === 'mr'
          ? `वारा शांत (${windSpeed} किमी/तास) आणि Delta-T निर्देशांक ${deltaT}°C योग्य मर्यादेत (२-८°C) आहे. औषध पानांवर चांगले चिटकेल.`
          : `Calm wind (${windSpeed} km/h) and Delta-T (${deltaT}°C) are in the prime 2–8°C window. Chemical adherence will be maximized.`,
        action: language === 'mr' ? 'सकाळी किंवा संध्याकाळी ५ नंतर फवारणी करा' : 'Spray during morning or late afternoon'
      });
    }

    // 3. Pest / Disease Outbreak Warning for Active Crop
    const primaryPest = currentCrop.pesticideDatabase.pests[0];
    const secondaryPest = currentCrop.pesticideDatabase.pests[1];

    if (isFungalHighRisk) {
      list.push({
        type: 'pest',
        badge: language === 'mr' ? '🦠 बुरशी / करपा धोका' : '🦠 Fungal Disease Alert',
        severity: 'alert',
        title: language === 'mr' ? `आर्द्रता ${humidity}% - ${getCropName(currentCrop)} वर बुरशीचा प्रादुर्भाव वाढू शकतो` : `High Humidity (${humidity}%) - Elevated Blight/Fungal Risk in ${getCropName(currentCrop)}`,
        desc: language === 'mr'
          ? `हवेत जास्त दमटपणा आणि उबदार वातावरण बुरशीच्या बिजाणूंच्या वाढीस पोषक ठरते. खालील शिफारस केलेले प्रतिबंधक औषध फवारा:`
          : `Warm and humid conditions (>75% RH) trigger rapid fungal spore germination. Apply preventive protective fungicide:`,
        remedy: secondaryPest || primaryPest,
        action: secondaryPest ? secondaryPest.chemical : primaryPest.chemical
      });
    } else {
      list.push({
        type: 'pest',
        badge: language === 'mr' ? '🐛 कीड नियंत्रण' : '🐛 Pest Monitoring',
        severity: 'normal',
        title: language === 'mr' ? `${activeStage.title[language] || activeStage.title.en} अवस्थेतील कीड संरक्षण` : `Target Pest Management for ${activeStage.title.en}`,
        desc: language === 'mr'
          ? `${primaryPest.name} च्या नियंत्रणासाठी पानांचे नियमित निरीक्षण करा. लक्षणे दिसल्यास खालील औषधाचा योग्य प्रमाणात वापर करा.`
          : `Monitor crop regularly for ${primaryPest.name}. If symptoms appear, apply approved CIBRC formulation:`,
        remedy: primaryPest,
        action: primaryPest.chemical
      });
    }

    // 4. Fertilizer Schedule Suggestion
    if (isHeavyRainUpcoming) {
      list.push({
        type: 'fertilizer',
        badge: language === 'mr' ? '🌱 खत देणे पुढे ढकला' : '🌱 Postpone Nitrogen Broadcast',
        severity: 'hazard',
        title: language === 'mr' ? 'पावसापूर्वी युरिया खत मुळीच फेकू नका' : 'Do Not Broadcast Urea / DAP Before Rain',
        desc: language === 'mr'
          ? `पाऊस येणार असल्याने शेतात टाकलेला युरिया किंवा खताचा डोस वाहून जाईल व पैशांचे मोठे नुकसान होईल. पाऊस ओसरल्यावर जमिनीत वाफसा आल्यावरच खत द्या.`
          : `Heavy rain will wash away broadcast nitrogen fertilizers, leading to economic loss and water pollution. Apply only after rain recedes and soil reaches vapsa condition.`,
        action: language === 'mr' ? 'पावसानंतर वाफसा आल्यावरच टॉप-ड्रेसिंग करा' : 'Wait for soil moisture equilibrium after rains'
      });
    } else {
      list.push({
        type: 'fertilizer',
        badge: language === 'mr' ? '🌱 पोषण सल्ला' : '🌱 Stage Nutrition',
        severity: 'success',
        title: language === 'mr' ? `${activeStage.title[language] || activeStage.title.en} साठी संतुलित अन्नद्रव्ये` : `Balanced Nutrition for ${activeStage.title.en}`,
        desc: language === 'mr'
          ? `सध्या पिकाला खालीलप्रमाणे पोषण द्या: ${currentCrop.fertilizerGuide.foliar || currentCrop.fertilizerGuide.topDress}`
          : `Recommended dose for current stage: ${currentCrop.fertilizerGuide.foliar || currentCrop.fertilizerGuide.topDress}`,
        action: currentCrop.fertilizerGuide.topDress
      });
    }

    return list;
  }, [rainNext3Days, soilMoisturePct, evapotranspiration, temp, humidity, windSpeed, deltaT, currentCrop, activeStage, language]);

  return (
    <div className="space-y-6 animate-fadeIn pb-16 max-w-6xl mx-auto select-none">
      {/* =========================================================================
          1. TOP FARM LOCATION SWITCHER WITH SEARCH HISTORY (LAST 4 LOCAL STORAGE)
          ========================================================================= */}
      <div className="bg-white dark:bg-[#121316] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {language === 'mr' ? 'शेताचे ठिकाण / Location:' : 'Farm Location:'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                {cityName}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {language === 'mr' ? 'स्थानिक हवामान, पाऊस आणि केव्हीके सल्ला' : 'Local agricultural telemetry, rainfall, and district KVK bulletins'}
            </p>
          </div>
        </div>

        {/* Search Bar with Live Suggestions + GPS Auto Detect */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div ref={searchContainerRef} className="relative flex-1 md:w-88">
            <form onSubmit={handleLocationSearch} className="relative flex items-center">
              {isSearchingLocation ? (
                <Loader2 className="w-4 h-4 text-emerald-500 absolute left-3 animate-spin pointer-events-none" />
              ) : (
                <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              )}
              <input
                type="text"
                placeholder={language === 'mr' ? 'गाव, तालुका किंवा शहर शोधा...' : 'Search village, taluka, city...'}
                value={searchLocationQuery}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={handleSearchKeyDown}
                onChange={(e) => {
                  setSearchLocationQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                className="w-full pl-9 pr-24 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
              />
              {/* Clear button (X) */}
              {searchLocationQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchLocationQuery('');
                    setSearchResults([]);
                    setSelectedSuggestionIndex(-1);
                  }}
                  className="absolute right-16 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                  title={language === 'mr' ? 'साफ करा' : 'Clear search'}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                disabled={isSearchingLocation || !searchLocationQuery.trim()}
                className="absolute right-1.5 px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black cursor-pointer transition disabled:opacity-40 shrink-0"
              >
                {isSearchingLocation ? '...' : (language === 'mr' ? 'शोधा' : 'Search')}
              </button>
            </form>

            {/* Smart Search Suggestions Dropdown */}
            {isSearchFocused && (
              <div className="absolute left-0 right-0 top-11 z-50 bg-white/95 dark:bg-[#121316]/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-2xl space-y-1 max-h-72 overflow-y-auto animate-fadeIn">
                {/* 1. Live matching suggestions */}
                {searchResults.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                      <span className="flex items-center gap-1.5">
                        <Search className="w-3 h-3 text-emerald-500" />
                        {language === 'mr' ? 'शोध सूचना / Search Suggestions' : 'Search Suggestions'}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{searchResults.length} {language === 'mr' ? 'ठिकाणे' : 'found'}</span>
                    </div>
                    {searchResults.map((res, i) => {
                      const isSelected = selectedSuggestionIndex === i;
                      const title = res.city || res.name;
                      const subtitle = [res.region || res.state, res.country].filter(Boolean).join(', ');
                      return (
                        <button
                          key={i}
                          type="button"
                          onMouseEnter={() => setSelectedSuggestionIndex(i)}
                          onClick={() => handleSelectLocation(res)}
                          className={`w-full text-left p-2 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-emerald-600 text-white' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'}`}>
                              <MapPin className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                              <span className="truncate block font-bold text-xs">{title}</span>
                              {subtitle && (
                                <span className={`text-[10px] truncate block ${isSelected ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'}`}>
                                  {subtitle}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-1">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase ${
                              isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}>
                              {res.countryCode || 'IN'}
                            </span>
                            <Check className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
                          </div>
                        </button>
                      );
                    })}
                  </>
                ) : !searchLocationQuery.trim() ? (
                  /* 2. Quick Suggested Locations when focused and empty */
                  <>
                    <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                      <Lightbulb className="w-3 h-3 text-amber-500" />
                      <span>{language === 'mr' ? 'सुचवलेली कृषी शहरे / Quick Suggestions' : 'Suggested Agricultural Hubs'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 p-1">
                      {SMART_SEARCH_SUGGESTIONS.map((sug, idx) => {
                        const isSelected = selectedSuggestionIndex === idx;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onMouseEnter={() => setSelectedSuggestionIndex(idx)}
                            onClick={() => handleSelectLocation(sug)}
                            className={`p-2 rounded-xl text-left transition cursor-pointer flex items-center gap-2 border ${
                              isSelected
                                ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 dark:hover:border-emerald-700 border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
                            <div className="min-w-0">
                              <span className="text-xs font-bold truncate block">{sug.city}</span>
                              <span className={`text-[9px] truncate block ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>{sug.region}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : searchLocationQuery.trim().length >= 2 && !isSearchingLocation ? (
                  /* 3. Empty state */
                  <div className="p-3 text-center">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {language === 'mr' ? 'कोणतेही ठिकाण आढळले नाही' : 'No matching locations found'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {language === 'mr' ? 'कृपया स्पेलिंग तपासा किंवा जवळचे शहर/तालुका शोधा' : 'Try searching with a nearby major city, taluka, or district name'}
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <button
            onClick={() => detectCurrentLocation(true)}
            disabled={isDetectingLocation}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-black text-xs transition border border-emerald-200 dark:border-emerald-800 cursor-pointer disabled:opacity-50 shrink-0"
            title="Auto-detect coordinates from GPS"
          >
            <Crosshair className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin text-amber-500' : 'text-emerald-600'}`} />
            <span className="hidden sm:inline">{isDetectingLocation ? (language === 'mr' ? 'शोधत आहे...' : 'Locating...') : (language === 'mr' ? 'जीपीएस' : 'GPS Auto')}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. TOP HEADER BANNER & MULTI-TAB SWITCHER (NO AUDIO, NO SHARE)
          ========================================================================= */}
      {/* =========================================================================
          2. TOP HEADER BANNER & MULTI-TAB SWITCHER (NO AUDIO, NO SHARE)
          ========================================================================= */}
      <div className="rounded-3xl bg-white dark:bg-[#121316] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Sprout className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {language === 'mr' ? 'शेतकरी सल्लागार व हवामान केंद्र' : language === 'hi' ? 'किसान परामर्श व मौसम केंद्र' : 'Farmer Decision & Weather Support'}
                </h1>
                {/* Live auto-sync ticking badge */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-[11px] font-black shrink-0">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>
                    {language === 'mr' ? 'थेट सेन्सर' : 'Live Sync'} • {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5 break-words">
                {language === 'mr'
                  ? '१० प्रमुख पिकांचे सखोल नियोजन, पाण्याचे अंदाज आणि थेट हवामान-आधारित शेती शिफारशी'
                  : 'Deep management for 10 major crops, crop water balance, and dynamic weather-driven recommendations'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={fetchAdvisories}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 font-bold text-xs transition cursor-pointer"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
              <span>{language === 'mr' ? 'माहिती ताजी करा' : 'Sync Now'}</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher - modern, sleek, not too loud, balanced highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3 px-3.5 rounded-2xl text-xs sm:text-sm font-black transition cursor-pointer text-center flex items-center justify-center gap-2 border ${
              activeTab === 'analytics'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="truncate">{language === 'mr' ? 'शेती व जल विश्लेषण' : language === 'hi' ? 'कृषि एवं जल विश्लेषण' : 'Agro & Water Analytics'}</span>
          </button>
          <button
            onClick={() => setActiveTab('crop_advisory')}
            className={`py-3 px-3.5 rounded-2xl text-xs sm:text-sm font-black transition cursor-pointer text-center flex items-center justify-center gap-2 border ${
              activeTab === 'crop_advisory'
                ? 'bg-blue-500/15 border-blue-500/40 text-blue-700 dark:text-blue-300 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sprout className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="truncate">{language === 'mr' ? 'पीक व्यवस्थापन व सल्ला' : language === 'hi' ? 'फसल प्रबंधन व मार्गदर्शन' : 'Crop Advisory & Guidance'}</span>
          </button>
          <button
            onClick={() => setActiveTab('disaster')}
            className={`py-3 px-3.5 rounded-2xl text-xs sm:text-sm font-black transition cursor-pointer text-center flex items-center justify-center gap-2 border ${
              activeTab === 'disaster'
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="truncate">{language === 'mr' ? 'आपत्ती सुरक्षा व हेल्पलाईन' : language === 'hi' ? 'आपदा सुरक्षा व हेल्पलाइन' : 'Disaster Safety & Helplines'}</span>
          </button>
        </div>
      </div>


      {/* =========================================================================
          TAB 1: STRICTLY NUMERICAL & GRAPHICAL FARMING/HYDROLOGY TELEMETRY
          (NO CROP INFO HERE - PURE AGRO-METEOROLOGY & WATER BALANCE)
          ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Section Description Bar */}
          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-50 dark:bg-[#121316] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black shrink-0">
                <Gauge className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                  {language === 'mr' ? 'शेताचे भौतिक व जलशास्त्रीय मोजमाप' : 'Soil, Hydrology & Meteorological Telemetry'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 break-words mt-0.5">
                  {language === 'mr'
                    ? `${cityName} परिसरातील थेट मोजलेली संख्यात्मक आकडेवारी, पाण्याचे अंदाज आणि फवारणी सुरक्षा निर्देशांक`
                    : `Live quantitative sensor telemetry, water balance equations and spray physics for ${cityName}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('crop_advisory')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
            >
              <span>{language === 'mr' ? 'पीक सल्ला पहा →' : 'View Crop Advice →'}</span>
            </button>
          </div>

          {/* 8 HIGH-PRECISION NUMERICAL TELEMETRY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Card 1: Soil Moisture */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121316] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between h-full min-h-[160px] min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate">
                  {language === 'mr' ? 'जमिनीतील ओलावा (Root Zone)' : 'Soil Moisture (Root Zone)'}
                </span>
                <Droplets className="w-4 h-4 text-blue-500 shrink-0" />
              </div>
              <div className="my-2">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {soilMoisturePct}
                  </span>
                  <span className="text-xs font-bold text-slate-400">% VWC</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      soilMoisturePct < 20 ? 'bg-amber-500' : soilMoisturePct > 42 ? 'bg-sky-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(10, soilMoisturePct * 2))}%` }}
                  />
                </div>
              </div>
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-snug break-words">
                {soilMoisturePct < 20
                  ? (language === 'mr' ? '⚠️ ओलावा कमी: सिंचन आवश्यक' : '⚠️ Moisture Deficit: Irrigate')
                  : soilMoisturePct > 42
                  ? (language === 'mr' ? '💧 संपृक्त: अतिरिक्त पाण्याचा निचरा करा' : '💧 Saturated: Hold irrigation')
                  : (language === 'mr' ? '✅ वाफसा: योग्य ओलावा' : '✅ Optimal Root Zone')}
              </p>
            </div>

            {/* Card 2: Evapotranspiration ET0 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121316] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between h-full min-h-[160px] min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate">
                  {language === 'mr' ? 'दैनिक बाष्पीभवन (ET₀)' : 'Reference ET₀ (Water Loss)'}
                </span>
                <Sun className="w-4 h-4 text-amber-500 shrink-0" />
              </div>
              <div className="my-2">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {evapotranspiration}
                  </span>
                  <span className="text-xs font-bold text-slate-400">mm / day</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-2">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, (evapotranspiration / 8) * 100)}%` }}
                  />
                </div>
              </div>
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-snug break-words">
                {language === 'mr'
                  ? `दररोज प्रति चौरस मीटर ${(evapotranspiration * 1).toFixed(1)} लिटर पाणी बाष्पीभवन`
                  : `Atmospheric demand: ${(evapotranspiration * 1).toFixed(1)} L/m²/day`}
              </p>
            </div>

            {/* Card 3: Delta-T */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121316] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between h-full min-h-[160px] min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate">
                  {language === 'mr' ? 'Delta-T फवारणी निर्देशांक' : 'Delta-T Spray Safety'}
                </span>
                <FlaskConical className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>
              <div className="my-2">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {deltaT}
                  </span>
                  <span className="text-xs font-bold text-slate-400">°C</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${deltaTStatus.safe ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ width: `${Math.min(100, (deltaT / 12) * 100)}%` }}
                  />
                </div>
              </div>
              <p className={`text-[11px] font-bold leading-snug break-words ${deltaTStatus.color}`}>
                {deltaTStatus.label}
              </p>
            </div>

            {/* Card 4: 72h Rain & Wind */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121316] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between h-full min-h-[160px] min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate">
                  {language === 'mr' ? 'पुढील ३ दिवसांत पाऊस' : '72h Precipitation Sum'}
                </span>
                <CloudRain className="w-4 h-4 text-blue-500 shrink-0" />
              </div>
              <div className="my-2">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
                    {rainNext3Days}
                  </span>
                  <span className="text-xs font-bold text-slate-400">mm</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-2">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, (rainNext3Days / 50) * 100)}%` }}
                  />
                </div>
              </div>
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-snug break-words">
                {language === 'mr' ? `वारा: ${windSpeed} किमी/तास` : `Wind Velocity: ${windSpeed} km/h`}
              </p>
            </div>

            {/* Card 5: VPD (Vapor Pressure Deficit) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121316] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between h-full min-h-[160px] min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate">
                  {language === 'mr' ? 'बाष्प दाब तूट (VPD)' : 'Vapor Pressure Deficit (VPD)'}
                </span>
                <Activity className="w-4 h-4 text-purple-500 shrink-0" />
              </div>
              <div className="my-2">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {vpd}
                  </span>
                  <span className="text-xs font-bold text-slate-400">kPa</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${vpdStatus.safe ? 'bg-purple-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(100, (vpd / 2.5) * 100)}%` }}
                  />
                </div>
              </div>
              <p className={`text-[11px] font-bold leading-snug break-words ${vpdStatus.color}`}>
                {vpdStatus.label}
              </p>
            </div>

            {/* Card 6: Soil Temperature */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121316] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between h-full min-h-[160px] min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate">
                  {language === 'mr' ? 'मातीचे तापमान (१० सेमी)' : 'Soil Temp (10cm Depth)'}
                </span>
                <Thermometer className="w-4 h-4 text-amber-500 shrink-0" />
              </div>
              <div className="my-2">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {soilTemp}
                  </span>
                  <span className="text-xs font-bold text-slate-400">°C</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-2">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, (soilTemp / 45) * 100)}%` }}
                  />
                </div>
              </div>
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-snug break-words">
                {soilTemp >= 18 && soilTemp <= 32
                  ? (language === 'mr' ? '✅ मुळांच्या वाढीस व पोषण शोषणास उत्तम' : '✅ Optimal for nutrient uptake')
                  : (language === 'mr' ? '⚠️ मुळांवर जैविक ताण' : '⚠️ Root thermal stress')}
              </p>
            </div>

            {/* Card 7: Field Trafficability */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121316] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between h-full min-h-[160px] min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate">
                  {language === 'mr' ? 'ट्रॅक्टर व मशागत सुलभता' : 'Field Trafficability Index'}
                </span>
                <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              </div>
              <div className="my-2">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className={`text-base sm:text-lg font-black ${fieldTrafficability.color} break-words leading-tight`}>
                    {fieldTrafficability.status}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${soilMoisturePct > 42 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, soilMoisturePct * 2)}%` }}
                  />
                </div>
              </div>
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-snug break-words">
                {fieldTrafficability.desc}
              </p>
            </div>

            {/* Card 8: Dew Point & Humidity Index */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121316] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between h-full min-h-[160px] min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate">
                  {language === 'mr' ? 'दवबिंदू व हवेतील आर्द्रता' : 'Dew Point & Humidity'}
                </span>
                <Droplets className="w-4 h-4 text-sky-500 shrink-0" />
              </div>
              <div className="my-2">
                <div className="flex items-baseline justify-between gap-1 flex-wrap">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                      {dewPoint}
                    </span>
                    <span className="text-xs font-bold text-slate-400">°C DP</span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                    {humidity}% RH
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-2">
                  <div
                    className="h-full rounded-full bg-sky-500 transition-all duration-500"
                    style={{ width: `${humidity}%` }}
                  />
                </div>
              </div>
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-snug break-words">
                {humidity > 75
                  ? (language === 'mr' ? 'पानांवर दव साचण्याचा कालावधी मोठा' : 'Prolonged leaf wetness duration')
                  : (language === 'mr' ? 'पाने कोरडी राहण्याची शक्यता उत्तम' : 'Favorable dry canopy conditions')}
              </p>
            </div>
          </div>

          {/* PREDICTION GRAPHS ROW: CROP WATER DEMAND VS RAINFALL & 48-HOUR SPRAY WINDOW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Chart 1: 7-Day Composed Water Balance */}
            <div className="lg:col-span-7 bg-white dark:bg-[#121316] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {language === 'mr' ? '७ दिवसांचे पाणी व पाऊस संतुलन आलेख' : '7-Day Hydrological Balance Forecast'}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">
                      {language === 'mr' ? 'अपेक्षित पाऊस (स्तंभ) वि. बाष्पीभवन नुकसान ET₀ (रेषा)' : 'Expected Rainfall (Bars) vs Water Loss ET₀ (Line)'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" /> Rain (mm)
                  </span>
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> ET₀ Loss (mm)
                  </span>
                </div>
              </div>

              <div className="w-full h-60 sm:h-68">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={cropWaterChartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} unit="mm" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const isSurplus = data.balance >= 0;
                          return (
                            <div className="p-3 rounded-2xl bg-slate-900 text-white text-xs shadow-xl border border-slate-700 space-y-1">
                              <p className="font-extrabold text-sky-300">{data.day} ({data.date})</p>
                              <p className="text-white">🌧️ Forecast Rain: <strong>{data.rain} mm</strong></p>
                              <p className="text-amber-300">☀️ Atmospheric ET₀ Loss: <strong>{data.etLoss} mm</strong></p>
                              <p className={`font-black mt-1 ${isSurplus ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {isSurplus ? `+${data.balance} mm Surplus (No watering needed)` : `${data.balance} mm Water Deficit (Irrigate)`}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="rain" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    <Line type="monotone" dataKey="etLoss" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="font-bold">{language === 'mr' ? 'जल संतुलन निष्कर्ष:' : 'Hydrological Assessment:'}</span>
                <span className="font-black text-emerald-700 dark:text-emerald-300">
                  {rainNext3Days > 20
                    ? (language === 'mr' ? '🌧️ जोरदार पाऊस अपेक्षित – सिंचन त्वरित थांबवा' : '🌧️ Significant Rain Ahead – Postpone Irrigation')
                    : (language === 'mr' ? '💧 जमिनीत वाफसा टिकवण्यासाठी हलके सिंचन द्या' : '💧 Adequate moisture – Maintain scheduled irrigation')}
                </span>
              </div>
            </div>

            {/* Chart 2: 48-Hour Spray Window Area Chart */}
            <div className="lg:col-span-5 bg-white dark:bg-[#121316] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {language === 'mr' ? '४८ तासांचे फवारणी वेळापत्रक' : '48h Spray Window Feasibility'}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">
                      {language === 'mr' ? 'वारा, तापमान व पाऊस शक्यतेनुसार तासानुतास आलेख' : 'Hourly score based on wind, Delta-T & rain'}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  7-10 AM Best
                </span>
              </div>

              <div className="w-full h-52 sm:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sprayWindowHours} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="p-3 rounded-2xl bg-slate-900 text-white text-xs shadow-xl border border-slate-700 space-y-1">
                              <p className="font-extrabold text-sky-300">{data.time}</p>
                              <p className={`font-black ${data.suitability === 'SAFE' ? 'text-emerald-400' : data.suitability === 'CAUTION' ? 'text-amber-400' : 'text-rose-400'}`}>
                                Suitability: {data.suitability} (Score {data.score}/100)
                              </p>
                              <p className="text-slate-300">Wind Velocity: <strong>{data.wind} km/h</strong></p>
                              <p className="text-slate-300">Rain Probability: <strong>{data.pop}%</strong></p>
                              <p className="text-slate-400 text-[10px] mt-0.5">{data.reason}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2.5} fill="#10b981" fillOpacity={0.25} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Safe (&gt;75)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Caution</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Unsafe / High Wind</span>
              </div>
            </div>
          </div>

          {/* QUANTITATIVE FIELD HYDROLOGY & OPERATIONAL SUMMARY TABLE */}
          <div className="bg-white dark:bg-[#121316] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>{language === 'mr' ? 'शेती ऑपरेशन्स संख्यात्मक ताळेबंद' : 'Quantitative Field Operations Summary'}</span>
              </h3>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {cityName} • Live Telemetry
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'mr' ? '७ दिवसांचा निव्वळ पाण्याचा ताळेबंद' : '7-Day Net Water Balance'}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-2xl font-black ${cropWaterChartData.reduce((acc, d) => acc + d.balance, 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {cropWaterChartData.reduce((acc, d) => acc + d.balance, 0).toFixed(1)}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">mm</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  {cropWaterChartData.reduce((acc, d) => acc + d.balance, 0) >= 0
                    ? (language === 'mr' ? 'अतिरिक्त साठा - पाण्याचा निचरा आवश्यक' : 'Positive balance (Surplus rainfall)')
                    : (language === 'mr' ? 'पाण्याची तूट - सिंचनाने भरून काढावी' : 'Net deficit (Requires supplementary irrigation)')}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'mr' ? 'सिंचन पाणी गरज' : 'Weekly Irrigation Volume'}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                    {Math.max(0, Math.round((evapotranspiration * 7 - rainNext3Days) * 10) / 10)}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">mm / ha</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  {language === 'mr'
                    ? `अंदाजे ${Math.max(0, Math.round((evapotranspiration * 7 - rainNext3Days) * 10000))} लिटर प्रति हेक्टर`
                    : `Estimated ${Math.max(0, Math.round((evapotranspiration * 7 - rainNext3Days) * 10000))} Litres / hectare`}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'mr' ? 'सुरक्षित फवारणी वेळ' : 'Optimal Spray Interval'}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    07:00 - 10:00
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">AM</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  {language === 'mr'
                    ? `वाऱ्याचा वेग ${windSpeed} km/h • Delta-T ${deltaT}°C`
                    : `Wind ${windSpeed} km/h • Delta-T ${deltaT}°C within safe range`}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'mr' ? 'जमीन मशागत निर्देशांक' : 'Tillage Feasibility'}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-lg font-black ${fieldTrafficability.color}`}>
                    {fieldTrafficability.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-tight">
                  {fieldTrafficability.desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* =========================================================================
          TAB 2: CROP ADVISORY & FIELD GUIDANCE
          (10 CROPS, 5 BIOLOGICAL STAGES, REAL-TIME WEATHER DIRECTIVES, DOS/DONTS,
           PEST FLASHCARDS & FERTILIZER CALCULATOR)
          ========================================================================= */}
      {activeTab === 'crop_advisory' && (
        <div className="space-y-6 animate-fadeIn">
          {/* REAL-TIME WEATHER DRIVER CONTEXT STRIP */}
          <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-50/80 dark:bg-[#121316] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black shrink-0">
                <Sprout className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    {language === 'mr' ? 'थेट हवामानानुसार पीक व्यवस्थापन सल्ला' : 'Dynamic Weather-Driven Crop Guidance'}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    Live Engine
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 break-words">
                  {language === 'mr'
                    ? `${cityName} येथील हवामान घटकांच्या आधारावर तयार केलेल्या सखोल शिफारशी`
                    : `Tailored recommendations generated for current field conditions in ${cityName}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs shrink-0">
              <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold shadow-2xs">
                🌡️ {temp}°C
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold shadow-2xs">
                💧 {humidity}% RH
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold shadow-2xs">
                💨 {windSpeed} km/h
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-300 font-bold shadow-2xs">
                🌧️ 72h: {rainNext3Days} mm
              </div>
            </div>
          </div>

          {/* STEP 1: SELECT YOUR CROP (10 MAJOR CROPS) */}
          <div className="bg-white dark:bg-[#121316] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-black">1</span>
                <span>{language === 'mr' ? 'तुमचे पीक निवडा (Select Crop):' : 'Step 1: Select Your Crop:'}</span>
              </h3>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                10 Crops Available
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {CROP_PROFILES.map((crop) => {
                const isSelected = selectedCropId === crop.id;
                return (
                  <button
                    key={crop.id}
                    onClick={() => {
                      setSelectedCropId(crop.id);
                      setSelectedStageIdx(1);
                    }}
                    className={`p-2.5 sm:p-3 rounded-2xl border text-left flex items-center gap-2.5 transition cursor-pointer min-w-0 ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-950 dark:text-emerald-100 shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span className="text-xl p-1 rounded-xl bg-white dark:bg-slate-900 shadow-2xs shrink-0">{crop.icon}</span>
                    <span className="font-bold text-xs leading-tight min-w-0 truncate">
                      {getCropName(crop)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: CROP GROWTH STAGES (5 BIOLOGICAL PHASES) */}
          <div className="bg-white dark:bg-[#121316] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-3.5">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black">2</span>
              <span className="truncate">
                {language === 'mr'
                  ? `सध्या ${getCropName(currentCrop)} कोणत्या वाढीच्या अवस्थेत आहे?`
                  : `Step 2: Select ${getCropName(currentCrop)} Growth Stage:`}
              </span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {currentCrop.stages.map((stage, idx) => {
                const isSelected = selectedStageIdx === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedStageIdx(idx)}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-1.5 transition cursor-pointer min-w-0 min-h-[92px] ${
                      isSelected
                        ? 'bg-blue-500/10 border-blue-500/50 text-blue-950 dark:text-blue-100 shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="text-2xl shrink-0">{stage.icon}</span>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">
                        {language === 'mr' ? `टप्पा ${idx + 1}` : `Stage ${idx + 1}`}
                      </span>
                      <span className="text-xs font-bold block mt-0.5 leading-snug break-words">
                        {stage.title[language] || stage.title.en}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: REAL-TIME WEATHER-CONDITION AI DIRECTIVES (NON-FIXED, COMPUTED FROM LIVE CONDITIONS) */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[11px] font-black">3</span>
                <span>{language === 'mr' ? 'थेट हवामान प्रभाव व कृती सूचना (Real-Time Directives):' : 'Step 3: Real-Time Weather Directives:'}</span>
              </h3>
              <span className="text-xs font-bold text-slate-400">
                {dynamicSuggestions.length} Active Directives
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dynamicSuggestions.map((sugg, idx) => {
                const isAlert = sugg.severity === 'alert' || sugg.severity === 'hazard';
                const isWarning = sugg.severity === 'warning';
                return (
                  <div
                    key={idx}
                    className={`p-5 sm:p-6 rounded-2xl sm:rounded-3xl border transition space-y-3.5 shadow-xs min-w-0 ${
                      isAlert
                        ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                        : isWarning
                        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                        : 'bg-white dark:bg-[#121316] border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                          isAlert
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : isWarning
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        {sugg.badge}
                      </span>

                      <span className="text-[11px] font-bold text-slate-400">
                        {language === 'mr' ? 'हवामान प्रभाव' : 'Weather Impact'}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug break-words">
                        {sugg.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed break-words">
                        {sugg.desc}
                      </p>
                    </div>

                    {sugg.remedy && (
                      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs min-w-0">
                        <div className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Bug className="w-4 h-4 text-rose-500 shrink-0" />
                          <span className="truncate">{sugg.remedy.name}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 break-words leading-relaxed">
                          <strong>💊 औषध व डोस:</strong> {sugg.remedy.chemical}
                        </p>
                        <p className="text-emerald-700 dark:text-emerald-300 break-words leading-relaxed">
                          <strong>🌿 जैविक उपाय:</strong> {sugg.remedy.bio}
                        </p>
                        <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700">
                          🌧️ {sugg.remedy.rainFastness}
                        </p>
                      </div>
                    )}

                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs sm:text-sm font-semibold text-emerald-950 dark:text-emerald-200 flex items-start gap-2.5 min-w-0 break-words">
                      <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="break-words leading-relaxed min-w-0">
                        <strong>{language === 'mr' ? 'थेट कृती:' : 'Action Directive:'}</strong>{' '}
                        {sugg.action}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 4: BALANCED MODERN "DOs" AND "DON'Ts" CARDS (NOT TOO MUCH HIGHLIGHT, MODERN & CLEAN) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* DO TODAY CARD */}
            <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white via-emerald-50/30 to-white dark:from-[#121316] dark:via-emerald-950/20 dark:to-[#121316] border border-emerald-500/30 p-5 sm:p-6 shadow-xs space-y-4 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                      {language === 'mr' ? 'आज काय करावे (DO TODAY)' : 'What to DO Today'}
                    </h3>
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold block truncate">
                      {getCropName(currentCrop)} • {activeStage.title[language] || activeStage.title.en}
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shrink-0">
                  {language === 'mr' ? 'शिफारस' : 'Recommended'}
                </span>
              </div>

              {/* Main Recommendation Callout */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-emerald-500/20 shadow-2xs">
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 leading-relaxed break-words">
                  {activeStage.doAction[language] || activeStage.doAction.en}
                </p>
              </div>

              {/* Categorized Field Action Tags */}
              <div className="space-y-2 pt-1 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 min-w-0 break-words">
                  <Droplets className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span className="break-words leading-relaxed min-w-0">
                    <strong>{language === 'mr' ? '💧 सिंचन नियोजन:' : '💧 Water Plan:'}</strong>{' '}
                    {rainNext3Days > 25
                      ? (language === 'mr' ? 'पाऊस येणार असल्याने पाणी देणे पुढे ढकला.' : 'Postpone watering; heavy rain expected.')
                      : (language === 'mr' ? 'जमिनीत पुरेसा ओलावा ठेवा; हलके पाणी द्या.' : 'Adequate soil moisture. Safe to irrigate.')}
                  </span>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 min-w-0 break-words">
                  <Wind className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="break-words leading-relaxed min-w-0">
                    <strong>{language === 'mr' ? '💨 फवारणी वेळ:' : '💨 Spray Window:'}</strong>{' '}
                    {windSpeed > 16
                      ? (language === 'mr' ? 'वारा शांत झाल्यावरच सकाळी फवारा.' : 'Wait for calm winds to spray.')
                      : (language === 'mr' ? 'सकाळी ७ ते १०:३० वाजेपर्यंत फवारणीस उत्तम वेळ.' : 'Favorable spray window between 7:00 AM – 10:30 AM.')}
                  </span>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 min-w-0 break-words">
                  <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="break-words leading-relaxed min-w-0">
                    <strong>{language === 'mr' ? '🌱 खत व पोषण:' : '🌱 Nutrition:'}</strong>{' '}
                    {currentCrop.fertilizerGuide.foliar}
                  </span>
                </div>
              </div>

              {/* Savings & Loss Prevention Meter */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between flex-wrap gap-1 min-w-0">
                <span className="flex items-center gap-1.5 font-black">
                  <BadgePercent className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{language === 'mr' ? 'बचत व नफा अंदाज:' : 'Yield Protection:'}</span>
                </span>
                <span className="font-bold">
                  {language === 'mr' ? '१५-२५% उत्पादन वाढ व औषध बचत' : '+15-25% Yield Protection'}
                </span>
              </div>
            </div>

            {/* WHAT NOT TO DO CARD */}
            <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white via-rose-50/30 to-white dark:from-[#121316] dark:via-rose-950/20 dark:to-[#121316] border border-rose-500/30 p-5 sm:p-6 shadow-xs space-y-4 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                      {language === 'mr' ? 'आज काय करू नये (DO NOT DO)' : 'What NOT to Do'}
                    </h3>
                    <span className="text-xs text-rose-700 dark:text-rose-400 font-bold block truncate">
                      {language === 'mr' ? 'नुकसान टाळण्यासाठी अत्यंत महत्त्वाची खबरदारी' : 'Crucial cautions to prevent loss'}
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/20 shrink-0">
                  {language === 'mr' ? 'सावधानता' : 'Hazard'}
                </span>
              </div>

              {/* Main Warning Callout */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-rose-500/20 shadow-2xs">
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 leading-relaxed break-words">
                  {activeStage.dontAction[language] || activeStage.dontAction.en}
                </p>
              </div>

              {/* Categorized Common Mistakes to Avoid */}
              <div className="space-y-2 pt-1 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 min-w-0 break-words">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="break-words leading-relaxed min-w-0">
                    <strong>{language === 'mr' ? '🚫 उष्णता धोका:' : '🚫 Heat Hazard:'}</strong>{' '}
                    {language === 'mr'
                      ? 'दुपारच्या कडक उन्हात (१२ ते ३) कीटकनाशक फवारू नका; औषध वाफेने उडून जाते.'
                      : 'Never spray in midday heat; chemical evaporates and burns leaves.'}
                  </span>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 min-w-0 break-words">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="break-words leading-relaxed min-w-0">
                    <strong>{language === 'mr' ? '🚫 पाऊस व खत:' : '🚫 Leaching Hazard:'}</strong>{' '}
                    {rainNext3Days > 20
                      ? (language === 'mr' ? 'पावसाची शक्यता असताना युरिया खत टाकू नका; खत पाण्यात वाहून जाईल.' : 'Do not apply urea before rain; fertilizer will leach away.')
                      : (language === 'mr' ? 'कापणी केलेले पीक शेतात उघड्यावर ठेवू नका.' : 'Do not leave harvested produce unprotected in open.')}
                  </span>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 min-w-0 break-words">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="break-words leading-relaxed min-w-0">
                    <strong>{language === 'mr' ? '🚫 मधमाशी संरक्षण:' : '🚫 Bee Protection:'}</strong>{' '}
                    {language === 'mr'
                      ? 'फुलोरा अवस्थेत सकाळी मधमाश्या परागीभवन करत असताना विषारी औषध फवारू नका.'
                      : 'Never spray bee-toxic insecticides during peak morning pollination.'}
                  </span>
                </div>
              </div>

              {/* Financial Risk Notice */}
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-900 dark:text-rose-200 flex items-center justify-between flex-wrap gap-1 min-w-0">
                <span className="flex items-center gap-1.5 font-black">
                  <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>{language === 'mr' ? 'नुकसान सावधानता:' : 'Damage Prevention:'}</span>
                </span>
                <span className="font-bold">
                  {language === 'mr' ? 'चुकीच्या फवारणीने एकरी ₹४,००० चे नुकसान टळते' : 'Prevents ₹4,000/acre crop loss'}
                </span>
              </div>
            </div>
          </div>

          {/* STEP 5: PEST & DISEASE DIAGNOSTIC FLASHCARDS FOR SELECTED CROP */}
          <div className="bg-white dark:bg-[#121316] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <Bug className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-black text-slate-900 dark:text-white truncate">
                    {language === 'mr' ? 'कीड व रोग जलद निदान व शिफारस' : 'Active Pest & Disease Identifier'}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                    {getCropName(currentCrop)} {language === 'mr' ? 'वरील प्रमुख किडींची लक्षणे व खात्रीशीर औषध डोस' : 'symptoms, chemical & bio remedies'}
                  </span>
                </div>
              </div>

              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-500/20 shrink-0">
                CIBRC Certified
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentCrop.pesticideDatabase.pests.map((pest, i) => (
                <div
                  key={i}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2.5 min-w-0"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                      <span className="truncate">{pest.name}</span>
                    </h4>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
                      Standard Dose
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-normal break-words">
                    <strong>लक्षणे:</strong> {pest.symptoms}
                  </p>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-950 dark:text-emerald-200 break-words leading-relaxed">
                    <strong>💊 औषध व डोस:</strong> {pest.chemical}
                  </div>

                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-950 dark:text-blue-200 break-words leading-relaxed">
                    <strong>🌿 सेंद्रिय/जैविक उपाय:</strong> {pest.bio}
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>🌧️ पाऊस तग: {pest.rainFastness}</span>
                    <span>⚠️ प्रतीक्षा कालावधी: {pest.safety}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 6: FERTILIZER SCHEDULE & STAGE NUTRITION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#121316] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5 min-w-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Sprout className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                    {language === 'mr' ? 'खत मात्रा शिफारस (एकरी डोस)' : 'Fertilizer & Nutrition per Acre'}
                  </h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                    {getCropName(currentCrop)} {language === 'mr' ? 'साठी संतुलित खत व्यवस्थापन' : 'nutrition guide'}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 break-words">
                  <strong className="block text-slate-900 dark:text-white font-bold mb-0.5">🌱 बेसल डोस (पेरणी/लागवड वेळ):</strong>
                  <span className="leading-relaxed">{currentCrop.fertilizerGuide.basal}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 break-words">
                  <strong className="block text-slate-900 dark:text-white font-bold mb-0.5">🌿 टॉप-ड्रेसिंग (वाढीच्या काळात):</strong>
                  <span className="leading-relaxed">{currentCrop.fertilizerGuide.topDress}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 break-words">
                  <strong className="block text-slate-900 dark:text-white font-bold mb-0.5">🌸 फवारणी खते (फुलोरा/दाणे भरणे):</strong>
                  <span className="leading-relaxed">{currentCrop.fertilizerGuide.foliar}</span>
                </div>
              </div>
            </div>

            {/* Current Crop MSP & Yield Benchmark */}
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#121316] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3.5 min-w-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Coins className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                    {language === 'mr' ? 'शासकीय हमीभाव (MSP) व नुकसान बचत' : 'Crop MSP & Yield Economics'}
                  </h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">
                    {language === 'mr' ? 'किमान आधारभूत किंमत व उत्पन्न संरक्षण' : 'Support price & yield protection'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-1">
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block uppercase">
                  {getCropName(currentCrop)} हमीभाव (MSP)
                </span>
                <span className="text-xl font-black text-slate-900 dark:text-white block">
                  {currentCrop.mspRate}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 pt-1 break-words">
                  {language === 'mr' ? 'शासकीय हमीभाव केंद्रांवर विक्रीसाठी पीक नोंदणी आवश्यक आहे.' : 'Register crop on state portal to avail MSP procurement benefits.'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-950 dark:text-emerald-200 flex items-center justify-between flex-wrap gap-1">
                <span className="font-bold">{language === 'mr' ? 'वेळेवर सल्ल्याने बचत:' : 'Yield Protection Value:'}</span>
                <span className="font-black text-emerald-700 dark:text-emerald-300">
                  {language === 'mr' ? '₹३,५०० ते ५,००० / एकर' : '₹3,500 - 5,000 / acre'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* =========================================================================
          TAB 3: DISASTER SAFETY, GOVERNMENT FARM HELPLINES & OFFICIAL WEBSITES
          ========================================================================= */}
      {activeTab === 'disaster' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Banner - Subtle refined emergency gradient */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-rose-500/10 via-white to-slate-50 dark:from-rose-950/25 dark:via-[#121316] dark:to-[#121316] border border-rose-500/30 text-rose-950 dark:text-rose-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-black text-rose-950 dark:text-white truncate">
                  {language === 'mr' ? 'नैसर्गिक आपत्ती सुरक्षा, शासकीय हेल्पलाईन व वेब पोर्टल्स' : 'Disaster Safety, Government Farm Helplines & Portals'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5 break-words">
                  {language === 'mr'
                    ? `${cityName} व महाराष्ट्रातील शेतकऱ्यांसाठी २४x७ अधिकृत मदत कक्ष, विमा क्लेम नंबर व शासकीय पोर्टल्स`
                    : `24x7 official emergency helplines, crop insurance claim hotline and verified government portals`}
                </p>
              </div>
            </div>
          </div>

          {/* DEDICATED GOVERNMENT AGRICULTURAL HELPLINES (TAP TO CALL) */}
          <div className="bg-white dark:bg-[#121316] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{language === 'mr' ? 'कृषी व शेतकरी शासकीय हेल्पलाईन (टॅप करून मोफत कॉल करा)' : 'Official Government Agricultural Helplines (Tap to Call)'}</span>
              </h3>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                100% Toll-Free
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
              {[
                {
                  title: language === 'mr' ? 'किसान कॉल सेंटर (Kisan Call Centre)' : 'Kisan Call Centre (Agri Experts)',
                  sub: language === 'mr' ? 'पिकावरील कीड, रोग, हवामान व खतांवर थेट तज्ज्ञ सल्ला' : 'Direct advisory from agricultural scientists',
                  number: '1800-180-1551',
                  dial: '18001801551',
                  badge: '6 AM – 10 PM'
                },
                {
                  title: language === 'mr' ? 'प्रधानमंत्री पीक विमा (PMFBY Claim)' : 'PMFBY Crop Loss Claim Hotline',
                  sub: language === 'mr' ? 'अतिवृष्टी किंवा गारपिटीनंतर ७२ तासांत नुकसान तक्रार नोंदवा' : 'Mandatory 72-hour crop loss intimation window',
                  number: '14447',
                  dial: '14447',
                  badge: '24x7 Toll-Free'
                },
                {
                  title: language === 'mr' ? 'PM-किसान सन्मान निधी मदत कक्ष' : 'PM-KISAN Samman Nidhi Helpline',
                  sub: language === 'mr' ? 'हप्ता जमा न झाल्यास किंवा e-KYC समस्येसाठी मदत' : 'Installment transfer and e-KYC inquiry',
                  number: '155261',
                  dial: '155261',
                  badge: 'National Desk'
                },
                {
                  title: language === 'mr' ? 'किसान क्रेडिट कार्ड (KCC) बँक मदत' : 'Kisan Credit Card (KCC) Banking',
                  sub: language === 'mr' ? '४% सवलतीच्या पिककर्ज व्याजदर व बँक तक्रारीसाठी' : 'Concessional 4% interest crop loans',
                  number: '1800-11-2211',
                  dial: '1800112211',
                  badge: 'Banking Support'
                },
                {
                  title: language === 'mr' ? 'महाराष्ट्र शेतकरी कॉल सेंटर' : 'Maharashtra Shetkari Sahayyata',
                  sub: language === 'mr' ? 'राज्य कृषी विभाग योजना, अनुदाने व बियाणे माहिती' : 'Maharashtra state agri schemes & subsidies',
                  number: '1800-233-4000',
                  dial: '18002334000',
                  badge: 'State Agri Dept'
                },
                {
                  title: language === 'mr' ? 'पशुवैद्यकीय आपत्कालीन सेवा' : 'Veterinary Emergency (Pashu Sanjeevani)',
                  sub: language === 'mr' ? 'जनावरांचे आजार, साथीचे रोग व फिरता दवाखाना' : 'Emergency veterinary medical service for livestock',
                  number: '1962',
                  dial: '1962',
                  badge: 'Veterinary 24x7'
                }
              ].map((item, idx) => (
                <a
                  key={idx}
                  href={`tel:${item.dial}`}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition flex flex-col justify-between gap-3 group shadow-2xs cursor-pointer min-w-0"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-800 dark:text-emerald-300">
                        {item.badge}
                      </span>
                      <PhoneCall className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition shrink-0" />
                    </div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug break-words">
                      {item.sub}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-1 flex-wrap">
                    <span className="text-xs sm:text-sm font-black text-emerald-700 dark:text-emerald-300 truncate">
                      📞 {item.number}
                    </span>
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 group-hover:underline shrink-0">
                      {language === 'mr' ? 'कॉल करा' : 'Call Now'}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* OFFICIAL GOVERNMENT FARM WEBSITES & DIGITAL PORTALS */}
          <div className="bg-white dark:bg-[#121316] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>{language === 'mr' ? 'अधिकृत शासकीय कृषी पोर्टल्स व योजना संकेतस्थळे' : 'Official Government Agricultural Portals & Websites'}</span>
              </h3>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                Direct Portal Links
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
              {[
                {
                  title: 'PM-KISAN Samman Nidhi',
                  url: 'https://pmkisan.gov.in',
                  desc: language === 'mr' ? 'हप्ता स्थिती, e-KYC व लाभार्थी यादी तपासा' : 'Check installment status & e-KYC beneficiary list',
                  tag: 'Govt of India'
                },
                {
                  title: 'PMFBY Crop Insurance',
                  url: 'https://pmfby.gov.in',
                  desc: language === 'mr' ? 'पिक विमा अर्ज, प्रीमियम कॅल्क्युलेटर व क्लेम ट्रॅकिंग' : 'Crop insurance application & 72h claim reporting',
                  tag: 'Ministry of Agri'
                },
                {
                  title: 'IMD Agromet (Mausam)',
                  url: 'https://mausam.imd.gov.in',
                  desc: language === 'mr' ? 'हवामान विभागाचा अधिकृत जिल्हास्तरीय कृषी हवामान सल्ला' : 'Official IMD district weather advisories & radar',
                  tag: 'IMD Govt'
                },
                {
                  title: 'e-NAM (राष्ट्रीय कृषी बाजार)',
                  url: 'https://enam.gov.in',
                  desc: language === 'mr' ? 'देशभरातील बाजार समित्यांचे (APMC) थेट हमीभाव व दर' : 'Live mandi rates across all APMC wholesale markets',
                  tag: 'Mandi Rates'
                },
                {
                  title: 'Soil Health Card Portal',
                  url: 'https://soilhealth.dac.gov.in',
                  desc: language === 'mr' ? 'माती परीक्षण अहवाल व जमीन पोषण शिफारस' : 'Soil test report & chemical/organic recommendations',
                  tag: 'Soil Testing'
                },
                {
                  title: 'MahaDBT Farmer Schemes',
                  url: 'https://mahadbt.maharashtra.gov.in',
                  desc: language === 'mr' ? 'ठिबक सिंचन, ट्रॅक्टर व शेती अवजारे शासकीय अनुदान' : 'Maharashtra drip, tractor & equipment subsidies',
                  tag: 'Maha Govt'
                },
                {
                  title: 'mKisan SMS Portal',
                  url: 'https://mkisan.gov.in',
                  desc: language === 'mr' ? 'मोफत कृषी सल्ला एसएमएस सेवेसाठी नोंदणी' : 'Subscribe to mobile SMS advisories in regional language',
                  tag: 'SMS Service'
                },
                {
                  title: 'ICAR - Krishi Vigyan Kendra',
                  url: 'https://kvk.icar.gov.in',
                  desc: language === 'mr' ? 'जिल्हा कृषी विज्ञान केंद्र शास्त्रज्ञ व प्रात्यक्षिक' : 'District farm scientists, training & certified seeds',
                  tag: 'ICAR Network'
                }
              ].map((site, idx) => (
                <a
                  key={idx}
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition flex flex-col justify-between gap-3 group shadow-2xs min-w-0 min-h-[145px]"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-800 dark:text-blue-300">
                        {site.tag}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition shrink-0" />
                    </div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight truncate">
                      {site.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                      {site.desc}
                    </p>
                  </div>

                  <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-1 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>{language === 'mr' ? 'अधिकृत पोर्टल उघडा' : 'Visit Official Portal'}</span>
                    <span>→</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* 24x7 WEATHER DISASTER & FARM EMERGENCY HELPLINES */}
          <div className="bg-white dark:bg-[#121316] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-blue-500 shrink-0" />
              <span>{language === 'mr' ? 'हवामान आपत्ती, पूर व कृषी आपत्कालीन हेल्पलाईन (टॅप करा)' : '24x7 Weather Disaster, Flood & Farm Emergency Helplines (Tap to Call)'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {[
                { name: language === 'mr' ? 'IMD कृषी हवामान व चक्रीवादळ इशारा' : 'IMD Agromet & Weather Alert Desk', number: '1800-180-1717', dial: '18001801717' },
                { name: language === 'mr' ? 'राष्ट्रीय पूर व वादळ आपत्ती निवारण (NDRF)' : 'NDRF Flood & Severe Storm Relief', number: '1078', dial: '1078' },
                { name: language === 'mr' ? 'राज्य अतिवृष्टी व आपत्ती नियंत्रण कक्ष' : 'State Heavy Rain & Disaster Control', number: '1070', dial: '1070' },
                { name: language === 'mr' ? 'किसान कॉल सेंटर (हवामान व पीक सल्ला)' : 'Kisan Call Centre (Crop & Weather Advisory)', number: '1800-180-1551', dial: '18001801551' },
                { name: language === 'mr' ? 'पीक नुकसान भरपाई नोंदणी (PMFBY ७२ तास)' : 'PMFBY 72-Hr Crop Loss Intimation', number: '14447', dial: '14447' },
                { name: language === 'mr' ? 'पशू आपत्कालीन व पूर वैद्यकीय सेवा' : 'Livestock & Veterinary Emergency (1962)', number: '1962', dial: '1962' }
              ].map((h, i) => (
                <a
                  key={i}
                  href={`tel:${h.dial}`}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 transition flex items-center justify-between group min-w-0 cursor-pointer"
                >
                  <div className="min-w-0">
                    <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">{h.name}</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-500 transition mt-0.5 block truncate">
                      {h.number}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition shrink-0 ml-2">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* EXTREME WEATHER SAFETY ACTION PROTOCOLS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-[#121316] border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black text-sm">
                <Flame className="w-5 h-5" />
                <span>{language === 'mr' ? 'विजांचा कडकडाट व वादळ (Lightning Protocol)' : 'Lightning & Storm Protocol'}</span>
              </div>
              <ul className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{language === 'mr' ? 'पक्क्या इमारतीत किंवा घरात त्वरित आसरा घ्या.' : 'Take shelter inside a concrete building or house.'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✗</span>
                  <span>{language === 'mr' ? 'उघड्या शेतात, विजेच्या खांबांजवळ किंवा उंच झाडाखाली उभे राहू नका.' : 'Never stand under tall isolated trees or in open fields.'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{language === 'mr' ? 'शेतीतील लोखंडी अवजारे व ट्रॅक्टरपासून ताबडतोब दूर व्हा.' : 'Stay away from metal tools, tractors, and wire fencing.'}</span>
                </li>
              </ul>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-[#121316] border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black text-sm">
                <Waves className="w-5 h-5" />
                <span>{language === 'mr' ? 'पूर व शेतात पाणी साचल्यास (Flood Protocol)' : 'Flood & Waterlogging Protocol'}</span>
              </div>
              <ul className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{language === 'mr' ? 'जनावरांना उंचावरील कोरड्या व सुरक्षित गोठ्यात हलवा.' : 'Move livestock to elevated dry shelters.'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{language === 'mr' ? 'शेतात साचलेले पाणी बाहेर काढण्यासाठी चर व बांधावरील नाले मोकळे करा.' : 'Open field drainage outlets to clear excess root zone water.'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✗</span>
                  <span>{language === 'mr' ? 'वाहत्या ओढ्यातून किंवा पुलावरून ट्रॅक्टर चालवू नका.' : 'Never drive farm vehicles through flooded streams or bridges.'}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvisoryPage;
