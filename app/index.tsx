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
import { SafeAreaProvider } from "react-native-safe-area-context";
import EventSource from "react-native-sse";
import Markdown from "react-native-markdown-display";

type Roles = "system" | "user" | "assistant";

interface Message {
  role: Roles;
  content: string;
}

export default function Page() {
  const inputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: "You are a helpful assistant." },
  ]);

  async function handleSubmit() {
    const newMessage: Message = { role: "user", content: input };
    setInput("");
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);

    let stream = "";
    const url = Platform.OS === "web" ? "/chat" : "http://localhost:8081/chat";

    try {
      const es = new EventSource(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
        }),
        lineEndingCharacter: "\n",
      });

      es.addEventListener("open", () => {
        setMessages((messages) => [
          ...messages,
          { role: "assistant", content: "" },
        ]);
      });

      es.addEventListener("message", (event) => {
        if (!event.data) return;

        if (event.data === "[DONE]") {
          es.removeAllEventListeners();
          es.close();
          inputRef.current?.focus();
          return;
        }

        const data = JSON.parse(event.data);
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

        scrollViewRef.current?.scrollToEnd({ animated: true });
      });

      es.addEventListener("error", (event) => {
        if (event.type === "error") {
          console.error("Connection error:", event.message);
        } else if (event.type === "exception") {
          console.error("Error:", event.message, event.error);
        }
      });
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Text style={styles.heading}>chat.giving</Text>
        <KeyboardAvoidingView
          style={styles.main}
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === "ios" ? 30 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
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
                <Markdown style={mdStyles}>{message.content}</Markdown>
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
    </SafeAreaProvider>
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
});

const mdStyles = StyleSheet.create({
  body: {
    color: "#FFFFFF",
    lineHeight: 24,
  },
  heading1: {
    fontSize: 32,
  },
  heading2: {
    fontSize: 24,
  },
  heading3: {
    fontSize: 18,
  },
  heading4: {
    fontSize: 16,
  },
  heading5: {
    fontSize: 13,
  },
  heading6: {
    fontSize: 11,
  },
  code_inline: {
    backgroundColor: "transparent",
    paddingVertical: 1,
    paddingHorizontal: 2,
  },
  code_block: {
    backgroundColor: "transparent",
    paddingVertical: 2,
  },
  fence: {
    backgroundColor: "transparent",
    paddingVertical: 2,
  },
  blockquote: {
    backgroundColor: "transparent",
  },
});
