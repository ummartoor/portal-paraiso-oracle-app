/**
 * Skeleton Loader Component
 * Professional loading placeholders for better UX
 */
import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../constants/design';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.sm,
  style,
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Predefined skeleton components for common use cases
export const SkeletonCard: React.FC = () => (
  <View style={styles.skeletonCard}>
    <SkeletonLoader width="60%" height={16} style={styles.skeletonTitle} />
    <SkeletonLoader width="80%" height={14} style={styles.skeletonSubtitle} />
    <SkeletonLoader width="40%" height={12} style={styles.skeletonMeta} />
  </View>
);

export const SkeletonListItem: React.FC = () => (
  <View style={styles.skeletonListItem}>
    <SkeletonLoader width={50} height={50} borderRadius={BorderRadius.md} />
    <View style={styles.skeletonListItemContent}>
      <SkeletonLoader width="70%" height={16} />
      <SkeletonLoader
        width="50%"
        height={14}
        style={styles.skeletonListItemSubtitle}
      />
    </View>
  </View>
);

export const SkeletonMessage: React.FC<{ isUser?: boolean }> = ({
  isUser = false,
}) => (
  <View style={[styles.skeletonMessage, isUser && styles.skeletonMessageUser]}>
    <SkeletonLoader width="75%" height={60} borderRadius={BorderRadius.lg} />
  </View>
);

export const SkeletonHeader: React.FC = () => (
  <View style={styles.skeletonHeader}>
    <SkeletonLoader width={50} height={50} borderRadius={BorderRadius.round} />
    <View style={styles.skeletonHeaderText}>
      <SkeletonLoader width={120} height={20} />
      <SkeletonLoader
        width={80}
        height={14}
        style={styles.skeletonHeaderSubtitle}
      />
    </View>
  </View>
);

export const SkeletonCardDetail: React.FC<{
  width?: number;
  height?: number;
}> = ({ width = 250, height = 350 }) => (
  <View style={styles.skeletonCardContainer}>
    <SkeletonLoader
      width={width}
      height={height}
      borderRadius={BorderRadius.lg}
    />
    <SkeletonLoader
      width={width * 0.6}
      height={20}
      style={styles.skeletonCardTitle}
    />
    <SkeletonLoader
      width={width * 0.8}
      height={16}
      style={styles.skeletonCardSubtitle}
    />
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.bgBox,
  },
  skeletonCard: {
    backgroundColor: Colors.bgBox,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  skeletonTitle: {
    marginBottom: Spacing.sm,
  },
  skeletonSubtitle: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  skeletonMeta: {
    marginTop: Spacing.sm,
  },
  skeletonListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgBox,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  skeletonListItemContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  skeletonListItemSubtitle: {
    marginTop: Spacing.xs,
  },
  skeletonMessage: {
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  skeletonMessageUser: {
    alignItems: 'flex-end',
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  skeletonHeaderText: {
    marginLeft: Spacing.md,
  },
  skeletonHeaderSubtitle: {
    marginTop: Spacing.xs,
  },
  skeletonCardContainer: {
    alignItems: 'center',
    padding: Spacing.lg,
  },
  skeletonCardTitle: {
    marginTop: Spacing.md,
  },
  skeletonCardSubtitle: {
    marginTop: Spacing.sm,
  },
});

export default SkeletonLoader;
