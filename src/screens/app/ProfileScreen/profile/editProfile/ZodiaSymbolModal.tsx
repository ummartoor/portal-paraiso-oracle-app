import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  ImageSourcePropType,
  Vibration,
} from "react-native";
import { useThemeStore } from "../../../../../store/useThemeStore";
import { Fonts } from "../../../../../constants/fonts";
import GradientBox from "../../../../../components/GradientBox";
import { useTranslation } from "react-i18next"; // --- ADDED ---

type Zodiac = { key: string; name: string; icon: ImageSourcePropType };

interface ZodiacSymbolModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (sign: string) => void;
  defaultValue?: string | null;
  isLoading?: boolean;
}

const ZodiacSymbolModal: React.FC<ZodiacSymbolModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  defaultValue,
  isLoading,
}) => {
  const colors = useThemeStore((state) => state.theme.colors);
  const { t } = useTranslation(); // --- ADDED ---
  const [selected, setSelected] = useState<string | null>(defaultValue || null);

  // --- CHANGED: Moved inside component and translated names ---
  const ZODIACS: Zodiac[] = [
    { key: "aries", name: t('zodiac_aries'), icon: require("../../../../../assets/icons/AriesIcon.png") },
    { key: "taurus", name: t('zodiac_taurus'), icon: require("../../../../../assets/icons/TaurusIcon.png") },
    { key: "gemini", name: t('zodiac_gemini'), icon: require("../../../../../assets/icons/GeminiIcon.png") },
    { key: "cancer", name: t('zodiac_cancer'), icon: require("../../../../../assets/icons/CancerIcon.png") },
    { key: "leo", name: t('zodiac_leo'), icon: require("../../../../../assets/icons/leoIcon.png") },
    { key: "virgo", name: t('zodiac_virgo'), icon: require("../../../../../assets/icons/VirgoIcon.png") },
    { key: "libra", name: t('zodiac_libra'), icon: require("../../../../../assets/icons/libraIcon.png") },
    { key: "scorpio", name: t('zodiac_scorpio'), icon: require("../../../../../assets/icons/ScorpioIcon.png") },
    { key: "sagittarius", name: t('zodiac_sagittarius'), icon: require("../../../../../assets/icons/SagittariusIcon.png")},
    { key: "capricorn", name: t('zodiac_capricorn'), icon: require("../../../../../assets/icons/CapricornIcon.png") },
    { key: "aquarius", name: t('zodiac_aquarius'), icon: require("../../../../../assets/icons/AquariusIcon.png") },
    { key: "pisces", name: t('zodiac_pisces'), icon: require("../../../../../assets/icons/PiscesIcon.png") },
  ];

  useEffect(() => {
    if (defaultValue) setSelected(defaultValue);
  }, [defaultValue, isVisible]); // Added isVisible to reset on modal open

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={[StyleSheet.absoluteFill, styles(colors).overlayBackground]}>
        <View style={styles(colors).overlay}>
          <View style={styles(colors).modal}>
            {/* --- CHANGED --- */}
            <Text style={styles(colors).heading}>{t('zodiac_modal_header')}</Text>

            <ScrollView contentContainerStyle={styles(colors).gridWrapper}>
              {ZODIACS.reduce((rows: Zodiac[][], option, index) => {
                if (index % 3 === 0) rows.push([option]);
                else rows[rows.length - 1].push(option);
                return rows;
              }, []).map((row, rowIndex) => (
                <View key={rowIndex} style={styles(colors).row}>
                  {row.map((item) => {
                    const isActive = selected === item.key;
                    return (
                      <TouchableOpacity
                        key={item.key}
                        style={[
                          styles(colors).statusBox,
                          {
                            borderColor: isActive ? colors.primary : colors.white,
                            borderWidth: isActive ? 1.5 : 1,
                          },
                        ]}
                        onPress={() => {
                          Vibration.vibrate([0, 35, 40, 35])
                          setSelected(item.key)}}
                        activeOpacity={0.8}
                      >
                        <Image
                          source={item.icon}
                          style={[
                            styles(colors).iconImage,
                            { tintColor: isActive ? colors.primary : "#fff" },
                          ]}
                          resizeMode="contain"
                        />
                        <Text
                          style={[
                            styles(colors).statusLabel,
                            {
                              color: isActive ? colors.primary : "#fff",
                              fontFamily: isActive
                                ? Fonts.aeonikBold
                                : Fonts.aeonikRegular,
                            },
                          ]}
                        >
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  {row.length < 3 &&
                    [...Array(3 - row.length)].map((_, i) => (
                      <View
                        key={`placeholder-${i}`}
                        style={[
                          styles(colors).statusBox,
                          {
                            backgroundColor: "transparent",
                            borderColor: "transparent",
                          },
                        ]}
                      />
                    ))}
                </View>
              ))}
            </ScrollView>

            <View style={styles(colors).buttonRow}>
              <TouchableOpacity
               onPress={() => {
                              Vibration.vibrate([0, 35, 40, 35]); 
                              onClose();                          
                            }}
                activeOpacity={0.85}
                style={styles(colors).cancelButton}
              >
                {/* --- CHANGED --- */}
                <Text style={styles(colors).cancelText}>{t('cancel_button')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Vibration.vibrate([0, 35, 40, 35])
                 
                  selected && onConfirm(selected)}}
                activeOpacity={0.9}
                disabled={isLoading}
                style={styles(colors).gradientTouchable}
              >
                <GradientBox
                  colors={[colors.black, colors.bgBox]}
                  style={styles(colors).gradientFill}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    // --- CHANGED ---
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

export default ZodiacSymbolModal;

const styles = (colors: any) =>
  StyleSheet.create({
    overlayBackground: { backgroundColor: "rgba(0, 0, 0, 0.6)" },
    overlay: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
    modal: {
      width: "100%",
      backgroundColor: colors.bgBox,
      paddingVertical: 30,
      paddingHorizontal: 20,
      borderRadius: 15,
      alignItems: "center",
      maxHeight: "85%",
    },
    heading: {
      fontFamily: Fonts.cormorantSCBold,
      fontSize: 22,
      color: colors.primary,
      marginBottom: 20,
    },
    gridWrapper: { paddingBottom: 20 },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
      columnGap: 12,
    },
    statusBox: {
      width: 80,
      height: 85,
      borderRadius: 14,
      backgroundColor: "#4A3F50",
      justifyContent: "center",
      alignItems: "center",
    },
    iconImage: { width: 35, height: 35, marginBottom: 6 },
    statusLabel: { fontSize: 12, textAlign: "center" },
    buttonRow: {
      width: "100%",
      flexDirection: "row",
      columnGap: 12,
      marginTop: 10,
    },
    cancelButton: {
      flexGrow: 1,
      flexBasis: 0,
      height: 50,
      justifyContent: "center",
      alignItems: "center",
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
      overflow: "hidden",
    },
    gradientFill: {
      flex: 1,
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    updateText: {
      fontFamily: Fonts.aeonikRegular,
      fontSize: 14,
      color: colors.white,
    },
  });
