

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const TypingIndicator = () => {

  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {

    const bounce = (dot: Animated.Value) =>
      Animated.sequence([
        Animated.timing(dot, {
          toValue: -8, 
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(dot, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]);

    const animation = Animated.loop(
      Animated.stagger(150, [ 
        bounce(dot1),
        bounce(dot2),
        bounce(dot3),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.dot, { transform: [{ translateY: dot1 }] }]} />
      <Animated.View style={[styles.dot, { transform: [{ translateY: dot2 }] }]} />
      <Animated.View style={[styles.dot, { transform: [{ translateY: dot3 }] }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width:6,
    height: 6,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 3,
  },
});

export default TypingIndicator;