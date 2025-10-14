import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Vibration,
  Switch,
} from 'react-native';
import { useThemeStore } from '../../../store/useThemeStore';
import { Fonts } from '../../../constants/fonts';
import GradientBox from '../../../components/GradientBox';
import { useTranslation } from 'react-i18next';
import { useGetNotificationsStore } from '../../../store/useGetNotificationsStore';
import { useShallow } from 'zustand/react/shallow';
interface NotificationToggleModalProps {
  isVisible: boolean;
  onClose: () => void;
  defaultValues?: {
    push: boolean;
    daily_wisdom_cards: boolean;
    ritual_tips: boolean;
  };
}

const NotificationToggleModal: React.FC<NotificationToggleModalProps> = ({
  isVisible,
  onClose,
  defaultValues = { push: true, daily_wisdom_cards: true, ritual_tips: true },
}) => {
  const colors = useThemeStore(state => state.theme.colors);
  const { t } = useTranslation();

  const { updateNotificationSettings, isUpdatingSettings } = useGetNotificationsStore(
    useShallow(state => ({
      updateNotificationSettings: state.updateNotificationSettings,
      isUpdatingSettings: state.isUpdatingSettings,
    })),
  );

  const [allNotifications, setAllNotifications] = useState(defaultValues.push);
  const [dailyWisdom, setDailyWisdom] = useState(defaultValues.daily_wisdom_cards);
  const [ritual, setRitual] = useState(defaultValues.ritual_tips);

  useEffect(() => {
    if (isVisible) {
      setAllNotifications(defaultValues.push);
      setDailyWisdom(defaultValues.daily_wisdom_cards);
      setRitual(defaultValues.ritual_tips);
    }
  }, [isVisible, defaultValues]);

  // --- CHANGE: Updated logic for the master toggle ---
  const handleAllNotificationsToggle = (newValue: boolean) => {
    setAllNotifications(newValue);
    // Jab master toggle ON ho, to baaqi dono bhi ON ho jayen
    if (newValue) {
      setDailyWisdom(true);
      setRitual(true);
    } else {
      // Jab master toggle OFF ho, to baaqi dono bhi OFF ho jayen
      setDailyWisdom(false);
      setRitual(false);
    }
  };

  useEffect(() => {
    // Agar individual toggles ON/OFF hon, to master toggle ko sync karein
    if (dailyWisdom && ritual) {
      setAllNotifications(true);
    } else if (!dailyWisdom && !ritual) {
      setAllNotifications(false);
    }
  }, [dailyWisdom, ritual]);

  const handleUpdate = async () => {
    Vibration.vibrate([0, 35, 40, 35]);
    if (!isUpdatingSettings) {
      const settingsPayload = {
        push: allNotifications,
        daily_wisdom_cards: dailyWisdom,
        ritual_tips: ritual,
      };
      const success = await updateNotificationSettings(settingsPayload);
      if (success) {
        onClose();
      }
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={[StyleSheet.absoluteFill, styles(colors).overlayBackground]}>
        <View style={styles(colors).overlay}>
          <View style={styles(colors).modal}>
            <Text style={styles(colors).heading}>Notification Settings</Text>
            
            <View style={styles(colors).headerRow}>
              <Text style={styles(colors).label}>All Push Notifications</Text>
              <Switch
                trackColor={{ false: '#767577', true: colors.primary }}
                thumbColor={allNotifications ? colors.white : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={handleAllNotificationsToggle}
                value={allNotifications}
                disabled={isUpdatingSettings}
              />
            </View>

            <View style={styles(colors).notificationContainer}>
              <View style={styles(colors).notificationRow}>
                <Text style={styles(colors).label}>Daily Wisdom Card</Text>
                <Switch
                  trackColor={{ false: '#767577', true: colors.primary }}
                  thumbColor={dailyWisdom ? colors.white : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={setDailyWisdom}
                  value={dailyWisdom}
                  disabled={isUpdatingSettings}
                />
              </View>

              <View style={styles(colors).notificationRow}>
                <Text style={styles(colors).label}>Ritual Tip</Text>
                <Switch
                  trackColor={{ false: '#767577', true: colors.primary }}
                  thumbColor={ritual ? colors.white : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={setRitual}
                  value={ritual}
                  disabled={isUpdatingSettings}
                />
              </View>
            </View>

            <View style={styles(colors).buttonRow}>
              <TouchableOpacity
                onPress={() => {
                  Vibration.vibrate([0, 35, 40, 35]);
                  onClose();
                }}
                activeOpacity={0.85}
                style={styles(colors).cancelButton}
              >
                <Text style={styles(colors).cancelText}>{t('cancel_button')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdate}
                activeOpacity={0.9}
                style={styles(colors).gradientTouchable}
                disabled={isUpdatingSettings}
              >
                <GradientBox
                  colors={[colors.black, colors.bgBox]}
                  style={styles(colors).gradientFill}
                >
                  {isUpdatingSettings ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <Text style={styles(colors).updateText}>{t('update_button')}</Text>
                  )}
                </GradientBox>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default NotificationToggleModal;

const styles = (colors: any) =>
  StyleSheet.create({
    overlayBackground: { backgroundColor: 'rgba(0, 0, 0, 0.6)' },
    overlay: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
    modal: {
      width: '100%',
      backgroundColor: colors.bgBox,
      paddingVertical: 30,
      paddingHorizontal: 20,
      borderRadius: 15,
      alignItems: 'center',
    },
    headerRow: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.1)',
      paddingBottom: 15,
    },
    heading: {
      fontFamily: Fonts.cormorantSCBold,
      fontSize: 22,
      color: colors.primary,
      marginBottom: 16,
    },
    notificationContainer: {
      width: '100%',
      marginBottom: 20,
    },
    notificationRow: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
    },
    label: {
      fontFamily: Fonts.aeonikRegular,
      fontSize: 16,
      color: colors.white,
      opacity: 0.9,
    },
    buttonRow: {
      width: '100%',
      flexDirection: 'row',
      columnGap: 12,
      marginTop: 10,
    },
    cancelButton: {
      flexGrow: 1,
      flexBasis: 0,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.white,
      borderRadius: 200,
    },
    cancelText: {
      fontFamily: Fonts.aeonikRegular,
      fontSize: 14,
      color: colors.black,
    },
    gradientTouchable: {
      flexGrow: 1,
      flexBasis: 0,
      height: 50,
      borderWidth: 1.7,
      borderColor: '#D9B699',
      borderRadius: 200,
      overflow: 'hidden',
    },
    gradientFill: {
      flex: 1,
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    updateText: {
      fontFamily: Fonts.aeonikRegular,
      fontSize: 14,
      color: colors.white,
    },
  });