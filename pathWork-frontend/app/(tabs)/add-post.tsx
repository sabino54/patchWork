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
} from "react-native";
import { useMutation } from "@tanstack/react-query";
import { FontAwesome } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { UploadImage } from "@/components/uploadImage";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { createPost, uploadImage } from "@/lib/posts";
import { useRouter } from "expo-router";

export default function AddPost() {
  const router = useRouter();

  const [selectedPostType, setSelectedPostType] = useState<"image" | "audio" | "video" | "link">(
    "image",
  );
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const [user, setUser] = useState<User | null>(null);

  // Fetch user on mount
  useEffect(() => {
    // TODO: use session instead of getUser? getUser makes a network request, but idk if session does
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: uploadImage,
    onError: (error: Error) => {
      console.error(error.message);
      Alert.alert("Error", "Failed to upload image");
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
      setImageUri(null);
      setTags([]);

      // navigate to the home screen
      router.navigate("/");
    },
    onError: (error: Error) => {
      console.error(error.message);
      Alert.alert("Error", "Failed to create post");
    },
  });

  const handleAddTagButtonPress = () => {
    setTags([...tags, "New Tag"]);
  };

  const handleTagDelete = (index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
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

    setIsSubmitting(true);

    try {
      // For image posts, upload the image first
      if (selectedPostType === "image" && imageUri) {
        // Upload the image and wait for it to complete
        const uploadedImageUrl = await uploadImageMutation.mutateAsync({
          imageUri,
          userId: user.id,
        });

        // After successful image upload, create the post with the image URL
        await createPostMutation.mutateAsync({
          title,
          description,
          userId: user.id,
          mediaUrl: uploadedImageUrl,
          mediaType: selectedPostType,
        });
      } else {
        // For audio posts or posts without media
        await createPostMutation.mutateAsync({
          title,
          description,
          userId: user.id,
          mediaUrl: null,
          mediaType: selectedPostType,
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
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Create New Post</Text>
        </View>
        <View style={styles.postTypes}>
          <TouchableOpacity
            style={[
              styles.postTypeButton,
              selectedPostType === "image" && styles.selectedPostType,
            ]}
            onPress={() => setSelectedPostType("image")}
          >
            <Text
              style={[
                styles.postTypeText,
                selectedPostType === "image" && styles.selectedText,
              ]}
            >
              Image
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.postTypeButton,
              selectedPostType === "video" && styles.selectedPostType,
            ]}
            onPress={() => setSelectedPostType("video")}
          >
            <Text
              style={[
                styles.postTypeText,
                selectedPostType === "video" && styles.selectedText,
              ]}
            >
              Video
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.postTypeButton,
              selectedPostType === "audio" && styles.selectedPostType,
            ]}
            onPress={() => setSelectedPostType("audio")}
          >
            <Text
              style={[
                styles.postTypeText,
                selectedPostType === "audio" && styles.selectedText,
              ]}
            >
              Audio
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.postTypeButton,
              selectedPostType === "link" && styles.selectedPostType,
            ]}
            onPress={() => setSelectedPostType("link")}
          >
            <Text
              style={[
                styles.postTypeText,
                selectedPostType === "link" && styles.selectedText,
              ]}
            >
              Link
            </Text>
          </TouchableOpacity>
        </View>

        {(selectedPostType === "image" || selectedPostType === "video") && (
          <UploadImage
            mediaType={selectedPostType}
            imageUri={imageUri}
            onImageSelection={(uri) => {
              setImageUri(uri);
            }}
          />
        )}

        {selectedPostType === "audio" && (
          <View style={styles.uploadContainer}>
            <TouchableOpacity style={styles.uploadButton}>
              <FontAwesome name="cloud-upload" size={30} color="#a084ca" />
              <Text style={styles.uploadText}>Upload Audio</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.tagsContainer}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.tagButton}>
              <Text style={styles.tagText}>{tag}</Text>
              <TouchableOpacity onPress={() => handleTagDelete(index)}>
                <FontAwesome name="times" size={16} color={"white"} />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={styles.addTagButton}
            onPress={handleAddTagButtonPress}
          >
            <Text style={{}}>+ Add Tag</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={"padding"} style={{ flex: 1 }}>
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
        </KeyboardAvoidingView>

        <KeyboardAvoidingView style={styles.actionContainer}>
          <TouchableOpacity style={styles.cancelButton} disabled={isSubmitting}>
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
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f0fa",
  },
  scrollView: {
    flex: 1,
    display: "flex",
    backgroundColor: "#f7f0fa",
    gap: 10,
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

  // Text Section
  textContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 5,
  },
  titleInput: {
    fontSize: 16,
    fontWeight: "bold",
  },
  descriptionInput: {
    fontSize: 16,
    minHeight: 100,
  },

  // Action Section
  actionContainer: {
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
