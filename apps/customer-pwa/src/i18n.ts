import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translations
const resources = {
  en: {
    translation: {
      "Welcome to ScanGo": "Welcome to ScanGo",
      "Enter Phone Number": "Enter Phone Number",
      "Scan, Pay, & Go": "Scan, Pay, & Go",
      "Start Shopping": "Start Shopping",
    }
  },
  te: {
    translation: {
      "Welcome to ScanGo": "స్కాన్ గోకు స్వాగతం",
      "Enter Phone Number": "ఫోన్ నంబర్ నమోదు చేయండి",
      "Scan, Pay, & Go": "స్కాన్ చేయండి, చెల్లించండి & వెళ్లండి",
      "Start Shopping": "షాపింగ్ ప్రారంభించండి",
    }
  },
  hi: {
    translation: {
      "Welcome to ScanGo": "स्कैन गो में आपका स्वागत है",
      "Enter Phone Number": "फ़ोन नंबर दर्ज करें",
      "Scan, Pay, & Go": "स्कैन करें, भुगतान करें, और जाएं",
      "Start Shopping": "खरीदारी शुरू करें",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
