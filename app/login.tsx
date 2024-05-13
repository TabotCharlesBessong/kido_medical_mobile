import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const login = () => {
  return (
    <View style={styles.container} >
      <Text>login</Text>
    </View>
  )
}

export default login

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
});