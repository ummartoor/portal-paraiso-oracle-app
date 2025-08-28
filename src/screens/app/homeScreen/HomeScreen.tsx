import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  ImageBackground,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Fonts } from "../../../constants/fonts";
import { useThemeStore } from "../../../store/useThemeStore";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../../navigation/routeTypes"; // <-- use App stack
import CarouselCard, { DEFAULT_CARDS, CardItem } from "./CarouselCards";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("screen");

type CardBoxProps = {
  label: string;
  isSelected?: boolean;
  onPress?: () => void;
};

const CardBox: React.FC<CardBoxProps> = ({ label, isSelected, onPress }) => {
  const { colors } = useThemeStore((s) => s.theme);
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.cardBox,
        {
          backgroundColor: colors.bgBox,
          borderColor: isSelected ? colors.primary : "transparent",
          borderWidth: isSelected ? 1 : 0,
        },
      ]}
    >
      <Text style={[styles.cardBoxText, { color: colors.white }]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const HomeScreen: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);
  const { colors } = theme;

  // IMPORTANT: App stack navigation, not Auth
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const BOX_ITEMS = [
    { key: "daily", label: "Daily Wisdom card" },
    { key: "orisha", label: "Featured Orisha" },
    { key: "ritual", label: "Ritual Tip" },
    { key: "recent", label: "Recent Readings" },
  ];

  const onPressCarouselCard = (item: CardItem) => {
    if (item.route) {
      navigation.navigate(item.route);
    } else {
      console.warn("No route defined for card:", item.id);
    }
  };

  return (
    <ImageBackground
      source={require("../../../assets/images/backgroundImage.png")}
      style={[styles.bgImage, { height: SCREEN_HEIGHT, width: SCREEN_WIDTH }]}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        {/* FULL SCREEN SCROLL */}
        <ScrollView
          contentContainerStyle={{ paddingBottom: 90 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.headerIconBtn}>
              <Image
                source={require("../../../assets/icons/menuIcon.png")}
                style={styles.headerIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <View style={styles.profileWrap}>
              <Image
                source={require("../../../assets/icons/userprofile.png")}
                style={[styles.profileImg, { borderColor: colors.white }]}
              />
              <View  style={[styles.onlineDot, { borderColor: colors.white }]} />
            </View>

            <TouchableOpacity style={styles.headerIconBtn}>
              <Image
                source={require("../../../assets/icons/notificationIcon.png")}
                style={styles.headerIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* Title & Subtitle */}
          <View style={styles.titlesBox}>
            <Text style={[styles.title, { color: colors.white }]} numberOfLines={1}>
              PORTAL PARAISO
            </Text>
            <Text style={[styles.subtitle, { color: colors.primary }]} numberOfLines={2}>
              Choose your path to divine guidance
            </Text>
          </View>

          {/* Carousel (fixed height, isolated) */}
          <View style={{ marginTop: 22 }}>
            <CarouselCard data={DEFAULT_CARDS} onPressCard={onPressCarouselCard} />
          </View>

          {/* CardBox Section */}
          <View style={styles.cardBoxSection}>
            {BOX_ITEMS.map((item) => (
              <CardBox
                key={item.key}
                label={item.label}
                isSelected={selectedKey === item.key}
                onPress={() =>
                  setSelectedKey((prev) => (prev === item.key ? null : item.key))
                }
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  bgImage: { flex: 1 },
  container: {
    flex: 1,
    paddingTop: 14,
  },

  /* Header */
  headerRow: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerIconBtn: {
    height: 44,
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerIcon: { height: 24, width: 24 },

  profileWrap: {
    height: 60,
    width: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  profileImg: {
    height: 60,
    width: 60,
    borderRadius: 30,
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: "#27C93F",
    borderWidth: 2,
  },

  /* Titles */
  titlesBox: {
    marginTop: 21,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    lineHeight: 26,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    textAlign: "center",
    fontFamily: Fonts.cormorantSCBold,
  },
  subtitle: { marginTop: 6, fontSize: 14, lineHeight: 16, textAlign: "center" },

  /* CardBox Section */
  cardBoxSection: {
    marginTop: 24,
    paddingHorizontal: 20,
    rowGap: 12,
  },
  cardBox: {
    height: 70,
    borderRadius: 25,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  cardBoxText: {
    fontSize: 20,
    fontFamily: Fonts.cormorantSCBold,
    letterSpacing: 0.4,
    textTransform: "capitalize",
  },
});
