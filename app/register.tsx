import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const register = () => {
  return (
    <View style={styles.container} >
      <Text>register</Text>
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
  },
});