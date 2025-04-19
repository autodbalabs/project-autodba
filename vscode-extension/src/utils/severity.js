/**
 * Get the CSS class name for a severity level
 * @param {number} level - Severity level (1-5)
 * @returns {string} CSS class name
 */
function getSeverityClass(level) {
  switch (level) {
    case 1: return 'informational';
    case 2: return 'low';
    case 3: return 'moderate';
    case 4: return 'high';
    case 5: return 'critical';
    default: return 'moderate';
  }
}

/**
 * Get the display text for a severity level
 * @param {number} level - Severity level (1-5)
 * @returns {string} Display text
 */
function getSeverityText(level) {
  switch (level) {
    case 1: return 'Informational';
    case 2: return 'Low';
    case 3: return 'Moderate';
    case 4: return 'High';
    case 5: return 'Critical';
    default: return 'Moderate';
  }
}

/**
 * Convert an impact string to a severity level number
 * @param {string} impact - Impact level ('informational' | 'low' | 'moderate' | 'high' | 'critical')
 * @returns {number} Severity level (1-5)
 */
function getSeverityLevel(impact) {
  switch (impact) {
    case 'critical': return 5;
    case 'high': return 4;
    case 'moderate': return 3;
    case 'low': return 2;
    case 'informational': return 1;
    default: return 3;
  }
}

module.exports = {
  getSeverityClass,
  getSeverityText,
  getSeverityLevel
}; 