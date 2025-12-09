import React, { useMemo } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet, ViewStyle } from 'react-native';

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
  const safeColors = useMemo(() => {
    const filtered = colors.filter(Boolean) as string[];
    // Fallback if less than 2 colors provided
    if (filtered.length < 2) {
      return ['#000000', '#333333'];
    }
    return filtered;
  }, [colors]);

  const gradientStart = useMemo(() => ({ x: 0.5, y: 0 }), []);
  const gradientEnd = useMemo(() => ({ x: 0.5, y: 1 }), []);

  return (
    <LinearGradient
      colors={safeColors}
      style={[styles.gradient, style]}
      start={gradientStart}
      end={gradientEnd}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    // padding: 15,
    // borderRadius: 10,
  },
});

export default GradientBox;
