import { supabase } from './supabase';
import uuid from 'react-native-uuid';

export type PostMediaType = 'image' | 'audio' | 'video' | 'link';

export interface User {
  id: string;
  username: string;
  bio: string;
  profile_photo: string;
}

export interface Post {
  id: string;
  created_at: string;
  media_url: string;
  media_type: PostMediaType;
  description: string;
  user_id: string;
  title: string;
  tags: string[];
  project: string;
  version: number;
  user: User;
}

function transformPost(data: any): Post {
  return {
    id: data.id,
    created_at: data.created_at,
    media_url: data.media_url,
    media_type: data.media_type,
    description: data.description,
    user_id: data.user_id,
    title: data.title,
    tags: data.tag,
    project: data.project,
    version: data.version,
    user: {
      ...data.user,
      profile_photo: data.user.profile_photo
        ? `${data.user.profile_photo}?t=${Date.now()}`
        : null,
    },
  };
}

export async function getPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select(
      `
            *,
            user:public_profiles(*)
        `,
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }

  return (data || []).map(transformPost);
}

export async function getPostsByUsername(username: string): Promise<Post[]> {
  // First, get the user ID from the username
  const { data: userData, error: userError } = await supabase
    .from('public_profiles')
    .select('id')
    .eq('username', username)
    .single();

  if (userError) {
    console.error('Error fetching user by username:', userError);
    throw userError;
  }

  if (!userData) {
    return [];
  }

  // Then get posts by user ID
  const { data, error } = await supabase
    .from('posts')
    .select(
      `
            *,
            user:public_profiles(*)
        `,
    )
    .eq('user_id', userData.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts by username:', error);
    throw error;
  }

  return (data || []).map(transformPost);
}

// Helper function to convert media URI to array buffer
const fetchMediaFromUri = async (uri: string) => {
  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();
  return arrayBuffer;
};

export async function uploadMedia({
  mediaUri,
  userId,
}: {
  mediaUri: string;
  userId: string;
}): Promise<string> {
  // Convert the media URI to a Blob and generate a unique filename
  const mediaArray = await fetchMediaFromUri(mediaUri);
  const randomUUID = uuid.v4();
  const fileExtension = mediaUri.split('.').pop();
  const filename = `${userId}/${randomUUID}.${fileExtension}`;

  // Upload the media to Supabase storage
  const { data, error } = await supabase.storage
    .from('posts')
    .upload(filename, mediaArray);

  if (error) {
    throw new Error(`Error uploading media: ${error.message}`);
  }

  // Get the public URL of the uploaded media
  const publicUrl = supabase.storage.from('posts').getPublicUrl(filename)
    .data.publicUrl;

  return publicUrl;
}

export async function createPost({
  title,
  description,
  userId,
  publicMediaUrl,
  mediaType,
  tag,
}: {
  title: string;
  description: string;
  userId: string;
  publicMediaUrl: string | null;
  mediaType: PostMediaType;
  tag: string[];
}): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      title,
      description,
      user_id: userId,
      media_url: publicMediaUrl,
      media_type: mediaType,
      tag,
    })
    .select();

  if (error) {
    throw new Error(`Error creating post: ${error.message}`);
  }

  return data;
}
