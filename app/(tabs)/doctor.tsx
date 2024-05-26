import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const doctor = () => {
  return (
    <View style={styles.container} >
      <Text>doctor</Text>
    </View>
  )
}

export default doctor

const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
});