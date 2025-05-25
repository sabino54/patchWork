import { RealtimeChannel, User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import {
  GiftedChat,
  IMessage,
  Bubble,
  Send,
  InputToolbar,
} from "react-native-gifted-chat";
import { supabase } from "@/lib/supabase";
import {
  SafeAreaView,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  ConversationWithUsers,
  fetchConversation,
  fetchMessages,
  sendMessage,
  Message,
} from "@/lib/messages";
import { useMutation } from "@tanstack/react-query";
import { fetchUserProfileById, PublicProfile } from "@/lib/users";

export default function Chat() {
  const router = useRouter();
  const { chatId } = useLocalSearchParams<{ chatId: string }>();

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [user, setUser] = useState<User | null>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [conversation, setConversation] =
    useState<ConversationWithUsers | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Fetch the user from Supabase
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  // Fetch public profile of the user
  useEffect(() => {
    if (!user) return;
    fetchUserProfileById(user.id).then((data) => {
      setProfile(data);
    });
  }, [user]);

  // Fetch the conversation details if chatId is provided
  useEffect(() => {
    fetchConversation(chatId || "").then((data) => {
      setConversation(data);
    });
  }, [chatId]);

  const loadMessages = async () => {
    try {
      const data = await fetchMessages(chatId || "");
      setMessages(
        data.reverse().map((msg) => ({
          _id: msg.id,
          text: msg.content,
          createdAt: new Date(msg.created_at),
          user: {
            _id: msg.sender_id,
            name: msg.sender.username || "Unknown",
            avatar:
              msg.sender.profile_photo || "https://placeimg.com/140/140/any",
          },
        })),
      );
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  // fetch messages for the conversation
  useEffect(() => {
    loadMessages();
  }, [chatId]);

  // Initialize the realtime channel for the conversation
  useEffect(() => {
    if (!chatId) return;
    if (!channel) {
      // Subscribe to the realtime channel for new messages
      const channel = supabase
        .channel(`${chatId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          (payload) => {
            const newMessage = payload.new as Message;
            appendMessage(newMessage);
          },
        )
        .subscribe();
      setChannel(channel);
    }

    return () => {
      // Unsubscribe from the channel when the component unmounts
      setChannel(null);
      channel?.unsubscribe();
    };
  }, [conversation]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadMessages();
    setIsRefreshing(false);
  };

  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: (data) => {
      console.log("Message sent successfully:", data);
    },
    onError: (error) => {
      Alert.alert("Error. Failed to send message. Please try again.");
      console.error("Error sending message:", error);
    },
  });

  const appendMessage = (newMessage: Message) => {
    setMessages((prevMessages) =>
      GiftedChat.append(prevMessages, [
        {
          _id: newMessage.id,
          text: newMessage.content,
          createdAt: new Date(newMessage.created_at),
          user: {
            _id: newMessage.sender_id,
            name:
              conversation?.user_a_id === newMessage.sender_id
                ? conversation?.user_a.username
                : conversation?.user_b.username,
            avatar:
              (conversation?.user_a_id === newMessage.sender_id
                ? conversation?.user_a.profile_photo
                : conversation?.user_b.profile_photo) ||
              "https://placeimg.com/140/140/any",
          },
        },
      ]),
    );
  };

  const onSend = (messages: any[] = []) => {
    sendMessageMutation.mutate({
      conversationId: chatId || "",
      senderId: user?.id || "",
      content: messages[0].text,
    });
  };

  const renderBubble = (props: any) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: "#f2e9fa",
          },
          right: {
            backgroundColor: "#8d5fd3",
          },
        }}
        textStyle={{
          left: {
            color: "#222",
          },
          right: {
            color: "#fff",
          },
        }}
      />
    );
  };

  const renderSend = (props: any) => {
    return (
      <Send {...props}>
        <View style={styles.sendButton}>
          <Ionicons name="send" size={24} color="#8d5fd3" />
        </View>
      </Send>
    );
  };

  const renderInputToolbar = (props: any) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbar}
        primaryStyle={styles.inputPrimary}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.navigate("..")}
        >
          <Ionicons name="arrow-back" size={24} color="#8d5fd3" />
        </TouchableOpacity>
        {conversation && (
          <View style={styles.headerContent}>
            <Image
              source={{
                uri:
                  conversation.user_a_id === user?.id
                    ? conversation.user_b.profile_photo ||
                      "https://placeimg.com/140/140/any"
                    : conversation.user_a.profile_photo ||
                      "https://placeimg.com/140/140/any",
              }}
              style={styles.headerImage}
            />
            <Text style={styles.headerTitle}>
              {conversation.user_a_id === user?.id
                ? conversation.user_b.username
                : conversation.user_a.username}
            </Text>
          </View>
        )}
      </View>

      {user && (
        <GiftedChat
          messages={messages}
          onSend={(messages) => onSend(messages)}
          user={{
            _id: user.id,
            name: profile?.username || "User",
            avatar:
              profile?.profile_photo || "https://placeimg.com/140/140/any",
          }}
          renderBubble={renderBubble}
          renderSend={renderSend}
          renderInputToolbar={renderInputToolbar}
          alwaysShowSend
          scrollToBottom
          infiniteScroll
          messagesContainerStyle={styles.messagesContainer}
          onLoadEarlier={onRefresh}
          isLoadingEarlier={isRefreshing}
          listViewProps={{
            refreshControl: (
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
            ),
          }}
          // loadEarlier={true}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e8e0f0",
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  headerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#f2e9fa",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
  },
  messagesContainer: {
    backgroundColor: "#f7f0fa",
  },
  inputToolbar: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  inputPrimary: {
    padding: 4,
    borderTopWidth: 1,
    borderTopColor: "#e8e0f0",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f2e9fa",
    justifyContent: "center",
    alignItems: "center",
  },
});
