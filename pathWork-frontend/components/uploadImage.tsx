import React from "react";
import { Image, View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState, useEffect } from "react";
import { Video } from "expo-av";

interface UploadImageProps {
  readonly mediaType: "image" | "video";
  readonly mediaUri: string | null;
  readonly onMediaSelection: (mediaUri: string) => void;
}

export function UploadImage({
  mediaType,
  mediaUri,
  onMediaSelection,
}: UploadImageProps) {
  const [media, setMedia] = useState<string | null>(mediaUri);

  // Update internal state when imageUri prop changes
  useEffect(() => {
    setMedia(mediaUri);
  }, [mediaUri]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: mediaType === "image" ? ["images"] : ["videos"],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setMedia(result.assets[0].uri);
      onMediaSelection(result.assets[0].uri);
    }
  };

  return (
    <>
      {media && mediaType === "image" && (
        <View>
          <Image
            source={{ uri: media }}
            style={{ width: "100%", minHeight: 400 }}
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
      {media && mediaType === "video" && (
        <View>
          <Video
            source={{ uri: media }}
            style={{ width: "100%", minHeight: 400 }}
            useNativeControls
          />
          <TouchableOpacity
            style={styles.changeImageButton}
            onPress={pickImage}
          >
            <FontAwesome name="refresh" size={16} color="#ffffff" />
            <Text style={styles.changeImageText}>Change Video</Text>
          </TouchableOpacity>
        </View>
      )}
      {!media && (
        <View style={styles.uploadContainer}>
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <FontAwesome name="cloud-upload" size={30} color="#a084ca" />
            <Text style={styles.uploadText}>Upload {mediaType}</Text>
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
