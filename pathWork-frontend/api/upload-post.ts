import uuid from 'react-native-uuid';
import { supabase } from '@/lib/supabase';

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
}) {
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
  mediaType: 'image' | 'audio';
}) {
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
