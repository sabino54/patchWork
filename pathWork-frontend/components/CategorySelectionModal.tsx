import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

const categories = [
  "Visual Arts",
  "Digital Art",
  "Photography",
  "Music & Audio",
  "Performance",
  "Writing & Poetry",
  "Design",
  "Craft & DIY",
  "Film & Video",
  "Animation",
  "Fashion",
  "Architecture",
  "Mixed Media",
] as const;

type CategorySelectionModalProps = {
  isVisible: boolean;
  onClose: () => void;
  selectedCategory: string | null;
  onSelectCategory: (category: string) => void;
};

export default function CategorySelectionModal({
  isVisible,
  onClose,
  selectedCategory,
  onSelectCategory,
}: CategorySelectionModalProps) {
  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select a Category</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome name="times" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <View style={styles.categoryGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryBubble,
                  selectedCategory === category &&
                    styles.selectedCategoryBubble,
                ]}
                onPress={() => onSelectCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryBubbleText,
                    selectedCategory === category &&
                      styles.selectedCategoryBubbleText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0d6f7",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 10,
  },
  categoryBubble: {
    backgroundColor: "#f7f0fa",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0d6f7",
    minWidth: "45%",
    alignItems: "center",
  },
  selectedCategoryBubble: {
    backgroundColor: "#a084ca",
    borderColor: "#8d5fd3",
  },
  categoryBubbleText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  selectedCategoryBubbleText: {
    color: "white",
    fontWeight: "600",
  },
});
