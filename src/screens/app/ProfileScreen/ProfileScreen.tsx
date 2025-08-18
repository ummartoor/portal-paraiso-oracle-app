import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../../store/useThemeStore';
import { useAuthStore } from '../../../store/useAuthStore'; 

const ProfileScreen: React.FC = () => {
  const { colors } = useThemeStore(state => state.theme);
  const logout = useAuthStore(state => state.logout);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'black' }]}>
      <View style={styles.centerContent}>
        <Text style={[styles.title, { color: colors.primary }]}>
          Profile Screen
        </Text>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={logout}
          activeOpacity={0.8}
          style={[styles.button, { borderColor: colors.white }]}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;

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
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
