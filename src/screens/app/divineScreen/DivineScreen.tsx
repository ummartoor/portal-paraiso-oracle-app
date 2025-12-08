import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Fonts } from '../../../constants/fonts';
import { useThemeStore } from '../../../store/useThemeStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/routeTypes';
import GradientBox from '../../../components/GradientBox';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type DivineItem = {
  id: string;
  title: string;
  subtitle: string;
  btntitle:string;
  icon: any; 
  route: keyof AppStackParamList;
};

const H_PADDING = 20;
// CHANGED: Full width calculation (Screen width - padding on both sides)
const CARD_WIDTH = SCREEN_WIDTH - H_PADDING * 2;

const DivineScreen: React.FC = () => {
  const { colors } = useThemeStore(s => s.theme);
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { t } = useTranslation();

  const DIVINE_ITEMS: DivineItem[] = [
    {
      id: 'tarot',
      title: t('divine_tarot_title'),
      subtitle: t('divine_tarot_subtitle'),
         btntitle: t('divine_tarot_btn'),
      icon: require('../../../assets/images/divineTarotIcon.png'),
      route: 'AskQuestionTarotScreen',
    },
    {
      id: 'cauris',
      title: t('divine_cauris_title'),
      subtitle: t('divine_cauris_subitle'),
        btntitle: t('divine_cauris_btn'),
      icon: require('../../../assets/images/Caris.png'),
      route: 'AskQuestionCariusScreen',
    },
    {
      id: 'astrology',
      title: t('divine_astrology_title'),
      subtitle: t('divine_astrology_subtitle'),
         btntitle: t('divine_astrology_btn'),
      icon: require('../../../assets/images/devineAsrologyIcon.png'),
      route: 'AskQuestionAstrologyScreen',
    },
  ];

  const renderItem = ({ item }: { item: DivineItem }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate(item.route as any)}
        style={[
          styles.cardWrapper,
          { 
            width: CARD_WIDTH, // Full Width
            marginTop: 20 
          },
        ]}
      >
        {/* Main Card Box */}
        <View style={[styles.card, { backgroundColor: colors.bgBox }]}>
          
          {/* Text Content Area */}
          <View style={styles.textContainer}>
            <Text
              style={[styles.cardTitle, { color: colors.white }]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            
            <Text 
              style={[styles.cardSubtitle, { color: 'rgba(255, 255, 255, 0.7)' }]} 
              numberOfLines={3}
            >
              {item.subtitle}
            </Text>
          </View>

          {/* Button at the bottom */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate(item.route as any)}
            style={styles.actionButtonWrapper}
          >
            <GradientBox
              colors={[colors.bgBox, colors.black]}
              style={[styles.actionGradient, { borderColor: colors.primary }]}
            >
              <Image
                source={require('../../../assets/images/chatAvatar.png')}
                style={styles.buttonIcon}
              />
              <Text style={[styles.buttonText, { color: colors.white }]}>
             {item.btntitle}
              </Text>
            </GradientBox>
          </TouchableOpacity>
        </View>

        {/* Floating Icon - Positioned Absolute outside the card flow */}
        <Image
          source={item.icon}
          style={styles.floatingIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/backgroundImage.png')}
      style={styles.bgImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <View style={styles.titlesBox}>
          <Text
            style={[styles.title, { color: colors.white }]}
            numberOfLines={1}
          >
            {t('divine_screen')}
          </Text>
        </View>
        <FlatList
          style={{ flex: 1 }}
          data={DIVINE_ITEMS}
          keyExtractor={it => it.id}
          // REMOVED: numColumns={2} (defaults to 1)
          contentContainerStyle={{
            paddingTop: 10,
            paddingBottom: insets.bottom + 70,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
        />
      </SafeAreaView>
    </ImageBackground>
  );
};

export default DivineScreen;

const styles = StyleSheet.create({
  bgImage: { flex: 1 },
  container: { flex: 1, paddingHorizontal: H_PADDING },
  titlesBox: { marginTop: 21, alignItems: 'center' },
  title: {
    fontSize: 24,
    lineHeight: 26,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textAlign: 'center',
    fontFamily: Fonts.cormorantSCBold,
    marginBottom: 5,
  },
  
  cardWrapper: {
    height: 200, // Slightly reduced height since width is wider, content fits easier
    marginBottom: 10,
    position: 'relative', 
    overflow: 'visible', 
  },
  
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16, // Increased padding slightly for full width look
    paddingTop: 30, 
    justifyContent: 'space-between',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  textContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingRight: 50, // Added right padding so text doesn't go behind the big icon
  },

  floatingIcon: {
    position: 'absolute',
    top: -24,   
    right: 0, 
    width: 108,  // Made icon slightly bigger for full width card
    height: 108,
    zIndex: 10, 
  },

  cardTitle: {
    fontSize: 20, // Increased font size slightly for full width
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    fontFamily: Fonts.cormorantSCBold,
    marginBottom: 8,
    textAlign: 'left',
  },
  
  cardSubtitle: {
    fontSize: 13, // Increased font size slightly
    fontFamily: Fonts.aeonikRegular,
    lineHeight: 18,
    textAlign: 'left',
    marginRight:12
  },

actionButtonWrapper: {
    width: '80%', // Set width to 80%
    marginTop: 10,
    alignSelf: 'center', // Center the button horizontally
  },
  actionGradient: {
    height: 45, 
   
    borderRadius: 22.5,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

  },
  
  buttonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  
  buttonText: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    letterSpacing: 0.5,
  },
});










// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   StatusBar,
//   Dimensions,
//   ImageBackground,
//   FlatList,
//   TouchableOpacity,
//   Image,
// } from 'react-native';
// import {
//   SafeAreaView,
//   useSafeAreaInsets,
// } from 'react-native-safe-area-context';
// import { Fonts } from '../../../constants/fonts';
// import { useThemeStore } from '../../../store/useThemeStore';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { AppStackParamList } from '../../../navigation/routeTypes';
// import GradientBox from '../../../components/GradientBox';
// import { useTranslation } from 'react-i18next';
// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// type DivineItem = {
//   id: string;
//   title: string;
//   subtitle:string;
//   icon: any; // require(...)
//   route: keyof AppStackParamList;
// };

// const CARD_GAP = 14;
// const H_PADDING = 20;
// const CARD_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - CARD_GAP) / 2;

// const DivineScreen: React.FC = () => {
//   const { colors } = useThemeStore(s => s.theme);
//   const insets = useSafeAreaInsets();
//   const navigation =
//     useNavigation<NativeStackNavigationProp<AppStackParamList>>();
//   const { t } = useTranslation();

//   const DIVINE_ITEMS: DivineItem[] = [
//     {
//       id: 'tarot',
//       title: t('divine_tarot_title'),
//       subtitle: t('carousel_tarot_subtitle'),
//       icon: require('../../../assets/images/TarotReading.png'),
//       route: 'AskQuestionTarotScreen',
//     },
//     {
//       id: 'cauris',
//       title: t('divine_cauris_title'),
//         subtitle: t('carousel_buzious_subtitle'),
//       icon: require('../../../assets/images/Caris.png'),
//       route: 'AskQuestionCariusScreen',
//     },
//     {
//       id: 'astrology',
//       title: t('divine_astrology_title'),
//       subtitle: t('carousel_astrology_subtitle'),
//       icon: require('../../../assets/images/astrology.png'),
//       route: 'AskQuestionAstrologyScreen',
//     },
//   ];
//   const renderItem = ({ item, index }: { item: DivineItem; index: number }) => {
//     const isLeft = index % 2 === 0;
//     return (
//       <TouchableOpacity
//         activeOpacity={0.85}
//         onPress={() => navigation.navigate(item.route as any)}
//         style={[
//           styles.cardWrapper,
//           { width: CARD_WIDTH, marginRight: isLeft ? CARD_GAP : 0 },
//         ]}
//       >
//         <View  style={[styles.card ,{backgroundColor: colors.bgBox}]}>
//           <View style={styles.iconArea}>
//             <Image
//               source={item.icon}
//               style={styles.icon}
//               resizeMode="contain"
//             />
//           </View>
//           <Text
//             style={[styles.cardTitle, { color: colors.white }]}
//             numberOfLines={1}
//           >
//             {item.title}
//           </Text>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <ImageBackground
//       source={require('../../../assets/images/backgroundImage.png')}
//       style={styles.bgImage}
//       resizeMode="cover"
//     >
//       <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
//         <StatusBar
//           barStyle="light-content"
//           backgroundColor="transparent"
//           translucent
//         />
//         <View style={styles.titlesBox}>
//           <Text
//             style={[styles.title, { color: colors.white }]}
//             numberOfLines={1}
//           >
//             {t('divine_screen')}
//           </Text>
//         </View>
//         <FlatList
//           style={{ flex: 1 }}
//           data={DIVINE_ITEMS}
//           keyExtractor={it => it.id}
//           numColumns={2}
//           contentContainerStyle={{
//             paddingTop: 16,
//             paddingBottom: insets.bottom + 70,
//           }}
//           showsVerticalScrollIndicator={false}
//           renderItem={renderItem}
//         />
//       </SafeAreaView>
//     </ImageBackground>
//   );
// };

// export default DivineScreen;

// const styles = StyleSheet.create({
//   bgImage: { flex: 1 },
//   container: { flex: 1, paddingHorizontal: H_PADDING },
//   titlesBox: { marginTop: 21, alignItems: 'center' },
//   title: {
//     fontSize: 24,
//     lineHeight: 26,
//     letterSpacing: 1.2,
//     textTransform: 'uppercase',
//     textAlign: 'center',
//     fontFamily: Fonts.cormorantSCBold,
//     marginBottom: 5,
//   },
//   cardWrapper: {
//     height: 200,
//     borderRadius: 16,
//     overflow: 'hidden',
//     marginBottom: CARD_GAP,
//   },
//   card: {
//     flex: 1,
//     borderRadius: 16,
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     shadowOpacity: 0.25,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 6 },
//     elevation: 6,
    
//   },
//   iconArea: {
//     flex: 1,
//     width: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   icon: { width: 130, height: 130 },
//   cardTitle: {
//     marginTop: 8,
//     marginBottom:15,
//     fontSize: 16,
//     letterSpacing: 1.1,
//     textTransform: 'uppercase',
//     fontFamily: Fonts.cormorantSCBold,
//   },
// });







// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   StatusBar,
//   Dimensions,
//   ImageBackground,
//   FlatList,
//   TouchableOpacity,
//   Image,
// } from 'react-native';
// import {
//   SafeAreaView,
//   useSafeAreaInsets,
// } from 'react-native-safe-area-context';
// import { Fonts } from '../../../constants/fonts';
// import { useThemeStore } from '../../../store/useThemeStore';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { AppStackParamList } from '../../../navigation/routeTypes';
// import GradientBox from '../../../components/GradientBox';
// import { useTranslation } from 'react-i18next';
// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// type DivineItem = {
//   id: string;
//   title: string;
//   icon: any; // require(...)
//   route: keyof AppStackParamList;
// };

// const CARD_GAP = 14;
// const H_PADDING = 20;
// const CARD_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - CARD_GAP) / 2;

// const DivineScreen: React.FC = () => {
//   const { colors } = useThemeStore(s => s.theme);
//   const insets = useSafeAreaInsets();
//   const navigation =
//     useNavigation<NativeStackNavigationProp<AppStackParamList>>();
//   const { t } = useTranslation();

//   const DIVINE_ITEMS: DivineItem[] = [
//     {
//       id: 'tarot',
//       title: t('divine_tarot_title'),
//       icon: require('../../../assets/images/TarotReading.png'),
//       route: 'AskQuestionTarotScreen',
//     },
//     {
//       id: 'cauris',
//       title: t('divine_cauris_title'),
//       icon: require('../../../assets/images/Caris.png'),
//       route: 'AskQuestionCariusScreen',
//     },
//     {
//       id: 'astrology',
//       title: t('divine_astrology_title'),
//       icon: require('../../../assets/images/astrology.png'),
//       route: 'AskQuestionAstrologyScreen',
//     },
//   ];
//   const renderItem = ({ item, index }: { item: DivineItem; index: number }) => {
//     const isLeft = index % 2 === 0;
//     return (
//       <TouchableOpacity
//         activeOpacity={0.85}
//         onPress={() => navigation.navigate(item.route as any)}
//         style={[
//           styles.cardWrapper,
//           { width: CARD_WIDTH, marginRight: isLeft ? CARD_GAP : 0 },
//         ]}
//       >
//         <GradientBox colors={[colors.black, colors.bgBox]} style={styles.card}>
//           <View style={styles.iconArea}>
//             <Image
//               source={item.icon}
//               style={styles.icon}
//               resizeMode="contain"
//             />
//           </View>
//           <Text
//             style={[styles.cardTitle, { color: colors.white }]}
//             numberOfLines={1}
//           >
//             {item.title}
//           </Text>
//         </GradientBox>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <ImageBackground
//       source={require('../../../assets/images/backgroundImage.png')}
//       style={styles.bgImage}
//       resizeMode="cover"
//     >
//       <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
//         <StatusBar
//           barStyle="light-content"
//           backgroundColor="transparent"
//           translucent
//         />
//         <View style={styles.titlesBox}>
//           <Text
//             style={[styles.title, { color: colors.white }]}
//             numberOfLines={1}
//           >
//             {t('divine_screen')}
//           </Text>
//         </View>
//         <FlatList
//           style={{ flex: 1 }}
//           data={DIVINE_ITEMS}
//           keyExtractor={it => it.id}
//           numColumns={2}
//           contentContainerStyle={{
//             paddingTop: 16,
//             paddingBottom: insets.bottom + 70,
//           }}
//           showsVerticalScrollIndicator={false}
//           renderItem={renderItem}
//         />
//       </SafeAreaView>
//     </ImageBackground>
//   );
// };

// export default DivineScreen;

// const styles = StyleSheet.create({
//   bgImage: { flex: 1 },
//   container: { flex: 1, paddingHorizontal: H_PADDING },
//   titlesBox: { marginTop: 21, alignItems: 'center' },
//   title: {
//     fontSize: 24,
//     lineHeight: 26,
//     letterSpacing: 1.2,
//     textTransform: 'uppercase',
//     textAlign: 'center',
//     fontFamily: Fonts.cormorantSCBold,
//     marginBottom: 5,
//   },
//   cardWrapper: {
//     height: 200,
//     borderRadius: 16,
//     overflow: 'hidden',
//     marginBottom: CARD_GAP,
//   },
//   card: {
//     flex: 1,
//     borderRadius: 16,
//     padding: 14,
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     shadowOpacity: 0.25,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 6 },
//     elevation: 6,
//   },
//   iconArea: {
//     flex: 1,
//     width: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   icon: { width: 130, height: 130 },
//   cardTitle: {
//     marginTop: 8,
//     fontSize: 16,
//     letterSpacing: 1.1,
//     textTransform: 'uppercase',
//     fontFamily: Fonts.cormorantSCBold,
//   },
// });
