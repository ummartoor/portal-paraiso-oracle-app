import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  Vibration, // --- ADDED ---
} from "react-native";
import { useThemeStore } from "../../../../../store/useThemeStore";
import { Fonts } from "../../../../../constants/fonts";
import GradientBox from "../../../../../components/GradientBox";
import { useTranslation } from "react-i18next"; // --- ADDED ---

interface RelationshipStatusModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (status: string) => Promise<any>; // --- CHANGED to Promise ---
  defaultValue?: string | null;
}

const RelationshipStatusModal: React.FC<RelationshipStatusModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  defaultValue,
}) => {
  const colors = useThemeStore((state) => state.theme.colors);
  const { t } = useTranslation(); // --- ADDED ---
  const [selected, setSelected] = useState<string | null>(defaultValue || null);
  const [isLoading, setIsLoading] = useState(false); // --- ADDED ---

  // --- CHANGED: Moved inside component and translated labels ---
  const options = [
    { key: "single", label: t('status_single'), icon: require("../../../../../assets/icons/goalIcon1.png") },
    { key: "relationship", label: t('status_relationship'), icon: require("../../../../../assets/icons/goalIcon1.png") },
    { key: "married", label: t('status_married'), icon: require("../../../../../assets/icons/goalIcon1.png") },
    { key: "engaged", label: t('status_engaged'), icon: require("../../../../../assets/icons/goalIcon1.png") },
    { key: "complicated", label: t('status_complicated'), icon: require("../../../../../assets/icons/goalIcon1.png") },
    { key: "divorced", label: t('status_divorced'), icon: require("../../../../../assets/icons/goalIcon1.png") },
  ];

  useEffect(() => {
    if (isVisible) {
      setSelected(defaultValue || null);
    }
  }, [isVisible, defaultValue]);

  const handleSave = async () => {
       Vibration.vibrate([0, 35, 40, 35]); 
    if (selected && !isLoading) {
      setIsLoading(true);
      await onConfirm(selected);
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={[StyleSheet.absoluteFill, styles(colors).overlayBackground]}>
        <View style={styles(colors).overlay}>
          <View style={styles(colors).modal}>
            {/* --- CHANGED --- */}
            <Text style={styles(colors).heading}>{t('relationship_modal_header')}</Text>

            <FlatList
              data={options}
              numColumns={2}
              keyExtractor={(item) => item.key}
              columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 12 }}
              renderItem={({ item }) => {
                const isActive = selected === item.key;
                return (
                  <TouchableOpacity
                    style={[
                      styles(colors).optionBox,
                      {
                        borderColor: isActive ? colors.primary : colors.white,
                        borderWidth: 1.5,
                      },
                    ]}
                    onPress={() =>{ 
                         Vibration.vibrate([0, 35, 40, 35]); 
                      setSelected(item.key)}}
                    activeOpacity={0.8}
                  >
                    <View style={styles(colors).iconWrapper}>
                      <Image
                        source={item.icon}
                        style={{ width: 21, height: 21 }}
                        resizeMode="contain"
                      />
                    </View>
                    <Text
                      style={{
                        fontFamily: isActive
                          ? Fonts.aeonikBold
                          : Fonts.aeonikRegular,
                        color: isActive ? colors.primary : colors.white,
                        fontSize: 14,
                        textAlign: "center",
                      }}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />

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
                onPress={handleSave}
                activeOpacity={0.9}
                style={styles(colors).gradientTouchable}
                disabled={isLoading || !selected}
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

export default RelationshipStatusModal;

const styles = (colors: any) =>
  StyleSheet.create({
    overlayBackground: {
      backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
    overlay: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 20,
    },
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
    optionBox: {
      width: "48%",
      height: 100,
      borderRadius: 16,
      backgroundColor: colors.bgBox,
      justifyContent: "center",
      alignItems: "center",
    },
    iconWrapper: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "#2D2A33",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
    },
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
