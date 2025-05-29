/**
 * Logger utility that automatically removes logs in production builds
 * while maintaining them in development for debugging purposes.
 */
class Logger {
  private static isDevelopment = __DEV__;

  /**
   * Log general information (equivalent to console.log)
   */
  static log(...args: any[]): void {
    if (this.isDevelopment) {
      console.log(...args);
    }
  }

  /**
   * Log warning messages (equivalent to console.warn)
   */
  static warn(...args: any[]): void {
    if (this.isDevelopment) {
      console.warn(...args);
    }
  }

  /**
   * Log error messages (equivalent to console.error)
   * Note: In production, you might want to send errors to a crash reporting service
   */
  static error(...args: any[]): void {
    if (this.isDevelopment) {
      console.error(...args);
    }
    // In production, you could send to crash reporting service like Sentry
    // Example: Sentry.captureException(new Error(args.join(' ')));
  }

  /**
   * Log debug information (equivalent to console.debug)
   */
  static debug(...args: any[]): void {
    if (this.isDevelopment) {
      console.debug(...args);
    }
  }

  /**
   * Log informational messages (equivalent to console.info)
   */
  static info(...args: any[]): void {
    if (this.isDevelopment) {
      console.info(...args);
    }
  }

  /**
   * Log with custom prefix for better organization
   */
  static logWithPrefix(prefix: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(`[${prefix}]`, ...args);
    }
  }

  /**
   * Log API calls for debugging
   */
  static api(endpoint: string, method: string, data?: any): void {
    if (this.isDevelopment) {
      console.log(`🌐 API ${method.toUpperCase()} ${endpoint}`, data ? data : '');
    }
  }

  /**
   * Log user interactions for debugging
   */
  static userAction(action: string, details?: any): void {
    if (this.isDevelopment) {
      console.log(`👤 User Action: ${action}`, details ? details : '');
    }
  }

  /**
   * Log navigation events
   */
  static navigation(screenName: string, params?: any): void {
    if (this.isDevelopment) {
      console.log(`📱 Navigation: ${screenName}`, params ? params : '');
    }
  }
}

export default Logger;
