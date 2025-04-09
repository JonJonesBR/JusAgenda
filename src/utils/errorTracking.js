import * as Sentry from "@sentry/react-native";
import { Platform } from "react-native";
import Constants from "expo-constants";

/**
 * Initialize Sentry for error tracking and monitoring
 *
 * @param {Object} options - Configuration options
 * @param {string} options.dsn - Sentry DSN (required for production)
 * @param {boolean} options.enableInDev - Whether to enable Sentry in development mode
 */
export const initErrorTracking = (options = {}) => {
  const { dsn, enableInDev = false } = options;

  // Only initialize if we have a DSN and we're either in production or enableInDev is true
  const isDev = __DEV__;
  if (!dsn || (isDev && !enableInDev)) {
    return;
  }

  Sentry.init({
    dsn,
    debug: isDev,
    environment: isDev ? "development" : "production",
    release: `${Constants.manifest?.version || "1.0.0"}`,
    dist: Platform.OS === "ios" ? "ios" : "android",
    // Performance monitoring
    tracesSampleRate: isDev ? 1.0 : 0.2,
    // Session tracking for crash-free sessions
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000,
    // Automatically set user IP address
    sendDefaultPii: false,
  });

};

/**
 * Capture an exception with Sentry
 *
 * @param {Error} error - The error to capture
 * @param {Object} context - Additional context information
 */
export const captureException = (error, context = {}) => {
  if (!error) return;

  Sentry.captureException(error, {
    extra: context,
  });
};

/**
 * Set user information for Sentry
 *
 * @param {Object} user - User information
 * @param {string} user.id - User ID
 * @param {string} user.email - User email
 */
export const setUser = (user) => {
  if (!user) {
    Sentry.setUser(null);
    return;
  }

  Sentry.setUser({
    id: user.id,
    email: user.email,
  });
};

/**
 * Add breadcrumb for tracking user actions
 *
 * @param {Object} breadcrumb - Breadcrumb information
 */
export const addBreadcrumb = (breadcrumb) => {
  Sentry.addBreadcrumb(breadcrumb);
};

/**
 * Start performance monitoring for a transaction
 *
 * @param {string} name - Transaction name
 * @param {string} operation - Operation type
 * @returns {Object} Transaction object
 */
export const startTransaction = (name, operation) => {
  return Sentry.startTransaction({
    name,
    op: operation,
  });
};

/**
 * Create a child span for more detailed performance tracking
 *
 * @param {Object} transaction - Parent transaction
 * @param {string} name - Span name
 * @param {string} operation - Operation type
 * @returns {Object} Span object
 */
export const createSpan = (transaction, name, operation) => {
  if (!transaction) return null;

  return transaction.startChild({
    op: operation,
    description: name,
  });
};
