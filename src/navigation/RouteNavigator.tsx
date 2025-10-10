// import { View, Text } from 'react-native'
// import React, { useEffect, useState } from 'react'

// import AuthNavigator from './AuthNavigator'
// import { useAuthStore } from '../store/useAuthStore'
// import AppNavigator from './AppNavigator';

// const RouteNavigator = () => {

//   // const [isloggedIn,setIsloggedIn]=useState<Boolean>(false)

//     const { isLoggedIn, checkAuthStatus } = useAuthStore();
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const init = async () => {
//       await checkAuthStatus();
//       setLoading(false);
//     };
//     init();
//   }, []);

//   if (loading) return <Text>Loading...</Text>; 

//   return (
//   isLoggedIn ?  <AppNavigator /> : <AuthNavigator />

//   )
// }

// export default RouteNavigator










import React, { useEffect, useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ActivityIndicator, 
    ImageBackground,
    StatusBar
} from 'react-native';

import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore'; // 1. Import Theme Store
import { Fonts } from '../constants/fonts'; // 2. Import Fonts

const RouteNavigator = () => {
  const { isLoggedIn, checkAuthStatus } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const { colors } = useThemeStore(s => s.theme); // 3. Get colors from theme

  useEffect(() => {
    const init = async () => {
      await checkAuthStatus();
      setLoading(false);
    };
    init();
  }, []);

  // --- 4. NEW: Professional Loading Screen ---
  if (loading) {
    return (
      <ImageBackground
        source={require('../assets/images/backgroundImage.png')}
        style={styles.bgImage}
        resizeMode="cover"
      >
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.primary }]}>
            Portal Paraiso
          </Text>
        </View>
      </ImageBackground>
    );
  }

  return isLoggedIn ? <AppNavigator /> : <AuthNavigator />;
};

export default RouteNavigator;

// --- 5. NEW: Styles for the loading screen ---
const styles = StyleSheet.create({
    bgImage: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 20,
        fontFamily: Fonts.cormorantSCBold,
        fontSize: 24,
        letterSpacing: 1,
    }
});
