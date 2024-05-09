import { useState, useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Roles = "system" | "user" | "assistant";

interface Message {
  role: Roles;
  content: string;
}

export default function Page() {
  const inputRef = useRef<TextInput>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: "You are a helpful assistant." },
  ]);

  async function handleSubmit() {
    const newMessage: Message = { role: "user", content: input };
    setInput("");
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);

    const response = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: newMessages,
      }),
    });

    if (response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let stream = "";
      setMessages((messages) => [
        ...messages,
        { role: "assistant", content: "" },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        const parts = text.trim().split("\n\n");

        let buffer = "";
        parts.forEach((part) => {
          try {
            if (buffer) {
              part = buffer + part;
              buffer = "";
            }

            const data = JSON.parse(part.slice(6));
            const content = data.choices[0].delta.content;
            if (!content) return;
            stream += content;

            setMessages((messages) => [
              ...messages.slice(0, -1),
              {
                role: "assistant",
                content: stream,
              },
            ]);
          } catch (error) {
            buffer += part;
          }
        });
      }
    }
    inputRef.current?.focus();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>chat.giving</Text>
      <KeyboardAvoidingView
        style={styles.main}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 30 : 0}
      >
        <ScrollView
          style={styles.responseContainer}
          contentContainerStyle={{
            gap: 12,
          }}
        >
          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.message,
                message.role === "system"
                  ? { display: "none" }
                  : message.role === "user"
                  ? { backgroundColor: "#1d89fe" }
                  : { backgroundColor: "#262529" },
              ]}
            >
              <Text style={[styles.messageText, { fontWeight: "bold" }]}>
                {message.role}
              </Text>
              <Text style={styles.messageText}>{message.content}</Text>
            </View>
          ))}
        </ScrollView>
        <TextInput
          ref={inputRef}
          autoFocus={true}
          style={styles.input}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSubmit}
        ></TextInput>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  container: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    gap: 12,
    backgroundColor: "black",
  },
  main: {
    flex: 1,
    maxWidth: 960,
    width: "100%",
    gap: 12,
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "white",
    color: "white",
  },
  responseContainer: {
    flex: 1,
  },
  message: {
    padding: 12,
    borderRadius: 8,
  },
  messageText: {
    color: "white",
  },
});
