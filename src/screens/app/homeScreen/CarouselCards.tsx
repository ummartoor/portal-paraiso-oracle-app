// import React from "react";
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   Dimensions,
//   TouchableOpacity,
//   ImageBackground,
//   Vibration
// } from "react-native";
// import Carousel from "react-native-reanimated-carousel";
// import { useSharedValue } from "react-native-reanimated";
// import { useThemeStore } from "../../../store/useThemeStore";
// import { Fonts } from "../../../constants/fonts";
// import { NativeStackNavigationProp } from "@react-navigation/native-stack";
// import { AppStackParamList } from "../../../navigation/routeTypes";
// import { useNavigation } from "@react-navigation/native";
// import { useTranslation } from "react-i18next"; // --- ADDED ---

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
//   route: keyof AppStackParamList;
// };

// type Props = {
//   data?: CardItem[];
//   onPressCard?: (item: CardItem) => void;
// };

// const CarouselCard: React.FC<Props> = ({ data, onPressCard }) => {
//   const { colors } = useThemeStore((s) => s.theme);
//   const progress = useSharedValue(0);
//   const navigation =
//     useNavigation<NativeStackNavigationProp<AppStackParamList>>();
//   const { t } = useTranslation(); // --- ADDED ---

//   // --- CHANGED: Default cards array ko component ke andar move kiya gaya hai ---
//   const DEFAULT_CARDS: CardItem[] = [
//     {
//       id: "tarot",
//       title: t('carousel_tarot_title'),
//       subtitle: t('carousel_tarot_subtitle'),
//       image: require("../../../assets/images/TarotReading.png"),
//       route: "AskQuestionTarotScreen",
//     },
//     {
//       id: "numero",
//       title: t('carousel_buzious_title'),
//       subtitle: t('carousel_buzious_subtitle'),
//       image: require("../../../assets/images/odu.png"),
//       route: "AskQuestionCariusScreen",
//     },
//     {
//       id: "astro",
//       title: t('carousel_astrology_title'),
//       subtitle: t('carousel_astrology_subtitle'),
//       image: require("../../../assets/images/astrology.png"),
//       route: "AskQuestionAstrologyScreen",
//     },
//   ];

//   // Use props data if available, otherwise use our translated default cards
//   const cardData = data || DEFAULT_CARDS;

//   const handlePress = (item: CardItem) => {
//       Vibration.vibrate([0, 35, 40, 35]); 

//     if (onPressCard) {
//       onPressCard(item);
//       return;
//     }
//     if (item.route) {
//       navigation.navigate(item.route as any);
//     }
//   };

//   const renderCard = ({ item }: { item: CardItem }) => {
//     return (
//       <View style={styles.cardWrap}>
//         <TouchableOpacity activeOpacity={0.9} onPress={() => handlePress(item)}>
//           <ImageBackground
//             source={require("../../../assets/images/bgCard.png")}
//             style={styles.card}
//             resizeMode="cover"
//           >
//             <View
//               style={[
//                 StyleSheet.absoluteFillObject,
//                 styles.topFade,
//                 { borderRadius: CARD_RADIUS },
//               ]}
//             />
//             {item.image ? (
//               <Image source={item.image} resizeMode="contain" style={styles.image} />
//             ) : (
//               <View style={styles.imagePlaceholder}>
//                 {/* --- CHANGED --- */}
//                 <Text style={styles.placeholderText}>{t('carousel_no_image')}</Text>
//               </View>
//             )}
//             <View style={styles.textArea}>
//               <Text style={[styles.title, { color: colors.white }]}>{item.title}</Text>
//               {!!item.subtitle && (
//                 <Text style={[styles.subtitle, { color: colors.primary }]}>
//                   {item.subtitle}
//                 </Text>
//               )}
//             </View>
//           </ImageBackground>
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   return (
//     <View style={{ width: VIEWPORT_WIDTH }}>
//       <Carousel
//         data={cardData} // Use the translated data
//         width={ITEM_WIDTH}
//         height={ITEM_HEIGHT}
//         style={{ width: VIEWPORT_WIDTH }}
//         loop={false}
//         pagingEnabled
//         snapEnabled
//         mode="parallax"
//         modeConfig={{
//           parallaxScrollingScale: 0.85,
//           parallaxScrollingOffset: 50,
//         }}
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
//     borderColor: "#fff",
//     borderWidth: 1,
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






import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ImageBackground,
  Vibration,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";

import { useThemeStore } from "../../../store/useThemeStore";
import { Fonts } from "../../../constants/fonts";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../../navigation/routeTypes";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";


const { width: SCREEN_WIDTH } = Dimensions.get("window");
const VIEWPORT_WIDTH = SCREEN_WIDTH;


const SNAP_WIDTH = SCREEN_WIDTH * 0.7;

const GAP = 16;

const ITEM_WIDTH = SNAP_WIDTH - GAP;


const ITEM_HEIGHT = 200;
const CARD_RADIUS = 18;

export type CardItem = {
  id: string | number;
  title: string;
  // --- REMOVED subtitle ---
  image?: any;
  route: keyof AppStackParamList;
};

type Props = {
  data?: CardItem[];
  onPressCard?: (item: CardItem) => void;
};

const CarouselCard: React.FC<Props> = ({ data, onPressCard }) => {
  const { colors } = useThemeStore((s) => s.theme);

  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { t } = useTranslation();

  const DEFAULT_CARDS: CardItem[] = [
    {
      id: "tarot",
      title: t("carousel_tarot_title"),

      image: require("../../../assets/images/TarotReading.png"),
      route: "AskQuestionTarotScreen",
    },
    {
      id: "numero",
      title: t("carousel_buzious_title"),

      image: require("../../../assets/images/odu.png"),
      route: "AskQuestionCariusScreen",
    },
    {
      id: "astro",
      title: t("carousel_astrology_title"),

      image: require("../../../assets/images/astrology.png"),
      route: "AskQuestionAstrologyScreen",
    },
  ];

  // Use props data if available, otherwise use our translated default cards
  const cardData = data || DEFAULT_CARDS;

  const handlePress = (item: CardItem) => {
    Vibration.vibrate([0, 35, 40, 35]);

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
              <Image
                source={item.image}
                resizeMode="contain"
                style={styles.image}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderText}>
                  {t("carousel_no_image")}
                </Text>
              </View>
            )}
            <View style={styles.textArea}>
              <Text style={[styles.title, { color: colors.white }]}>
                {item.title}
              </Text>
              {/* --- REMOVED Subtitle Text View --- */}
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ width: VIEWPORT_WIDTH }}>
      {/* --- ADDED Main Title and Subtitle --- */}
      <View style={styles.headerContainer}>
        <Text style={[styles.mainTitle, { color: colors.white }]}>
          {t("carousel_header_title")}
        </Text>
        <Text style={[styles.mainSubtitle, { color: colors.white }]}>
          {t("carousel_header_subtitle")}
        </Text>
      </View>

      <Carousel
        data={cardData} 
        width={SNAP_WIDTH} 
        height={ITEM_HEIGHT}
        style={{ width: VIEWPORT_WIDTH }}
        loop={false}
        pagingEnabled
        snapEnabled
        containerStyle={{paddingHorizontal:16}}
        renderItem={({ item }) => renderCard({ item })}
      />
    </View>
  );
};

export default CarouselCard;

const styles = StyleSheet.create({

  headerContainer: {
    paddingHorizontal: 20, 
    marginBottom: 16,
  },
  mainTitle: {
    fontFamily: Fonts.cormorantSCBold,
   fontSize: 22,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  mainSubtitle: {
    fontFamily: Fonts.aeonikRegular,
    fontSize: 14, 
    opacity: 0.85,
    marginTop: 4,
  },

  cardWrap: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
 
  },
  card: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT, 
    borderRadius: CARD_RADIUS,
    padding: 20,
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
    height: 120,
    alignSelf: "center",
  },
  imagePlaceholder: {
    width: "100%",
    height: 120,
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
  textArea: { marginTop: 10},
  title: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 20,
    letterSpacing: 0.5,
    textAlign:'center',
    textTransform: "uppercase",
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