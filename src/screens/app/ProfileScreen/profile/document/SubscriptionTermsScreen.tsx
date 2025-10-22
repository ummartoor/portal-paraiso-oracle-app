import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  ImageBackground,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { Fonts } from '../../../../../constants/fonts';
import { useThemeStore } from '../../../../../store/useThemeStore';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

const SubscriptionTermsScreen = () => {
  const colors = useThemeStore(s => s.theme.colors);
  const navigation = useNavigation<any>();

  return (
    <ImageBackground
      source={require('../../../../../assets/images/backgroundImage.png')}
      style={[styles.bgImage, { height: SCREEN_HEIGHT, width: SCREEN_WIDTH }]}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Image
              source={require('../../../../../assets/icons/backIcon.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap} pointerEvents="none">
            <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.headerTitle, { color: colors.white }]}>
              Terms & Conditions
            </Text>
          </View>
        </View>

        {/* --- NEW: Scrollable Content --- */}
        <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollInner}
            showsVerticalScrollIndicator={false}
        >
            <Text style={[styles.lastUpdated, {color: colors.white}]}>Last updated: October 2025</Text>
            
            <Text style={[styles.paragraph, {color: colors.white}]}>
                Welcome to Portal Paraíso, a spiritual and digital platform that combines ancient wisdom with modern artificial intelligence.
                These Terms and Conditions (“Terms”) govern your use of our website, mobile app, and all related services provided by Portal Paraíso.
                By accessing or using the Portal Paraíso website or app, you agree to be bound by these Terms.
                If you do not agree, please do not use our services.
            </Text>

            <Text style={[styles.heading, {color: colors.primary}]}>1. Description of Services</Text>
            <Text style={[styles.paragraph, {color: colors.white}]}>
                Portal Paraíso provides a hybrid spiritual experience through:
            </Text>
            <View style={styles.listItem}>
                <Text style={[styles.bullet, {color: colors.white}]}>•</Text>
                <Text style={[styles.paragraph, {color: colors.white}]}>
                    <Text style={styles.bold}>Online Store –</Text> Sale of spiritual and esoteric products such as Orixá and Catholic images, ritual candles, incense, and accessories.
                </Text>
            </View>
             <View style={styles.listItem}>
                <Text style={[styles.bullet, {color: colors.white}]}>•</Text>
                <Text style={[styles.paragraph, {color: colors.white}]}>
                    <Text style={styles.bold}>App Oracles –</Text> Digital divination tools including Ifá, Tarot Lenormand, and Astrology, partially powered by artificial intelligence (AI).
                </Text>
            </View>
             <View style={styles.listItem}>
                <Text style={[styles.bullet, {color: colors.white}]}>•</Text>
                <Text style={[styles.paragraph, {color: colors.white}]}>
                    <Text style={styles.bold}>AI Oracle –</Text> A virtual spiritual entity that introduces users to the oracles and assists in navigation.
                </Text>
            </View>
             <View style={styles.listItem}>
                <Text style={[styles.bullet, {color: colors.white}]}>•</Text>
                <Text style={[styles.paragraph, {color: colors.white}]}>
                    <Text style={styles.bold}>Future Online Consultations –</Text> Human-guided consultations may be offered later through the app.
                </Text>
            </View>
            <Text style={[styles.paragraph, {color: colors.white, marginTop: 10}]}>
                All products and digital readings are designed for spiritual and entertainment purposes only and should not replace professional, medical, psychological, or financial advice.
            </Text>

            <Text style={[styles.heading, {color: colors.primary}]}>2. User Eligibility</Text>
            <Text style={[styles.paragraph, {color: colors.white}]}>
                You must be at least 18 years old to use Portal Paraíso or make purchases.
                By using the app or site, you represent that all information provided is accurate and that you will not use the platform for unlawful purposes.
            </Text>

            <Text style={[styles.heading, {color: colors.primary}]}>3. Payments and Subscriptions</Text>
            <Text style={[styles.paragraph, {color: colors.white}]}>
                Portal Paraíso offers:
            </Text>
            <View style={styles.listItem}>
                 <Text style={[styles.bullet, {color: colors.white}]}>•</Text>
                 <Text style={[styles.paragraph, {color: colors.white}]}>One-time purchases through the online shop.</Text>
            </View>
            <View style={styles.listItem}>
                 <Text style={[styles.bullet, {color: colors.white}]}>•</Text>
                 <Text style={[styles.paragraph, {color: colors.white}]}>Paid consultations and subscription plans (such as Portal Paraíso VIP) for extended access to oracles and features.</Text>
            </View>
            <Text style={[styles.paragraph, {color: colors.white, marginTop: 10}]}>
                Payments are securely processed via third-party platforms (e.g., Stripe, PayPal, App Store, Google Play).
                By purchasing, you agree to their respective terms and refund policies.
                Prices are displayed in euros (EUR) and, where applicable, Brazilian reais (BRL).
                Portal Paraíso reserves the right to modify prices and plans at any time, with notice provided on the website or app.
            </Text>

            <Text style={[styles.heading, {color: colors.primary}]}>4. Intellectual Property</Text>
            <Text style={[styles.paragraph, {color: colors.white}]}>
                All content, graphics, text, videos, designs, and software related to Portal Paraíso are the intellectual property of Portal Paraíso © 2025.
                You may not copy, modify, or distribute any material without written permission.
            </Text>

            <Text style={[styles.heading, {color: colors.primary}]}>5. Spiritual and Entertainment Disclaimer</Text>
            <Text style={[styles.paragraph, {color: colors.white}]}>
                Portal Paraíso’s readings, oracles, and consultations are intended for spiritual insight, inspiration, and entertainment.
                They do not replace medical, psychological, financial, or legal advice.
                Users are responsible for their own interpretations and decisions derived from readings or guidance received within the app or store.
            </Text>
            
            <Text style={[styles.heading, {color: colors.primary}]}>6. Use of Artificial Intelligence</Text>
            <Text style={[styles.paragraph, {color: colors.white}]}>
                Portal Paraíso employs AI systems (including the Oracle) to provide personalized responses and product recommendations.
                All AI-generated content is produced automatically and may not always be accurate or suitable for all contexts.
                By using the platform, you acknowledge that interactions with AI are for informational and entertainment purposes only.
            </Text>
            
            <Text style={[styles.heading, {color: colors.primary}]}>7. Future Online Consultations</Text>
            <Text style={[styles.paragraph, {color: colors.white}]}>
                In future updates, Portal Paraíso may introduce human-led consultations.
                These services will be offered only by authorized spiritual practitioners selected by the company.
                Users will be required to agree to additional terms before accessing live consultations, including data processing for scheduling and communication.
            </Text>

            <Text style={[styles.heading, {color: colors.primary}]}>8. User Responsibilities</Text>
            <Text style={[styles.paragraph, {color: colors.white}]}>
                You agree to:
            </Text>
            <View style={styles.listItem}>
                 <Text style={[styles.bullet, {color: colors.white}]}>•</Text>
                 <Text style={[styles.paragraph, {color: colors.white}]}>Use the app and website ethically and respectfully.</Text>
            </View>
            <View style={styles.listItem}>
                 <Text style={[styles.bullet, {color: colors.white}]}>•</Text>
                 <Text style={[styles.paragraph, {color: colors.white}]}>Not upload or transmit offensive or illegal content.</Text>
            </View>
            <View style={styles.listItem}>
                 <Text style={[styles.bullet, {color: colors.white}]}>•</Text>
                 <Text style={[styles.paragraph, {color: colors.white}]}>Not interfere with the technical operation or attempt to access other users’ data.</Text>
            </View>
            <Text style={[styles.paragraph, {color: colors.white, marginTop: 10}]}>
                Portal Paraíso reserves the right to suspend or terminate accounts violating these Terms.
            </Text>

            <Text style={[styles.heading, {color: colors.primary}]}>9. Limitation of Liability</Text>
            <Text style={[styles.paragraph, {color: colors.white}]}>
                Portal Paraíso is not liable for any direct, indirect, or consequential damages resulting from the use or inability to use our services.
                We do not guarantee the accuracy, completeness, or reliability of divinatory or AI-generated content.
            </Text>

            <Text style={[styles.heading, {color: colors.primary}]}>10. Modifications to the Terms</Text>
            <Text style={[styles.paragraph, {color: colors.white}]}>
                Portal Paraíso reserves the right to modify or update these Terms at any time.
                Users will be notified of significant changes through the app or website.
                Continued use of the platform after such updates constitutes acceptance of the revised Terms.
            </Text>

            <Text style={[styles.heading, {color: colors.primary}]}>11. Governing Law and Jurisdiction</Text>
            <Text style={[styles.paragraph, {color: colors.white}]}>
                These Terms shall be governed by and interpreted in accordance with the laws of Portugal.
                Any disputes arising under or related to these Terms shall be subject to the exclusive jurisdiction of the Portuguese courts.
            </Text>

            <Text style={[styles.heading, {color: colors.primary}]}>Contact</Text>
            <Text style={[styles.paragraph, {color: colors.white}]}>
                For any questions regarding these Terms, please contact us at:
            </Text>

        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default SubscriptionTermsScreen;

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.select({ ios: 0, android: 10 }),
  },
  header: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  backBtn: {
    position: 'absolute',
    left: 0,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { width: 22, height: 22, tintColor: '#fff' },
  headerTitleWrap: { maxWidth: '70%', alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    fontFamily: Fonts.cormorantSCBold,
    fontSize: 22,
    letterSpacing: 1,
    textTransform: 'capitalize',
  },
  scrollView: {
      flex: 1,
  },
  scrollInner: {
    paddingBottom: 40,
  },
  lastUpdated: {
      fontFamily: Fonts.aeonikRegular,
      fontSize: 12,
      opacity: 0.7,
      marginBottom: 20,
  },
  paragraph: {
      fontFamily: Fonts.aeonikRegular,
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 10,
      textAlign: 'left',
      flex: 1,
  },
  heading: {
      fontFamily: Fonts.cormorantSCBold,
      fontSize: 18,
      marginTop: 15,
      marginBottom: 10,
  },
  bold: {
      fontFamily: Fonts.aeonikBold,
  },
  listItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 5,
  },
  bullet: {
      fontSize: 16,
      marginRight: 8,
      lineHeight: 22,
  },
});
