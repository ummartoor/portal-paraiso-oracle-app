import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  Vibration
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useSharedValue } from "react-native-reanimated";
import { useThemeStore } from "../../../store/useThemeStore";
import { Fonts } from "../../../constants/fonts";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../../navigation/routeTypes";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next"; // --- ADDED ---

// ==== Layout tuning ====
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const VIEWPORT_WIDTH = SCREEN_WIDTH;
const ITEM_WIDTH = SCREEN_WIDTH * 0.72;
const ITEM_HEIGHT = 300;
const CARD_RADIUS = 18;

export type CardItem = {
  id: string | number;
  title: string;
  subtitle?: string;
  image?: any;
  route: keyof AppStackParamList;
};

type Props = {
  data?: CardItem[];
  onPressCard?: (item: CardItem) => void;
};

const CarouselCard: React.FC<Props> = ({ data, onPressCard }) => {
  const { colors } = useThemeStore((s) => s.theme);
  const progress = useSharedValue(0);
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { t } = useTranslation(); // --- ADDED ---

  // --- CHANGED: Default cards array ko component ke andar move kiya gaya hai ---
  const DEFAULT_CARDS: CardItem[] = [
    {
      id: "tarot",
      title: t('carousel_tarot_title'),
      subtitle: t('carousel_tarot_subtitle'),
      image: require("../../../assets/images/TarotReading.png"),
      route: "AskQuestionTarotScreen",
    },
    {
      id: "numero",
      title: t('carousel_buzious_title'),
      subtitle: t('carousel_buzious_subtitle'),
      image: require("../../../assets/images/odu.png"),
      route: "AskQuestionCariusScreen",
    },
    {
      id: "astro",
      title: t('carousel_astrology_title'),
      subtitle: t('carousel_astrology_subtitle'),
      image: require("../../../assets/images/astrology.png"),
      route: "AskQuestionAstrologyScreen",
    },
  ];

  // Use props data if available, otherwise use our translated default cards
  const cardData = data || DEFAULT_CARDS;

  const handlePress = (item: CardItem) => {
    Vibration.vibrate(50); // Lighter vibration

    if (onPressCard) {
      onPressCard(item);
      return;
    }
    if (item.route) {
      navigation.navigate(item.route as any);
    }
  };

  const renderCard = ({ item }: { item: CardItem }) => {
    return (
      <View style={styles.cardWrap}>
        <TouchableOpacity activeOpacity={0.9} onPress={() => handlePress(item)}>
          <ImageBackground
            source={require("../../../assets/images/bgCard.png")}
            style={styles.card}
            resizeMode="cover"
          >
            <View
              style={[
                StyleSheet.absoluteFillObject,
                styles.topFade,
                { borderRadius: CARD_RADIUS },
              ]}
            />
            {item.image ? (
              <Image source={item.image} resizeMode="contain" style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                {/* --- CHANGED --- */}
                <Text style={styles.placeholderText}>{t('carousel_no_image')}</Text>
              </View>
            )}
            <View style={styles.textArea}>
              <Text style={[styles.title, { color: colors.white }]}>{item.title}</Text>
              {!!item.subtitle && (
                <Text style={[styles.subtitle, { color: colors.primary }]}>
                  {item.subtitle}
                </Text>
              )}
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ width: VIEWPORT_WIDTH }}>
      <Carousel
        data={cardData} // Use the translated data
        width={ITEM_WIDTH}
        height={ITEM_HEIGHT}
        style={{ width: VIEWPORT_WIDTH }}
        loop={false}
        pagingEnabled
        snapEnabled
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.85,
          parallaxScrollingOffset: 50,
        }}
        onProgressChange={(_progress, absoluteProgress) => {
          progress.value = absoluteProgress;
        }}
        renderItem={({ item }) => renderCard({ item })}
      />
    </View>
  );
};

export default CarouselCard;

const styles = StyleSheet.create({
  cardWrap: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: ITEM_WIDTH,
    height: 350,
    borderRadius: CARD_RADIUS,
    padding: 30,
    overflow: "hidden",
    justifyContent: "space-between",
    borderColor: "#fff",
    borderWidth: 1,
  },
  topFade: {
    backgroundColor: "transparent",
  },
  image: {
    width: "100%",
    height: 180,
    alignSelf: "center",
  },
  imagePlaceholder: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ffffff22",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 12,
    opacity: 0.8,
  },
  textArea: { marginTop: 8 },
  title: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 22,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  subtitle: {
    marginTop: 6,
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14,
    lineHeight: 18,
    opacity: 0.85,
  },
  borderGlow: {
    position: "absolute",
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    borderRadius: CARD_RADIUS - 2,
    borderWidth: 1,
  },
});












// import React from "react";
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   Dimensions,
//   TouchableOpacity,
//   Platform,
//     ImageBackground,
// } from "react-native";
// import Carousel from "react-native-reanimated-carousel";
// import { useSharedValue } from "react-native-reanimated";
// import { useThemeStore } from "../../../store/useThemeStore";
// import { Fonts } from "../../../constants/fonts";
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { AppStackParamList } from '../../../navigation/routeTypes';
// import { useNavigation } from '@react-navigation/native';
// // ==== Layout tuning ====
// const { width: SCREEN_WIDTH } = Dimensions.get("window");
// const VIEWPORT_WIDTH = SCREEN_WIDTH;       
// const ITEM_WIDTH = SCREEN_WIDTH * 0.72;    
// const ITEM_HEIGHT = 300;
// const CARD_RADIUS = 18;
                 

// export type CardItem = {
//   id: string | number;
//   title: string;
//   subtitle?: string;
//   image?: any; 
// };

// type Props = {
//   data?: CardItem[];
//   onPressCard?: (item: CardItem) => void;
// };

// // cards 
// export const DEFAULT_CARDS: CardItem[] = [
//   {
//    id: "astro",
//     title: "Astrology",
//     subtitle: "Unveil your path through ancient cards of intuition.",
//     image: require("../../../assets/images/astrology.png"),
//   },
//   {
 
//      id: "tarot",
//     title: "Tarot Reading",
//     subtitle: "Decode the stars and your cosmic blueprint.",
//     image: require("../../../assets/images/TarotReading.png"),
//   },
//   {
//     id: "numero",
//     title: "Numerology",
//     subtitle: "Numbers that shape your destiny.",
//     image: require("../../../assets/images/odu.png"),
//   },
// ];
 

// const CarouselCard: React.FC<Props> = ({ data = DEFAULT_CARDS, onPressCard }) => {
//   const { colors } = useThemeStore((s) => s.theme);
//   const progress = useSharedValue(0);
//   const navigation =
//     useNavigation<NativeStackNavigationProp<AppStackParamList>>();



//   const renderCard = ({ item }: { item: CardItem }) => {
//     return (
//       <View style={styles.cardWrap}>
//         <TouchableOpacity activeOpacity={0.9} onPress={() => {   navigation.navigate("AstrologyCardDetail")}}>
      
   
//    <ImageBackground
//       source={require("../../../assets/images/bgCard.png")}
//           style={[styles.card, ]}
//       resizeMode="cover"
//     >
//           <View
//             style={[
//               StyleSheet.absoluteFillObject,
//               styles.topFade,
//               { borderRadius: CARD_RADIUS },
//             ]}
//           />

//           {/* Artwork */}
       
//             <Image source={item.image} resizeMode="contain" style={styles.image} />
        

//           {/* Text */}
//           <View style={styles.textArea}>
//             <Text style={[styles.title, { color: colors.white }]}>{item.title}</Text>
//             {!!item.subtitle && (
//               <Text style={[styles.subtitle, { color: colors.primary }]}>
//                 {item.subtitle}
//               </Text>
//             )}
//           </View>


//           </ImageBackground>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   return (
//     //  Parent view now explicitly spans the screen width
//     <View style={{ width: VIEWPORT_WIDTH  }}>
//       <Carousel
//         data={data}
//         width={ITEM_WIDTH}
//         height={ITEM_HEIGHT}
       
//         style={{ width: VIEWPORT_WIDTH, }}
//         loop={false}
        
 
//         pagingEnabled
//         snapEnabled
//         mode="parallax"
//         modeConfig={{
//           parallaxScrollingScale: 0.85,   
//           parallaxScrollingOffset:50,    
//         }}

//         // make sure this returns void
//         onProgressChange={(_progress, absoluteProgress) => {
//           progress.value = absoluteProgress;
//         }}
//         renderItem={({ item }) => renderCard({ item })}
//       />
//     </View>
//   );
// };

// export default CarouselCard;

// const styles = StyleSheet.create({
//   cardWrap: {
//     height: ITEM_HEIGHT,
//     justifyContent: "center",
//     alignItems: "center",


//   },
//   card: {
//     width: ITEM_WIDTH,
//     height: 350,
//     borderRadius: CARD_RADIUS,
//     padding: 30,
//     overflow: "hidden",
//     justifyContent: "space-between",
//     borderColor:'#fff',
//     borderWidth:1

//   },
//   topFade: {
//     backgroundColor: "transparent",
//   },
//   image: {
//     width: "100%",
//     height: 180,
//     alignSelf: "center",
//   },
//   imagePlaceholder: {
//     width: "100%",
//     height: 180,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#ffffff22",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   placeholderText: {
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 12,
//     opacity: 0.8,
//   },
//   textArea: { marginTop: 8 },
//   title: {
//     fontFamily: Fonts.cormorantSCBold,
//     fontSize: 22,
//     letterSpacing: 0.5,
//     textTransform: "uppercase",
//   },
//   subtitle: {
//     marginTop: 6,
//     fontFamily: Fonts.aeonikRegular,
//     fontSize: 14,
//     lineHeight: 18,
//     opacity: 0.85,
//   },
//   borderGlow: {
//     position: "absolute",
//     top: 6,
//     left: 6,
//     right: 6,
//     bottom: 6,
//     borderRadius: CARD_RADIUS - 2,
//     borderWidth: 1,
//   },
// });
