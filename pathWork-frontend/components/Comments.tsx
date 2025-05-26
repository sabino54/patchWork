import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { getComments, addComment, deleteComment, deleteCommentAsMod, checkIfUserIsMod } from "../lib/comments";
import { Ionicons } from "@expo/vector-icons";

interface CommentProps {
  postId: string;
  userId: string;
}

export default function Comments({ postId, userId }: CommentProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMod, setIsMod] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await getComments(postId);
      setComments(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // Check if current user is a moderator
    checkIfUserIsMod(userId).then(setIsMod);
  }, [postId, userId]);

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await addComment(postId, userId, commentText.trim());
      setCommentText("");
      fetchComments();
    } catch (err: any) {
      setError(err.message || "Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string, commentUserId: string) => {
    try {
      if (isMod) {
        // Moderators can delete any comment
        await deleteCommentAsMod(commentId);
      } else if (commentUserId === userId) {
        // Users can only delete their own comments
        await deleteComment(commentId);
      }
      fetchComments();
    } catch (err: any) {
      setError(err.message || 'Failed to delete comment');
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8d5fd3" />
        </View>
      ) : (
        <ScrollView style={styles.commentsList}>
          {comments.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-outline" size={48} color="#e0d6f7" />
              <Text style={styles.noComments}>Be the first to comment</Text>
            </View>
          ) : (
            comments.map((item) => (
              <View key={item.id} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <View style={styles.userInfo}>
                    <Image
                      source={{
                        uri:
                          item.public_profiles?.profile_photo ||
                          "https://via.placeholder.com/40",
                      }}
                      style={styles.avatar}
                    />
                    <View>
                      <Text style={styles.username}>
                        {item.public_profiles?.username || "User"}
                      </Text>
                      <Text style={styles.timestamp}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  {item.user_id === userId && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={async () => {
                        await deleteComment(item.id);
                        fetchComments();
                      }}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#ff4444"
                      />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.commentText}>{item.comment_text}</Text>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Write a comment..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity
          style={[
            styles.button,
            (!commentText.trim() || submitting) && styles.buttonDisabled,
          ]}
          onPress={handleAddComment}
          disabled={submitting || !commentText.trim()}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color="#ff4444" />
          <Text style={styles.error}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  commentsList: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  noComments: {
    color: "#999",
    fontSize: 16,
    marginTop: 12,
  },
  commentItem: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  username: {
    fontWeight: "600",
    color: "#333",
    fontSize: 15,
  },
  timestamp: {
    color: "#999",
    fontSize: 12,
    marginTop: 2,
  },
  commentText: {
    color: "#444",
    fontSize: 15,
    lineHeight: 20,
  },
  deleteButton: {
    padding: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 48,
    fontSize: 15,
    maxHeight: 100,
    color: "#333",
  },
  button: {
    position: "absolute",
    right: 24,
    backgroundColor: "#8d5fd3",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#e0d6f7",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff5f5",
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  error: {
    color: "#ff4444",
    marginLeft: 8,
    fontSize: 14,
  },
});
