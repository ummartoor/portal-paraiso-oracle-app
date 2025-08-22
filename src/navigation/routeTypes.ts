
export type AppStackParamList = {
  MainTabs: undefined;
  Profile: undefined;
   
    TarotCardDetail:undefined;
    AstrologyCardDetail:undefined;
    NumerologyCardDetail:undefined;
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
  Profile: undefined;
};

export type AuthStackParamsList = {
  OnBoarding: undefined;
  WelcomeScreen:undefined;
  Login: undefined;
  ForgotPasswordScreen:undefined;
    OTPScreen:{ email: string };
  ConfirmPassword: undefined; 
    SignUp: undefined;
    GenderScreen:undefined;
    GoalScreen:undefined;
    DateofBirth:undefined;
    TimeofBirth:undefined;
    PlaceofBirth:undefined;
    RelationshipStatus:undefined;

};
