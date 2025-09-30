// Phone number validation and formatting utilities

// List of country codes for the dropdown
export const COUNTRY_CODES = [
  { code: '+972', country: 'Israel', flag: '🇮🇱' },
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+39', country: 'Italy', flag: '🇮🇹' },
  { code: '+34', country: 'Spain', flag: '🇪🇸' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
  { code: '+43', country: 'Austria', flag: '🇦🇹' }
];

// Validate phone number format
export const validatePhoneNumber = (phone) => {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Check if it starts with +
  if (!cleaned.startsWith('+')) {
    return { isValid: false, error: 'Phone number must include country code (e.g., +972)' };
  }
  
  // Check minimum length (country code + number)
  if (cleaned.length < 8) {
    return { isValid: false, error: 'Phone number is too short' };
  }
  
  // Check maximum length
  if (cleaned.length > 16) {
    return { isValid: false, error: 'Phone number is too long' };
  }
  
  return { isValid: true, formatted: cleaned };
};

// Format phone number for display
export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  if (cleaned.startsWith('+972')) {
    // Israeli number formatting: +972 50-123-4567
    const number = cleaned.substring(4);
    if (number.length >= 9) {
      return `+972 ${number.substring(0, 2)}-${number.substring(2, 5)}-${number.substring(5)}`;
    }
  }
  
  // Default formatting: just return the cleaned number
  return cleaned;
};

// Extract country code from phone number
export const extractCountryCode = (phone) => {
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  for (const country of COUNTRY_CODES) {
    if (cleaned.startsWith(country.code)) {
      return country.code;
    }
  }
  
  return '+972'; // Default to Israel
};

// Get country info from phone number
export const getCountryFromPhone = (phone) => {
  const countryCode = extractCountryCode(phone);
  return COUNTRY_CODES.find(country => country.code === countryCode) || COUNTRY_CODES[0];
};

