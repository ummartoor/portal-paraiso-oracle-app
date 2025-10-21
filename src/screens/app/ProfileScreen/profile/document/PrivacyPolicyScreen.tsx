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
  Linking, // --- 1. Linking ko import karein ---
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { Fonts } from '../../../../../constants/fonts';
import { useThemeStore } from '../../../../../store/useThemeStore';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('screen');

const PrivacyPolicyScreen = () => {
  const colors = useThemeStore(s => s.theme.colors);
  const navigation = useNavigation<any>();
  
  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

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
              Privacy Policy
            </Text>
          </View>
        </View>

        {/* --- Scrollable Content --- */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollInner}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.lastUpdated, { color: colors.white }]}>Last updated: October 2025</Text>

          <Text style={[styles.paragraph, { color: colors.white }]}>
            Portal Paraíso (“we”, “our”, or “us”) respects your privacy and is committed to protecting your personal data.
            This Privacy Policy explains how we collect, use, and safeguard information when you visit our website, use our app, or interact with our services.
            By accessing or using Portal Paraíso, you agree to this Privacy Policy. If you do not agree, please discontinue use of our services.
          </Text>

          {/* ... Baaki content waisa hi rahega ... */}
            <Text style={[styles.heading, { color: colors.primary }]}>1. Information We Collect</Text>
          <Text style={[styles.paragraph, { color: colors.white }]}>
            We may collect the following types of information when you interact with the Portal Paraíso app or website:
          </Text>

          <Text style={[styles.subheading, { color: colors.white }]}>a) Personal Information</Text>
          <View style={styles.listItem}>
            <Text style={[styles.bullet, { color: colors.white }]}>•</Text>
            <Text style={[styles.paragraph, { color: colors.white }]}>Name, email address, and account details</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={[styles.bullet, { color: colors.white }]}>•</Text>
            <Text style={[styles.paragraph, { color: colors.white }]}>Payment information (processed securely through third-party providers)</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={[styles.bullet, { color: colors.white }]}>•</Text>
            <Text style={[styles.paragraph, { color: colors.white }]}>Device and usage data (IP address, language settings, app version)</Text>
          </View>

          <Text style={[styles.subheading, { color: colors.white }]}>b) Spiritual and Interaction Data</Text>
          <View style={styles.listItem}>
            <Text style={[styles.bullet, { color: colors.white }]}>•</Text>
            <Text style={[styles.paragraph, { color: colors.white }]}>Questions, readings, and preferences entered in the oracles or spiritual tools</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={[styles.bullet, { color: colors.white }]}>•</Text>
            <Text style={[styles.paragraph, { color: colors.white }]}>Interaction data generated during AI consultations and personalized recommendations</Text>
          </View>

          <Text style={[styles.subheading, { color: colors.white }]}>c) Cookies and Analytics</Text>
          <Text style={[styles.paragraph, { color: colors.white }]}>
            We use cookies and analytics tools to understand how users interact with our website and app.
            You can manage cookie preferences through your browser settings.
          </Text>

          <Text style={[styles.heading, { color: colors.primary }]}>2. How We Use Your Information</Text>
          <Text style={[styles.paragraph, { color: colors.white }]}>Your information is used to:</Text>
          <View style={styles.listItem}>
            <Text style={[styles.bullet, { color: colors.white }]}>•</Text>
            <Text style={[styles.paragraph, { color: colors.white }]}>Provide and personalize services and spiritual experiences</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={[styles.bullet, { color: colors.white }]}>•</Text>
            <Text style={[styles.paragraph, { color: colors.white }]}>Process payments and manage subscriptions</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={[styles.bullet, { color: colors.white }]}>•</Text>
            <Text style={[styles.paragraph, { color: colors.white }]}>Improve the performance and content of our app and website</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={[styles.bullet, { color: colors.white }]}>•</Text>
            <Text style={[styles.paragraph, { color: colors.white }]}>Communicate updates, promotions, and user support</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={[styles.bullet, { color: colors.white }]}>•</Text>
            <Text style={[styles.paragraph, { color: colors.white }]}>Ensure compliance with legal and security requirements</Text>
          </View>
          <Text style={[styles.paragraph, { color: colors.white, marginTop: 10 }]}>
            Portal Paraíso may also use AI systems (the Oracle) to analyze user input and provide automated spiritual responses and product suggestions.
          </Text>

          <Text style={[styles.heading, { color: colors.primary }]}>3. Legal Basis for Processing</Text>
          <Text style={[styles.paragraph, { color: colors.white }]}>
            Under the EU General Data Protection Regulation (GDPR), our legal bases for processing personal data include:
          </Text>
          <View style={styles.listItem}>
            <Text style={[styles.bullet, { color: colors.white }]}>•</Text>
            <Text style={[styles.paragraph, { color: colors.white }]}><Text style={styles.bold}>Performance of a contract:</Text> To deliver purchased services or products.</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={[styles.bullet, { color: colors.white }]}>•</Text>
            <Text style={[styles.paragraph, { color: colors.white }]}><Text style={styles.bold}>Consent:</Text> When you opt-in to marketing communications or non-essential cookies.</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={[styles.bullet, { color: colors.white }]}>•</Text>
            <Text style={[styles.paragraph, { color: colors.white }]}><Text style={styles.bold}>Legitimate interest:</Text> To maintain and improve our services securely.</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={[styles.bullet, { color: colors.white }]}>•</Text>
            <Text style={[styles.paragraph, { color: colors.white }]}><Text style={styles.bold}>Legal obligation:</Text> To comply with Portuguese or EU legal requirements.</Text>
          </View>

          <Text style={[styles.heading, { color: colors.primary }]}>4. Data Storage and Security</Text>
          <Text style={[styles.paragraph, { color: colors.white }]}>
            All collected data is stored securely on European servers in compliance with GDPR standards.
            We implement technical and organizational measures to protect against unauthorized access, alteration, disclosure, or destruction of personal data.
            Payment details are processed exclusively by certified third parties (e.g., Stripe, PayPal, App Store, Google Play).
            Portal Paraíso does not store or have direct access to full payment information.
          </Text>

          <Text style={[styles.heading, { color: colors.primary }]}>5. Data Retention</Text>
          <Text style={[styles.paragraph, { color: colors.white }]}>
            We retain personal data only for as long as necessary to fulfill the purposes described in this policy, or as required by law.
            Users can request deletion or anonymization of their data at any time (see section 7 below).
          </Text>

          <Text style={[styles.heading, { color: colors.primary }]}>6. AI and Automated Decision-Making</Text>
          <Text style={[styles.paragraph, { color: colors.white }]}>
            Portal Paraíso uses artificial intelligence (“the Oracle”) to provide personalized readings and experiences.
            AI-generated content is automated and based on user input — it does not make binding decisions or offer professional advice.
            You acknowledge that AI responses are for spiritual and entertainment purposes only.
          </Text>

          <Text style={[styles.heading, { color: colors.primary }]}>7. User Rights (GDPR)</Text>
          <Text style={[styles.paragraph, { color: colors.white }]}>As a user within the European Union, you have the right to:</Text>
          <View style={styles.listItem}>
            <Text style={[styles.bullet, { color: colors.white }]}>•</Text>
            <Text style={[styles.paragraph, { color: colors.white }]}>Access and obtain a copy of your data</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={[styles.bullet, { color: colors.white }]}>•</Text>
            <Text style={[styles.paragraph, { color: colors.white }]}>Request correction of inaccurate data</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={[styles.bullet, { color: colors.white }]}>•</Text>
            <Text style={[styles.paragraph, { color: colors.white }]}>Request deletion (“right to be forgotten”)</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={[styles.bullet, { color: colors.white }]}>•</Text>
            <Text style={[styles.paragraph, { color: colors.white }]}>Restrict or object to processing</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={[styles.bullet, { color: colors.white }]}>•</Text>
            <Text style={[styles.paragraph, { color: colors.white }]}>Request data portability</Text>
          </View>
          
          {/* --- 2. Yahan email ko clickable banayein --- */}
          <Text style={[styles.paragraph, { color: colors.white, marginTop: 10 }]}>
            To exercise these rights, contact us at:{' '}
            <Text style={styles.emailLink} onPress={() => handleEmailPress('portalparaiso25@gmail.com')}>
              portalparaiso25@gmail.com
            </Text>
          </Text>
          <Text style={[styles.paragraph, { color: colors.white }]}>
            We will respond within 30 days of receiving your request.
          </Text>

          <Text style={[styles.heading, { color: colors.primary }]}>8. Sharing of Data</Text>
          <Text style={[styles.paragraph, { color: colors.white }]}>We may share limited data with:</Text>
          <View style={styles.listItem}>
            <Text style={[styles.bullet, { color: colors.white }]}>•</Text>
            <Text style={[styles.paragraph, { color: colors.white }]}><Text style={styles.bold}>Payment processors</Text> (e.g., Stripe, PayPal, App Store, Google Play)</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={[styles.bullet, { color: colors.white }]}>•</Text>
            <Text style={[styles.paragraph, { color: colors.white }]}><Text style={styles.bold}>Hosting and cloud providers</Text> (EU-based, GDPR-compliant)</Text>
          </View>
          <View style={styles.listItem}>
            <Text style={[styles.bullet, { color: colors.white }]}>•</Text>
            <Text style={[styles.paragraph, { color: colors.white }]}><Text style={styles.bold}>Analytics and marketing tools</Text> (for service improvement)</Text>
          </View>
          <Text style={[styles.paragraph, { color: colors.white, marginTop: 10 }]}>
            We do not sell, rent, or trade user data with third parties.
          </Text>

          <Text style={[styles.heading, { color: colors.primary }]}>9. Future Consultations and Data Processing</Text>
          <Text style={[styles.paragraph, { color: colors.white }]}>
            When human-led consultations become available, personal and spiritual information shared during sessions may be processed to schedule appointments, provide the service, and improve quality.
            All consultants will operate under confidentiality and GDPR compliance.
            Users will be asked to accept specific terms before participating in live consultations.
          </Text>

          <Text style={[styles.heading, { color: colors.primary }]}>10. Children’s Privacy</Text>
          <Text style={[styles.paragraph, { color: colors.white }]}>
            Portal Paraíso is intended for users aged 18 and above.
            We do not knowingly collect personal information from minors.
            If you believe a minor has provided us with personal data, please contact us immediately.
          </Text>

          <Text style={[styles.heading, { color: colors.primary }]}>11. Changes to this Privacy Policy</Text>
          <Text style={[styles.paragraph, { color: colors.white }]}>
            Portal Paraíso reserves the right to modify or update this Privacy Policy at any time.
            Updates will be published on our website and in the app.
            Continued use of our services after changes constitutes acceptance of the revised policy.
          </Text>
          
          {/* --- 3. Yahan bhi email ko clickable banayein --- */}
          <Text style={[styles.heading, { color: colors.primary }]}>12. Contact</Text>
          <Text style={[styles.paragraph, { color: colors.white }]}>
            For questions or concerns regarding this Privacy Policy, please contact:{' '}
            <Text style={styles.emailLink} onPress={() => handleEmailPress('Portalparaiso25@gmail.com')}>
              Portalparaiso25@gmail.com.
            </Text>
          </Text>

        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default PrivacyPolicyScreen;

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
  subheading: {
      fontFamily: Fonts.aeonikBold,
      fontSize: 15,
      marginTop: 10,
      marginBottom: 5,
  },
  bold: {
    fontFamily: Fonts.aeonikBold,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
    paddingLeft: 10,
  },
  bullet: {
    fontSize: 16,
    marginRight: 8,
    lineHeight: 22,
  },
  // --- 4. Email ke liye naya style add karein ---
  emailLink: {
    color: '#D9B699', // Link jaisa color
    textDecorationLine: 'underline',
  },
});

