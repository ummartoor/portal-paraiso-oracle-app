// An interface defines the shape of our data objects
interface OnboardingItem {
  id: number;
  titleKey: string;    // --- CHANGED from 'title' ---
  subtitleKey: string; // --- CHANGED from 'subtitle' ---
  video: any;
}

export const OnboardingData: OnboardingItem[] = [
    {
        id: 1,
        titleKey: "onboarding1_title",     // --- CHANGED ---
        subtitleKey: "onboarding1_subtitle", // --- CHANGED ---
        video: require("../assets/videos/onboardingVideo1.mp4"),
    },
    {
        id: 2,
        titleKey: "onboarding2_title",     // --- CHANGED ---
        subtitleKey: "onboarding2_subtitle", // --- CHANGED ---
        video: require("../assets/videos/onboardingVideo2.mp4"),
    },
    {
        id: 3,
        titleKey: "onboarding3_title",     // --- CHANGED ---
        subtitleKey: "onboarding3_subtitle", // --- CHANGED ---
        video: require("../assets/videos/onboardingVideo3.mp4"),
    },
];
