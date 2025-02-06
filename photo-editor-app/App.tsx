import React from "react";
import { StyleSheet, SafeAreaView } from "react-native";
import ImageEditor from "./components/ImageEditor";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <ImageEditor />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
