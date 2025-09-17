
export type AppStackParamList = {
  MainTabs: undefined;
  Profile: undefined;
  AskQuestionTarotScreen:undefined;
    TarotCardDetail:undefined; 
    AskQuestionAstrologyScreen:undefined;
    AstrologyCardDetail:undefined;
   
    AskQuestionCariusScreen:undefined;
    CaurisCardDetail:undefined;
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
