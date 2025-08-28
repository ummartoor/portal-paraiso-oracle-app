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
// import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
// import { Fonts } from '../../../constants/fonts';
// import { useThemeStore } from '../../../store/useThemeStore';
// import { useNavigation } from "@react-navigation/native";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import { AppStackParamList } from "../../../navigation/routeTypes"; 
// import GradientBox from '../../../components/GradientBox';

// const { width: SCREEN_WIDTH } = Dimensions.get('window');


// type DivineItem = {
//   id: string;
//   title: string;
//   icon: any; // require(...)
// };

// const DIVINE_ITEMS: DivineItem[] = [
//   { id: 'tarot',     title: 'Tarot Reading', icon: require('../../../assets/images/TarotReading.png') },
//   { id: 'astrology', title: 'Astrology',     icon: require('../../../assets/images/astrology.png')},
//   { id: 'cauris',    title: 'Cauris',        icon: require('../../../assets/images/Caris.png') },
//   { id: 'buzios',    title: 'Búzios',        icon: require('../../../assets/images/buzios.png') },
//   { id: 'odu',       title: 'ODU',           icon: require('../../../assets/images/odu.png') },
//   { id: 'sixteen',   title: '16 Principal',  icon: require('../../../assets/images/principal.png') },
// ];

// const CARD_GAP = 14;
// const H_PADDING = 20;

// const CARD_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - CARD_GAP) / 2;

// const DivineScreen: React.FC = () => {
//   const { colors } = useThemeStore(s => s.theme);
//   const insets = useSafeAreaInsets();
//   const navigation =
//     useNavigation<NativeStackNavigationProp< AppStackParamList >>();
//   const renderItem = ({ item, index }: { item: DivineItem; index: number }) => {
//     const isLeft = index % 2 === 0;
//     return (
//       <TouchableOpacity
//         activeOpacity={0.85}
//         onPress={() => {

//         }}
//         style={[
//           styles.cardWrapper,
//           {
//             width: CARD_WIDTH,
//             marginRight: isLeft ? CARD_GAP : 0,
//           },
//         ]}
//       >
//         <GradientBox colors={[colors.black, colors.bgBox]} style={styles.card}>
//           <View style={styles.iconArea}>
//             <Image source={item.icon} style={styles.icon} resizeMode="contain" />
//           </View>

//           <Text style={[styles.cardTitle, { color: colors.white }]} numberOfLines={1}>
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
//         <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

//         {/* Title */}
//         <View style={styles.titlesBox}>
//           <Text style={[styles.title, { color: colors.white }]} numberOfLines={1}>
//             Divine
//           </Text>
//         </View>

//         {/* Grid (2 columns) */}
//         <FlatList
//           style={{ flex: 1 }}          
//           data={DIVINE_ITEMS}
//           keyExtractor={(it) => it.id}
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

//   container: {
//     flex: 1,
//     paddingHorizontal: H_PADDING,
//   },

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


// screens/Divine/DivineScreen.tsx
import React from 'react';
import {
  View, Text, StyleSheet, StatusBar, Dimensions, ImageBackground,
  FlatList, TouchableOpacity, Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '../../../constants/fonts';
import { useThemeStore } from '../../../store/useThemeStore';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../../navigation/routeTypes";
import GradientBox from '../../../components/GradientBox';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type DivineItem = {
  id: string;
  title: string;
  icon: any; // require(...)
  route: keyof AppStackParamList;
};

const DIVINE_ITEMS: DivineItem[] = [
  { id: 'tarot',     title: 'Tarot Reading',  icon: require('../../../assets/images/TarotReading.png'), route: 'TarotCardDetail' },
  { id: 'astrology', title: 'Astrology',      icon: require('../../../assets/images/astrology.png'),    route: 'AstrologyCardDetail' },
  { id: 'cauris',    title: 'Cauris',         icon: require('../../../assets/images/Caris.png'),        route: 'NumerologyCardDetail' },

];

const CARD_GAP = 14;
const H_PADDING = 20;
const CARD_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - CARD_GAP) / 2;

const DivineScreen: React.FC = () => {
  const { colors } = useThemeStore(s => s.theme);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const renderItem = ({ item, index }: { item: DivineItem; index: number }) => {
    const isLeft = index % 2 === 0;
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate(item.route)}
        style={[
          styles.cardWrapper,
          { width: CARD_WIDTH, marginRight: isLeft ? CARD_GAP : 0 },
        ]}
      >
        <GradientBox colors={[colors.black, colors.bgBox]} style={styles.card}>
          <View style={styles.iconArea}>
            <Image source={item.icon} style={styles.icon} resizeMode="contain" />
          </View>
          <Text style={[styles.cardTitle, { color: colors.white }]} numberOfLines={1}>
            {item.title}
          </Text>
        </GradientBox>
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
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View style={styles.titlesBox}>
          <Text style={[styles.title, { color: colors.white }]} numberOfLines={1}>Divine</Text>
        </View>
        <FlatList
          style={{ flex: 1 }}
          data={DIVINE_ITEMS}
          keyExtractor={(it) => it.id}
          numColumns={2}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 70 }}
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
    fontSize: 24, lineHeight: 26, letterSpacing: 1.2, textTransform: 'uppercase',
    textAlign: 'center', fontFamily: Fonts.cormorantSCBold, marginBottom: 5,
  },
  cardWrapper: {
    height: 200, borderRadius: 16, overflow: 'hidden', marginBottom: CARD_GAP,
  },
  card: {
    flex: 1, borderRadius: 16, padding: 14, justifyContent: 'space-between', alignItems: 'center',
    shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
  iconArea: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' },
  icon: { width: 130, height: 130 },
  cardTitle: {
    marginTop: 8, fontSize: 16, letterSpacing: 1.1, textTransform: 'uppercase',
    fontFamily: Fonts.cormorantSCBold,
  },
});
