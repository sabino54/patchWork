import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { getComments, addComment, deleteComment, deleteCommentAsMod, checkIfUserIsMod } from '../lib/comments';

interface CommentProps {
  postId: string;
  userId: string;
}

export default function Comments({ postId, userId }: CommentProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
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
      setError(err.message || 'Failed to load comments');
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
      setCommentText('');
      fetchComments();
    } catch (err: any) {
      setError(err.message || 'Failed to add comment');
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
      <Text style={styles.header}>Comments</Text>
      {loading ? (
        <ActivityIndicator color="#8d5fd3" />
      ) : (
        comments.length === 0 ? (
          <Text style={styles.noComments}>No comments yet.</Text>
        ) : (
          comments.map(item => (
            <View key={item.id} style={styles.commentItem}>
              <Text style={styles.username}>{item.public_profiles?.username || 'User'}</Text>
              <Text style={styles.commentText}>{item.comment_text}</Text>
              {(item.user_id === userId || isMod) && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteComment(item.id, item.user_id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )
      )}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Add a comment..."
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleAddComment}
          disabled={submitting || !commentText.trim()}
        >
          <Text style={styles.buttonText}>{submitting ? '...' : 'Post'}</Text>
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    backgroundColor: '#f7f0fa',
    borderRadius: 10,
    padding: 10,
  },
  header: {
    fontWeight: 'bold',
    color: '#8d5fd3',
    marginBottom: 6,
    fontSize: 16,
  },
  commentItem: {
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
  },
  username: {
    fontWeight: 'bold',
    color: '#a084ca',
    marginBottom: 2,
  },
  commentText: {
    color: '#333',
  },
  noComments: {
    color: '#aaa',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0d6f7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    fontSize: 15,
  },
  button: {
    marginLeft: 8,
    backgroundColor: '#8d5fd3',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  error: {
    color: '#ff4444',
    marginTop: 6,
    textAlign: 'center',
  },
  deleteButton: {
    marginTop: 4,
    alignSelf: 'flex-end',
    backgroundColor: '#ff4444',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
}); 