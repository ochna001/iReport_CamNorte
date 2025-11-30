/**
 * Validation Tests for iReport Mobile App
 * Tests for input validation functions
 */

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates Philippine phone number format
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/[\s\-]/g, '');
  const phMobileRegex = /^(\+63|0)9\d{9}$/;
  return phMobileRegex.test(cleaned);
};

/**
 * Validates name (letters, spaces, hyphens, apostrophes)
 */
export const isValidName = (name: string): boolean => {
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 100) return false;
  const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
  return nameRegex.test(trimmed);
};

/**
 * Validates password (minimum 6 characters for mobile)
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

/**
 * Validates incident description
 */
export const isValidDescription = (description: string): boolean => {
  const trimmed = description.trim();
  return trimmed.length >= 10 && trimmed.length <= 1000;
};

/**
 * Validates coordinates
 */
export const isValidCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Validates Philippine coordinates (rough bounds)
 */
export const isInPhilippines = (lat: number, lng: number): boolean => {
  // Rough bounding box for Philippines
  return lat >= 4.5 && lat <= 21.5 && lng >= 116 && lng <= 127;
};

/**
 * Calculates age from date of birth
 */
export const calculateAge = (dob: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

/**
 * Validates age (must be at least 13)
 */
export const isValidAge = (dob: Date): boolean => {
  const age = calculateAge(dob);
  return age >= 13 && age <= 120;
};

/**
 * Formats phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const limited = cleaned.substring(0, 11);
  
  if (limited.length <= 4) {
    return limited;
  } else if (limited.length <= 7) {
    return `${limited.slice(0, 4)}-${limited.slice(4)}`;
  } else {
    return `${limited.slice(0, 4)}-${limited.slice(4, 7)}-${limited.slice(7)}`;
  }
};

// ============================================
// TEST SUITES
// ============================================

describe('Email Validation', () => {
  it('should accept valid email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.org')).toBe(true);
    expect(isValidEmail('resident@gmail.com')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('no@domain')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
  });
});

describe('Phone Number Validation', () => {
  it('should accept valid Philippine mobile numbers', () => {
    expect(isValidPhoneNumber('09171234567')).toBe(true);
    expect(isValidPhoneNumber('0917-123-4567')).toBe(true);
    expect(isValidPhoneNumber('+639171234567')).toBe(true);
  });

  it('should reject invalid phone numbers', () => {
    expect(isValidPhoneNumber('')).toBe(false);
    expect(isValidPhoneNumber('1234567890')).toBe(false);
    expect(isValidPhoneNumber('08171234567')).toBe(false);
  });
});

describe('Name Validation', () => {
  it('should accept valid names', () => {
    expect(isValidName('Juan Dela Cruz')).toBe(true);
    expect(isValidName('María José')).toBe(true);
    expect(isValidName("O'Brien")).toBe(true);
  });

  it('should reject invalid names', () => {
    expect(isValidName('')).toBe(false);
    expect(isValidName('A')).toBe(false);
    expect(isValidName('Name123')).toBe(false);
  });
});

describe('Password Validation', () => {
  it('should accept valid passwords', () => {
    expect(isValidPassword('password')).toBe(true);
    expect(isValidPassword('123456')).toBe(true);
    expect(isValidPassword('SecurePass123!')).toBe(true);
  });

  it('should reject short passwords', () => {
    expect(isValidPassword('')).toBe(false);
    expect(isValidPassword('12345')).toBe(false);
    expect(isValidPassword('short')).toBe(false);
  });
});

describe('Incident Description Validation', () => {
  it('should accept valid descriptions', () => {
    expect(isValidDescription('Fire reported at the building on Main Street')).toBe(true);
    expect(isValidDescription('Emergency! Need immediate assistance')).toBe(true);
  });

  it('should reject too short descriptions', () => {
    expect(isValidDescription('')).toBe(false);
    expect(isValidDescription('Fire')).toBe(false);
    expect(isValidDescription('Help!')).toBe(false);
  });

  it('should reject too long descriptions', () => {
    const longDesc = 'A'.repeat(1001);
    expect(isValidDescription(longDesc)).toBe(false);
  });
});

describe('Coordinate Validation', () => {
  it('should accept valid coordinates', () => {
    expect(isValidCoordinates(14.1091, 122.9553)).toBe(true); // Daet
    expect(isValidCoordinates(14.5995, 120.9842)).toBe(true); // Manila
    expect(isValidCoordinates(0, 0)).toBe(true);
  });

  it('should reject invalid coordinates', () => {
    expect(isValidCoordinates(91, 0)).toBe(false);
    expect(isValidCoordinates(-91, 0)).toBe(false);
    expect(isValidCoordinates(0, 181)).toBe(false);
    expect(isValidCoordinates(0, -181)).toBe(false);
  });
});

describe('Philippine Location Validation', () => {
  it('should accept coordinates within Philippines', () => {
    expect(isInPhilippines(14.1091, 122.9553)).toBe(true); // Daet
    expect(isInPhilippines(14.5995, 120.9842)).toBe(true); // Manila
    expect(isInPhilippines(7.0731, 125.6128)).toBe(true); // Davao
  });

  it('should reject coordinates outside Philippines', () => {
    expect(isInPhilippines(35.6762, 139.6503)).toBe(false); // Tokyo
    expect(isInPhilippines(40.7128, -74.0060)).toBe(false); // New York
    expect(isInPhilippines(1.3521, 103.8198)).toBe(false); // Singapore
  });
});

describe('Age Validation', () => {
  it('should accept valid ages (13+)', () => {
    const dob18 = new Date();
    dob18.setFullYear(dob18.getFullYear() - 18);
    expect(isValidAge(dob18)).toBe(true);

    const dob30 = new Date();
    dob30.setFullYear(dob30.getFullYear() - 30);
    expect(isValidAge(dob30)).toBe(true);
  });

  it('should reject ages under 13', () => {
    const dob10 = new Date();
    dob10.setFullYear(dob10.getFullYear() - 10);
    expect(isValidAge(dob10)).toBe(false);

    const dob12 = new Date();
    dob12.setFullYear(dob12.getFullYear() - 12);
    expect(isValidAge(dob12)).toBe(false);
  });

  it('should reject unrealistic ages', () => {
    const dob150 = new Date();
    dob150.setFullYear(dob150.getFullYear() - 150);
    expect(isValidAge(dob150)).toBe(false);
  });
});

describe('Phone Number Formatting', () => {
  it('should format phone numbers correctly', () => {
    expect(formatPhoneNumber('09171234567')).toBe('0917-123-4567');
    expect(formatPhoneNumber('0917')).toBe('0917');
    expect(formatPhoneNumber('0917123')).toBe('0917-123');
  });

  it('should strip non-numeric characters', () => {
    expect(formatPhoneNumber('0917-123-4567')).toBe('0917-123-4567');
    expect(formatPhoneNumber('0917 123 4567')).toBe('0917-123-4567');
  });

  it('should limit to 11 digits', () => {
    expect(formatPhoneNumber('091712345678901')).toBe('0917-123-4567');
  });
});
