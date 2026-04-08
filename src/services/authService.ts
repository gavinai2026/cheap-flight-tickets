import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createLogger } from './logger';

const log = createLogger('AuthService');
const AUTH_SETTINGS_KEY = 'biometric_settings';

interface BiometricSettings {
  enabled: boolean;
  type: 'fingerprint' | 'facial' | 'none';
}

export const getBiometricSettings = async (): Promise<BiometricSettings> => {
  try {
    const data = await AsyncStorage.getItem(AUTH_SETTINGS_KEY);
    return data ? JSON.parse(data) : { enabled: false, type: 'none' };
  } catch {
    return { enabled: false, type: 'none' };
  }
};

export const saveBiometricSettings = async (settings: BiometricSettings) => {
  await AsyncStorage.setItem(AUTH_SETTINGS_KEY, JSON.stringify(settings));
};

export const checkBiometricAvailability = async (): Promise<{ available: boolean; type: string }> => {
  try {
    // In production use: import * as LocalAuthentication from 'expo-local-authentication';
    // const compatible = await LocalAuthentication.hasHardwareAsync();
    // const enrolled = await LocalAuthentication.isEnrolledAsync();
    // const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

    // Simulated for development
    const isIOS = Platform.OS === 'ios';
    return {
      available: true,
      type: isIOS ? 'Face ID' : 'Fingerprint',
    };
  } catch (error) {
    log.error('Biometric check failed', error);
    return { available: false, type: 'none' };
  }
};

export const authenticateWithBiometrics = async (reason = 'Verify your identity'): Promise<boolean> => {
  try {
    // In production use:
    // const result = await LocalAuthentication.authenticateAsync({
    //   promptMessage: reason,
    //   cancelLabel: 'Cancel',
    //   disableDeviceFallback: false,
    // });
    // return result.success;

    log.info('Biometric authentication requested (simulated in dev)');
    return true;
  } catch (error) {
    log.error('Biometric auth failed', error);
    return false;
  }
};

export const enableBiometricLock = async (): Promise<boolean> => {
  const { available, type } = await checkBiometricAvailability();
  if (!available) {
    Alert.alert('Not Available', 'Biometric authentication is not available on this device.');
    return false;
  }

  const authenticated = await authenticateWithBiometrics('Enable biometric lock');
  if (authenticated) {
    await saveBiometricSettings({
      enabled: true,
      type: type === 'Face ID' ? 'facial' : 'fingerprint',
    });
    return true;
  }
  return false;
};

export const disableBiometricLock = async () => {
  await saveBiometricSettings({ enabled: false, type: 'none' });
};
