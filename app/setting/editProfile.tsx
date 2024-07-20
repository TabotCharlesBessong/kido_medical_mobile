import React from 'react'
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS } from '@/constants/theme'
import { CustomText } from '@/components'
import { useRouter } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'

const EditProfile = () => {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name='keyboard-arrow-left' size={24} color={COLORS.black} />
        </TouchableOpacity>
        <CustomText type='h2'>{t('editProfile.title')}</CustomText>
      </View>
      <View style={styles.form}>
        <CustomText type='body1'>{t('editProfile.name')}</CustomText>
        <TextInput style={styles.input} placeholder={t('editProfile.placeholderName')} />
        <CustomText type='body1'>{t('editProfile.email')}</CustomText>
        <TextInput style={styles.input} placeholder={t('editProfile.placeholderEmail')} />
        <CustomText type='body1'>{t('editProfile.phone')}</CustomText>
        <TextInput style={styles.input} placeholder={t('editProfile.placeholderPhone')} />
        <TouchableOpacity style={styles.saveButton}>
          <CustomText type='body1'>{t('editProfile.saveChanges')}</CustomText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
  },
  backButton: {},
  form: {
    padding: 12,
  },
  label: {
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.white,
  },
})

export default EditProfile
