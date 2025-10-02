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
} from "react-native";
import { useThemeStore } from "../../../../../store/useThemeStore";
import { Fonts } from "../../../../../constants/fonts";
import GradientBox from "../../../../../components/GradientBox";

// Goal Icons
 export const goalsList = [
  { key: "find_partner", label: "Find my perfect partner", icon: require("../../../../../assets/icons/goalIcon1.png") },
  { key: "improve_relationship", label: "Improve current relationship", icon: require("../../../../../assets/icons/goalIcon2.png") },
  { key: "understand_self", label: "Understand myself better", icon: require("../../../../../assets/icons/goalIcon3.png") },
  { key: "become_happier", label: "Become happier", icon: require("../../../../../assets/icons/goalIcon4.png") },
  { key: "personal_growth", label: "Foster personal growth", icon: require("../../../../../assets/icons/goalIcon5.png") },
  { key: "love_compatibility", label: "Check love compatibility", icon: require("../../../../../assets/icons/goalIcon6.png") },
  { key: "others", label: "Others", icon: require("../../../../../assets/icons/goalIcon7.png") },
];

interface GoalsModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (goals: string[]) => void;
    defaultValue?: string[];
}

const GoalsModal: React.FC<GoalsModalProps> = ({ isVisible, onClose, onConfirm, defaultValue = [] }) => {
  const colors = useThemeStore((state) => state.theme.colors);

  const [selectedGoals, setSelectedGoals] = useState<string[]>(defaultValue);
  const [isLoading, setIsLoading] = useState(false);

   useEffect(() => {
    if (isVisible) {
        setSelectedGoals(defaultValue || []);
    }
  }, [isVisible, defaultValue]);

  const toggleGoal = (goalKey: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalKey) ? prev.filter((g) => g !== goalKey) : [...prev, goalKey]
    );
  };

  const handleConfirm = async () => {
    if (selectedGoals.length === 0) return;
    setIsLoading(true);
    await onConfirm(selectedGoals);
    setIsLoading(false);
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={[StyleSheet.absoluteFill, styles(colors).overlayBackground]}>
        <View style={styles(colors).overlay}>
          <View style={styles(colors).modal}>
            {/* Heading */}
            <Text style={styles(colors).heading}>Select Your Goals</Text>
            {/* <Text style={styles(colors).subheading}>
              Goals reveal the balance between ambition and patience
            </Text> */}

            {/* Goals List */}
            <ScrollView
              style={{ maxHeight: 350, width: "100%" }}
              showsVerticalScrollIndicator={false}
            >
              {goalsList.map((goal) => {
                const isSelected = selectedGoals.includes(goal.key);
                return (
                  <TouchableOpacity
                    key={goal.key}
                    activeOpacity={0.8}
                    onPress={() => toggleGoal(goal.key)}
                    style={[
                      styles(colors).goalBox,
                      {
                        borderColor: isSelected ? colors.primary : colors.white,
                        borderWidth: isSelected ? 1.5 : 1,
                        backgroundColor: colors.bgBox,
                      },
                    ]}
                  >
                    <GradientBox
                      colors={[colors.black, colors.bgBox]}
                      style={styles(colors).iconWrapper}
                    >
                      <Image
                        source={goal.icon}
                        style={{
                          width: 20,
                          height: 20,
                        
                        }}
                        resizeMode="contain"
                      />
                    </GradientBox>
                    <Text
                      style={[
                        styles(colors).goalLabel,
                        {
                          color: isSelected ? colors.primary : "#fff",
                          fontFamily: isSelected ? Fonts.aeonikBold : Fonts.aeonikRegular,
                        },
                      ]}
                    >
                      {goal.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Buttons */}
            <View style={styles(colors).buttonRow}>
              {/* Cancel */}
              <TouchableOpacity
                onPress={onClose}
                activeOpacity={0.85}
                style={styles(colors).cancelButton}
              >
                <Text style={styles(colors).cancelText}>Cancel</Text>
              </TouchableOpacity>

              {/* Confirm */}
              <TouchableOpacity
                onPress={handleConfirm}
                activeOpacity={0.9}
                style={styles(colors).gradientTouchable}
                disabled={isLoading || selectedGoals.length === 0}
              >
                <GradientBox
                  colors={[colors.black, colors.bgBox]}
                  style={styles(colors).gradientFill}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <Text style={styles(colors).updateText}>Update</Text>
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

export default GoalsModal;

const styles = (colors: any) =>
  StyleSheet.create({
    overlayBackground: { backgroundColor: "rgba(0, 0, 0, 0.6)" },
    overlay: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
    modal: {
      width: "100%",
      backgroundColor: colors.bgBox,
      paddingVertical: 25,
      paddingHorizontal: 20,
      borderRadius: 15,
      alignItems: "center",
    },
    heading: {
      fontFamily: Fonts.cormorantSCBold,
      fontSize: 22,
      color: colors.primary,
      marginBottom: 25,
      textAlign: "center",
    },
    subheading: {
      fontFamily: Fonts.aeonikRegular,
      fontSize: 14,
      color: colors.primary,
      textAlign: "center",
      marginBottom: 18,
    },
    goalBox: {
      flexDirection: "row",
      alignItems: "center",
      height: 53,
      borderRadius: 20,
      paddingHorizontal: 12,
      marginBottom: 12,
    },
    iconWrapper: {
      width: 36,
      height: 36,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    goalLabel: { fontSize: 14 },
    buttonRow: {
      width: "100%",
      flexDirection: "row",
      columnGap: 12,
      marginTop: 12,
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
           borderWidth:1.7,
      borderColor:'#D9B699',
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
