import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function FolderPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Mock data - replace with actual data from your backend
  const folderData = {
    id: id as string,
    title: "Digital Paintings",
    description: "A collection of my digital painting experiments and studies",
    versions: [
      {
        id: "1",
        title: "Version 1.0",
        image: "https://picsum.photos/300",
        date: "2024-03-15",
        notes: "Initial concept",
      },
      {
        id: "2",
        title: "Version 1.1",
        image: "https://picsum.photos/301",
        date: "2024-03-16",
        notes: "Added color variations",
      },
      {
        id: "3",
        title: "Version 1.2",
        image: "https://picsum.photos/302",
        date: "2024-03-17",
        notes: "Final adjustments",
      },
      {
        id: "4",
        title: "Version 1.3",
        image: "https://picsum.photos/303",
        date: "2024-03-18",
        notes: "Added more details",
      },
      {
        id: "5",
        title: "Version 1.4",
        image: "https://picsum.photos/304",
        date: "2024-03-19",
        notes: "Final touches",
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.title}>{folderData.title}</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={24} color="#8d5fd3" />
        </TouchableOpacity>
      </View>

      <Text style={styles.description}>{folderData.description}</Text>

      <ScrollView style={styles.versionsList}>
        {folderData.versions.map((version) => (
          <TouchableOpacity
            key={version.id}
            style={styles.versionCard}
            onPress={() => {
              // Handle version selection
            }}
          >
            <Image
              source={{ uri: version.image }}
              style={styles.versionImage}
            />
            <View style={styles.versionInfo}>
              <Text style={styles.versionTitle}>{version.title}</Text>
              <Text style={styles.versionDate}>{version.date}</Text>
              <Text style={styles.versionNotes}>{version.notes}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    padding: 8,
  },
  description: {
    padding: 16,
    color: "#666",
    fontSize: 16,
    lineHeight: 24,
  },
  versionsList: {
    flex: 1,
  },
  versionCard: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  versionImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#f7f0fa",
  },
  versionInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  versionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  versionDate: {
    fontSize: 14,
    color: "#8d5fd3",
    marginBottom: 4,
  },
  versionNotes: {
    fontSize: 14,
    color: "#666",
  },
});
