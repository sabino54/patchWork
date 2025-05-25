import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useMutation } from "@tanstack/react-query";
import { FontAwesome } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { MediaUploader } from "@/components/MediaUploader";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { createPost, PostMediaType, uploadMedia } from "@/lib/posts";
import { useRouter } from "expo-router";
import CategorySelectionModal from "@/components/CategorySelectionModal";

const categories = [
  "Visual Arts",
  "Digital Art",
  "Photography",
  "Music & Audio",
  "Performance",
  "Writing & Poetry",
  "Design",
  "Craft & DIY",
  "Film & Video",
  "Animation",
  "Fashion",
  "Architecture",
  "Mixed Media",
] as const;

export default function AddPost() {
  const router = useRouter();

  const [selectedMediaType, setSelectedMediaType] =
    useState<PostMediaType>("image");
  const [media, setMedia] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

  const [user, setUser] = useState<User | null>(null);

  // Fetch user on mount
  useEffect(() => {
    // TODO: use session instead of getUser? getUser makes a network request, but idk if session does
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  // Clear media when mediaType changes
  useEffect(() => {
    setMedia(null);
  }, [selectedMediaType]);

  // Upload media mutation
  const uploadMediaMutation = useMutation({
    mutationFn: uploadMedia,
    onError: (error: Error) => {
      console.error(error.message);
      Alert.alert("Error", `Failed to upload ${selectedMediaType}`);
    },
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      Alert.alert("Success", "Post created successfully");
      // Reset form
      setTitle("");
      setDescription("");
      setMedia(null);
      setSelectedCategory(null);

      // navigate to the home screen
      router.navigate("/");
    },
    onError: (error: Error) => {
      console.error(error.message);
      Alert.alert("Error", "Failed to create post");
    },
  });

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
    setIsCategoryModalVisible(false);
  };

  const handleRemoveCategory = () => {
    setSelectedCategory(null);
  };

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePost = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title for your post");
      return;
    }

    if (!user?.id) {
      Alert.alert("Error", "You must be logged in to create a post");
      return;
    }

    if (selectedMediaType !== "link" && !media) {
      Alert.alert(
        "Error",
        `Please upload a ${selectedMediaType} for your post`
      );
      return;
    }

    if (!selectedCategory) {
      Alert.alert("Error", "Please select a category for your post");
      return;
    }

    setIsSubmitting(true);

    try {
      // For media that needs to be uploaded (image, video, audio)
      if (
        (selectedMediaType === "image" ||
          selectedMediaType === "video" ||
          selectedMediaType === "audio") &&
        media
      ) {
        // Upload the media and wait for it to complete
        const uploadedMediaUrl = await uploadMediaMutation.mutateAsync({
          mediaUri: media,
          userId: user.id,
        });

        // After successful media upload, create the post with the media URL
        await createPostMutation.mutateAsync({
          title,
          description,
          userId: user.id,
          publicMediaUrl: uploadedMediaUrl,
          mediaType: selectedMediaType,
          tag: [selectedCategory],
        });
      }

      // For link posts
      else if (selectedMediaType === "link" && media) {
        // For link posts, the mediaUrl contains the URL
        await createPostMutation.mutateAsync({
          title,
          description,
          userId: user.id,
          publicMediaUrl: media,
          mediaType: selectedMediaType,
          tag: [selectedCategory],
        });
      }
    } catch (error) {
      console.error("Error in post creation process:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create New Post</Text>
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.postTypes}>
            <TouchableOpacity
              style={[
                styles.postTypeButton,
                selectedMediaType === "image" && styles.selectedPostType,
              ]}
              onPress={() => setSelectedMediaType("image")}
            >
              <Text
                style={[
                  styles.postTypeText,
                  selectedMediaType === "image" && styles.selectedText,
                ]}
              >
                Image
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.postTypeButton,
                selectedMediaType === "video" && styles.selectedPostType,
              ]}
              onPress={() => setSelectedMediaType("video")}
            >
              <Text
                style={[
                  styles.postTypeText,
                  selectedMediaType === "video" && styles.selectedText,
                ]}
              >
                Video
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.postTypeButton,
                selectedMediaType === "audio" && styles.selectedPostType,
              ]}
              onPress={() => setSelectedMediaType("audio")}
            >
              <Text
                style={[
                  styles.postTypeText,
                  selectedMediaType === "audio" && styles.selectedText,
                ]}
              >
                Audio
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.postTypeButton,
                selectedMediaType === "link" && styles.selectedPostType,
              ]}
              onPress={() => setSelectedMediaType("link")}
            >
              <Text
                style={[
                  styles.postTypeText,
                  selectedMediaType === "link" && styles.selectedText,
                ]}
              >
                Link
              </Text>
            </TouchableOpacity>
          </View>

          <MediaUploader
            mediaType={selectedMediaType}
            mediaUri={media}
            onMediaSelection={(uri: string) => {
              setMedia(uri);
            }}
          />

          <View style={styles.tagsContainer}>
            {selectedCategory ? (
              <View style={styles.tagButton}>
                <Text style={styles.tagText}>{selectedCategory}</Text>
                <TouchableOpacity onPress={handleRemoveCategory}>
                  <FontAwesome name="times" size={18} color={"white"} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addTagButton}
                onPress={() => setIsCategoryModalVisible(true)}
              >
                <Text style={styles.addTagText}>+ Add Category</Text>
              </TouchableOpacity>
            )}
          </View>

          <CategorySelectionModal
            isVisible={isCategoryModalVisible}
            onClose={() => setIsCategoryModalVisible(false)}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
          />

          <View style={styles.textContainer}>
            <TextInput
              placeholder="Enter a title"
              value={title}
              onChangeText={setTitle}
              style={styles.titleInput}
              placeholderTextColor="#aaa"
            />
            <TextInput
              placeholder="Enter description here..."
              multiline
              value={description}
              onChangeText={setDescription}
              style={styles.descriptionInput}
              placeholderTextColor="#aaa"
            />
          </View>

          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.postButton, isSubmitting && styles.disabledButton]}
              onPress={handlePost}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.postButtonText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f0fa",
  },
  scrollView: {
    flexGrow: 1,
    display: "flex",
    backgroundColor: "#f7f0fa",
    gap: 10,
    paddingVertical: 10,
    paddingBottom: 20,
  },

  // Header
  header: {
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },

  // Post Type Selection
  postTypes: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    gap: 10,
    justifyContent: "center",
  },
  postTypeButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedPostType: {
    backgroundColor: "#f0e6ff",
  },
  postTypeText: {
    fontSize: 16,
    color: "#666",
  },
  selectedText: {
    color: "#a084ca",
  },

  // Upload Section
  uploadContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  uploadButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#ddd",
    width: "100%",
    height: 200,
  },
  uploadText: {
    fontSize: 16,
    color: "#a084ca",
    fontWeight: "bold",
  },

  // Tags Section
  tagsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
  },
  tagButton: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    backgroundColor: "#a084ca",
    borderRadius: 99,
  },
  tagText: {
    color: "white",
  },
  addTagButton: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 15,
    padding: 8,
  },
  addTagText: {
    color: "#a084ca",
    fontWeight: "bold",
  },

  // Text Section
  textContainer: {
    height: 150,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: "column",
    gap: 5,
    flex: 0,
  },
  titleInput: {
    fontSize: 16,
    fontWeight: "bold",
  },
  descriptionInput: {
    fontSize: 16,
    overflow: "scroll",
    flex: 1,
  },

  // Action Section
  actionContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    paddingHorizontal: 20,
  },
  postButton: {
    backgroundColor: "#a084ca",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    height: 40,
  },
  postButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#a084ca",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
  },
  cancelButtonText: {
    color: "#a084ca",
    fontSize: 20,
  },
  disabledButton: {
    backgroundColor: "#ccc",
    opacity: 0.7,
  },
});
