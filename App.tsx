
// import { StatusBar, StyleSheet, useColorScheme, View ,Text} from 'react-native';
// import {
//   SafeAreaProvider,
//   useSafeAreaInsets,
// } from 'react-native-safe-area-context';

// function App() {
//   const isDarkMode = useColorScheme() === 'dark';

//   return (
//     <SafeAreaProvider>
//       <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
// <View><Text>My New Apps</Text></View>
//     </SafeAreaProvider>
//   );
// }





// export default App;

import { NewAppScreen } from '@react-native/new-app-screen';

import { StatusBar, StyleSheet, useColorScheme, View,Text } from 'react-native';

import RouteNavigator from './src/navigation/RouteNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

function App() {


  return (

    <SafeAreaProvider>
      <GestureHandlerRootView>
    <NavigationContainer>
       <RouteNavigator />
       </NavigationContainer>
       </GestureHandlerRootView>
       </SafeAreaProvider>
     

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;