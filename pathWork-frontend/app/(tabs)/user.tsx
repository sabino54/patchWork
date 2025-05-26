import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useState, useEffect } from "react";
import React from "react";
import UserPosts from "../../components/UserPosts";
import Following from "../../components/Following";

export default function UserProfile() {
  const router = useRouter();
  const [userData, setUserData] = useState<{
    id: string;
    username: string;
    bio: string;
    profile_photo: string;
    mod?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (userData?.id) {
      fetchFollowingCount();
    }
  }, [userData?.id]);

  useEffect(() => {
    if (userData?.id) {
      fetchFollowingCount();
      // Refresh count every 5 seconds
      const interval = setInterval(fetchFollowingCount, 5000);
      return () => clearInterval(interval);
    }
  }, [userData?.id]);

  const fetchFollowingCount = async () => {
    if (!userData?.id) return;

    try {
      const { count, error } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userData.id);

      if (error) throw error;
      setFollowingCount(count || 0);
    } catch (error) {
      console.error("Error fetching following count:", error);
    }
  };

  async function fetchUserProfile() {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("public_profiles")
        .select("id, username, bio, profile_photo, mod")
        .eq("id", user.id)
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
    await fetchFollowingCount();
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
            style={{ position: "absolute", right: 20, top: 20, zIndex: 1 }}
            onPress={() => router.push("../account")}
          >
            <Ionicons name="settings-outline" size={28} color="#666" />
          </TouchableOpacity>
          <Image
            source={{ uri: userData?.profile_photo }}
            style={styles.profileImage}
          />
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{userData?.username}</Text>
            <Text style={styles.username}>
              @{userData?.username || "username"}
            </Text>
            {userData?.mod && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminText}>MODERATOR</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => setShowFollowing(true)}
          >
            <Text style={styles.statNumber}>{followingCount}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bioContainer}>
          <Text style={styles.bioTitle}>About</Text>
          <Text style={styles.bioText}>
            {userData?.bio || "No bio available"}
          </Text>
        </View>

        <View style={styles.postsSection}>
          <Text style={styles.postsSectionTitle}>Posts</Text>
          <UserPosts username={userData?.username || ""} />
        </View>
      </ScrollView>

      <Modal
        visible={showFollowing}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFollowing(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Following</Text>
              <TouchableOpacity
                onPress={() => setShowFollowing(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Following
              userId={userData?.id || ""}
              onUserPress={() => setShowFollowing(false)}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f0fa",
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
  nameContainer: {
    alignItems: "center",
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
  adminBadge: {
    backgroundColor: "#a084ca",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  adminText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
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
  postsSection: {
    marginTop: 20,
  },
  postsSectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    flex: 1,
    backgroundColor: "#f7f0fa",
    marginTop: 100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "white",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
});
