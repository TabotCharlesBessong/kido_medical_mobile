import { COLORS, FONTS } from "@/constants/theme";
import React, { FC } from "react";
import { Text, StyleSheet } from "react-native";

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
    | "body4";
  children: React.ReactNode;
}

const CustomText: FC<CustomTextProps> = ({ type, children }) => {
  const getStyle = (): any => {
    switch (type) {
      case "larger":
        return styles.larger;
      case "h1":
        return styles.h1;
      case "h2":
        return styles.h2;
      case "h3":
        return styles.h3;
      case "h4":
        return styles.h4;
      case "body1":
        return styles.body1;
      case "body2":
        return styles.body2;
      case "body3":
        return styles.body3;
      case "body4":
        return styles.body4;
      default:
        return styles.body1;
    }
  };

  return <Text style={getStyle()}>{children}</Text>;
};

const styles = StyleSheet.create({
  larger: {
    color: COLORS.black,
    ...FONTS.largeTitle,
  },
  h1: {
    color: COLORS.black,
    ...FONTS.h1,
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
    color: COLORS.black,
    ...FONTS.body3,
  },
  body4: {
    color: COLORS.black,
    ...FONTS.body4,
  },
});

export default CustomText;
