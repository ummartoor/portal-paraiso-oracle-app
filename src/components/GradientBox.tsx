import React from "react";
import LinearGradient from "react-native-linear-gradient";
import { StyleSheet, ViewStyle } from "react-native";

interface GradientBoxProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  colors: (string | undefined)[]; 
}

const GradientBox: React.FC<GradientBoxProps> = ({
  children,
  style,
  colors,
}) => {

  const safeColors = colors.filter(Boolean) as string[];

  // fallback if less than 2 colors provided
  if (safeColors.length < 2) {
    safeColors.push("#000000", "#333333");
  }

  return (
    <LinearGradient
      colors={safeColors}
      style={[styles.gradient, style]}
      start={{ x: 0.5, y: 0 }}  
      end={{ x: 0.5, y: 1 }}    
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    padding: 15,
    borderRadius: 10,
  },
});

export default GradientBox;
