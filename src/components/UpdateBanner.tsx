import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../constants/theme';
import { checkForUpdates, downloadUpdate, applyUpdate, UpdateStatus } from '../services/updateService';

export const UpdateBanner: React.FC = () => {
  const [status, setStatus] = useState<UpdateStatus | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    check();
  }, []);

  const check = async () => {
    const s = await checkForUpdates();
    if (s.isAvailable) setStatus(s);
  };

  const handleUpdate = async () => {
    setDownloading(true);
    const success = await downloadUpdate();
    if (success) {
      await applyUpdate();
    }
    setDownloading(false);
  };

  if (!status?.isAvailable) return null;

  if (status.isCritical) {
    return (
      <View style={[styles.banner, styles.criticalBanner]}>
        <Ionicons name="alert-circle" size={20} color={Colors.textInverse} />
        <Text style={[styles.text, styles.criticalText]}>Critical update required</Text>
        <TouchableOpacity style={styles.criticalButton} onPress={handleUpdate} disabled={downloading}>
          {downloading ? (
            <ActivityIndicator size="small" color={Colors.error} />
          ) : (
            <Text style={styles.criticalButtonText}>Update</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.banner}>
      <Ionicons name="download-outline" size={18} color={Colors.primary} />
      <Text style={styles.text}>New version available</Text>
      <TouchableOpacity style={styles.updateButton} onPress={handleUpdate} disabled={downloading}>
        {downloading ? (
          <ActivityIndicator size="small" color={Colors.textInverse} />
        ) : (
          <Text style={styles.updateText}>Update</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setStatus(null)}>
        <Ionicons name="close" size={18} color={Colors.textTertiary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.infoLight,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  criticalBanner: {
    backgroundColor: Colors.error,
  },
  text: {
    flex: 1,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.info,
  },
  criticalText: {
    color: Colors.textInverse,
  },
  updateButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  updateText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.textInverse,
  },
  criticalButton: {
    backgroundColor: Colors.textInverse,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  criticalButtonText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.error,
  },
});
