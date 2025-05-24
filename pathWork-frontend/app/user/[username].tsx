import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useState, useEffect } from "react";
import React from "react";
import ArtworkFolders from "../../components/ArtworkFolders";

export default function UserProfile() {
  const router = useRouter();
  const { username } = useLocalSearchParams();
  const [userData, setUserData] = useState<{
    username: string;
    bio: string;
    profile_photo: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [username]);

  async function fetchUserProfile() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("public_profiles")
        .select("username, bio, profile_photo")
        .eq("username", username)
        .single();

      if (error) throw error;

      // Force a re-render of the profile image by adding a timestamp
      if (data.profile_photo) {
        data.profile_photo = `${data.profile_photo}?t=${Date.now()}`;
      }

      setUserData(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  }

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchUserProfile();
    setRefreshing(false);
  }, []);

  if (loading) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8d5fd3"
            colors={["#8d5fd3"]}
            progressViewOffset={20}
            progressBackgroundColor="#f7f0fa"
          />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={{ position: "absolute", left: 20, top: 20, zIndex: 1 }}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={28} color="#666" />
          </TouchableOpacity>
          <Image
            source={{ uri: userData?.profile_photo }}
            style={styles.profileImage}
          />
          <Text style={styles.name}>{userData?.username}</Text>
          <Text style={styles.username}>
            @{userData?.username || "username"}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>64</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        <View style={styles.bioContainer}>
          <Text style={styles.bioTitle}>About</Text>
          <Text style={styles.bioText}>
            {userData?.bio || "No bio available"}
          </Text>
        </View>

        <ArtworkFolders folders={[]} onFolderPress={() => {}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    paddingVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  username: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#a084ca",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  bioContainer: {
    padding: 20,
  },
  bioTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  bioText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
});
