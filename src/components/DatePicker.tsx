import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../constants/theme';
import { formatDateLong } from '../utils/helpers';

interface Props {
  label: string;
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const DatePicker: React.FC<Props> = ({ label, value, onChange, minDate }) => {
  const [visible, setVisible] = useState(false);
  const [viewDate, setViewDate] = useState(new Date(value || Date.now()));

  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();

  const getFirstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDateObj = minDate ? new Date(minDate) : today;

  const isDisabled = (day: number) => {
    const date = new Date(year, month, day);
    return date < minDateObj;
  };

  const isSelected = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dateStr === value;
  };

  const isToday = (day: number) => {
    const t = new Date();
    return day === t.getDate() && month === t.getMonth() && year === t.getFullYear();
  };

  const handleSelect = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(dateStr);
    setVisible(false);
  };

  const navigateMonth = (dir: number) => {
    setViewDate(new Date(year, month + dir, 1));
  };

  const renderCalendar = () => {
    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const disabled = isDisabled(day);
      const selected = isSelected(day);
      const todayDay = isToday(day);

      cells.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            selected && styles.dayCellSelected,
            todayDay && !selected && styles.dayCellToday,
          ]}
          onPress={() => !disabled && handleSelect(day)}
          disabled={disabled}
        >
          <Text
            style={[
              styles.dayText,
              disabled && styles.dayTextDisabled,
              selected && styles.dayTextSelected,
              todayDay && !selected && styles.dayTextToday,
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }
    return cells;
  };

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setVisible(true)}>
        <View style={styles.triggerIcon}>
          <Ionicons name="calendar" size={18} color={Colors.primary} />
        </View>
        <View style={styles.triggerContent}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value ? formatDateLong(value) : 'Select date'}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{label}</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.calendarContainer}>
            <View style={styles.monthNav}>
              <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navButton}>
                <Ionicons name="chevron-back" size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.monthLabel}>
                {MONTHS[month]} {year}
              </Text>
              <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navButton}>
                <Ionicons name="chevron-forward" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekDays}>
              {DAYS.map((d) => (
                <View key={d} style={styles.weekDayCell}>
                  <Text style={styles.weekDayText}>{d}</Text>
                </View>
              ))}
            </View>

            <View style={styles.daysGrid}>{renderCalendar()}</View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  triggerIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.businessBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  triggerContent: {
    flex: 1,
  },
  label: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    fontWeight: FontWeights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
  },
  modal: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingTop: Spacing.xxl,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  calendarContainer: {
    padding: Spacing.lg,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  navButton: {
    padding: Spacing.sm,
  },
  monthLabel: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  weekDayText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.textTertiary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
  },
  dayCellSelected: {
    backgroundColor: Colors.primary,
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  dayText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    color: Colors.text,
  },
  dayTextDisabled: {
    color: Colors.textTertiary,
    opacity: 0.4,
  },
  dayTextSelected: {
    color: Colors.textInverse,
    fontWeight: FontWeights.bold,
  },
  dayTextToday: {
    color: Colors.primary,
    fontWeight: FontWeights.bold,
  },
});
