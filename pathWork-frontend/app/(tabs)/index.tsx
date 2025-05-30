import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  RefreshControl,
  Animated,
  ActivityIndicator,
  Modal,
  Dimensions,
  Alert,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Post, checkIfUserIsMod, getPostsFromFollowing } from "../../lib/posts";
import VideoPlayer from "../../components/VideoPlayer";
import LinkDisplay from "../../components/LinkDisplay";
import AudioPlayer from "../../components/AudioPlayer";
import formatTime from "../../components/timeFormat";
import { Ionicons } from "@expo/vector-icons";
import Comments from "../../components/Comments";
import { supabase } from "../../lib/supabase";
import { getCommentCount } from "../../lib/comments";

import { useQueryClient, useQuery } from "@tanstack/react-query";
import {
  usePosts,
  useFollowingPosts,
  useDeletePost,
  queryKeys,
} from "../../lib/queries";
import { Image as ExpoImage } from "expo-image";

const categories = [
  "All",
  "Following",
  "Visual Arts",
  "Digital Art",
  "Photography",
  "Music & Audio",
  "Performance",
  "Writing & Poetry",
  "Design",
  "Craft & DIY",
  "Film & Video",
  "Animation",
  "Fashion",
  "Architecture",
  "Mixed Media",
] as const;

export default function Index() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategory] =
    useState<(typeof categories)[number]>("All");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isMod, setIsMod] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Use React Query hooks
  const {
    data: allPosts = [],
    isLoading: isLoadingAllPosts,
    error: allPostsError,
    refetch: refetchAllPosts,
  } = usePosts();

  const {
    data: followingPosts = [],
    isLoading: isLoadingFollowingPosts,
    error: followingPostsError,
    refetch: refetchFollowingPosts,
  } = useFollowingPosts(currentUserId);

  const deletePostMutation = useDeletePost();

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const userId = data.user?.id || null;
      setCurrentUserId(userId);
      if (userId) {
        checkIfUserIsMod(userId).then(setIsMod);
      }
    });
  }, []);

  // Prefetch following posts when user is logged in
  useEffect(() => {
    if (currentUserId) {
      queryClient.prefetchQuery({
        queryKey: queryKeys.followingPosts(currentUserId),
        queryFn: () => getPostsFromFollowing(currentUserId),
      });
    }
  }, [currentUserId, queryClient]);

  // Determine which posts to show based on category and search
  const displayedPosts = useMemo(() => {
    let posts = selectedCategory === "Following" ? followingPosts : allPosts;

    if (selectedCategory !== "All" && selectedCategory !== "Following") {
      posts = posts.filter(
        (post) => post.tags && post.tags.includes(selectedCategory)
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      posts = posts.filter((post) => {
        const title = post.title?.toLowerCase() || "";
        const description = post.description?.toLowerCase() || "";
        const username = post.user?.username?.toLowerCase() || "";
        const project = post.project?.toLowerCase() || "";

        return (
          title.includes(query) ||
          description.includes(query) ||
          username.includes(query) ||
          project.includes(query)
        );
      });
    }

    return posts;
  }, [selectedCategory, allPosts, followingPosts, searchQuery]);

  // Loading and error states
  const isLoading =
    selectedCategory === "Following"
      ? isLoadingFollowingPosts
      : isLoadingAllPosts;

  const currentError =
    selectedCategory === "Following" ? followingPostsError : allPostsError;

  const onRefresh = React.useCallback(() => {
    if (selectedCategory === "Following") {
      refetchFollowingPosts();
    } else {
      refetchAllPosts();
    }
  }, [selectedCategory, refetchFollowingPosts, refetchAllPosts]);

  const toggleSearch = () => {
    const toValue = isSearchVisible ? 0 : 1;
    setIsSearchVisible(!isSearchVisible);

    Animated.parallel([
      Animated.timing(animatedWidth, {
        toValue,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(textOpacity, {
        toValue: isSearchVisible ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
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
          onPress: () => {
            deletePostMutation.mutate(postId);
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f0fa" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <ExpoImage
            source={require("../../assets/images/LOGO.png")}
            style={styles.logo}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
          <Animated.Text style={[styles.headerText, { opacity: textOpacity }]}>
            Patchwork
          </Animated.Text>
        </View>
        <View style={styles.searchContainer}>
          <Animated.View
            style={[
              styles.searchBar,
              {
                width: animatedWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 200],
                }),
              },
            ]}
          >
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onBlur={() => {
                if (!searchQuery) {
                  toggleSearch();
                }
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#8d5fd3" />
              </TouchableOpacity>
            )}
          </Animated.View>
          <TouchableOpacity
            onPress={toggleSearch}
            style={styles.searchIcon}
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={24} color="#8d5fd3" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabs}
      >
        {categories.map((cat) => (
          <TouchableOpacity key={cat} onPress={() => setSelectedCategory(cat)}>
            <Text
              style={[
                styles.tabText,
                selectedCategory === cat && styles.tabTextActive,
              ]}
            >
              {cat}
            </Text>
            {selectedCategory === cat && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

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

      {/* Feed */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.feed}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            colors={["#8d5fd3"]}
            tintColor="#8d5fd3"
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8d5fd3" />
            <Text style={styles.loadingText}>Loading posts...</Text>
          </View>
        ) : currentError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              {typeof currentError === "string"
                ? currentError
                : "An error occurred"}
            </Text>
          </View>
        ) : displayedPosts.length === 0 ? (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>
              {searchQuery
                ? "No posts found matching your search"
                : selectedCategory === "All"
                ? "No posts available"
                : `No posts found in ${selectedCategory} category`}
            </Text>
          </View>
        ) : (
          displayedPosts.map((post) => (
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
                <View style={styles.tagContainer}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{post.tags}</Text>
                  </View>
                </View>
                {(currentUserId === post.user.id || isMod) && (
                  <TouchableOpacity
                    onPress={() => handleDeletePost(post.id)}
                    style={styles.deleteIcon}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ff4444" />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.postContent}>
                <Text style={styles.postTitle}>{post.title}</Text>
                <Text style={styles.postText}>{post.description}</Text>
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
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <VideoPlayer url={post.media_url} />
                  </TouchableOpacity>
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
              <View style={styles.postFooter}>
                <Text style={styles.time}>{formatTime(post.created_at)}</Text>
                <CommentCount postId={post.id} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f0fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: "#f7f0fa",
    justifyContent: "space-between",
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  headerText: {
    fontSize: 37,
    fontWeight: "bold",
    color: "#a084ca",
    letterSpacing: 1,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  tabs: {
    flexGrow: 0,
    flexShrink: 0,
    flexDirection: "row",
    paddingHorizontal: 10,
    backgroundColor: "#f7f0fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e0d6f7",
  },
  tabText: {
    fontSize: 17,
    color: "#6c6c6c",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#8d5fd3",
    fontWeight: "bold",
  },
  tabUnderline: {
    height: 4,
    backgroundColor: "#8d5fd3",
    borderRadius: 2,
    marginTop: 4,
  },
  feed: {
    flex: 1,
    paddingHorizontal: 0,
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
    overflow: "hidden",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    paddingBottom: 8,
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
    color: "#888",
    fontSize: 13,
    fontWeight: "500",
  },
  mediaContainer: {
    width: "100%",
    backgroundColor: "#f8f8f8",
  },
  postContent: {
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  postImage: {
    width: "100%",
    height: 220,
    backgroundColor: "#f0f0f0",
  },
  audioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  audioAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  audioWave: {
    flex: 1,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2e9fa",
    borderRadius: 8,
    marginRight: 8,
  },
  audioPlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f2e9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  postTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 6,
    color: "#222",
  },
  postText: {
    color: "#444",
    fontSize: 15,
    lineHeight: 20,
  },
  comments: {
    color: "#8d5fd3",
    fontSize: 13,
    fontWeight: "600",
  },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e0d6f7",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 4,
  },
  navBtn: {
    flex: 1,
    alignItems: "center",
  },
  navBtnCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navIcon: {
    fontSize: 28,
    color: "#8d5fd3",
  },
  navIconCenter: {
    fontSize: 36,
    color: "#8d5fd3",
    fontWeight: "bold",
  },
  navAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#8d5fd3",
  },
  postFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0d6f7",
    backgroundColor: "#fff",
  },
  tagContainer: {
    flexDirection: "row",
    marginLeft: 4,
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
    marginRight: 10,
    height: 36,
    position: "relative",
  },
  searchBar: {
    height: 36,
    backgroundColor: "#fff",
    borderRadius: 18,
    overflow: "hidden",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e0d6f7",
    position: "absolute",
    right: 40,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    padding: 4,
    marginRight: 8,
  },
  searchIcon: {
    padding: 4,
    zIndex: 2,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    color: "#8d5fd3",
    fontSize: 16,
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 16,
  },
  noResultsContainer: {
    padding: 20,
    alignItems: "center",
  },
  noResultsText: {
    color: "#666",
    fontSize: 16,
  },
  linkContainer: {
    padding: 14,
    backgroundColor: "#fff",
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
  deleteIcon: {
    marginLeft: "auto",
    padding: 4,
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
