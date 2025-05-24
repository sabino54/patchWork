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
} from "react-native";
import { useRouter } from "expo-router";
import { getPosts, Post } from "../../lib/posts";
import VideoPlayer from "../../components/VideoPlayer";
import LinkDisplay from "../../components/LinkDisplay";
import AudioPlayer from "../../components/AudioPlayer";

const categories = [
  "All",
  "Music & Audio",
  "Visual Arts",
  "Performance",
  "Writing & Language",
];
export default function Index() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const posts = await getPosts();
      setPosts(posts);
      setError(null);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = (username: string) => {
    console.log("username", username);
    router.push(`/user/${username.replace("@", "")}`);
  };

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
      <ScrollView style={styles.feed}>
        {posts.map((post) => (
          <View key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <Image
                source={require("../../assets/images/splash-icon.png")}
                style={styles.avatar}
              />
              <TouchableOpacity onPress={() => handleUserPress(post.user_id)}>
                {" "}
                {/* TODO: Should be username  */}
                <Text style={styles.username}>{post.user_id}</Text>
              </TouchableOpacity>
              <View style={styles.versionBadge}>
                <Text style={styles.versionText}>v{post.version}</Text>{" "}
                {/* TODO: add version to a post on supa */}
              </View>
              <Text style={styles.time}>{post.created_at}</Text>
            </View>
            {post.media_type === "image" && (
              <Image
                source={{ uri: post.media_url }}
                style={styles.postImage}
              />
            )}
            {post.media_type === "video" && (
              <VideoPlayer url={post.media_url} />
            )}
            {post.media_type === "link" && <LinkDisplay url={post.media_url} />}
            {post.media_type === "audio" && (
              <AudioPlayer
                url={post.media_url}
                title={post.title}
                artist={post.user_id}
              />
            )}
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postText}>{post.description}</Text>
            <View style={styles.tagContainer}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{post.project} COOL ART </Text>{" "}
                {/* TODO: add tags to a post on supa */}
              </View>
            </View>
            <Text style={styles.comments}> 0 comments</Text>{" "}
            {/* TODO: grab comments to a post on supa */}
          </View>
        ))}
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
    color: "#8d5fd3",
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
