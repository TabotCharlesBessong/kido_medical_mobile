import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'

const home = () => {
  const router = useRouter()
  return (
    <View>
      <TouchableOpacity onPress={() => router.push("register")} >
        <Text>
          Create Account
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default home

const styles = StyleSheet.create({})