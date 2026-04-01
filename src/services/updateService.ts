import * as Updates from 'expo-updates';
import { createLogger } from './logger';
import { Alert, Platform } from 'react-native';

const log = createLogger('UpdateService');

export interface UpdateStatus {
  isAvailable: boolean;
  isDownloading: boolean;
  isReady: boolean;
  isCritical: boolean;
  manifest?: any;
  error?: string;
}

const CRITICAL_UPDATE_KEY = 'criticalUpdate';

export const checkForUpdates = async (): Promise<UpdateStatus> => {
  if (__DEV__) {
    log.debug('Skipping update check in development');
    return { isAvailable: false, isDownloading: false, isReady: false, isCritical: false };
  }

  try {
    const update = await Updates.checkForUpdateAsync();

    if (!update.isAvailable) {
      log.info('App is up to date');
      return { isAvailable: false, isDownloading: false, isReady: false, isCritical: false };
    }

    log.info('Update available', { manifest: update.manifest });

    const isCritical = !!(update.manifest as any)?.extra?.expoClient?.extra?.[CRITICAL_UPDATE_KEY];

    return {
      isAvailable: true,
      isDownloading: false,
      isReady: false,
      isCritical,
      manifest: update.manifest,
    };
  } catch (error) {
    log.error('Failed to check for updates', error as Error);
    return {
      isAvailable: false,
      isDownloading: false,
      isReady: false,
      isCritical: false,
      error: (error as Error).message,
    };
  }
};

export const downloadUpdate = async (): Promise<boolean> => {
  try {
    log.info('Downloading update...');
    const result = await Updates.fetchUpdateAsync();

    if (result.isNew) {
      log.info('Update downloaded successfully');
      return true;
    }

    return false;
  } catch (error) {
    log.error('Failed to download update', error as Error);
    return false;
  }
};

export const applyUpdate = async () => {
  try {
    log.info('Applying update and restarting...');
    await Updates.reloadAsync();
  } catch (error) {
    log.error('Failed to apply update', error as Error);
  }
};

export const promptUserForUpdate = (isCritical: boolean, onAccept: () => void) => {
  if (isCritical) {
    Alert.alert(
      'Critical Update Required',
      'A critical update is available that fixes important issues. The app will now update.',
      [{ text: 'Update Now', onPress: onAccept }],
      { cancelable: false }
    );
  } else {
    Alert.alert(
      'Update Available',
      'A new version of PremiumFlights is available with improvements and new features.',
      [
        { text: 'Later', style: 'cancel' },
        { text: 'Update Now', onPress: onAccept },
      ]
    );
  }
};

export const performAutoUpdate = async () => {
  const status = await checkForUpdates();

  if (!status.isAvailable) return;

  const downloaded = await downloadUpdate();
  if (!downloaded) return;

  promptUserForUpdate(status.isCritical, async () => {
    await applyUpdate();
  });
};
