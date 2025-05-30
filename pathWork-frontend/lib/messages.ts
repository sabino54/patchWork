import { supabase } from './supabase';
import { PublicProfile } from './users';

export interface Message {
  id: string;
  sender_id: string;
  conversation_id: string;
  content: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  created_at: string;
  last_message: string | null;
  last_message_at: string | null;
  user_a_id: string;
  user_b_id: string;
}

export interface ConversationWithUsers extends Conversation {
  user_a: PublicProfile;
  user_b: PublicProfile;
}

export interface MessageWithSender extends Message {
  sender: PublicProfile;
}

export async function createConversation({
  userAId,
  userBId,
}: {
  userAId: string;
  userBId: string;
}): Promise<Conversation> {
  // first check if a conversation already exists between the two users
  const { data: existingConversation, error: fetchError } = await supabase
    .from('conversations')
    .select('*')
    .or(
      `and(user_a_id.eq.${userAId},user_b_id.eq.${userBId}),and(user_a_id.eq.${userBId},user_b_id.eq.${userAId})`, // check both directions
    )
    .single();
  if (existingConversation) {
    return existingConversation;
  }

  // if no existing conversation, create a new one
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_a_id: userAId, user_b_id: userBId })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function fetchConversation(
  conversationId: string,
): Promise<ConversationWithUsers | null> {
  const { data, error } = await supabase
    .from('conversations')
    .select(
      `*, user_a:conversation_user_a_id_fkey(*), user_b:conversation_user_b_id_fkey(*)`,
    )
    .eq('id', conversationId)
    .single();

  if (error) {
    console.error('Error fetching conversation:', error);
    return null;
  }

  return data;
}

export async function fetchAllConversations(
  userId: string,
): Promise<ConversationWithUsers[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select(
      `*, user_a:conversation_user_a_id_fkey(*), user_b:conversation_user_b_id_fkey(*)`,
    )
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
    .order('last_message_at', { ascending: true }); // ascending is true because we want to show the most recent conversations first

  if (error) {
    throw error;
  }

  return data || [];
}

export async function fetchMessages(
  conversationId: string,
): Promise<MessageWithSender[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:messages_sender_id_fkey(*)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function sendMessage({
  conversationId,
  senderId,
  content,
}: {
  conversationId: string;
  senderId: string;
  content: string;
}): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Update the last message timestamp in the conversation
  const { data: lastmsgdata, error: lastmsgerror } = await supabase
    .from('conversations')
    .update({ last_message_at: data.created_at, last_message: content })
    .eq('id', conversationId)
    .select();
  if (lastmsgerror) {
    console.error('Error updating last message timestamp:', lastmsgerror);
  }

  return data;
}
