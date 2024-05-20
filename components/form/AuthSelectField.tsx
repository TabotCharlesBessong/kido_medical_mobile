import colors from "@/constants/Colors";
import React, { FC, useState } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import RNPickerSelect from "react-native-picker-select";

interface AuthSelectFieldProps {
  name: string;
  label?: string;
  options: { label: string; value: string }[];
  containerStyle?: StyleProp<ViewStyle>;
  placeholder?: string;
}

const AuthSelectField: FC<AuthSelectFieldProps> = ({
  name,
  label,
  options,
  containerStyle,
  placeholder,
}) => {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

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
            color: "green", // Set color to green
          }}
          name={name}
          items={options}
          onValueChange={(value) => setSelectedValue(value)}
          value={selectedValue}
          style={{
            inputIOS: styles.pickerInput,
            inputAndroid: styles.pickerInput,
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
    borderColor: colors.SECONDARY,
    height: 45,
    borderRadius: 25,
    color: colors.CONTRAST,
    padding: 10,
    textAlign: "center",
    alignItems: "center", // Center the content vertically,
    // paddingBottom:32 
  },
  label: {
    color: "green", // Set color to green
    width: 380,
    marginBottom: 16,
    left: 4,
  },
  pickerInput: {
    color: "green", // Set color to green
    textAlign: "center",
  },
});
