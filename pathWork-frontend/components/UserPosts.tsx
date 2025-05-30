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
import { Post, checkIfUserIsMod } from "../lib/posts";
import VideoPlayer from "./VideoPlayer";
import LinkDisplay from "./LinkDisplay";
import AudioPlayer from "./AudioPlayer";
import formatTime from "./timeFormat";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import Comments from "./Comments";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserPosts, useDeletePost, queryKeys } from "../lib/queries";
import { getCommentCount } from "../lib/comments";
import { Image as ExpoImage } from "expo-image";

interface UserPostsProps {
  username: string;
}

export default function UserPosts({ username }: UserPostsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isMod, setIsMod] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Use React Query hooks
  const {
    data: posts = [],
    isLoading,
    error: postsError,
  } = useUserPosts(username);

  const deletePostMutation = useDeletePost();

  useEffect(() => {
    // Get current user ID and check if they're a moderator
    supabase.auth.getUser().then(({ data }) => {
      const userId = data.user?.id || null;
      setCurrentUserId(userId);
      if (userId) {
        checkIfUserIsMod(userId).then(setIsMod);
      }
    });
  }, [username]);

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
          onPress: () => {
            deletePostMutation.mutate(postId, {
              onSuccess: () => {
                // Invalidate and refetch user posts
                queryClient.invalidateQueries({
                  queryKey: queryKeys.userPosts(username),
                });
              },
            });
          },
        },
      ]
    );
  };

  const openCommentsModal = (post: Post) => {
    setSelectedPost(post);
  };

  const closeCommentsModal = () => {
    setSelectedPost(null);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8d5fd3" />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  if (postsError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {typeof postsError === "string" ? postsError : "An error occurred"}
        </Text>
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
          <ExpoImage
            source={{ uri: selectedImage || "" }}
            style={styles.fullScreenImage}
            contentFit="contain"
            transition={200}
            cachePolicy="memory-disk"
          />
        </TouchableOpacity>
      </Modal>

      {/* Comments Modal */}
      <Modal
        visible={!!selectedPost}
        transparent={true}
        animationType="slide"
        onRequestClose={closeCommentsModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.commentsModalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={closeCommentsModal}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#8d5fd3" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Comments</Text>
            </View>
            {selectedPost && currentUserId && (
              <Comments postId={selectedPost.id} userId={currentUserId} />
            )}
          </View>
        </View>
      </Modal>

      {/* Posts */}
      {posts.map((post) => (
        <TouchableOpacity
          key={post.id}
          style={styles.postCard}
          onPress={() => openCommentsModal(post)}
        >
          <View style={styles.postHeader}>
            <ExpoImage
              source={{ uri: post.user.profile_photo }}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
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
                <ExpoImage
                  source={{ uri: post.media_url }}
                  style={styles.postImage}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
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
            <View style={styles.postBottomInfo}>
              <Text style={styles.time}>{formatTime(post.created_at)}</Text>
              <CommentCount postId={post.id} />
            </View>
          </View>
        </TouchableOpacity>
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
    backgroundColor: "#f0f0f0",
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
    backgroundColor: "#f0f0f0",
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  fullScreenImage: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    backgroundColor: "#000",
  },
  deleteIcon: {
    padding: 4,
    marginLeft: 8,
  },
  commentsModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "80%",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8d5fd3",
    marginLeft: 16,
  },
  postBottomInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  comments: {
    color: "#8d5fd3",
    fontSize: 13,
    fontWeight: "500",
  },
});

// Update CommentCount to use React Query
function CommentCount({ postId }: { postId: string }) {
  const { data: count = 0 } = useQuery({
    queryKey: ["comment-count", postId],
    queryFn: () => getCommentCount(postId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <Text style={styles.comments}>
      {count === null ? "..." : `${count} comment${count === 1 ? "" : "s"}`}
    </Text>
  );
}
