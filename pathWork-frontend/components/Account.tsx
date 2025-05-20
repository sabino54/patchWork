import * as ImagePicker from "expo-image-picker";
import {
  Image,
  StyleSheet,
  View,
  Alert,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Button, Input } from "@rneui/themed";
import { Session } from "@supabase/supabase-js";
import { Ionicons } from "@expo/vector-icons";

export default function Account({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      console.log("Fetching profile for user:", session.user.id);
      const { data, error, status } = await supabase
        .from("public_profiles")
        .select(`username, bio, profile_photo`)
        .eq("id", session?.user.id)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        if (status !== 406) {
          throw error;
        }
      }

      if (data) {
        console.log("Profile data received:", data);
        setUsername(data.username);
        setBio(data.bio);
        if (data.profile_photo) {
          setProfilePhoto(`${data.profile_photo}?t=${Date.now()}`);
        } else {
          setProfilePhoto(null);
        }
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      if (error instanceof Error) {
        Alert.alert("Error fetching profile", error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile({
    username,
    bio,
  }: {
    username: string;
    bio: string;
  }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      console.log("Updating profile for user:", session.user.id);
      const updates = {
        id: session?.user.id,
        username,
        bio,
      };

      const { error } = await supabase.from("public_profiles").upsert(updates);

      if (error) {
        console.error("Profile update error:", error);
        throw error;
      }
      console.log("Profile updated successfully");
    } catch (error) {
      console.error("Profile update error:", error);
      if (error instanceof Error) {
        Alert.alert("Error updating profile", error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function uploadPhoto() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      console.log("Starting photo upload for user:", session.user.id);
      const filePath = `user-${session.user.id}/profile.jpg`;

      // Get the local file URI
      const imageUri = Image.resolveAssetSource(
        require("../assets/images/SabinoCropped.jpeg"),
      ).uri;
      console.log("Local image URI:", imageUri);

      // Create form data
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "profile.jpg",
      } as any);

      console.log("Uploading to Supabase storage...");
      const { error } = await supabase.storage
        .from("avatars")
        .upload(filePath, formData, {
          upsert: true,
          contentType: "multipart/form-data",
        });

      if (error) {
        console.error("Storage upload error:", error);
        Alert.alert("Upload failed", error.message);
        return;
      }

      console.log("Getting public URL...");
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      console.log("Public URL:", data.publicUrl);

      setProfilePhoto(data.publicUrl);

      console.log("Updating user profile with new photo URL...");
      const { error: updateError } = await supabase
        .from("public_profiles")
        .update({ profile_photo: data.publicUrl })
        .eq("id", session.user.id);

      if (updateError) {
        console.error("Profile update error:", updateError);
        Alert.alert("Error updating profile", updateError.message);
      }
      console.log("Photo upload completed successfully");
    } catch (error) {
      console.error("Photo upload error:", error);
      if (error instanceof Error) {
        Alert.alert("Error uploading photo", error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            source={require("../assets/images/LOGO.png")}
            style={styles.logo}
          />
          <Text style={styles.headerText}>Account Settings</Text>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.profilePhotoContainer}>
            {profilePhoto ? (
              <Image
                source={{ uri: profilePhoto }}
                style={styles.profilePhoto}
              />
            ) : (
              <View style={styles.profilePhotoPlaceholder}>
                <Ionicons name="person" size={40} color="#8d5fd3" />
              </View>
            )}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={uploadPhoto}
              disabled={loading}
            >
              <Text style={styles.uploadButtonText}>
                {loading ? "Uploading..." : "Change Photo"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              value={session?.user?.email}
              disabled
              inputContainerStyle={styles.inputContainer}
              inputStyle={styles.input}
              labelStyle={styles.label}
              disabledInputStyle={styles.disabledInput}
            />

            <Input
              label="Username"
              value={username || ""}
              onChangeText={(text) => setUsername(text)}
              leftIcon={{
                type: "font-awesome",
                name: "user",
                color: "#8d5fd3",
                style: { marginRight: 8 },
              }}
              inputContainerStyle={styles.inputContainer}
              inputStyle={styles.input}
              labelStyle={styles.label}
            />

            <Input
              label="Bio"
              value={bio || ""}
              onChangeText={(text) => setBio(text)}
              leftIcon={{
                type: "font-awesome",
                name: "pencil",
                color: "#8d5fd3",
                style: { marginRight: 8 },
              }}
              inputContainerStyle={styles.inputContainer}
              inputStyle={styles.input}
              labelStyle={styles.label}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={styles.updateButton}
              onPress={() => updateProfile({ username, bio })}
              disabled={loading}
            >
              <Text style={styles.updateButtonText}>
                {loading ? "Updating..." : "Update Profile"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signOutButton}
              onPress={() => supabase.auth.signOut()}
            >
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f0fa",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 8,
    borderRadius: 8,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#a084ca",
    letterSpacing: 1,
  },
  profileSection: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  profilePhotoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  profilePhotoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f2e9fa",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  uploadButton: {
    backgroundColor: "#f2e9fa",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  uploadButtonText: {
    color: "#8d5fd3",
    fontSize: 14,
    fontWeight: "600",
  },
  form: {
    marginTop: 20,
  },
  inputContainer: {
    borderBottomWidth: 0,
    backgroundColor: "#f7f0fa",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 15,
  },
  input: {
    color: "#333",
    fontSize: 16,
  },
  label: {
    color: "#666",
    fontSize: 14,
    marginBottom: 8,
  },
  disabledInput: {
    color: "#999",
  },
  updateButton: {
    backgroundColor: "#8d5fd3",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginTop: 20,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  signOutButton: {
    backgroundColor: "#f2e9fa",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginTop: 15,
  },
  signOutButtonText: {
    color: "#8d5fd3",
    fontSize: 16,
    fontWeight: "600",
  },
});
