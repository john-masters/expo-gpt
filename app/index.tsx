import { StyleSheet, Text, TextInput, View } from "react-native";

export default function Page() {
  async function fetchHello() {
    const response = await fetch("/hello");
    const data = await response.json();
    alert("Hello " + data.hello);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>chat.giving</Text>
      <View style={[styles.main, styles.border]}>
        <View style={[styles.border, styles.responseContainer]}></View>
        <TextInput
          style={[styles.input, styles.border]}
          onSubmitEditing={fetchHello}
        ></TextInput>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  border: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  main: {
    flex: 1,
    maxWidth: 960,
    width: "100%",
    gap: 12,
  },
  input: {
    width: "100%",
  },
  responseContainer: {
    flex: 1,
  },
});
