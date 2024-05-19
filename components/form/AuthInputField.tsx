import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import React, { FC, ReactNode } from "react";
import colors from "@/constants/Colors";
import AppInput from "../ui/AppInput";

interface AuthInputFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  secureTextEntry?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  rightIcon?: ReactNode;
  onRightIconPress?(): void;
}

const AuthInputField: FC<AuthInputFieldProps> = (props) => {
  const {
    label,
    name,
    placeholder,
    autoCapitalize,
    keyboardType,
    secureTextEntry,
    containerStyle,
    rightIcon,
    onRightIconPress,
  } = props;
  return (
    <View style={[containerStyle,{width:"90%"}]}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
      </View>
      <View>
        <AppInput
          placeholder={placeholder}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
        />
        {rightIcon ? (
          <Pressable onPress={onRightIconPress} style={styles.rightIcon}>
            {rightIcon}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

export default AuthInputField;

const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 5,
  },
  label: {
    color: colors.CONTRAST,
  },
  rightIcon: {
    width: 45,
    height: 45,
    position: "absolute",
    top: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});
