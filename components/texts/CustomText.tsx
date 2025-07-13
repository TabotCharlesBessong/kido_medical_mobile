import { COLORS, FONTS } from "@/constants/theme";
import React, { FC } from "react";
import { Text, StyleSheet, TextStyle, StyleProp } from "react-native";

interface CustomTextProps {
  type:
    | "larger"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "body1"
    | "body2"
    | "body3"
    | "body4"
    | "body5";
  children: React.ReactNode;
  textColor?: string;
  style?: StyleProp<TextStyle>;
}

const CustomText: FC<CustomTextProps> = ({
  type,
  children,
  textColor,
  style,
}) => {
  const getStyle = (): any => {
    let baseStyle;
    switch (type) {
      case "larger":
        baseStyle = styles.larger;
        break;
      case "h1":
        baseStyle = styles.h1;
        break;
      case "h2":
        baseStyle = styles.h2;
        break;
      case "h3":
        baseStyle = styles.h3;
        break;
      case "h4":
        baseStyle = styles.h4;
        break;
      case "body1":
        baseStyle = styles.body1;
        break;
      case "body2":
        baseStyle = styles.body2;
        break;
      case "body3":
        baseStyle = styles.body3;
        break;
      case "body4":
        baseStyle = styles.body4;
        break;
      case "body5":
        baseStyle = styles.body5;
        break;
      default:
        baseStyle = styles.body1;
    }

    // Apply textColor if provided
    const colorStyle = textColor ? { color: textColor } : {};

    return [baseStyle, colorStyle, style];
  };

  return <Text style={getStyle()}>{children}</Text>;
};

const styles = StyleSheet.create({
  larger: {
    color: COLORS.primary,
    ...FONTS.largeTitle,
    textTransform: "capitalize",
  },
  h1: {
    color: COLORS.black,
    ...FONTS.h1,
    textTransform: "capitalize",
  },
  h2: {
    color: COLORS.black,
    ...FONTS.h2,
  },
  h3: {
    color: COLORS.black,
    ...FONTS.h3,
  },
  h4: {
    color: COLORS.black,
    ...FONTS.h4,
  },
  body1: {
    color: COLORS.black,
    ...FONTS.body1,
  },
  body2: {
    color: COLORS.black,
    ...FONTS.body2,
  },
  body3: {
    color: COLORS.primary,
    ...FONTS.body3,
  },
  body4: {
    color: COLORS.black,
    ...FONTS.body4,
  },
  body5: {
    color: COLORS.primary,
    ...FONTS.body5,
    textAlign: "right",
  },
});

export default CustomText;
