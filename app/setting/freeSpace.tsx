import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { COLORS } from '@/constants/theme'
import { CustomText } from '@/components'
import { useRouter } from 'expo-router'
import { MaterialIcons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'

const FreeSpace = () => {
  const router = useRouter()
  const { t } = useTranslation()

  const handleClearCache = () => {
    // Logic to clear cache
    console.log(t('freeSpace.clearCache'))
  }

  const handleClearDownloads = () => {
    // Logic to clear downloads
    console.log(t('freeSpace.clearDownloads'))
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name='keyboard-arrow-left' size={24} color={COLORS.black} />
        </TouchableOpacity>
        <CustomText type='h2'>{t('freeSpace.title')}</CustomText>
      </View>
      <View style={styles.content}>
        <TouchableOpacity style={styles.clearButton} onPress={handleClearCache}>
          <CustomText type='body1'>{t('freeSpace.clearCache')}</CustomText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.clearButton} onPress={handleClearDownloads}>
          <CustomText type='body1'>{t('freeSpace.clearDownloads')}</CustomText>
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
  content: {
    padding: 12,
  },
  clearButton: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  clearButtonText: {
    color: COLORS.white,
  },
})

export default FreeSpace
