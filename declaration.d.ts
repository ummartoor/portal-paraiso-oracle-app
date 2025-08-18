

// Declare .png files (React Native returns a number for require('<image>.png'))
declare module "*.png" {
  const value: number;
  export default value;
}

// Declare .jpg/.jpeg files
declare module "*.jpg" {
  const value: number;
  export default value;
}
declare module "*.jpeg" {
  const value: number;
  export default value;
}

// Declare .mp4 files (React Native also returns a number when using require('<video>.mp4'))
declare module "*.mp4" {
  const value: number;
  export default value;
}

// Optionally: Add .svg if you use react-native-svg-transformer
declare module "*.svg" {
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}
