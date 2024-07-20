import { View, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native'
import React, { FC, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS, FONTS } from '@/constants/theme'
import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { CustomText, AppButton } from '@/components'
import { useTranslation } from 'react-i18next'
import RNPickerSelect from 'react-native-picker-select'

interface SettingItemsProps {
  icon: string
  text: string
  action: () => void
}

const SettingsScreen = () => {
  const router = useRouter()
  const { t, i18n } = useTranslation()
  const [modalVisible, setModalVisible] = useState(false)

  const navigateTo = (route: string) => {
    router.push(route)
  }

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    setModalVisible(false)
  }

  const accountItems = [
    {
      icon: 'person-outline',
      text: t('settings.profile'), // "Edit Profile"
      action: () => navigateTo('/setting/editProfile'),
    },
    {
      icon: 'security',
      text: t('settings.security'),
      action: () => navigateTo('/Security'),
    },
    {
      icon: 'notifications-none',
      text: t('settings.notification'), // "Notifications"
      action: () => navigateTo('/setting/notifications'),
    },
    {
      icon: 'lock-outline',
      text: t('settings.privacy'),
      action: () => navigateTo('/setting/privacy'),
    },
  ]

  const supportItems = [
    {
      icon: 'credit-card',
      text: t('settings.money'), // "My Subscriptions"
      action: () => navigateTo('/setting/subscription'),
    },
    {
      icon: 'help-outline',
      text: t('settings.help'),
      action: () => navigateTo('/setting/support'),
    },
    {
      icon: 'info-outline',
      text: t('settings.terms'), // "Terms and Policies"
      action: () => navigateTo('/setting/termsAndPolicies'),
    },
  ]

  const cacheAndCellularItems = [
    {
      icon: 'delete-outline',
      text: t('settings.delete'), // "Free up space"
      action: () => navigateTo('/setting/freeSpace'),
    },
    {
      icon: 'save-alt',
      text: t('settings.save'),
      action: () => navigateTo('/setting/dataSaver'),
    },
  ]

  const actionsItems = [
    {
      icon: 'outlined-flag',
      text: t('settings.report'), // "Report a problem"
      action: () => navigateTo('/setting/reportProblem'),
    },
    {
      icon: 'language',
      text: t('settings.account'),
      action: () => setModalVisible(true),
    },
    {
      icon: 'logout',
      text: t('settings.logout'),
      action: () => navigateTo('/setting/logout'),
    },
  ]

  const renderSettingsItem: FC<SettingItemsProps> = ({ icon, text, action }) => (
    <TouchableOpacity key={text} onPress={action} style={styles.settingsItem}>
      <MaterialIcons style={{ marginRight: 16 }} name={icon} size={24} color='black' />
      <CustomText type='body1'>{text}</CustomText>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name='keyboard-arrow-left' size={24} color={COLORS.black} />
        </TouchableOpacity>
        <CustomText type='h2'>Settings</CustomText>
      </View>
      <ScrollView style={styles.scrollView}>
        {/* Account Settings */}
        <View style={styles.section}>
          <CustomText type='h4'>Account</CustomText>
          {accountItems.map(renderSettingsItem)}
        </View>
        {/* Support and About settings */}
        <View style={styles.section}>
          <CustomText type='h4'>Support & About</CustomText>
          {supportItems.map(renderSettingsItem)}
        </View>
        {/* Cache & Cellular */}
        <View style={styles.section}>
          <CustomText type='h4'>Cache & Cellular</CustomText>
          {cacheAndCellularItems.map(renderSettingsItem)}
        </View>
        {/* Actions Settings */}
        <View style={styles.section}>
          <CustomText type='h4'>Actions</CustomText>
          {actionsItems.map(renderSettingsItem)}
        </View>
      </ScrollView>

      {/* Language Selector Modal */}
      <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <CustomText type='h3'>{t('translate.selectLanguage')}</CustomText>
            <RNPickerSelect
              placeholder={{
                label: t('translate.selectLanguage'),
                value: null,
                color: COLORS.primary,
              }}
              onValueChange={value => changeLanguage(value)}
              items={[
                { label: t('translate.en'), value: 'en' },
                { label: t('translate.fr'), value: 'fr' },
                { label: t('translate.de'), value: 'de' },
              ]}
              style={{
                inputIOS: styles.pickerInput,
                inputAndroid: styles.pickerInput,
              }}
            />
            <AppButton
              title={t('translate.close')}
              onPress={() => setModalVisible(false)}
              backgroundColor={COLORS.danger}
              containerStyle={styles.closeButton}
            />
          </View>
        </View>
      </Modal>
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
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    marginVertical: 10,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 12,
    backgroundColor: COLORS.gray,
    borderRadius: 12,
    marginVertical: 5,
  },
  settingsText: {
    marginLeft: 40,
    fontWeight: '600',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    alignItems: 'center',
  },
  pickerInput: {
    color: COLORS.primary,
    width: '100%',
    marginTop: 20,
  },
  closeButton: {
    marginTop: 20,
    width: '100%',
  },
})

export default SettingsScreen
