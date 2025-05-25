import React, { useState, useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, TouchableOpacity } from "react-native";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import Auth from "../components/auth";
import Account from "../components/Account";
import { Ionicons } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function RootLayout() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (!session) {
    return <Auth />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
        <Stack.Screen
          name="account"
          options={{
            title: "Settings",
            headerStyle: {
              backgroundColor: "#f7f0fa",
            },
            headerTintColor: "#8d5fd3",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
            },
            headerShadowVisible: false,
            headerBackTitle: " ",
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={24} color="#8d5fd3" />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="folder/[id]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="user/[username]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="chat/[chatId]"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
