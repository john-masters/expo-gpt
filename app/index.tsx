import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

type Roles = "system" | "user" | "assistant";

interface Message {
  role: Roles;
  content: string;
}

export default function Page() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: "You are a helpful assistant." },
  ]);

  async function handleSubmit() {
    setMessages((messages) => [...messages, { role: "user", content: input }]);

    const response = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [...messages, { role: "user", content: input }],
      }),
    });

    const data = await response.json();
    setMessages((messages) => [...messages, data]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>chat.giving</Text>
      <View style={[styles.main, styles.border]}>
        <ScrollView style={[styles.border, styles.responseContainer]}>
          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.border,
                message.role === "system"
                  ? { display: "none" }
                  : message.role === "user"
                  ? { backgroundColor: "grey" }
                  : { backgroundColor: "lightblue" },
              ]}
            >
              <Text>{message.role}</Text>
              <Text>{message.content}</Text>
            </View>
          ))}
        </ScrollView>
        <TextInput
          style={[styles.input, styles.border]}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSubmit}
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
