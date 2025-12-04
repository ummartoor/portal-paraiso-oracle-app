import { WisdomHistoryItem } from "../store/useDailyWisdomStore";
import { RitualHistoryItem } from "../store/useRitualTipStore";

export type AppStackParamList = {
  MainTabs: undefined;
  Profile: undefined;
  Notification :undefined;
  AskQuestionTarotScreen:undefined;
VideoPlayerScreen: {
    videoID: string | number; // Changed from videoId
    videoSRC: any;          // Changed from video
  };
  TheSunScreen:undefined;
  TheHoroscopeScreen:undefined;
  TheRitualScreen:undefined;

  TarotCardDetail: { userQuestion: string };
    AskQuestionAstrologyScreen:undefined;
    AstrologyCardDetail:{userQuestion:string};
   
    AskQuestionCariusScreen:undefined;
    CaurisCardDetail:{userQuestion:string};

    DailyWisdomCardScreen:undefined;
    FeaturedOrishaScreen:undefined;
    RitualTipScreen:undefined;
    RecentReadingsScreen:undefined;
    
    TarotReadingHistoryDetail:{readingItem:any};
    AstrologyHistoryDetail:{horoscopeItem:any}
    BuziosHistoryDetail:{history_uid: string };
    DailyWisdomCardHistoryDetail:{ historyItem: WisdomHistoryItem };
RitualTipHistoryDetail: { historyItem: RitualHistoryItem };
    
    ChatDetail :undefined;
  DeleteAccount: undefined;
    SupportScreen: undefined;
      EditProfile: undefined;
      BuySubscription:undefined;
      SubscriptionDetails:undefined;
      PurchaseHistory:undefined;
      TermOfService :undefined;
       SubscriptionTerms :undefined;
       PrivacyPolicy:undefined
};


export type BottomTabBarParamList = {
  Home: undefined;
  Divine: undefined;
  Library: undefined;
 
  Chat:undefined;
};

export type AuthStackParamsList = {
  OnBoarding: undefined;
  WelcomeScreen:undefined;
  Login: undefined;
VerifyLoginOtpScreen: { email: string };
  ForgotPasswordScreen:undefined;
    OTPScreen:{ email: string };
  ConfirmPassword:{ email: string }; 
    SignUp: undefined;
    VerifyEmailScreen:{ email: string }; 
    GenderScreen:undefined;
    GoalScreen:undefined;
    DateofBirth:undefined;
    TimeofBirth:undefined;
    PlaceofBirth:undefined;
    RelationshipStatus:undefined;
    ZodiacSymbol:undefined;

};
