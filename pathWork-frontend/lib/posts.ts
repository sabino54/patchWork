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
    tags: data.tags,
    project: data.project,
    version: data.version,
    user: data.user,
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

// Helper function to convert image URI to array buffer
const fetchImageFromUri = async (uri: string) => {
  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();
  return arrayBuffer;
};

export async function uploadImage({
  imageUri,
  userId,
}: {
  imageUri: string;
  userId: string;
}): Promise<string> {
  // Convert the image URI to a Blob and generate a unique filename
  const imageArray = await fetchImageFromUri(imageUri);
  const randomImageUUID = uuid.v4();
  const fileExtension = imageUri.split('.').pop();
  const filename = `${userId}/${randomImageUUID}.${fileExtension}`;

  // Upload the image to Supabase storage
  const { data, error } = await supabase.storage
    .from('posts')
    .upload(filename, imageArray);

  if (error) {
    throw new Error(`Error uploading image: ${error.message}`);
  }

  // Get the public URL of the uploaded image
  const publicUrl = supabase.storage.from('posts').getPublicUrl(filename)
    .data.publicUrl;

  return publicUrl;
}

export async function createPost({
  title,
  description,
  userId,
  mediaUrl,
  mediaType,
}: {
  title: string;
  description: string;
  userId: string;
  mediaUrl: string | null;
  mediaType: PostMediaType;
}): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .insert({
      title,
      description,
      user_id: userId,
      media_url: mediaUrl,
      media_type: mediaType,
    })
    .select();

  if (error) {
    throw new Error(`Error creating post: ${error.message}`);
  }

  return data;
}
