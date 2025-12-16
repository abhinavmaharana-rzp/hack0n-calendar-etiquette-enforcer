/**
 * Utility helper functions
 */

/**
 * Format date to readable string
 */
function formatDate(date, format = 'full') {
  const d = new Date(date);
  
  const options = {
    full: {
      dateStyle: 'full',
      timeStyle: 'short'
    },
    short: {
      dateStyle: 'short',
      timeStyle: 'short'
    },
    date: {
      dateStyle: 'medium'
    },
    time: {
      timeStyle: 'short'
    }
  };

  return d.toLocaleString('en-IN', options[format] || options.full);
}

/**
 * Calculate percentage
 */
function calculatePercentage(part, total, decimals = 0) {
  if (total === 0) return 0;
  return Number(((part / total) * 100).toFixed(decimals));
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Sanitize string for database
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
}

/**
 * Parse agenda sections from raw text
 */
function parseAgenda(rawAgenda) {
  const sections = {
    purpose: extractSection(rawAgenda, '📍 Purpose:', '🎯'),
    outcomes: extractSection(rawAgenda, '🎯 Expected Outcomes:', '⚡'),
    decisions: extractSection(rawAgenda, '⚡ Decisions Needed:', '📌'),
    prereads: extractSection(rawAgenda, '📌 Pre-reads')
  };

  return sections;
}

/**
 * Extract section from text between markers
 */
function extractSection(text, startMarker, endMarker = null) {
  const startIdx = text.indexOf(startMarker);
  if (startIdx === -1) return '';

  const contentStart = startIdx + startMarker.length;
  let endIdx = text.length;

  if (endMarker) {
    const foundEndIdx = text.indexOf(endMarker, contentStart);
    if (foundEndIdx !== -1) {
      endIdx = foundEndIdx;
    }
  }

  return text.substring(contentStart, endIdx).trim();
}

/**
 * Calculate time difference in human-readable format
 */
function getTimeDifference(date1, date2 = new Date()) {
  const diff = Math.abs(date2 - date1);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  return `${seconds} second${seconds > 1 ? 's' : ''}`;
}

/**
 * Generate random string
 */
function generateRandomString(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.math.random() * chars.length));
  }
  return result;
}

/**
 * Chunk array into smaller arrays
 */
function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Sleep/delay function
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = baseDelay * Math.pow(2, i);
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
      await sleep(delay);
    }
  }
}

/**
 * Format number with commas
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Truncate string with ellipsis
 */
function truncateString(str, maxLength = 100) {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Get initials from name
 */
function getInitials(name) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Check if date is today
 */
function isToday(date) {
  const today = new Date();
  const d = new Date(date);
  return d.getDate() === today.getDate() &&
         d.getMonth() === today.getMonth() &&
         d.getFullYear() === today.getFullYear();
}

/**
 * Check if date is within range
 */
function isDateInRange(date, startDate, endDate) {
  const d = new Date(date);
  return d >= new Date(startDate) && d <= new Date(endDate);
}

/**
 * Convert minutes to hours and minutes
 */
function minutesToHoursMinutes(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Remove duplicates from array
 */
function removeDuplicates(array, key = null) {
  if (!key) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/**
 * Deep clone object
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Merge objects deeply
 */
function deepMerge(target, source) {
  const output = Object.assign({}, target);
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

/**
 * Check if value is object
 */
function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Calculate agenda quality score
 */
function calculateAgendaScore(agendaParsed) {
  let score = 0;

  // Purpose (30 points)
  if (agendaParsed.purpose && agendaParsed.purpose.length > 20) score += 30;
  else if (agendaParsed.purpose && agendaParsed.purpose.length > 10) score += 15;

  // Outcomes (30 points)
  if (agendaParsed.outcomes && agendaParsed.outcomes.length > 20) score += 30;
  else if (agendaParsed.outcomes && agendaParsed.outcomes.length > 10) score += 15;

  // Decisions (25 points)
  if (agendaParsed.decisions && agendaParsed.decisions.length > 20) score += 25;
  else if (agendaParsed.decisions && agendaParsed.decisions.length > 10) score += 12;

  // Pre-reads (15 points)
  if (agendaParsed.prereads && agendaParsed.prereads.length > 10) score += 15;

  return score;
}

/**
 * Get date range for period
 */
function getDateRange(period) {
  const now = new Date();
  const ranges = {
    today: {
      start: new Date(now.setHours(0, 0, 0, 0)),
      end: new Date(now.setHours(23, 59, 59, 999))
    },
    yesterday: {
      start: new Date(now.setDate(now.getDate() - 1)),
      end: new Date(now.setHours(23, 59, 59, 999))
    },
    thisWeek: {
      start: new Date(now.setDate(now.getDate() - now.getDay())),
      end: new Date(now.setDate(now.getDate() - now.getDay() + 6))
    },
    lastWeek: {
      start: new Date(now.setDate(now.getDate() - now.getDay() - 7)),
      end: new Date(now.setDate(now.getDate() - now.getDay() - 1))
    },
    thisMonth: {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
    },
    lastMonth: {
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      end: new Date(now.getFullYear(), now.getMonth(), 0)
    }
  };

  return ranges[period] || ranges.today;
}

module.exports = {
  formatDate,
  calculatePercentage,
  isValidEmail,
  sanitizeString,
  parseAgenda,
  extractSection,
  getTimeDifference,
  generateRandomString,
  chunkArray,
  sleep,
  retryWithBackoff,
  formatNumber,
  truncateString,
  getInitials,
  isToday,
  isDateInRange,
  minutesToHoursMinutes,
  removeDuplicates,
  deepClone,
  deepMerge,
  isObject,
  calculateAgendaScore,
  getDateRange
};