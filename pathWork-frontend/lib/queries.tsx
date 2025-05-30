// pathWork-frontend/lib/queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getPosts, 
  getPostsByUsername, 
  getPostsFromFollowing, 
  createPost, 
  deletePost,
  Post,
  PostMediaType 
} from './posts';

// Query keys as constants to avoid typos and enable better TypeScript support
export const queryKeys = {
  posts: 'posts',
  userPosts: (username: string) => ['user-posts', username],
  followingPosts: (userId: string) => ['following-posts', userId],
  userProfile: (username: string) => ['user-profile', username],
} as const;

// Custom hook for fetching all posts
export function usePosts() {
  return useQuery({
    queryKey: [queryKeys.posts],
    queryFn: getPosts,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  });
}

// Custom hook for fetching user posts
export function useUserPosts(username: string) {
  return useQuery({
    queryKey: queryKeys.userPosts(username),
    queryFn: () => getPostsByUsername(username),
    enabled: !!username, // Only run query if username is provided
    staleTime: 5 * 60 * 1000,
  });
}

// Custom hook for fetching following posts
export function useFollowingPosts(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.followingPosts(userId || ''),
    queryFn: () => getPostsFromFollowing(userId!),
    enabled: !!userId, // Only run query if userId is provided
    staleTime: 5 * 60 * 1000,
  });
}

// Custom hook for creating a post
export function useCreatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: [queryKeys.posts] });
    },
  });
}

// Custom hook for deleting a post
export function useDeletePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePost,
    onSuccess: (_, postId) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: [queryKeys.posts] });
      // Also invalidate any user-specific post queries that might contain this post
      queryClient.invalidateQueries({ queryKey: [queryKeys.userPosts] });
    },
  });
}