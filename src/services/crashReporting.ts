import * as Sentry from '@sentry/react-native';

const SENTRY_DSN = 'https://your-sentry-dsn@sentry.io/project-id';

export const initCrashReporting = () => {
  if (__DEV__) return;

  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.2,
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000,
    attachStacktrace: true,
    enableNativeFramesTracking: true,
    beforeSend(event) {
      // Strip PII
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      return event;
    },
  });
};

export const captureException = (error: Error, context?: Record<string, any>) => {
  if (__DEV__) {
    console.error('[CrashReporting]', error, context);
    return;
  }
  if (context) {
    Sentry.setExtras(context);
  }
  Sentry.captureException(error);
};

export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  if (__DEV__) {
    console.log(`[CrashReporting:${level}]`, message);
    return;
  }
  Sentry.captureMessage(message, level);
};

export const setUserContext = (userId: string, traits?: Record<string, string>) => {
  Sentry.setUser({ id: userId, ...traits });
};

export const addBreadcrumb = (
  category: string,
  message: string,
  data?: Record<string, any>,
  level: Sentry.SeverityLevel = 'info'
) => {
  Sentry.addBreadcrumb({ category, message, data, level, timestamp: Date.now() / 1000 });
};

export const startTransaction = (name: string, op: string) => {
  return Sentry.startSpan({ name, op }, () => {});
};
