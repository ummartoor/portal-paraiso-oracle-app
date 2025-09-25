import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useThemeStore } from "../../../../../store/useThemeStore";
import { Fonts } from "../../../../../constants/fonts";
import GradientBox from "../../../../../components/GradientBox";

type Zodiac = { key: string; name: string; icon: any };

interface ZodiacSymbolModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (sign: string) => void;
  defaultValue?: string | null;
  isLoading?: boolean;
}

const ZODIACS: Zodiac[] = [
  { key: "aries", name: "Aries", icon: require("../../../../../assets/icons/leo.png") },
  { key: "taurus", name: "Taurus", icon: require("../../../../../assets/icons/cancer.png") },
  { key: "gemini", name: "Gemini", icon: require("../../../../../assets/icons/gemini.png") },
  { key: "cancer", name: "Cancer", icon: require("../../../../../assets/icons/cancer.png") },
  { key: "leo", name: "Leo", icon: require("../../../../../assets/icons/leo.png") },
  { key: "virgo", name: "Virgo", icon: require("../../../../../assets/icons/virgo.png") },
  { key: "libra", name: "Libra", icon: require("../../../../../assets/icons/libra.png") },
  { key: "scorpio", name: "Scorpio", icon: require("../../../../../assets/icons/scorpio.png") },
  { key: "sagittarius", name: "Sagittarius", icon: require("../../../../../assets/icons/sagittarius.png") },
  { key: "capricorn", name: "Capricorn", icon: require("../../../../../assets/icons/capricorn.png") },
  { key: "aquarius", name: "Aquarius", icon: require("../../../../../assets/icons/aquarius.png") },
  { key: "pisces", name: "Pisces", icon: require("../../../../../assets/icons/pisces.png") },
];

const ZodiacSymbolModal: React.FC<ZodiacSymbolModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  defaultValue,
  isLoading,
}) => {
  const colors = useThemeStore((state) => state.theme.colors);
  const [selected, setSelected] = useState<string | null>(defaultValue || null);

  useEffect(() => {
    if (defaultValue) setSelected(defaultValue);
  }, [defaultValue]);

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={[StyleSheet.absoluteFill, styles(colors).overlayBackground]}>
        <View style={styles(colors).overlay}>
          <View style={styles(colors).modal}>
            {/* Heading */}
            <Text style={styles(colors).heading}>Select Your Zodiac Symbol</Text>

            {/* Zodiac Grid */}
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
                        onPress={() => setSelected(item.key)}
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

            {/* Buttons */}
            <View style={styles(colors).buttonRow}>
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.85}
                style={styles(colors).cancelButton}
              >
                <Text style={styles(colors).cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => selected && onConfirm(selected)}
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
                    <Text style={styles(colors).updateText}>Save</Text>
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
      fontFamily: Fonts.aeonikRegular,
      fontSize: 18,
      lineHeight: 22,
      color: colors.primary,
      marginBottom: 20,
    },
    gridWrapper: { paddingBottom: 20 },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 16,
      columnGap: 12, // <-- spacing between items
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
