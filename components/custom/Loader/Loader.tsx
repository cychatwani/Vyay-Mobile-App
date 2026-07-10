import LottieView from 'lottie-react-native'
import React from 'react'
import { SafeAreaView, StyleSheet, View } from 'react-native'

export default function Loader() {
  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.mainContainer}>
        <LottieView
            source={require("@/assets/images/loaderAnimation1.json")}
            autoPlay
            loop
            // speed={2}
            style={styles.lottieAnimation}
          />

        </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white"
      },
      mainContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      },
      lottieAnimation: {
        // flex: 1,
        height:'30%',
        width: "100%",
      },
})