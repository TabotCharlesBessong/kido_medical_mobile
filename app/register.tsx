import { AuthInputField } from '@/components'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const register = () => {
  return (
    <View style={styles.container} >
      <Text>register</Text>
      <AuthInputField name='name' placeholder='Charles Tabot' label='Name' containerStyle={{marginBottom:16}} />
    </View>
  )
}

export default register

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    width:"100%"
  },
});