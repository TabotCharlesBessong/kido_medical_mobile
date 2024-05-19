import colors from "@/constants/Colors";
import { Entypo } from "@expo/vector-icons";
import React, { FC } from "react";
import { StyleSheet, View } from "react-native";

interface PasswordVisibilityIconProps {
  privateIcon: boolean;
}

const PasswordVisibilityIcon: FC<PasswordVisibilityIconProps> = ({
  privateIcon,
}) => {
  return (
    <View>
      {privateIcon ? (
        <Entypo name="eye" color={colors.SECONDARY} size={30} />
      ) : (
        <Entypo name="eye-with-line" color={colors.SECONDARY} size={30} />
      )}
    </View>
  );
};

export default PasswordVisibilityIcon;

const styles = StyleSheet.create({});
