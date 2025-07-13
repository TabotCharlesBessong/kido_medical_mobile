// AuthInputField.tsx
import { useFormikContext } from "formik";
import { FC, ReactNode, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInputProps,
  StyleProp,
  ViewStyle,
  Pressable,
} from "react-native";
import AppInput from "../ui/form/AppInput";
import { COLORS } from "@/constants/theme";
import React from "react";

interface Props {
  name: string;
  label?: string;
  placeholder?: string;
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  secureTextEntry?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  rightIcon?: ReactNode;
  onRightIconPress?(): void;
  multiline?: boolean;
  numberOfLines?: number;
  style?: StyleProp<ViewStyle>;
  editable?: boolean;
  // New props for direct value control
  value?: string;
  onChangeText?: (text: string) => void;
}

const AuthInputField: FC<Props> = (props) => {
  const formikContext = useFormikContext<{
    [key: string]: string;
  }>();

  const {
    label,
    placeholder,
    autoCapitalize,
    keyboardType,
    secureTextEntry,
    containerStyle,
    name,
    rightIcon,
    onRightIconPress,
    multiline,
    numberOfLines,
    style,
    editable,
    value,
    onChangeText,
  } = props;

  // Use direct value/onChangeText if provided, otherwise use Formik
  const isControlled = value !== undefined && onChangeText !== undefined;

  const inputValue = isControlled ? value : formikContext?.values[name] || "";
  const handleTextChange = isControlled
    ? onChangeText
    : formikContext?.handleChange(name);
  const handleInputBlur = isControlled
    ? undefined
    : formikContext?.handleBlur(name);

  // Only show error messages when using Formik
  const errorMsg =
    !isControlled && formikContext?.touched[name] && formikContext?.errors[name]
      ? formikContext.errors[name]
      : "";

  return (
    <View style={[containerStyle, style, { width: "100%" }]}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.errorMsg}>{errorMsg}</Text>
      </View>
      <View>
        <AppInput
          placeholder={placeholder}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          onChangeText={handleTextChange}
          value={inputValue}
          onBlur={handleInputBlur}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
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

const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 5,
  },
  label: {
    color: COLORS.primary,
  },
  errorMsg: {
    color: COLORS.danger,
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

export default AuthInputField;
