/**
 * Autocomplete Cache Utility
 * Caches autocomplete predictions to reduce API calls
 */

class AutocompleteCache {
  constructor(maxSize = 100, ttl = 5 * 60 * 1000) { // 5 minutes TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  // Generate cache key from input
  getKey(input, options = {}) {
    const optionsStr = JSON.stringify(options);
    return `${input.toLowerCase().trim()}_${optionsStr}`;
  }

  // Get cached predictions
  get(input, options = {}) {
    const key = this.getKey(input, options);
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.predictions;
  }

  // Set cache
  set(input, predictions, options = {}) {
    const key = this.getKey(input, options);

    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      predictions,
      timestamp: Date.now()
    });
  }

  // Clear cache
  clear() {
    this.cache.clear();
  }

  // Get cache size
  size() {
    return this.cache.size;
  }
}

// Export singleton instance
export const autocompleteCache = new AutocompleteCache();

// Export class for testing
export { AutocompleteCache };

