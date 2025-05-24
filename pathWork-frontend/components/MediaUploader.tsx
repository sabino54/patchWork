import { Image, View, TouchableOpacity, Text, StyleSheet, TextInput } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState, useEffect } from "react";
import { Video, Audio } from "expo-av";
import { PostMediaType } from "@/lib/posts";
import * as DocumentPicker from "expo-document-picker";

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
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Update internal state when mediaUri prop changes
  useEffect(() => {
    setMedia(mediaUri);
  }, [mediaUri]);

  // Clean up audio resources when component unmounts
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const pickMedia = async () => {
    if (mediaType === "image" || mediaType === "video") {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaType === "image" ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
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

  const handlePlayPauseAudio = async () => {
    if (!media) return;

    if (sound === null) {
      // Load the audio file
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: media });
      setSound(newSound);
      await newSound.playAsync();
      setIsPlaying(true);
    } else {
      // Toggle play/pause
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <>
      {/* Image Media */}
      {media && mediaType === "image" && (
        <View>
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
        <View>
          <Video
            source={{ uri: media }}
            style={{ width: "100%", minHeight: 400 }}
            useNativeControls
          />
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
            <TouchableOpacity 
              style={styles.audioPlayButton} 
              onPress={handlePlayPauseAudio}
            >
              <FontAwesome 
                name={isPlaying ? "pause" : "play"} 
                size={24} 
                color="#a084ca" 
              />
            </TouchableOpacity>
            <Text style={styles.audioFileName} numberOfLines={1} ellipsizeMode="middle">
              {media.split('/').pop()}
            </Text>
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
              <Text style={styles.linkText} numberOfLines={1} ellipsizeMode="middle">
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
  changeMediaText: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "bold" as const,
  },
  
  // Audio Player
  audioContainer: {
    width: "100%",
    height: 200,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  audioPlayer: {
    flexDirection: "row" as const,
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 30,
    padding: 15,
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  audioPlayButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0e6ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  audioFileName: {
    flex: 1,
    fontSize: 16,
    color: "#333",
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
