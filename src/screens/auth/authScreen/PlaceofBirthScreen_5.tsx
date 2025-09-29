
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  ImageBackground,
  TextInput,
  Alert, // --- ADDED ---
  ActivityIndicator, // --- ADDED ---
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../../store/useThemeStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamsList } from '../../../navigation/routeTypes';
import { useNavigation } from '@react-navigation/native';
import { Fonts } from '../../../constants/fonts';
import GradientBox from '../../../components/GradientBox';
import { useRegisterStore } from '../../../store/useRegisterStore'; // --- ADDED ---
import { useTranslation } from 'react-i18next';
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

const PlaceofBirthScreen_5 = () => {
  const theme = useThemeStore(state => state.theme);
  const colors = theme.colors;
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();
 const { t } = useTranslation();
  const [place, setPlace] = useState('');

  // --- ADDED: Get store function and loading state ---
  const { updateUserDetails, isUpdating } = useRegisterStore();

  // --- ADDED: Handle 'Next' button press and API call ---
  const handleNext = async () => {
    if (!place.trim()) {
    Alert.alert(
        t('alert_input_required_title'),
        t('alert_input_required_message_pob')
      );
      return;
    }

    const success = await updateUserDetails({ place_of_birth: place });
    
    if (success) {
      navigation.navigate('RelationshipStatus');
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/bglinearImage.png')}
      style={[styles.bgImage, { height: SCREEN_HEIGHT, width: SCREEN_WIDTH }]}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />

        {/* Header with back arrow + progress bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../../../assets/icons/ArrowIcon.png')}
              style={{ width: 22, height: 22, tintColor: colors.white }}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: '90%' }]} />
          </View>
        </View>

        {/* Heading */}
        <Text style={[styles.heading, { color: colors.white }]}>
         {t('pob_header')}
        </Text>
        <Text style={[styles.subheading, { color: colors.primary }]}>
           {t('pob_subheader')}
        </Text>

        {/* Input field */}
        <TextInput
          style={styles.inputField}
        placeholder={t('pob_placeholder')}
          placeholderTextColor="#999"
          value={place}
          onChangeText={setPlace}
        />
      </SafeAreaView>

      {/* --- UPDATED: Next Button with loading state and API call --- */}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleNext}
          style={{ width: '100%' }}
          disabled={isUpdating}
        >
          <GradientBox
            colors={[colors.black, colors.bgBox]}
            style={[
              styles.nextBtn,
              { borderWidth: 1.5, borderColor: colors.primary },
            ]}
          >
            {isUpdating ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.nextText}>{t('next_button')}</Text>
            )}
          </GradientBox>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default PlaceofBirthScreen_5;

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  progressBarBackground: {
    flex: 1,
    height: 7,
    backgroundColor: '#4A3F50',
    borderRadius: 5,
    marginLeft: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 32,
    lineHeight: 36,
    textAlign: 'center',
    fontFamily: Fonts.cormorantSCBold,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: Fonts.aeonikRegular,
    marginBottom: 20,
  },
  inputField: {
    height: 59,
    borderRadius: 60,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    fontSize: 16,
    fontFamily: Fonts.aeonikRegular,
    color: '#000',
    borderWidth: 1,
    borderColor: '#fff',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  nextBtn: {
    height: 56,
    width: '100%',
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextText: {
    fontSize: 16,
    lineHeight: 20,
    color: '#fff',
    fontFamily: Fonts.aeonikRegular,
  },
});















// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   StatusBar,
//   Dimensions,
//   ImageBackground,
//   TextInput,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useThemeStore } from '../../../store/useThemeStore';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { AuthStackParamsList } from '../../../navigation/routeTypes';
// import { useNavigation } from '@react-navigation/native';
// import { Fonts } from '../../../constants/fonts';
// import GradientBox from '../../../components/GradientBox';

// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

// const PlaceofBirthScreen_5 = () => {
//   const theme = useThemeStore(state => state.theme);
//   const colors = theme.colors;
//   const navigation =
//     useNavigation<NativeStackNavigationProp<AuthStackParamsList>>();

//   const [place, setPlace] = useState('');

//   return (
//     <ImageBackground
//       source={require('../../../assets/images/bglinearImage.png')}
//       style={[styles.bgImage, { height: SCREEN_HEIGHT, width: SCREEN_WIDTH }]}
//       resizeMode="cover"
//     >
//       <SafeAreaView style={styles.container}>
//         <StatusBar
//           barStyle="light-content"
//           backgroundColor="transparent"
//           translucent
//         />

//         {/* Header with back arrow + progress bar */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <Image
//               source={require('../../../assets/icons/ArrowIcon.png')}
//               style={{ width: 22, height: 22, tintColor: colors.white }}
//               resizeMode="contain"
//             />
//           </TouchableOpacity>

//           {/* Progress Bar */}
//           <View style={styles.progressBarBackground}>
//             <View style={[styles.progressBarFill, { width: '90%' }]} />
//           </View>
//         </View>

//         {/* Heading */}
//         <Text style={[styles.heading, { color: colors.white }]}>
//           Place of Birth
//         </Text>
//         <Text style={[styles.subheading, { color: colors.primary }]}>
//           Please enter your Place of birth
//         </Text>

//         {/*  Input field */}
//         <TextInput
//           style={styles.inputField}
//           placeholder="Enter the place of birth"
//           placeholderTextColor="#999"
//           value={place}
//           onChangeText={setPlace}
//         />
//       </SafeAreaView>

//       {/*  Next Button fixed at bottom */}
//       <View style={styles.footer}>
//         <TouchableOpacity
//           activeOpacity={0.8}
//           onPress={() => navigation.navigate('RelationshipStatus')}
//           style={{ width: '100%' }}
//         >
//           <GradientBox
//             colors={[colors.black, colors.bgBox]}
//             style={[
//               styles.nextBtn,
//               { borderWidth: 1.5, borderColor: colors.primary },
//             ]}
//           >
//             <Text style={styles.nextText}>Next</Text>
//           </GradientBox>
//         </TouchableOpacity>
//       </View>
//     </ImageBackground>
//   );
// };

// export default PlaceofBirthScreen_5;

// const styles = StyleSheet.create({
//   bgImage: {
//     flex: 1,
//   },
//   container: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingTop: 40,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 30,
//   },
//   progressBarBackground: {
//     flex: 1,
//     height: 7,
//     backgroundColor: '#4A3F50',
//     borderRadius: 5,
//     marginLeft: 12,
//     overflow: 'hidden',
//   },
//   progressBarFill: {
//     height: '100%',
//     borderRadius: 5,
//     backgroundColor: '#fff',
//   },
//   heading: {
//     fontSize: 32,
//     lineHeight: 36,
//     textAlign: 'center',
//     fontFamily: Fonts.cormorantSCBold,
//     marginBottom: 8,
//   },
//   subheading: {
//     fontSize: 16,
//     textAlign: 'center',
//     fontFamily: Fonts.aeonikRegular,
//     marginBottom: 20,
//   },
//   inputField: {
//     height: 59,
//     borderRadius: 66,
//     backgroundColor: '#fff',
//     paddingHorizontal: 20,
//     fontSize: 16,
//     fontFamily: Fonts.aeonikRegular,
//     marginBottom: 20,
//   },
//   footer: {
//     position: 'absolute', // ✅ fixed at bottom
//     bottom: 40,
//     left: 20,
//     right: 20,
//   },
//   nextBtn: {
//     height: 56,
//     width: '100%',
//     borderRadius: 65,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   nextText: {
//     fontSize: 16,
//     lineHeight: 20,
//     color: '#fff',
//     fontFamily: Fonts.aeonikRegular,
//   },
// });
