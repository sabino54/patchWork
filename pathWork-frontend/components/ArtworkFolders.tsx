import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const FOLDER_WIDTH = (width - 48) / 2; // 2 columns with padding

interface ArtworkFolder {
  id: string;
  title: string;
  thumbnail: string;
  versionCount: number;
  lastUpdated: string;
}

interface ArtworkFoldersProps {
  folders: ArtworkFolder[];
  onFolderPress: (folderId: string) => void;
}

export default function ArtworkFolders({
  folders,
  onFolderPress,
}: ArtworkFoldersProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Artwork Folders</Text>
        <TouchableOpacity style={styles.newFolderButton}>
          <Ionicons name="add-circle-outline" size={24} color="#8d5fd3" />
          <Text style={styles.newFolderText}>New Folder</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {folders.map((folder) => (
          <TouchableOpacity
            key={folder.id}
            style={styles.folderCard}
            onPress={() => onFolderPress(folder.id)}
          >
            <Image
              source={{ uri: folder.thumbnail }}
              style={styles.thumbnail}
            />
            <View style={styles.folderInfo}>
              <Text style={styles.folderTitle} numberOfLines={1}>
                {folder.title}
              </Text>
              <View style={styles.folderMeta}>
                <Text style={styles.versionCount}>
                  {folder.versionCount}{" "}
                  {folder.versionCount === 1 ? "version" : "versions"}
                </Text>
                <Text style={styles.lastUpdated}>
                  Updated {folder.lastUpdated}
                </Text>
              </View>
            </View>
            <View style={styles.folderIcon}>
              <Ionicons name="folder" size={24} color="#8d5fd3" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  newFolderButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f0fa",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  newFolderText: {
    marginLeft: 4,
    color: "#8d5fd3",
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  folderCard: {
    width: FOLDER_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
    height: FOLDER_WIDTH + 80,
  },
  thumbnail: {
    width: "100%",
    height: FOLDER_WIDTH,
    backgroundColor: "#f7f0fa",
  },
  folderInfo: {
    padding: 12,
    flex: 1,
    justifyContent: "space-between",
  },
  folderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  folderMeta: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginTop: "auto",
  },
  versionCount: {
    fontSize: 12,
    color: "#8d5fd3",
    fontWeight: "500",
    marginBottom: 4,
  },
  lastUpdated: {
    fontSize: 12,
    color: "#666",
  },
  folderIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 4,
  },
});
