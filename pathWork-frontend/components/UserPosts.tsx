import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Dimensions,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  getPostsByUsername,
  Post,
  deletePost,
  checkIfUserIsMod,
} from "../lib/posts";
import VideoPlayer from "./VideoPlayer";
import LinkDisplay from "./LinkDisplay";
import AudioPlayer from "./AudioPlayer";
import formatTime from "./timeFormat";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";

interface UserPostsProps {
  username: string;
}

export default function UserPosts({ username }: UserPostsProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isMod, setIsMod] = useState(false);

  useEffect(() => {
    loadUserPosts();
    // Get current user ID and check if they're a moderator
    supabase.auth.getUser().then(({ data }) => {
      const userId = data.user?.id || null;
      setCurrentUserId(userId);
      if (userId) {
        checkIfUserIsMod(userId).then(setIsMod);
      }
    });
  }, [username]);

  const loadUserPosts = async () => {
    try {
      setLoading(true);
      const userPosts = await getPostsByUsername(username);
      setPosts(userPosts);
      setError(null);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      console.error("Error loading user posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = (username: string) => {
    router.push(`/user/${username.replace("@", "")}` as any);
  };

  const handleImagePress = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const closeImageViewer = () => {
    setSelectedImage(null);
  };

  const handleDeletePost = async (postId: string) => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePost(postId);
              loadUserPosts(); // Refresh the posts list
            } catch (error) {
              Alert.alert("Error", "Failed to delete post");
              console.error("Error deleting post:", error);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8d5fd3" />
        <Text style={styles.loadingText}>Loading posts...</Text>
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

  if (posts.length === 0) {
    return (
      <View style={styles.noPostsContainer}>
        <Text style={styles.noPostsText}>No posts yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Full Screen Image Viewer */}
      <Modal
        visible={!!selectedImage}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageViewer}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={closeImageViewer}
        >
          <Image
            source={{ uri: selectedImage || "" }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Modal>

      {/* Posts */}
      {posts.map((post) => (
        <View key={post.id} style={styles.postCard}>
          <View style={styles.postHeader}>
            <Image
              source={{ uri: post.user.profile_photo }}
              style={styles.avatar}
            />
            <TouchableOpacity
              onPress={() => handleUserPress(post.user.username)}
            >
              <Text style={styles.username}>{post.user.username}</Text>
            </TouchableOpacity>
            <Text style={styles.time}>{formatTime(post.created_at)}</Text>
          </View>
          <View style={styles.mediaContainer}>
            {post.media_type === "image" && (
              <TouchableOpacity
                onPress={() => handleImagePress(post.media_url)}
              >
                <Image
                  source={{ uri: post.media_url }}
                  style={styles.postImage}
                />
              </TouchableOpacity>
            )}
            {post.media_type === "video" && (
              <VideoPlayer url={post.media_url} />
            )}
            {post.media_type === "link" && (
              <View style={styles.linkContainer}>
                <LinkDisplay url={post.media_url} />
              </View>
            )}
            {post.media_type === "audio" && (
              <AudioPlayer url={post.media_url} />
            )}
          </View>
          <View style={styles.postContent}>
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postText}>{post.description}</Text>
            <View style={styles.postFooter}>
              <View style={styles.tagContainer}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{post.tags}</Text>
                </View>
              </View>
              {(currentUserId === post.user_id || isMod) && (
                <TouchableOpacity
                  onPress={() => handleDeletePost(post.id)}
                  style={styles.deleteIcon}
                >
                  <Ionicons name="trash-outline" size={20} color="#ff4444" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f0fa",
  },
  postCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    margin: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    padding: 14,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  username: {
    fontWeight: "bold",
    color: "#8d5fd3",
    marginRight: 8,
  },
  time: {
    color: "#aaa",
    fontSize: 12,
    marginLeft: "auto",
    marginRight: 8,
  },
  mediaContainer: {
    width: "100%",
  },
  postContent: {
    padding: 14,
  },
  postImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#eee",
  },
  postTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 2,
    color: "#222",
  },
  postText: {
    color: "#444",
    marginBottom: 8,
  },
  postFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  tagContainer: {
    flexDirection: "row",
  },
  tag: {
    backgroundColor: "#f2e9fa",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0d6f7",
  },
  tagText: {
    color: "#8d5fd3",
    fontSize: 12,
    fontWeight: "600",
  },
  versionBadge: {
    backgroundColor: "#e0d6f7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  versionText: {
    color: "#8d5fd3",
    fontSize: 11,
    fontWeight: "600",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    color: "#8d5fd3",
    fontSize: 16,
    marginTop: 8,
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 16,
  },
  noPostsContainer: {
    padding: 20,
    alignItems: "center",
  },
  noPostsText: {
    color: "#666",
    fontSize: 16,
  },
  linkContainer: {
    paddingLeft: 14,
    paddingRight: 14,
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  deleteIcon: {
    padding: 4,
    marginLeft: 8,
  },
});
