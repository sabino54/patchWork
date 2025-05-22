import { Image, View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState, useEffect } from "react";

interface UploadImageProps {
  imageUri: string | null;
  onImageSelection: (imageUri: string) => void;
}

export function UploadImage({ imageUri, onImageSelection }: UploadImageProps) {
  const [image, setImage] = useState<string | null>(imageUri);

  // Update internal state when imageUri prop changes
  useEffect(() => {
    setImage(imageUri);
  }, [imageUri]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      onImageSelection(result.assets[0].uri);
    }
  };

  return (
    <>
      {image && (
        <View>
          <Image
            source={{ uri: image }}
            style={{ width: "100%", height: 200, borderRadius: 10 }}
          />
          <TouchableOpacity
            style={styles.changeImageButton}
            onPress={pickImage}
          >
            <FontAwesome name="refresh" size={16} color="#ffffff" />
            <Text style={styles.changeImageText}>Change Image</Text>
          </TouchableOpacity>
        </View>
      )}
      {!image && (
        <View style={styles.uploadContainer}>
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <FontAwesome name="cloud-upload" size={30} color="#a084ca" />
            <Text style={styles.uploadText}>Upload Photo</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
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
    fontWeight: "bold" as const,
  },
  // Change Image Button
  changeImageButton: {
    position: "absolute" as const,
    bottom: 10,
    right: 10,
    backgroundColor: "#a084ca",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 5,
  },
  changeImageText: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "bold" as const,
  },
});
