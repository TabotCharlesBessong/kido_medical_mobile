import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const patient = () => {
  return (
    <View style={styles.container} >
      <Text>patient</Text>
    </View>
  )
}

export default patient

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
});