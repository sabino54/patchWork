import React, { useState } from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";

const VideoPlayer = ({ url }: { url: string }) => {
  const player = useVideoPlayer(url, (player) => {
    player.loop = true;
  });
  const [showControls, setShowControls] = useState(true);

  return (
    <>
      <VideoView
        style={styles.postImage}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
      />
      {showControls && (
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => {
            if (player.playing) {
              player.pause();
              setShowControls(true);
            } else {
              player.play();
              setShowControls(false);
            }
          }}
        >
          <Text style={styles.playButtonText}>
            {player.playing ? "⏸" : "▶"}
          </Text>
        </TouchableOpacity>
      )}
    </>
  );
};
const styles = StyleSheet.create({
  postImage: {
    width: "100%",
    height: 300,
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonText: {
    color: "#fff",
    fontSize: 20,
  },
});

export default VideoPlayer;
