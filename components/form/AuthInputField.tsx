import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";
import React, { FC, ReactNode, useRef } from "react";
import colors from "@/constants/Colors";
import { COLORS } from "@/constants/theme";

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
  fileInput?: boolean; // Add fileInput prop
  onFileSelect?(file: File): void; // Add onFileSelect prop
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
    fileInput,
    onFileSelect,
  } = props;

  const fileInputRef = useRef<TextInput>(null);

  const handleFileInputChange = (event: any) => {
    const file =
      event.nativeEvent.target.files && event.nativeEvent.target.files[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleFileInputPress = () => {
    if (fileInputRef.current) {
      fileInputRef.current.focus();
    }
  };

  return (
    <View style={[containerStyle, { width: "100%" }]}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
      </View>
      <View>
        {!fileInput ? (
          <TextInput
            style={styles.textInput}
            placeholder={placeholder}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            secureTextEntry={secureTextEntry}
          />
        ) : (
          <>
            <TextInput
              style={styles.textInput}
              placeholder={placeholder}
              onFocus={handleFileInputPress}
              ref={fileInputRef}
              editable={false}
              onChange={handleFileInputChange}
            />
            <Pressable onPress={handleFileInputPress} style={styles.fileInput}>
              <Text>Select File</Text>
            </Pressable>
          </>
        )}
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
  textInput: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
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
  fileInput: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
});
