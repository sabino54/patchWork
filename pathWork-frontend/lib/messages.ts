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
