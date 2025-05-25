import { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Audio } from "expo-av";
import { MaterialIcons } from "@expo/vector-icons";

interface AudioPlayerProps {
  url: string;
}

const AudioPlayer = ({ url }: AudioPlayerProps) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  // Clean up audio resources when component unmounts
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    loadAudio();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [url]);

  const loadAudio = async () => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: false },
        onPlaybackStatusUpdate,
      );
      setSound(newSound);
    } catch (error) {
      console.error("Error loading audio:", error);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);
    }
  };

  const handlePlayPause = async () => {
    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={handlePlayPause}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={isPlaying ? "pause" : "play-arrow"}
            size={24}
            color="#8d5fd3"
          />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progress, { width: `${progress}%` }]} />
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f2e9fa",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#f2e9fa",
    borderRadius: 2,
    overflow: "hidden",
  },
  progress: {
    height: "100%",
    backgroundColor: "#8d5fd3",
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: "#666",
  },
});

export default AudioPlayer;
