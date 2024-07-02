import colors from "@/constants/Colors";
import { COLORS } from "@/constants/theme";
import React, { FC, useState } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import RNPickerSelect from "react-native-picker-select";

interface AuthSelectFieldProps {
  name: string;
  label?: string;
  options: { label: string; value: string }[];
  containerStyle?: StyleProp<ViewStyle>;
  placeholder?: string;
  multiple?: boolean; // Add multiple prop
}

const AuthSelectField: FC<AuthSelectFieldProps> = ({
  name,
  label,
  options,
  containerStyle,
  placeholder,
  multiple,
}) => {
  const [selectedValue, setSelectedValue] = useState<string | string[] | null>(
    null
  ); // Update state type

  return (
    <View style={containerStyle}>
      <View style={styles.label}>
        <Text>{label}</Text>
      </View>
      <View style={styles.input}>
        <RNPickerSelect
          placeholder={{
            label: placeholder,
            value: null,
            color: "green",
          }}
          name={name}
          items={options}
          onValueChange={(value) => setSelectedValue(value)}
          value={selectedValue}
          style={{
            inputIOS: styles.pickerInput,
            inputAndroid: styles.pickerInput,
          }}
          useNativeAndroidPickerStyle={false} // Use this to enable multi-select on Android
          mode={multiple ? "multiple" : "default"} // Set mode to "multiple" if multiple prop is true
          onOpen={() => {
            // Reset selected value when the picker is opened
            setSelectedValue(multiple ? [] : null);
          }}
        />
      </View>
    </View>
  );
};

export default AuthSelectField;

const styles = StyleSheet.create({
  input: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    height: 45,
    borderRadius: 25,
    color: colors.CONTRAST,
    padding: 10,
    textAlign: "left",
  },
  label: {
    color: "green",
    width: 380,
    marginBottom: 16,
    left: 4,
  },
  pickerInput: {
    color: "green",
    textAlign: "left",
  },
  containerStyle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
});
