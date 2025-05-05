import { Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#a084ca",
        tabBarInactiveTintColor: "#8E8E93",
        headerShown: false,
        tabBarStyle: {
          height: 80,
          backgroundColor: "#FFFFFF",
          overflow: "hidden",
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={30} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-post"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="plus-square" size={30} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user" size={30} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
