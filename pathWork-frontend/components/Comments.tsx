import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { getComments, addComment } from '../lib/comments';

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
  }, [postId]);

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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Comments</Text>
      {loading ? (
        <ActivityIndicator color="#8d5fd3" />
      ) : (
        <FlatList
          data={comments}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.commentItem}>
              <Text style={styles.username}>{item.public_profiles?.username || 'User'}</Text>
              <Text style={styles.commentText}>{item.comment_text}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.noComments}>No comments yet.</Text>}
        />
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
}); 