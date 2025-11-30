/**
 * Security Tests for iReport Mobile App
 * Tests for authentication, input validation, and security vulnerabilities
 */

// ============================================
// SECURITY UTILITIES
// ============================================

/**
 * Checks if input contains potential injection patterns
 */
export const containsInjection = (input: string): boolean => {
  const patterns = [
    /<script\b[^>]*>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /(--|#|\/\*|\*\/)/,
    /(\bOR\b\s+\d+\s*=\s*\d+)/i,
  ];
  return patterns.some(pattern => pattern.test(input));
};

/**
 * Sanitizes user input
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

/**
 * Validates file type for uploads
 */
export const isValidMediaType = (mimeType: string): boolean => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/quicktime',
  ];
  return allowedTypes.includes(mimeType.toLowerCase());
};

/**
 * Validates file size (max 10MB for images, 50MB for videos)
 */
export const isValidFileSize = (size: number, type: 'image' | 'video'): boolean => {
  const maxImageSize = 10 * 1024 * 1024; // 10MB
  const maxVideoSize = 50 * 1024 * 1024; // 50MB
  return type === 'image' ? size <= maxImageSize : size <= maxVideoSize;
};

/**
 * Validates session token format
 */
export const isValidToken = (token: string): boolean => {
  // JWT format: header.payload.signature
  const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
  return jwtRegex.test(token);
};

/**
 * Checks if location data is reasonable (not spoofed)
 */
export const isReasonableLocation = (
  lat: number, 
  lng: number, 
  accuracy: number
): boolean => {
  // Reject if accuracy is too poor (> 1km)
  if (accuracy > 1000) return false;
  
  // Basic coordinate validation
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
  
  return true;
};

/**
 * Rate limiting check for incident reports
 */
export const canSubmitReport = (
  lastSubmitTime: number | null,
  cooldownMs: number = 60000 // 1 minute default
): boolean => {
  if (!lastSubmitTime) return true;
  return Date.now() - lastSubmitTime >= cooldownMs;
};

// ============================================
// TEST SUITES
// ============================================

describe('Input Injection Prevention', () => {
  it('should detect script injection attempts', () => {
    expect(containsInjection("<script>alert('XSS')</script>")).toBe(true);
    expect(containsInjection("javascript:void(0)")).toBe(true);
    expect(containsInjection("<img onerror='alert(1)'>")).toBe(true);
  });

  it('should detect SQL injection attempts', () => {
    expect(containsInjection("1 OR 1=1")).toBe(true);
    expect(containsInjection("admin--")).toBe(true);
    expect(containsInjection("/* comment */")).toBe(true);
  });

  it('should allow safe inputs', () => {
    expect(containsInjection("Fire at 123 Main Street")).toBe(false);
    expect(containsInjection("Emergency! Need help")).toBe(false);
    expect(containsInjection("Contact: 09171234567")).toBe(false);
  });
});

describe('Input Sanitization', () => {
  it('should escape HTML characters', () => {
    expect(sanitizeInput('<script>')).toBe('&lt;script&gt;');
    expect(sanitizeInput('"quoted"')).toBe('&quot;quoted&quot;');
    expect(sanitizeInput("it's")).toBe("it&#x27;s");
  });

  it('should preserve safe text', () => {
    expect(sanitizeInput('Normal text')).toBe('Normal text');
    expect(sanitizeInput('Fire at building')).toBe('Fire at building');
  });
});

describe('Media Upload Validation', () => {
  it('should accept valid image types', () => {
    expect(isValidMediaType('image/jpeg')).toBe(true);
    expect(isValidMediaType('image/png')).toBe(true);
    expect(isValidMediaType('image/gif')).toBe(true);
  });

  it('should accept valid video types', () => {
    expect(isValidMediaType('video/mp4')).toBe(true);
    expect(isValidMediaType('video/quicktime')).toBe(true);
  });

  it('should reject invalid file types', () => {
    expect(isValidMediaType('application/pdf')).toBe(false);
    expect(isValidMediaType('text/html')).toBe(false);
    expect(isValidMediaType('application/javascript')).toBe(false);
    expect(isValidMediaType('application/x-executable')).toBe(false);
  });

  it('should validate file sizes', () => {
    expect(isValidFileSize(5 * 1024 * 1024, 'image')).toBe(true); // 5MB
    expect(isValidFileSize(15 * 1024 * 1024, 'image')).toBe(false); // 15MB
    expect(isValidFileSize(30 * 1024 * 1024, 'video')).toBe(true); // 30MB
    expect(isValidFileSize(60 * 1024 * 1024, 'video')).toBe(false); // 60MB
  });
});

describe('Token Validation', () => {
  it('should accept valid JWT format', () => {
    const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
    expect(isValidToken(validJWT)).toBe(true);
  });

  it('should reject invalid token formats', () => {
    expect(isValidToken('')).toBe(false);
    expect(isValidToken('invalid')).toBe(false);
    expect(isValidToken('not.a.valid.token.format')).toBe(false);
    expect(isValidToken('only.two')).toBe(false);
  });
});

describe('Location Validation', () => {
  it('should accept reasonable location data', () => {
    expect(isReasonableLocation(14.1091, 122.9553, 10)).toBe(true); // Daet, 10m accuracy
    expect(isReasonableLocation(14.5995, 120.9842, 50)).toBe(true); // Manila, 50m accuracy
  });

  it('should reject poor accuracy', () => {
    expect(isReasonableLocation(14.1091, 122.9553, 2000)).toBe(false); // 2km accuracy
    expect(isReasonableLocation(14.1091, 122.9553, 5000)).toBe(false); // 5km accuracy
  });

  it('should reject invalid coordinates', () => {
    expect(isReasonableLocation(91, 0, 10)).toBe(false);
    expect(isReasonableLocation(0, 181, 10)).toBe(false);
    expect(isReasonableLocation(-91, 0, 10)).toBe(false);
  });
});

describe('Rate Limiting', () => {
  it('should allow first submission', () => {
    expect(canSubmitReport(null)).toBe(true);
  });

  it('should block rapid submissions', () => {
    const now = Date.now();
    expect(canSubmitReport(now - 30000)).toBe(false); // 30 seconds ago
    expect(canSubmitReport(now - 10000)).toBe(false); // 10 seconds ago
  });

  it('should allow after cooldown', () => {
    const now = Date.now();
    expect(canSubmitReport(now - 120000)).toBe(true); // 2 minutes ago
    expect(canSubmitReport(now - 60000)).toBe(true); // 1 minute ago (exactly)
  });

  it('should respect custom cooldown', () => {
    const now = Date.now();
    expect(canSubmitReport(now - 25000, 30000)).toBe(false); // 25s ago, 30s cooldown
    expect(canSubmitReport(now - 35000, 30000)).toBe(true); // 35s ago, 30s cooldown
  });
});

describe('Edge Cases', () => {
  it('should handle empty strings', () => {
    expect(containsInjection('')).toBe(false);
    expect(sanitizeInput('')).toBe('');
    expect(isValidMediaType('')).toBe(false);
  });

  it('should handle unicode characters', () => {
    expect(containsInjection('日本語テスト')).toBe(false);
    expect(sanitizeInput('Ñoño García')).toBe('Ñoño García');
    expect(containsInjection('🔥 Emergency')).toBe(false);
  });

  it('should handle very long inputs', () => {
    const longString = 'A'.repeat(10000);
    expect(containsInjection(longString)).toBe(false);
    expect(sanitizeInput(longString)).toBe(longString);
  });
});
