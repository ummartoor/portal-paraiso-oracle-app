import React, { Suspense } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AppStackParamList } from './routeTypes';
import MainTabs from './MainTabs';

// Lazy load all screens for better performance and smaller initial bundle
const DeleteAccountScreen = React.lazy(
  () =>
    import('../screens/app/ProfileScreen/profile/general/DeleteAccountScreen'),
);
const SupportScreen = React.lazy(
  () => import('../screens/app/ProfileScreen/profile/general/SupportScreen'),
);
const EditProfileScreen = React.lazy(
  () =>
    import(
      '../screens/app/ProfileScreen/profile/editProfile/EditProfileScreen'
    ),
);
const TermOfServiceScreen = React.lazy(
  () =>
    import('../screens/app/ProfileScreen/profile/document/TermOfServiceScreen'),
);
const BuySubscriptionScreen = React.lazy(
  () =>
    import(
      '../screens/app/ProfileScreen/profile/subscription/BuySubscriptionScreen'
    ),
);
const SubscriptionTermsScreen = React.lazy(
  () =>
    import(
      '../screens/app/ProfileScreen/profile/document/SubscriptionTermsScreen'
    ),
);
const PrivacyPolicyScreen = React.lazy(
  () =>
    import('../screens/app/ProfileScreen/profile/document/PrivacyPolicyScreen'),
);
const AstrologyCardDetailScreen = React.lazy(
  () =>
    import(
      '../screens/app/homeScreen/carouselCardDetail/astrologyCardDetail/AstrologyCardDetailScreen'
    ),
);
const AskQuestionAstrologyScreen = React.lazy(
  () =>
    import(
      '../screens/app/homeScreen/carouselCardDetail/astrologyCardDetail/AskQuestionAstrologyScreen'
    ),
);
const TarotCardDetailScreen = React.lazy(
  () =>
    import(
      '../screens/app/homeScreen/carouselCardDetail/TarotCardDetail/TarotCardDetailScreen'
    ),
);
const AskQuestionTarotScreen = React.lazy(
  () =>
    import(
      '../screens/app/homeScreen/carouselCardDetail/TarotCardDetail/AskQuestionTarotScreen'
    ),
);
const AskQuestionCariusScreen = React.lazy(
  () =>
    import(
      '../screens/app/homeScreen/carouselCardDetail/CariusCardDetail/AskQuestionCariusScreen'
    ),
);
const CaurisCardDetailScreen = React.lazy(
  () =>
    import(
      '../screens/app/homeScreen/carouselCardDetail/CariusCardDetail/CaurisCardDetailScreen'
    ),
);
const DailyWisdomCardScreen = React.lazy(
  () =>
    import('../screens/app/homeScreen/dailyWisdomCard/DailyWisdomCardScreen'),
);
const RitualTipScreen = React.lazy(
  () => import('../screens/app/homeScreen/ritualTip/RitualTipScreen'),
);
const FeaturedOrishaScreen = React.lazy(
  () => import('../screens/app/homeScreen/featuredOrisha/FeaturedOrishaScreen'),
);
const RecentReadingsScreen = React.lazy(
  () => import('../screens/app/homeScreen/recentReadings/RecentReadingsScreen'),
);
const TarotReadingHistoryDetail = React.lazy(
  () => import('../screens/app/libraryScreen/TarotReadingHistoryDetail'),
);
const AstrologyHistoryDetail = React.lazy(
  () => import('../screens/app/libraryScreen/AstrologyHistoryDetail'),
);
const ProfileScreen = React.lazy(
  () => import('../screens/app/ProfileScreen/ProfileScreen'),
);
const BuziosHistoryDetail = React.lazy(
  () => import('../screens/app/libraryScreen/BuziousHistoryDetail'),
);
const ChatDetailScreen = React.lazy(
  () => import('../screens/app/chatScreen/ChatDetailScreen'),
);
const DailyWisdomCardHistoryDetail = React.lazy(
  () => import('../screens/app/libraryScreen/DailyWisdomCardHistoryDetail'),
);
const NotificationScreen = React.lazy(
  () => import('../screens/app/homeScreen/notification/NotificationScreen'),
);
const RitualTipHistoryDetail = React.lazy(
  () => import('../screens/app/libraryScreen/RitualTipHistoryDetail'),
);
const PurchaseHistoryScreen = React.lazy(
  () =>
    import(
      '../screens/app/ProfileScreen/profile/subscription/PurchaseHistoryScreen'
    ),
);
const SubscriptionDetailsScreen = React.lazy(
  () =>
    import(
      '../screens/app/ProfileScreen/profile/subscription/SubscriptionDetailsScreen'
    ),
);
const TheSunScreen = React.lazy(
  () =>
    import(
      '../screens/app/homeScreen/HightlightsCarouselCardsDetail/TheSunScreen'
    ),
);
const TheHoroscopeScreen = React.lazy(
  () =>
    import(
      '../screens/app/homeScreen/HightlightsCarouselCardsDetail/TheHoroscopeScreen'
    ),
);
const TheRitualScreen = React.lazy(
  () =>
    import(
      '../screens/app/homeScreen/HightlightsCarouselCardsDetail/TheRitualScreen'
    ),
);
const VideoPlayerScreen = React.lazy(
  () => import('../screens/app/homeScreen/VideoPlayerScreen'),
);

// Loading fallback component
const LoadingFallback: React.FC = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#D9B699" />
  </View>
);

// Helper function to create lazy screen wrapper
const withLazyLoading = <P extends object>(
  LazyComponent: React.LazyExoticComponent<React.ComponentType<P>>,
) => {
  const WrappedComponent = (props: P) => (
    <Suspense fallback={<LoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
  return WrappedComponent;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="VideoPlayerScreen"
        component={withLazyLoading(VideoPlayerScreen)}
      />
      <Stack.Screen
        name="Notification"
        component={withLazyLoading(NotificationScreen)}
      />
      <Stack.Screen
        name="TheSunScreen"
        component={withLazyLoading(TheSunScreen)}
      />
      <Stack.Screen
        name="TheHoroscopeScreen"
        component={withLazyLoading(TheHoroscopeScreen)}
      />
      <Stack.Screen
        name="TheRitualScreen"
        component={withLazyLoading(TheRitualScreen)}
      />
      <Stack.Screen
        name="AskQuestionTarotScreen"
        component={withLazyLoading(AskQuestionTarotScreen)}
      />
      <Stack.Screen
        name="TarotCardDetail"
        component={withLazyLoading(TarotCardDetailScreen)}
      />
      <Stack.Screen
        name="AskQuestionAstrologyScreen"
        component={withLazyLoading(AskQuestionAstrologyScreen)}
      />
      <Stack.Screen
        name="AstrologyCardDetail"
        component={withLazyLoading(AstrologyCardDetailScreen)}
      />
      <Stack.Screen
        name="AskQuestionCariusScreen"
        component={withLazyLoading(AskQuestionCariusScreen)}
      />
      <Stack.Screen
        name="CaurisCardDetail"
        component={withLazyLoading(CaurisCardDetailScreen)}
      />
      <Stack.Screen
        name="DailyWisdomCardScreen"
        component={withLazyLoading(DailyWisdomCardScreen)}
      />
      <Stack.Screen
        name="FeaturedOrishaScreen"
        component={withLazyLoading(FeaturedOrishaScreen)}
      />
      <Stack.Screen
        name="RitualTipScreen"
        component={withLazyLoading(RitualTipScreen)}
      />
      <Stack.Screen
        name="RecentReadingsScreen"
        component={withLazyLoading(RecentReadingsScreen)}
      />
      <Stack.Screen
        name="TarotReadingHistoryDetail"
        component={withLazyLoading(TarotReadingHistoryDetail)}
      />
      <Stack.Screen
        name="AstrologyHistoryDetail"
        component={withLazyLoading(AstrologyHistoryDetail)}
      />
      <Stack.Screen
        name="BuziosHistoryDetail"
        component={withLazyLoading(BuziosHistoryDetail)}
      />
      <Stack.Screen
        name="DailyWisdomCardHistoryDetail"
        component={withLazyLoading(DailyWisdomCardHistoryDetail)}
      />
      <Stack.Screen
        name="RitualTipHistoryDetail"
        component={withLazyLoading(RitualTipHistoryDetail)}
      />
      <Stack.Screen
        name="ChatDetail"
        component={withLazyLoading(ChatDetailScreen)}
      />
      <Stack.Screen name="Profile" component={withLazyLoading(ProfileScreen)} />
      <Stack.Screen
        name="DeleteAccount"
        component={withLazyLoading(DeleteAccountScreen)}
      />
      <Stack.Screen
        name="SupportScreen"
        component={withLazyLoading(SupportScreen)}
      />
      <Stack.Screen
        name="EditProfile"
        component={withLazyLoading(EditProfileScreen)}
      />
      <Stack.Screen
        name="BuySubscription"
        component={withLazyLoading(BuySubscriptionScreen)}
      />
      <Stack.Screen
        name="PurchaseHistory"
        component={withLazyLoading(PurchaseHistoryScreen)}
      />
      <Stack.Screen
        name="SubscriptionDetails"
        component={withLazyLoading(SubscriptionDetailsScreen)}
      />
      <Stack.Screen
        name="TermOfService"
        component={withLazyLoading(TermOfServiceScreen)}
      />
      <Stack.Screen
        name="SubscriptionTerms"
        component={withLazyLoading(SubscriptionTermsScreen)}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={withLazyLoading(PrivacyPolicyScreen)}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});

export default AppNavigator;
