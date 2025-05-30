import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface LinkDisplayProps {
  url: string;
  backgroundColor?: string;
}

const LinkDisplay = ({
  url,
  backgroundColor = "#F2F2F7",
}: LinkDisplayProps) => {
  const handlePress = async () => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  };

  // Extract domain from URL for display
  const getDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace("www.", "");
    } catch {
      return url;
    }
  };

  return (
    <TouchableOpacity
      style={{ ...styles.container, backgroundColor }}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.linkContent}>
        <MaterialIcons name="link" size={24} color="#007AFF" />
        <View style={styles.textContainer}>
          <Text style={styles.domainText} numberOfLines={1}>
            {getDomain(url)}
          </Text>
          <Text style={styles.urlText} numberOfLines={1}>
            {url}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#8E8E93" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 12,
    padding: 12,
  },
  linkContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  textContainer: {
    flex: 1,
  },
  domainText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  urlText: {
    fontSize: 14,
    color: "#8E8E93",
  },
});
export default LinkDisplay;
