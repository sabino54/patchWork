import { supabase } from './supabase';

export interface PublicProfile {
  id: string;
  username: string;
  bio: string | null;
  profile_photo: string | null;
  private_id: string | null;
  uid: string | null;
  created_at: string;
}

export const fetchUserProfile = async (
  username: string,
): Promise<PublicProfile | null> => {
  const { data, error } = await supabase
    .from('public_profiles')
    .select('id, username, bio, profile_photo, private_id, uid, created_at')
    .eq('username', username)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  // Force a re-render of the profile image by adding a timestamp
  if (data.profile_photo) {
    data.profile_photo = `${data.profile_photo}?t=${Date.now()}`;
  }

  return data;
};

export const fetchUserProfileById = async (
  userId: string,
): Promise<PublicProfile | null> => {
  const { data, error } = await supabase
    .from('public_profiles')
    .select('id, username, bio, profile_photo, private_id, uid, created_at')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile by ID:', error);
    return null;
  }

  // Force a re-render of the profile image by adding a timestamp
  if (data.profile_photo) {
    data.profile_photo = `${data.profile_photo}?t=${Date.now()}`;
  }

  return data;
};
