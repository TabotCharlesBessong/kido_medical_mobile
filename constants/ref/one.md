Here is the complete implementation including French and German translations, and the language selection feature:

### Translations
`locales/en.json`:
```json
{
  "complete": {
    "yup": {
      "req1": "Gender is required",
      "pos": "Age must be a positive number",
      "req2": "Age is required",
      "req3": "Address 1 is required",
      "re4": "Occupation is required",
      "match": "Phone number must be 9 or 14 digits long",
      "req5": "Phone number is required"
    },
    "text1": "Fill in information",
    "form": {
      "label1": "Gender",
      "placeholder1": "Choose your Gender",
      "label2": "Age",
      "placeholder2": "Enter your Age",
      "label3": "City",
      "placeholder3": "Enter your City",
      "label4": "Quarter",
      "placeholder4": "Enter your Quarter",
      "label5": "Occupation",
      "placeholder5": "Enter your Occupation",
      "label6": "Phone Number",
      "placeholder6": "Enter your Phone Number"
    },
    "button": "Submit",
    "loader": "Submitting...",
    "options": {
      "one": "MALE",
      "two": "FEMALE"
    }
  }
}
```

`locales/fr.json`:
```json
{
  "complete": {
    "yup": {
      "req1": "Le sexe est requis",
      "pos": "L'âge doit être un nombre positif",
      "req2": "L'âge est requis",
      "req3": "L'adresse 1 est requise",
      "re4": "L'occupation est requise",
      "match": "Le numéro de téléphone doit comporter 9 ou 14 chiffres",
      "req5": "Le numéro de téléphone est requis"
    },
    "text1": "Remplir les informations",
    "form": {
      "label1": "Genre",
      "placeholder1": "Choisissez votre Genre",
      "label2": "Âge",
      "placeholder2": "Entrez votre Âge",
      "label3": "Ville",
      "placeholder3": "Entrez votre Ville",
      "label4": "Quartier",
      "placeholder4": "Entrez votre Quartier",
      "label5": "Occupation",
      "placeholder5": "Entrez votre Occupation",
      "label6": "Numéro de Téléphone",
      "placeholder6": "Entrez votre Numéro de Téléphone"
    },
    "button": "Soumettre",
    "loader": "Soumission...",
    "options": {
      "one": "MÂLE",
      "two": "FEMELLE"
    }
  }
}
```

`locales/de.json`:
```json
{
  "complete": {
    "yup": {
      "req1": "Geschlecht ist erforderlich",
      "pos": "Das Alter muss eine positive Zahl sein",
      "req2": "Das Alter ist erforderlich",
      "req3": "Adresse 1 ist erforderlich",
      "re4": "Beschäftigung ist erforderlich",
      "match": "Die Telefonnummer muss 9 oder 14 Ziffern lang sein",
      "req5": "Telefonnummer ist erforderlich"
    },
    "text1": "Informationen ausfüllen",
    "form": {
      "label1": "Geschlecht",
      "placeholder1": "Wählen Sie Ihr Geschlecht",
      "label2": "Alter",
      "placeholder2": "Geben Sie Ihr Alter ein",
      "label3": "Stadt",
      "placeholder3": "Geben Sie Ihre Stadt ein",
      "label4": "Viertel",
      "placeholder4": "Geben Sie Ihr Viertel ein",
      "label5": "Beruf",
      "placeholder5": "Geben Sie Ihre Beschäftigung ein",
      "label6": "Telefonnummer",
      "placeholder6": "Geben Sie Ihre Telefonnummer ein"
    },
    "button": "Einreichen",
    "loader": "Einreichung...",
    "options": {
      "one": "MÄNNLICH",
      "two": "WEIBLICH"
    }
  }
}
```

### Initialize `i18next`

Create an `i18n.ts` file for setting up i18next.

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import fr from './locales/fr.json';
import de from './locales/de.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      de: { translation: de },
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

### Language Selection Component

Create a component for language selection:

```typescript
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
```

### Update the `CompleteScreen` Component

Modify your `CompleteScreen` component to include translations and the language selector.

```typescript
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Button,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import { IPatient } from "@/constants/types";
import { AppButton, AuthInputField, CustomText } from "@/components";
import { useDispatch } from "react-redux";
import * as yup from "yup";
import { Formik, FormikHelpers } from "formik";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { COLORS } from "@/constants/theme";
import { baseUrl } from "@/utils/variables";
import { useTranslation } from 'react-i18next';
import LanguageSelector from "@/components/LanguageSelector";
import AuthSelectField from "@/components/AuthSelectField";

interface CompleteValues {
  gender: string;
  age: number;
  address1: string;
  address2: string;
  occupation: string;
  phone: number;
}

const CompleteScreen: React.FC = () => {
  const [patientData, setPatientData] = useState<IPatient>({
    id: "",
    userId: "",
    gender: "",
    age: 0,
    address1: "",
    address2: "",
    occupation: "",
    phone: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const initialValues: CompleteValues = {
    gender: "",
    age: 0,
    address1: "",
    address2: "",
    occupation: "",
    phone: 0,
  };

  const completionSchema = yup.object().shape({
    gender: yup
      .string()
      .oneOf([t('complete.options.one'), t('complete.options.two')])
      .required(t('complete.yup.req1')),
    age: yup
      .number()
      .positive(t('complete.yup.pos'))
      .required(t('complete.yup.req2')),
    address1: yup.string().required(t('complete.yup.req3')),
    address2: yup.string(),
    occupation: yup.string().required(t('complete.yup.re4')),
    phone: yup
      .string()
      .matches(/^(?:\d{9}|\d{14})$/, t('complete.yup.match'))
      .required(t('complete.yup.req5')),
  });

  const handleInputChange = (name: keyof IPatient, value: string | number) => {
    setPatientData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    values: CompleteValues,
    actions: FormikHelpers<CompleteValues>
  ) => {
    console.log(values);
    try {
      setLoading(true);
      setErrorMessage("");

      // Get the bearer token from async storage
      const token = await AsyncStorage.getItem("

userToken");
      console.log(token);

      // Create an instance of axios with default headers
      const instance = axios.create({
        baseURL: baseUrl,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Add request interceptor to handle authorization
      instance.interceptors.request.use(
        async (config) => {
          // Refresh the bearer token if expired or not available
          const newToken = await AsyncStorage.getItem("userToken");
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
          }
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );

      // Add response interceptor to handle errors
      instance.interceptors.response.use(
        (response) => {
          return response;
        },
        (error) => {
          if (error.response) {
            // Handle HTTP errors
            console.log(error.response.data);
            setErrorMessage(error.response.data.message);
          } else {
            // Handle network errors
            console.log(error.message);
            setErrorMessage(error.message);
          }
          return Promise.reject(error);
        }
      );

      // Make the API request
      const res = await instance.post("/patient/create", values);
      console.log(res);
      const data = res.data;
      console.log(data);

      // Handle success and redirect
      if (data.success === false) {
        setErrorMessage(data.message);
      } else {
        setLoading(false);
        if (res.status === 200) {
          router.push("(tabs)");
        }
      }
    } catch (error) {
      console.log(error);
      setErrorMessage((error as TypeError).message);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="height" style={styles.container}>
      <LanguageSelector />
      <CustomText type="larger">{t('complete.text1')}</CustomText>
      <Formik
        initialValues={initialValues}
        validationSchema={completionSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit }) => (
          <KeyboardAvoidingView style={styles.container}>
            <AuthSelectField
              name="gender"
              label={t('complete.form.label1')}
              options={[
                { label: t('complete.options.one'), value: 'MALE' },
                { label: t('complete.options.two'), value: 'FEMALE' },
              ]}
              placeholder={t('complete.form.placeholder1')}
            />
            <AuthInputField
              name="age"
              label={t('complete.form.label2')}
              placeholder={t('complete.form.placeholder2')}
              keyboardType="numeric"
            />
            <AuthInputField
              name="address1"
              label={t('complete.form.label3')}
              placeholder={t('complete.form.placeholder3')}
            />
            <AuthInputField
              name="address2"
              label={t('complete.form.label4')}
              placeholder={t('complete.form.placeholder4')}
            />
            <AuthInputField
              name="occupation"
              label={t('complete.form.label5')}
              placeholder={t('complete.form.placeholder5')}
            />
            <AuthInputField
              name="phone"
              label={t('complete.form.label6')}
              placeholder={t('complete.form.placeholder6')}
              keyboardType="phone-pad"
            />
            <AppButton
              title={t('complete.button')}
              backgroundColor={COLORS.primary}
              loading={loading}
              loadingText={t('complete.loader')}
              onPress={handleSubmit}
            />
          </KeyboardAvoidingView>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});

export default CompleteScreen;
```

### Conclusion

With this setup, the `CompleteScreen` component now supports multiple languages and provides a way for users to select their preferred language. The translations will be applied based on the selected language, and the form validation messages will be translated accordingly.