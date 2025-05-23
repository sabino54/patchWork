import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";

import { supabase } from "../../lib/supabase";

const categories = [
  "All",
  "Music & Audio",
  "Visual Arts",
  "Performance",
  "Writing & Language",
];

export default function Index() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("posts")
      .select(`*, public_profiles (username, profile_photo)`)
      .order("created_at", { ascending: false });
    if (error) {
      setError("Failed to load posts");
      setLoading(false);
      return;
    }
    setPosts(data || []);
    setLoading(false);
  }

  // Helper to map Supabase post to UI post
  function mapPost(post: any) {
    return {
      id: post.id,
      user: post.public_profiles?.username
        ? `@${post.public_profiles.username}`
        : "@unknown",
      userImage: post.public_profiles?.profile_photo
        ? { uri: post.public_profiles.profile_photo }
        : require("../../assets/images/splash-icon.png"),
      time: timeAgo(post.created_at),
      type: post.media_type || "image",
      image: post.media_url
        ? { uri: post.media_url }
        : require("../../assets/images/splash-icon.png"),
      title: post.title,
      text: post.description,
      comments: 0, // Optionally fetch comment count
      category: post.tags && post.tags.length > 0 ? post.tags[0] : "Other",
      version: post.version || 1,
      projectId: post.project || post.id,
    };
  }

  // Helper to format time ago
  function timeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff} sec ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hour ago`;
    return `${Math.floor(diff / 86400)} day ago`;
  }

  const filteredPosts = posts
    .map(mapPost)
    .filter(
      (post) =>
        selectedCategory === "All" || post.category === selectedCategory
    );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <Image
            source={require("../../assets/images/LOGO.png")}
            style={styles.logo}
          />
          <Text style={styles.headerText}>Patchwork</Text>
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

      {/* Feed */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#8d5fd3" />
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "red" }}>{error}</Text>
        </View>
      ) : filteredPosts.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>No posts found.</Text>
        </View>
      ) : (
        <ScrollView style={styles.feed}>
          {filteredPosts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <Image
                  source={post.userImage}
                  style={styles.avatar}
                />
                <Text style={styles.username}>{post.user}</Text>
                <View style={styles.versionBadge}>
                  <Text style={styles.versionText}>v{post.version}</Text>
                </View>
                <Text style={styles.time}>{post.time}</Text>
              </View>
              {post.type === "image" && (
                <Image source={post.image} style={styles.postImage} />
              )}
              {post.type === "audio" && (
                <View style={styles.audioRow}>
                  <Image source={post.image} style={styles.audioAvatar} />
                  <View style={styles.audioWave}>
                    <Text style={{ color: "#aaa" }}>[waveform]</Text>
                  </View>
                  <TouchableOpacity style={styles.audioPlayBtn}>
                    <Text style={{ fontSize: 20, color: "#8d5fd3" }}>▶</Text>
                  </TouchableOpacity>
                </View>
              )}
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postText}>{post.text}</Text>
              <View style={styles.tagContainer}>
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{post.category}</Text>
                </View>
              </View>
              <Text style={styles.comments}>{post.comments} comments</Text>
            </View>
          ))}
        </ScrollView>
      )}
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
    justifyContent: "center",
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: "#f7f0fa",
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 8,
    borderRadius: 8,
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
    justifyContent: "center",
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
    fontSize: 15,
    color: "#6c6c6c",
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 4,
  },
  tabTextActive: {
    color: "#8d5fd3",
    fontWeight: "bold",
  },
  tabUnderline: {
    height: 3,
    backgroundColor: "#8d5fd3",
    borderRadius: 2,
    marginTop: 2,
  },
  feed: {
    flex: 1,
    paddingHorizontal: 0,
  },
  postCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    margin: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  username: {
    fontWeight: "bold",
    color: "#333",
    marginRight: 8,
  },
  time: {
    color: "#aaa",
    fontSize: 12,
    marginLeft: "auto",
  },
  postImage: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#eee",
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
    fontSize: 16,
    marginBottom: 2,
    color: "#222",
  },
  postText: {
    color: "#444",
    marginBottom: 8,
  },
  comments: {
    color: "#8d5fd3",
    fontSize: 13,
    marginTop: 2,
    fontWeight: "500",
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
  tagContainer: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 4,
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
});
