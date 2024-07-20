import React from 'react'
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS } from '@/constants/theme'
import { CustomText } from '@/components'
import { useRouter } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'

const TermsAndPolicies = () => {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name='keyboard-arrow-left' size={24} color={COLORS.black} />
        </TouchableOpacity>
        <CustomText type='h2'>{t('termsAndPolicies.title')}</CustomText>
      </View>
      <ScrollView style={styles.scrollView}>
        <CustomText type='h3'>{t('termsAndPolicies.introduction')}</CustomText>
        <CustomText type='body1'>{t('termsAndPolicies.introText')}</CustomText>

        <CustomText type='h3'>{t('termsAndPolicies.privacyPolicy')}</CustomText>
        <CustomText type='body1'>{t('termsAndPolicies.privacyText')}</CustomText>

        <CustomText type='h3'>{t('termsAndPolicies.userResponsibilities')}</CustomText>
        <CustomText type='body1'>{t('termsAndPolicies.userResponsibilitiesText')}</CustomText>

        <CustomText type='h3'>{t('termsAndPolicies.limitationOfLiability')}</CustomText>
        <CustomText type='body1'>{t('termsAndPolicies.limitationText')}</CustomText>

        <CustomText type='h3'>{t('termsAndPolicies.contactInformation')}</CustomText>
        <CustomText type='body1'>{t('termsAndPolicies.contactText')}</CustomText>
      </ScrollView>
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
  headerTitle: {
    textAlign: 'center',
    flex: 1,
  },
  scrollView: {
    marginHorizontal: 12,
  },
  sectionTitle: {
    marginVertical: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  sectionText: {
    marginVertical: 5,
    fontSize: 16,
    lineHeight: 24,
  },
})

export default TermsAndPolicies
