import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <View style={styles.container}>
      <RNPickerSelect
        placeholder={{
          label: "Select Language",
          value: null,
          color: "green",
        }}
        onValueChange={(value) => changeLanguage(value)}
        items={[
          { label: 'English', value: 'en' },
          { label: 'Français', value: 'fr' },
          { label: 'Deutsch', value: 'de' }
        ]}
        style={{
          inputIOS: styles.pickerInput,
          inputAndroid: styles.pickerInput,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  pickerInput: {
    color: "green",
  },
});

export default LanguageSelector;