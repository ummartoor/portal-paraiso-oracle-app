import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../../store/useThemeStore';


const DivineScreen: React.FC = () => {
  const { colors } = useThemeStore(state => state.theme);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'black' }]}>
      <View style={styles.centerContent}>
        <Text style={[styles.title, { color: colors.primary }]}>
          Divine Screen
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default DivineScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    
  },
});
