import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";
import { Ionicons } from "@expo/vector-icons";

interface FollowingUser {
  id: string;
  username: string;
  profile_photo: string;
}

interface FollowingProps {
  userId: string;
  onUserPress?: () => void;
}

interface FollowingData {
  followed_id: string;
  public_profiles: FollowingUser;
}

export default function Following({ userId, onUserPress }: FollowingProps) {
  const router = useRouter();
  const [following, setFollowing] = useState<FollowingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFollowing();
  }, [userId]);

  const fetchFollowing = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("follows")
        .select(
          `
          followed_id,
          public_profiles!followed_id (
            id,
            username,
            profile_photo
          )
        `
        )
        .eq("follower_id", userId);

      if (error) throw error;

      // Transform the data to get the followed users' information
      const followingUsers = (data as unknown as FollowingData[])
        .map((item) => item.public_profiles)
        .filter((user): user is FollowingUser => user !== null);

      setFollowing(followingUsers);
    } catch (error) {
      console.error("Error fetching following:", error);
      setError("Failed to load following");
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = (username: string) => {
    router.push(`/user/${username}`);
    onUserPress?.();
  };

  const renderItem = ({ item }: { item: FollowingUser }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => handleUserPress(item.username)}
    >
      <Image
        source={{
          uri: item.profile_photo || "https://placeimg.com/140/140/any",
        }}
        style={styles.profileImage}
      />
      <Text style={styles.username} numberOfLines={1}>
        {item.username}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8d5fd3" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (following.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Not following anyone yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={following}
      keyExtractor={(item) => item.id}
      numColumns={2}
      renderItem={renderItem}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
  },
  listContainer: {
    padding: 10,
  },
  userCard: {
    flex: 1,
    margin: 5,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  username: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
});
