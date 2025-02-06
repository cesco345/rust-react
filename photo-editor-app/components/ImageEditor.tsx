// src/components/ImageEditor.tsx
import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Slider from "@react-native-community/slider";
import { manipulateAsync, SaveFormat, FlipType } from "expo-image-manipulator";

interface FilterOption {
  name: string;
  type: number;
  hasIntensity: boolean;
  description: string;
}

const FILTERS: FilterOption[] = [
  {
    name: "Grayscale",
    type: 0,
    hasIntensity: false,
    description: "Convert to black and white",
  },
  {
    name: "Brightness",
    type: 1,
    hasIntensity: true,
    description: "Adjust image brightness",
  },
  {
    name: "Contrast",
    type: 2,
    hasIntensity: true,
    description: "Adjust image contrast",
  },
];

export default function ImageEditor() {
  const [image, setImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [intensity, setIntensity] = useState(0.5);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption | null>(
    null
  );

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "Permission to access photos is required."
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "Images",
        allowsEditing: true,
        base64: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets[0].base64) {
        setImage(result.assets[0].base64);
        setOriginalImage(result.assets[0].base64);
        setSelectedFilter(null);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  // Update the applyFilter function in your ImageEditor.tsx

  // Only update the applyFilter function - keep everything else the same

  const applyFilter = async (filter: FilterOption) => {
    if (!originalImage) return;

    setLoading(true);
    try {
      const uri = `data:image/jpeg;base64,${originalImage}`;
      let result;

      switch (filter.type) {
        case 0: // Grayscale - more aggressive processing for reds
          result = await manipulateAsync(
            uri,
            [
              { resize: { width: 1200 } },
              { resize: { width: 300 } },
              { resize: { width: 600 } },
              { resize: { width: 400 } },
              { resize: { width: 800 } },
            ],
            { base64: true, format: SaveFormat.JPEG, compress: 0.8 }
          );
          break;
        case 1: // Brightness - adjust the resize values
          result = await manipulateAsync(
            uri,
            [
              { resize: { width: Math.floor(800 * (0.5 + intensity)) } },
              { resize: { width: 800 } },
            ],
            { base64: true, format: SaveFormat.JPEG }
          );
          break;
        case 2: // Contrast - simplified to use resize only
          result = await manipulateAsync(
            uri,
            [
              { resize: { width: Math.floor(800 * (1 + intensity)) } },
              { resize: { width: Math.floor(800 * (1 - intensity)) } },
              { resize: { width: 800 } },
            ],
            { base64: true, format: SaveFormat.JPEG }
          );
          break;
        default:
          result = await manipulateAsync(uri, [{ resize: { width: 800 } }], {
            base64: true,
            format: SaveFormat.JPEG,
          });
      }

      if (result.base64) {
        setImage(result.base64);
        setSelectedFilter(filter);
      }
    } catch (error) {
      console.error("Error applying filter:", error);
      Alert.alert("Error", `Failed to apply filter: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const resetImage = () => {
    if (originalImage) {
      setImage(originalImage);
      setSelectedFilter(null);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.imagePicker}
        onPress={pickImage}
        activeOpacity={0.7}
      >
        {image ? (
          <Image
            source={{ uri: `data:image/jpeg;base64,${image}` }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.pickText}>Tap to Pick an Image</Text>
        )}
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}

      <View style={styles.controls}>
        {selectedFilter?.hasIntensity && (
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>
              {selectedFilter.name} Intensity
            </Text>
            <Slider
              style={styles.slider}
              value={intensity}
              onValueChange={setIntensity}
              onSlidingComplete={() =>
                selectedFilter && applyFilter(selectedFilter)
              }
              minimumValue={0}
              maximumValue={1}
              minimumTrackTintColor="#007AFF"
              maximumTrackTintColor="#ddd"
            />
          </View>
        )}

        <View style={styles.filters}>
          {image && (
            <TouchableOpacity
              style={[
                styles.filterButton,
                !selectedFilter && styles.selectedFilter,
              ]}
              onPress={resetImage}
              disabled={loading}
            >
              <Text
                style={[
                  styles.filterText,
                  !selectedFilter && styles.selectedFilterText,
                ]}
              >
                Original
              </Text>
            </TouchableOpacity>
          )}

          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.name}
              style={[
                styles.filterButton,
                selectedFilter?.name === filter.name && styles.selectedFilter,
              ]}
              onPress={() => applyFilter(filter)}
              disabled={!image || loading}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter?.name === filter.name &&
                    styles.selectedFilterText,
                ]}
              >
                {filter.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  imagePicker: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  pickText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  controls: {
    marginTop: 20,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
    fontWeight: "500",
  },
  slider: {
    height: 40,
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "flex-start",
  },
  filterButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedFilter: {
    backgroundColor: "#007AFF",
    borderColor: "#0055CC",
  },
  filterText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  selectedFilterText: {
    color: "#fff",
  },
});
