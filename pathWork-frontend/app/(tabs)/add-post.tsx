import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import { useState } from "react";

export default function AddPost() {
  const [selectedPostType, setSelectedPostType] = useState<"photo" | "audio">(
    "photo",
  );

  const [tags, setTags] = useState<string[]>([]);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const handleAddTagButtonPress = () => {
    setTags([...tags, "New Tag"]);
  };

  const handleTagDelete = (index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create New Post</Text>
      </View>

      <View style={styles.postTypes}>
        <TouchableOpacity
          style={[
            styles.postTypeButton,
            selectedPostType === "photo" && styles.selectedPostType,
          ]}
          onPress={() => setSelectedPostType("photo")}
        >
          <Text
            style={[
              styles.postTypeText,
              selectedPostType === "photo" && styles.selectedText,
            ]}
          >
            Photo
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
      </View>

      {selectedPostType === "photo" && (
        <View style={styles.uploadContainer}>
          <TouchableOpacity style={styles.uploadButton}>
            <FontAwesome name="cloud-upload" size={30} color="#a084ca" />
            <Text style={styles.uploadText}>Upload Photo</Text>
          </TouchableOpacity>
        </View>
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

      <View style={styles.textContainer}>
        <KeyboardAvoidingView
          behavior={"padding"}
          style={{ flex: 1 }}
        >
          <TextInput
            placeholder="Enter a title"
            value={title}
            onChangeText={setTitle}
            style={{ ...styles.titleInput, color: title ? "#000" : "#333" }}
          />
          <TextInput
            placeholder="Enter description here..."
            multiline
            value={description}
            onChangeText={setDescription}
            style={{
              ...styles.descriptionInput,
              color: description ? "#000" : "#333",
            }}
          />
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f0fa",
    gap: 20,
    overflow: "scroll",
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
    padding: 10,
    gap: 10,
  },
  tagButton: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    backgroundColor: "#a084ca",
    borderRadius: 15,
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
    padding: 10,
  },
  titleInput: {
    fontSize: 16,
    fontWeight: "bold",
  },
  descriptionInput: {
    fontSize: 12,
  },
});
