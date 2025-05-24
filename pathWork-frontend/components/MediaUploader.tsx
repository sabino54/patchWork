import {
  Image,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState, useEffect } from "react";
import { Video, Audio } from "expo-av";
import { PostMediaType } from "@/lib/posts";
import * as DocumentPicker from "expo-document-picker";
import AudioPlayer from "./AudioPlayer";
import VideoPlayer from "./VideoPlayer";

interface MediaUploaderProps {
  readonly mediaType: PostMediaType;
  readonly mediaUri: string | null;
  readonly onMediaSelection: (mediaUri: string) => void;
}

export function MediaUploader({
  mediaType,
  mediaUri,
  onMediaSelection,
}: MediaUploaderProps) {
  const [media, setMedia] = useState<string | null>(mediaUri);
  const [linkInput, setLinkInput] = useState<string>("");
  const [filename, setFilename] = useState<string>("");

  // Update internal state when mediaUri prop changes
  useEffect(() => {
    setMedia(mediaUri);
  }, [mediaUri]);

  const pickMedia = async () => {
    if (mediaType === "image" || mediaType === "video") {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaType === "image" ? ["images"] : ["videos"],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setMedia(result.assets[0].uri);
        onMediaSelection(result.assets[0].uri);
      }
    } else if (mediaType === "audio") {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: "audio/*",
          copyToCacheDirectory: true,
        });

        if (result.canceled === false) {
          setMedia(result.assets[0].uri);
          setFilename(result.assets[0].name);
          onMediaSelection(result.assets[0].uri);
        }
      } catch (error) {
        console.error("Error picking audio file:", error);
      }
    }
  };

  const handleLinkSubmit = () => {
    if (linkInput.trim()) {
      setMedia(linkInput);
      onMediaSelection(linkInput);
    }
  };

  return (
    <>
      {/* Image Media */}
      {media && mediaType === "image" && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: media }}
            style={{ width: "100%", minHeight: 400 }}
          />
          <TouchableOpacity
            style={styles.changeMediaButton}
            onPress={pickMedia}
          >
            <FontAwesome name="refresh" size={16} color="#ffffff" />
            <Text style={styles.changeMediaText}>Change Image</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Video Media */}
      {media && mediaType === "video" && (
        <View style={styles.videoContainer}>
          <VideoPlayer url={media} />
          <TouchableOpacity
            style={styles.changeMediaButton}
            onPress={pickMedia}
          >
            <FontAwesome name="refresh" size={16} color="#ffffff" />
            <Text style={styles.changeMediaText}>Change Video</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Audio Media */}
      {media && mediaType === "audio" && (
        <View style={styles.audioContainer}>
          <View style={styles.audioPlayer}>
            <AudioPlayer url={media} title={filename} />
          </View>
          <TouchableOpacity
            style={styles.changeMediaButton}
            onPress={pickMedia}
          >
            <FontAwesome name="refresh" size={16} color="#ffffff" />
            <Text style={styles.changeMediaText}>Change Audio</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Link Media */}
      {mediaType === "link" && (
        <View style={styles.linkContainer}>
          {media ? (
            <View style={styles.linkPreview}>
              <Text
                style={styles.linkText}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {media}
              </Text>
              <TouchableOpacity
                style={styles.changeMediaButton}
                onPress={() => setMedia(null)}
              >
                <FontAwesome name="refresh" size={16} color="#ffffff" />
                <Text style={styles.changeMediaText}>Change Link</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.linkInputContainer}>
              <TextInput
                style={styles.linkInput}
                placeholder="Enter URL here..."
                value={linkInput}
                onChangeText={setLinkInput}
                autoCapitalize="none"
                keyboardType="url"
              />
              <TouchableOpacity
                style={styles.linkSubmitButton}
                onPress={handleLinkSubmit}
                disabled={!linkInput.trim()}
              >
                <Text style={styles.linkSubmitText}>Add Link</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Upload Button (when no media is selected) */}
      {!media && mediaType !== "link" && (
        <View style={styles.uploadContainer}>
          <TouchableOpacity style={styles.uploadButton} onPress={pickMedia}>
            <FontAwesome
              name={mediaType === "audio" ? "music" : "cloud-upload"}
              size={30}
              color="#a084ca"
            />
            <Text style={styles.uploadText}>
              Upload {mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}
            </Text>
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

  // Change Media Button
  changeMediaButton: {
    backgroundColor: "#a084ca",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 5,
  },
  changeMediaText: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "bold" as const,
  },

  // Image Media
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    gap: 10,
  },

  // Video Media
  videoContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    gap: 10,
  },

  // Audio Player
  audioContainer: {
    width: "100%",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  audioPlayer: {
    width: "80%",
  },

  // Link Input
  linkContainer: {
    width: "100%",
    minHeight: 200,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  linkInputContainer: {
    width: "100%",
    gap: 10,
  },
  linkInput: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  linkSubmitButton: {
    backgroundColor: "#a084ca",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  linkSubmitText: {
    color: "#ffffff",
    fontWeight: "bold" as const,
    fontSize: 16,
  },
  linkPreview: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 15,
    minHeight: 100,
    justifyContent: "center",
    position: "relative",
  },
  linkText: {
    fontSize: 16,
    color: "#0066cc",
    textDecorationLine: "underline",
    marginBottom: 40,
  },
});
