import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  Alert,
  Modal,
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from "../../lib/supabase";
import { useState, useEffect } from "react";
import React from "react";
import UserPosts from "../../components/UserPosts";
import ArtworkFolders from "../../components/ArtworkFolders";
import { Session } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";
import { createConversation } from "@/lib/messages";
import Following from "../../components/Following";

export default function UserProfile() {
  const router = useRouter();
  const { username } = useLocalSearchParams();
  const [userData, setUserData] = useState<{
    id: string;
    username: string;
    bio: string;
    profile_photo: string;
    mod?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followingCount, setFollowingCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
    };
    fetchSession();
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [username]);

  useEffect(() => {
    if (session?.user.id && userData?.id) {
      checkFollowStatus();
    }
  }, [session?.user.id, userData?.id]);

  useEffect(() => {
    if (userData?.id) {
      fetchFollowingCount();
      fetchPostsCount();
    }
  }, [userData?.id]);

  const checkFollowStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("follows")
        .select("*")
        .eq("follower_id", session?.user.id)
        .eq("followed_id", userData?.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking follow status:", error);
      }

      setIsFollowing(!!data);
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  const handleFollowPress = async () => {
    if (!session?.user.id || !userData?.id) return;

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", session.user.id)
          .eq("followed_id", userData.id);

        if (error) throw error;
        setIsFollowing(false);
      } else {
        // Follow
        const { error } = await supabase.from("follows").insert([
          {
            follower_id: session.user.id,
            followed_id: userData.id,
          },
        ]);

        if (error) throw error;
        setIsFollowing(true);
      }
      // Refresh following count after follow/unfollow
      fetchFollowingCount();
    } catch (error) {
      console.error("Error toggling follow status:", error);
      Alert.alert("Error", "Failed to update follow status");
    }
  };

  const createConversationMutation = useMutation({
    mutationFn: createConversation,
    onError: (error) => {
      console.error("Error creating conversation:", error);
      Alert.alert("Error. Failed to create conversation.");
    },
    onSuccess: (data) => {
      router.push(`/chat/${data.id}`);
    },
  });

  async function fetchUserProfile() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("public_profiles")
        .select("id, username, bio, profile_photo, mod")
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
    await fetchFollowingCount();
    await fetchPostsCount();
    setRefreshing(false);
  }, []);

  const handleMessagePress = () => {
    createConversationMutation.mutate({
      userAId: session?.user.id || "",
      userBId: userData?.id || "",
    });
  };

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

  const fetchPostsCount = async () => {
    if (!userData?.id) return;

    try {
      const { count, error } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userData.id);

      if (error) throw error;
      setPostsCount(count || 0);
    } catch (error) {
      console.error("Error fetching posts count:", error);
    }
  };

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
          {userData?.mod && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminText}>MODERATOR</Text>
            </View>
          )}
          <View style={styles.buttonContainer}>
            {session?.user.id !== userData?.id && (
              <>
                <TouchableOpacity
                  style={[
                    styles.followButton,
                    isFollowing && styles.followingButton,
                  ]}
                  onPress={handleFollowPress}
                >
                  <Text
                    style={[
                      styles.followButtonText,
                      isFollowing && styles.followingButtonText,
                    ]}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.messageButton}
                  onPress={handleMessagePress}
                >
                  <FontAwesome name="paper-plane" size={16} color="white" />
                  <Text style={styles.messageButtonText}>Message</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{postsCount}</Text>
            <Text style={styles.statLabel}>Posts</Text>
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
          <UserPosts username={username as string} />
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
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  followButton: {
    backgroundColor: "#a084ca",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 15,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  followingButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#a084ca",
  },
  followButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  followingButtonText: {
    color: "#a084ca",
  },
  messageButton: {
    backgroundColor: "#a084ca",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 15,
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    justifyContent: "center",
    height: 40,
  },
  messageButtonText: {
    color: "white",
    fontSize: 16,
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
  adminBadge: {
    backgroundColor: "#a084ca",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginTop: 5,
  },
  adminText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
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
