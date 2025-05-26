import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';
import { SafeAreaView, View, StyleSheet, Text, TouchableOpacity, ScrollView, Image, RefreshControl } from "react-native";
import { ConversationWithUsers, fetchAllConversations } from "@/lib/messages";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  
  // If more than a week, show the date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

export default function ChatList() {
  const [user, setUser] = useState<User | null>()
  const [conversations, setConversations] = useState<ConversationWithUsers[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  // Fetch the user from Supabase
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  // Fetch all conversations for the user
  useEffect(() => {
    if(!user) return;
    fetchAllConversations(user?.id || '').then((data) => {
      setConversations(data)
    })
  }, [user])

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (!user) return;
      const data = await fetchAllConversations(user.id);
      setConversations(data);
    } catch (error) {
      console.error("Error refreshing conversations:", error);
    } finally {
      setIsRefreshing(false);
    }
  }

  const onConversationPress = (conversationId: string) => {
    router.push(`/chat/${conversationId}`);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.conversationsContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing} 
            onRefresh={onRefresh} 
            colors={['#8d5fd3']}
          />
        }
      >
        {conversations.reverse().map((conversation) => (
          <TouchableOpacity 
            style={styles.conversationItem} 
            key={conversation.id}
            activeOpacity={0.7}
            onPress={() => onConversationPress(conversation.id)}
          >
            <View style={styles.conversationContent}>
              <Image 
                source={{ uri: conversation.user_a_id === user?.id 
                  ? conversation.user_b.profile_photo || 'https://placeimg.com/140/140/any'
                  : conversation.user_a.profile_photo || 'https://placeimg.com/140/140/any'
                }} 
                style={styles.profileImage} 
              />
              <View style={styles.conversationInfo}>
                <Text style={styles.username}>
                  {conversation.user_a_id === user?.id 
                    ? conversation.user_b.username
                    : conversation.user_a.username
                  }
                </Text>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {conversation.last_message || 'No messages yet'}
                </Text>
              </View>
            </View>
            <View style={styles.rightContent}>
              <Text style={styles.timeText}>
                {formatTimeAgo(new Date(conversation.last_message_at || conversation.created_at))}
              </Text>
              <MaterialIcons name="chevron-right" size={24} color="#8d5fd3" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f0fa',
  },
  header: {
    height: 60,
    backgroundColor: '#f7f0fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8d5fd3',
  },
  conversationsContainer: {
    paddingVertical: 10,
  },
  conversationItem: {
    padding: 15,
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginBottom: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#8d5fd3',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  conversationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#f2e9fa',
  },
  conversationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  rightContent: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 12,
  },
  timeText: {
    fontSize: 12,
    color: '#8d5fd3',
    marginBottom: 4,
  },
})
