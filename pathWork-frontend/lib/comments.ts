import { supabase } from './supabase';

/**
 * Fetch all comments for a given post, including the commenter's public profile info.
 * Gets id of post and returns array of comment objects with user profile info.
 */
export async function getComments(post_id: string) {
  const { data, error } = await supabase
    .from('comments')
    // Also fetch the username and profile_photo from the related public_profiles table
    .select('*, public_profiles(username, profile_photo)')
    .eq('post_id', post_id)
    .order('created_at', { ascending: true }); // Oldest comments first
  if (error) throw error;
  return data;
}

/**
 * Add a new comment to a post given post ID, user ID, and comment text.
 * Returns the inserted comment data.
 */
export async function addComment(post_id: string, user_id: string, comment_text: string) {
  const { data, error } = await supabase
    .from('comments')
    .insert([{ post_id, user_id, comment_text }]);
  if (error) throw error;
  return data;
}

/**
 * Get the number of comments for a given post.
 */
export async function getCommentCount(post_id: string): Promise<number> {
  const { count, error } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', post_id);
  if (error) throw error;
  return count || 0;
} 

/**
 * Delete a comment by its id.
 */
export async function deleteComment(comment_id: string) {
    const { data, error } = await supabase
      .from('comments')
      .delete()
      .eq('id', comment_id);
    if (error) throw error;
    return data;
}

/**
 * Check if the current user is a moderator.
 */
export async function checkIfUserIsMod(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('public_profiles')
    .select('mod')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error checking mod status:', error);
    return false;
  }
  
  return data?.mod === true;
} 