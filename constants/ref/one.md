Here are the JSON translations for English, French, and German for the screen:

### English (en.json)
```json
{
  "manageTimeSlots": "Manage Time Slots",
  "available": "Available",
  "notAvailable": "Not Available",
  "weekly": "Weekly",
  "addTimeSlot": "+ Add Time Slot",
  "createTimeSlot": "Create Time Slot",
  "selectStartTime": "Select Start Time",
  "selectEndTime": "Select End Time",
  "weeklyAvailability": "Weekly Availability",
  "create": "Create",
  "cancel": "Cancel",
  "validationError": "Validation Error",
  "selectBothTimes": "Please select both start and end times.",
  "error": "Error",
  "failedToCreateTimeSlot": "Failed to create time slot. Please try again."
}
```

### French (fr.json)
```json
{
  "manageTimeSlots": "Gérer les créneaux horaires",
  "available": "Disponible",
  "notAvailable": "Indisponible",
  "weekly": "Hebdomadaire",
  "addTimeSlot": "+ Ajouter un créneau",
  "createTimeSlot": "Créer un créneau",
  "selectStartTime": "Sélectionner l'heure de début",
  "selectEndTime": "Sélectionner l'heure de fin",
  "weeklyAvailability": "Disponibilité hebdomadaire",
  "create": "Créer",
  "cancel": "Annuler",
  "validationError": "Erreur de validation",
  "selectBothTimes": "Veuillez sélectionner à la fois l'heure de début et de fin.",
  "error": "Erreur",
  "failedToCreateTimeSlot": "Échec de la création du créneau. Veuillez réessayer."
}
```

### German (de.json)
```json
{
  "manageTimeSlots": "Zeitfenster verwalten",
  "available": "Verfügbar",
  "notAvailable": "Nicht verfügbar",
  "weekly": "Wöchentlich",
  "addTimeSlot": "+ Zeitfenster hinzufügen",
  "createTimeSlot": "Zeitfenster erstellen",
  "selectStartTime": "Startzeit auswählen",
  "selectEndTime": "Endzeit auswählen",
  "weeklyAvailability": "Wöchentliche Verfügbarkeit",
  "create": "Erstellen",
  "cancel": "Abbrechen",
  "validationError": "Validierungsfehler",
  "selectBothTimes": "Bitte wählen Sie sowohl die Start- als auch die Endzeit aus.",
  "error": "Fehler",
  "failedToCreateTimeSlot": "Zeitfenster konnte nicht erstellt werden. Bitte versuchen Sie es erneut."
}
```

### Implementing Translation into the Screens

First, install the necessary packages for translation:
```bash
npm install i18next react-i18next i18next-http-backend i18next-browser-languagedetector
```

Next, configure the `i18n` setup:

**i18n.js**
```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n;
```

Create a folder structure for the translations:

```
public
└── locales
    ├── en
    │   └── translation.json
    ├── fr
    │   └── translation.json
    └── de
        └── translation.json
```

Place the respective JSON files in the corresponding folders.

**App.js**
```javascript
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TimeSlotScreen from './TimeSlotScreen';

const App = () => {
  return (
    <SafeAreaProvider>
      <I18nextProvider i18n={i18n}>
        <TimeSlotScreen />
      </I18nextProvider>
    </SafeAreaProvider>
  );
};

export default App;
```

**TimeSlotScreen.js**
```javascript
import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from 'react-i18next';

import { COLORS } from "@/constants/theme";
import { CustomText, TimeslotModal } from "@/components";
import { TimeSlot, generateRandomTimeSlots } from "@/constants/data/timeslot";
import { useRouter } from "expo-router";
import { AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";

const TimeSlotScreen: React.FC = () => {
  const { t } = useTranslation();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(generateRandomTimeSlots(8));
  const [isModalVisible, setIsModalVisible] = useState(false);
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();

  const handleCreateTimeSlot = (startTime: string, endTime: string, isWeekly: boolean) => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      startTime,
      endTime,
      isAvailable: true,
      isWeekly,
    };
    setTimeSlots((prevSlots) => [...prevSlots, newSlot]);
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <CustomText type="h3">{t('manageTimeSlots')}</CustomText>
        {timeSlots.map((slot) => (
          <View key={slot.id} style={styles.timeSlotItem}>
            <View style={{display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"space-between"}} >
              <CustomText type="body3">
                {slot.isAvailable ? t('available') : t('notAvailable')}
              </CustomText>
              <CustomText type="body1">
                {`${slot.startTime} - ${slot.endTime}`}
              </CustomText>
            </View>
            {slot.isWeekly && <CustomText type="body2">{t('weekly')}</CustomText>}
          </View>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={toggleModal}>
          <CustomText type="body1">{t('addTimeSlot')}</CustomText>
        </TouchableOpacity>
      </ScrollView>
      <TimeslotModal
        isVisible={isModalVisible}
        onClose={toggleModal}
        onCreate={handleCreateTimeSlot}
      />
    </SafeAreaView>
  );
};

export default TimeSlotScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  header: {
    marginVertical: 20,
  },
  timeSlotItem: {
    padding: 15,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginVertical: 5,
  },
  available: {
    color: COLORS.primary,
  },
  notAvailable: {
    color: COLORS.danger,
  },
  weekly: {
    color: "blue",
  },
  addButton: {
    padding: 15,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 20,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
});
```

**TimeslotModal.js**
```javascript
import React, { useState } from "react";
import {
  Modal,
  View,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { COLORS } from "@/constants/theme";
import { AppButton, AuthCheckbox, CustomText } from "@/components";
import { useTranslation } from 'react-i18next';
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { createTimeSlot } from "@/redux/actions/timeslot.action";

interface TimeSlotModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCreate: (startTime: string, endTime: string, isWeekly: boolean) => void;
}

const TimeSlotModal: React.FC<TimeSlotModalProps> = ({
  isVisible,
  onClose,
  onCreate,
}) => {
  const { t } = useTranslation();
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [isWeekly, setIsWeekly] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false

);
  const dispatch: AppDispatch = useDispatch();

  const onStartTimeChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartTime(selectedDate);
    }
  };

  const onEndTimeChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndTime(selectedDate);
    }
  };

  const formatTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const handleCreate = async () => {
    if (startTime && endTime) {
      const doctorId = 1; // Replace with actual doctor ID
      const newTimeSlot = {
        doctorId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        isAvailable: true,
      };

      try {
        await dispatch(createTimeSlot(newTimeSlot));
        onCreate(formatTime(startTime), formatTime(endTime), isWeekly);
        onClose();
      } catch (error) {
        Alert.alert(t('error'), t('failedToCreateTimeSlot'));
      }
    } else {
      Alert.alert(t('validationError'), t('selectBothTimes'));
    }
  };

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <CustomText type="h3">{t('createTimeSlot')}</CustomText>

          <TouchableOpacity
            onPress={() => setShowStartPicker(true)}
            style={styles.timePickerButton}
          >
            <CustomText type="body1">
              {startTime ? formatTime(startTime) : t('selectStartTime')}
            </CustomText>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startTime || new Date()}
              mode="time"
              display="default"
              onChange={onStartTimeChange}
            />
          )}

          <TouchableOpacity
            onPress={() => setShowEndPicker(true)}
            style={styles.timePickerButton}
          >
            <CustomText type="body1">
              {endTime ? formatTime(endTime) : t('selectEndTime')}
            </CustomText>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endTime || new Date()}
              mode="time"
              display="default"
              onChange={onEndTimeChange}
            />
          )}

          <AuthCheckbox
            isChecked={isWeekly}
            onPress={() => setIsWeekly(!isWeekly)}
            title={t('weeklyAvailability')}
          />
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-around",
              marginTop: 12,
            }}
          >
            <AppButton
              title={t('create')}
              onPress={handleCreate}
              width={120}
              backgroundColor={COLORS.primary}
            />
            <AppButton
              title={t('cancel')}
              onPress={onClose}
              width={120}
              backgroundColor={COLORS.danger}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: 10,
  },
  timePickerButton: {
    padding: 10,
    marginVertical: 10,
    backgroundColor: COLORS.gray,
    borderRadius: 5,
  },
});

export default TimeSlotModal;
```

With these changes, the Time Slot screen and modal should now support translations in English, French, and German. The text displayed in the UI will be dynamically fetched from the respective JSON files based on the user's language preference.

### Notes

generate the english, french and german json text for the translation of the screen above and also implement the translation into the  screen