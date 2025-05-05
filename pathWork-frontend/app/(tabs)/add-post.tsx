import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import { useState } from "react";

export default function AddPost() {
  const [selectedOption, setSelectedOption] = useState<
    "photo" | "audio" | null
  >(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create New Post</Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[
            styles.optionButton,
            selectedOption === "photo" && styles.selectedOption,
          ]}
          onPress={() => setSelectedOption("photo")}
        >
          <FontAwesome
            name="camera"
            size={40}
            color={selectedOption === "photo" ? "#a084ca" : "#666"}
          />
          <Text
            style={[
              styles.optionText,
              selectedOption === "photo" && styles.selectedText,
            ]}
          >
            Photo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionButton,
            selectedOption === "audio" && styles.selectedOption,
          ]}
          onPress={() => setSelectedOption("audio")}
        >
          <FontAwesome
            name="microphone"
            size={40}
            color={selectedOption === "audio" ? "#a084ca" : "#666"}
          />
          <Text
            style={[
              styles.optionText,
              selectedOption === "audio" && styles.selectedText,
            ]}
          >
            Audio
          </Text>
        </TouchableOpacity>
      </View>

      {selectedOption === "photo" && (
        <View style={styles.uploadContainer}>
          <TouchableOpacity style={styles.uploadButton}>
            <FontAwesome name="cloud-upload" size={30} color="#a084ca" />
            <Text style={styles.uploadText}>Upload Photo</Text>
          </TouchableOpacity>
        </View>
      )}

      {selectedOption === "audio" && (
        <View style={styles.uploadContainer}>
          <TouchableOpacity style={styles.uploadButton}>
            <FontAwesome name="cloud-upload" size={30} color="#a084ca" />
            <Text style={styles.uploadText}>Upload Audio</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    marginTop: 20,
  },
  optionButton: {
    alignItems: "center",
    padding: 20,
    borderRadius: 15,
    backgroundColor: "#f5f5f5",
    width: "45%",
  },
  selectedOption: {
    backgroundColor: "#f0e6ff",
    borderWidth: 2,
    borderColor: "#a084ca",
  },
  optionText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  selectedText: {
    color: "#a084ca",
    fontWeight: "bold",
  },
  uploadContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  uploadButton: {
    alignItems: "center",
    padding: 20,
    borderRadius: 15,
    backgroundColor: "#f5f5f5",
    width: "100%",
  },
  uploadText: {
    marginTop: 10,
    fontSize: 16,
    color: "#a084ca",
    fontWeight: "bold",
  },
});
