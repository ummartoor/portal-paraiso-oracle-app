
export type AppStackParamList = {
  MainTabs: undefined;
  Profile: undefined;
  AskQuestionTarotScreen:undefined;
  TarotCardDetail: { userQuestion: string };
    AskQuestionAstrologyScreen:undefined;
    AstrologyCardDetail:{userQuestion:string};
   
    AskQuestionCariusScreen:undefined;
    CaurisCardDetail:undefined;

    DailyWisdomCardScreen:undefined;
    FeaturedOrishaScreen:undefined;
    RitualTipScreen:undefined;
    RecentReadingsScreen:undefined;
    
    TarotReadingHistoryDetail:{readingItem:any};
    AstrologyHistoryDetail:{horoscopeItem:any}
  DeleteAccount: undefined;
    SupportScreen: undefined;
      EditProfile: undefined;
      BuySubscription:undefined;
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
  ForgotPasswordScreen:undefined;
    OTPScreen:{ email: string };
  ConfirmPassword:{ email: string }; 
    SignUp: undefined;
    GenderScreen:undefined;
    GoalScreen:undefined;
    DateofBirth:undefined;
    TimeofBirth:undefined;
    PlaceofBirth:undefined;
    RelationshipStatus:undefined;
    ZodiacSymbol:undefined;

};
