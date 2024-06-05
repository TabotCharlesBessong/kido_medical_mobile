import { Dimensions } from "react-native";

const { height, width } = Dimensions.get("window");

export const COLORS = {
  primary: "#45BA65",
  secondary: "#544C4C",
  white: "#FFFFFF",
  black: "#000000",
  gray: "rgba(36,39,96,0.05)",
  secondaryGray: "rgba(84,76,76,0.14)",
};

export const SIZES = {
  // global SIZES
  base: 8,
  font: 14,
  radius: 30,
  padding: 10,
  padding2: 12,
  padding3: 16,

  // font sizes
  largeTitle: 50,
  h1: 30,
  h2: 20,
  h3: 18,
  h4: 16,
  body1: 30,
  body2: 20,
  body3: 18,
  body4: 14,
  body5: 12,

  // app dimension
  width,
  height,
};

export const FONTS = {
  largeTitle: {
    fontFamily: "InterBlack",
    fontSize: SIZES.largeTitle,
    lineHeight: 55,
  },
  h1: { fontFamily: "InterBold", fontSize: SIZES.h1, lineHeight: 36 },
  h2: { fontFamily: "InterBold", fontSize: SIZES.h2, lineHeight: 30 },
  h3: { fontFamily: "InterBold", fontSize: SIZES.h3, lineHeight: 22 },
  h4: { fontFamily: "InterBold", fontSize: SIZES.h4, lineHeight: 20 },
  body1: { fontFamily: "InterRegular", fontSize: SIZES.body1, lineHeight: 36 },
  body2: { fontFamily: "InterRegular", fontSize: SIZES.body2, lineHeight: 30 },
  body3: { fontFamily: "InterLight", fontSize: SIZES.body3, lineHeight: 22 },
  body4: { fontFamily: "InterLight", fontSize: SIZES.body4, lineHeight: 20 },
};

const appTheme = { FONTS, SIZES, COLORS };

export default appTheme;
