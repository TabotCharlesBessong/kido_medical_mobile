import React, { FC, useState } from "react";
import RNPickerSelect from "react-native-picker-select";
import { View, Text, StyleProp, ViewStyle } from "react-native";
import AuthInputField from "./AuthInputField";

interface AuthSelectFieldProps {
  name:string
  label?:string
  options:string[]
  containerStyle?:StyleProp<ViewStyle>
  placeholder?:string
}

const AuthSelectField: FC<AuthSelectFieldProps> = ({
  name,
  label,
  options,
  containerStyle,
  placeholder
}) => {
  const [selectedValue, setSelectedValue] = useState(null);

  return (
    <View style={containerStyle}>
      <View style={{ width: 380 }}>
        {/* <AuthInputField name={name} label={label} /> */}
        <Text>{label}</Text>
      </View>
      <RNPickerSelect
        placeholder={placeholder}
        name={name}
        items={options}
        onValueChange={(value) => setSelectedValue(value)}
        value={selectedValue}
      />
      {/* {selectedValue && <Text>Selected: {selectedValue}</Text>} */}
    </View>
  );
};

export default AuthSelectField;
