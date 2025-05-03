import React, { useState } from "react";
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

const categories = [
  "All",
  "Music",
  "Sewing & Knitting",
  "Photography",
  "Painting",
];

const posts = [
  {
    id: 1,
    user: "@avi.udash",
    userImage: require("../assets/images/avitypeshit.png"),
    time: "2 mins ago",
    type: "image",
    image: require("../assets/images/skateTest.png"), // Placeholder
    title: "Film around Stanford v1",
    text: "started my film photography arc... here are some shots of @stanford.skates ! hmu if u wanna go shoot tgt around campus sometime",
    comments: 2,
  },
  {
    id: 2,
    user: "@Sabzz",
    userImage: require("../assets/images/SabinoCropped.jpeg"), // Placeholder
    time: "2 mins ago",
    type: "audio",
    image: require("../assets/images/splash-icon.png"), // Placeholder
    audio: true, // Placeholder for waveform
    title: "Sabino - Sunrise",
    text: "Been cooking up some new jazz tunes on the sax lately, check it out! 🎷",
    comments: 0,
  },
  {
    id: 3,
    user: "@adrian",
    userImage: require("../assets/images/andrewTypeShit.png"),
    time: "2 mins ago",
    type: "image",
    image: require("../assets/images/guitarTest.png"), // Placeholder
    title: "Guitar Practice",
    text: "Rehearsing with the band, still figuring out new songs 🎸",
    comments: 2,
  },
];

export default function Index() {
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <Image
            source={require("../assets/images/LOGO.png")}
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
                source={
                  post.userImage || require("../assets/images/splash-icon.png")
                }
                style={styles.avatar}
              />
              <Text style={styles.username}>{post.user}</Text>
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
            <Text style={styles.comments}>{post.comments} comments</Text>
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
});
