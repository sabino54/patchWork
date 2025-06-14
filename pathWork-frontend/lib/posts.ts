import { supabase } from "./supabase";
import uuid from "react-native-uuid";

export type PostMediaType = "image" | "audio" | "video" | "link";

export interface User {
  id: string;
  username: string;
  bio: string;
  profile_photo: string;
  mod?: boolean;
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
    .from("posts")
    .select(
      `
            *,
            user:public_profiles(*, mod)
        `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }

  return (data || []).map(transformPost);
}

export async function getPostsByUsername(username: string): Promise<Post[]> {
  // First, get the user ID from the username
  const { data: userData, error: userError } = await supabase
    .from("public_profiles")
    .select("id")
    .eq("username", username)
    .single();

  if (userError) {
    console.error("Error fetching user by username:", userError);
    throw userError;
  }

  if (!userData) {
    return [];
  }

  // Then get posts by user ID
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
            *,
            user:public_profiles(*, mod)
        `
    )
    .eq("user_id", userData.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts by username:", error);
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
  const fileExtension = mediaUri.split(".").pop();
  const filename = `${userId}/${randomUUID}.${fileExtension}`;

  // Upload the media to Supabase storage
  const { data, error } = await supabase.storage
    .from("posts")
    .upload(filename, mediaArray);

  if (error) {
    throw new Error(`Error uploading media: ${error.message}`);
  }

  // Get the public URL of the uploaded media
  const publicUrl = supabase.storage.from("posts").getPublicUrl(filename)
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
    .from("posts")
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

/**
 * Delete a post by its id. Only moderators should be able to call this.
 */
export async function deletePost(postId: string) {
  const { data, error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId);

  if (error) {
    throw new Error(`Error deleting post: ${error.message}`);
  }

  return data;
}

/**
 * Check if the current user is a moderator.
 */
export async function checkIfUserIsMod(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("public_profiles")
    .select("mod")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error checking mod status:", error);
    return false;
  }

  return data?.mod === true;
}

export async function getPostsFromFollowing(userId: string): Promise<Post[]> {
  // First get all the users that the current user follows
  const { data: followingData, error: followingError } = await supabase
    .from("follows")
    .select("followed_id")
    .eq("follower_id", userId);

  if (followingError) {
    console.error("Error fetching following:", followingError);
    throw followingError;
  }

  if (!followingData || followingData.length === 0) {
    return [];
  }

  // Get all posts from followed users
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      user:public_profiles(*, mod)
    `
    )
    .in(
      "user_id",
      followingData.map((f) => f.followed_id)
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts from following:", error);
    throw error;
  }

  return (data || []).map(transformPost);
}
