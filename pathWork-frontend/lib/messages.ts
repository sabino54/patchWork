import { supabase } from './supabase';

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
  last_message_at: string;
  user_a_id: string;
  user_b_id: string;
}

export async function createConversation({
  userAId,
  userBId,
}: {
  userAId: string;
  userBId: string;
}): Promise<Conversation> {
  const { data, error } = await supabase
    .from('conversations')
    .insert([{ user_a_id: userAId, user_b_id: userBId }])
    .select()
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }

  return data;
}
