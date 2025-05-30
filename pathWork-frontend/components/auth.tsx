import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  View,
  AppState,
  Image,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { supabase } from "../lib/supabase";
import { Button, Input } from "@rneui/themed";
import { User } from "@supabase/supabase-js";
import BackgroundSwirl from "./BackgroundSwirl";

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_OUT` event
// if the user's session is terminated. This should only be registered once.
AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

async function createProfile(user: User, username: string) {
  console.log("Creating profile for user: ", user);
  const { error } = await supabase.from("public_profiles").insert([
    {
      id: user.id,
      username: username,
      bio: "Nothing here to see",
    },
  ]);
  if (error) {
    // TODO: handle duplicate username error
    console.error("Error creating profile:", error);
    Alert.alert("Profile creation failed: " + error.message);
  }
}

export default function Auth() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { user, session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    if (user) createProfile(user, username);
    if (error) {
      console.error("Error signing up:", error);
      Alert.alert(error.message);
    }
    if (!session)
      Alert.alert("Please check your inbox for email verification!");
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <BackgroundSwirl />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Image
              source={require("../assets/images/LOGO.png")}
              style={styles.logo}
            />
            <Text style={styles.headerText}>Patchwork</Text>
          </View>

          <Text style={styles.subtitle}>
            {isSignUp ? "Create your account" : "Welcome back"}
          </Text>

          <View style={styles.form}>
            {isSignUp && (
              <Input
                placeholder="Username"
                leftIcon={{
                  type: "font-awesome",
                  name: "user",
                  color: "#8d5fd3",
                  style: { marginRight: 8 },
                }}
                onChangeText={(text) => setUsername(text)}
                value={username}
                autoCapitalize={"none"}
                inputContainerStyle={styles.inputContainer}
                inputStyle={styles.input}
                placeholderTextColor="#aaa"
              />
            )}
            <Input
              placeholder="Email"
              leftIcon={{
                type: "font-awesome",
                name: "envelope",
                color: "#8d5fd3",
                style: { marginRight: 8 },
              }}
              onChangeText={(text) => setEmail(text)}
              value={email}
              autoCapitalize={"none"}
              inputContainerStyle={styles.inputContainer}
              inputStyle={styles.input}
              placeholderTextColor="#aaa"
            />
            <Input
              placeholder="Password"
              leftIcon={{
                type: "font-awesome",
                name: "lock",
                color: "#8d5fd3",
                style: { marginRight: 8 },
              }}
              onChangeText={(text) => setPassword(text)}
              value={password}
              secureTextEntry={true}
              autoCapitalize={"none"}
              inputContainerStyle={styles.inputContainer}
              inputStyle={styles.input}
              placeholderTextColor="#aaa"
            />

            <TouchableOpacity
              style={styles.mainButton}
              onPress={() => (isSignUp ? signUpWithEmail() : signInWithEmail())}
              disabled={loading}
            >
              <Text style={styles.mainButtonText}>
                {isSignUp ? "Sign Up" : "Sign In"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={styles.switchButtonText}>
                {isSignUp
                  ? "Already have an account? Sign In"
                  : "New to Patchwork? Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f0fa",
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  logo: {
    width: 70,
    height: 70,
    marginRight: 8,
    borderRadius: 8,
  },
  headerText: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#a084ca",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 24,
    color: "#333",
    textAlign: "center",
    marginBottom: 30,
    fontWeight: "600",
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  inputContainer: {
    borderBottomWidth: 0,
    backgroundColor: "#f7f0fa",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 15,
  },
  input: {
    color: "#333",
    fontSize: 16,
  },
  mainButton: {
    backgroundColor: "#8d5fd3",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  mainButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  switchButton: {
    marginTop: 20,
    alignItems: "center",
  },
  switchButtonText: {
    color: "#8d5fd3",
    fontSize: 14,
  },
});
