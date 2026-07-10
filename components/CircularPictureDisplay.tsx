import { StyleSheet, View, Image, TouchableOpacity } from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";
import { scale } from "react-native-size-matters";
import { useColors } from "@/store/themeStore";
import { Colors } from "react-native/Libraries/NewAppScreen";

type Props = {
  src?: string;
  isEditable?: boolean;
  onEdit?: () => void;
  size?: number;
};

const CircularPictureDisplay: React.FC<Props> = ({
  src,
  isEditable = false,
  onEdit,
  size = 100,
}) => {
  const colors = useColors();
  const styles = getStyles(scale(size), colors);

  return (
    <View style={styles.container}>
      {/* Image with gradient border effect */}
      <View style={styles.gradientBorder}>
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: src }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Edit button with modern glass effect */}
      {isEditable && (
        <TouchableOpacity
          style={styles.editButton}
          onPress={onEdit}
          activeOpacity={0.7}
        >
          <View style={styles.editIconWrapper}>
            <Feather name="edit-3" size={scale(13)} color="#fff" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default CircularPictureDisplay;

const getStyles = (size: number, colors: any) =>
  StyleSheet.create({
    container: {
      width: size,
      height: size,
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
    },
    gradientBorder: {
      width: size,
      height: size,
      borderRadius: size / 2,
      padding: 2.5,
      backgroundColor: colors.pictureBorderColor,
      shadowColor: colors.primaryShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    imageWrapper: {
      width: "100%",
      height: "100%",
      borderRadius: size / 2,
      overflow: "hidden",
      backgroundColor: colors.card,
    },
    image: {
      width: "100%",
      height: "100%",
    },
    editButton: {
      position: "absolute",
      bottom: scale(2),
      right: scale(2),
      borderRadius: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    editIconWrapper: {
      width: scale(28),
      height: scale(28),
      borderRadius: 14,
      backgroundColor: colors.main,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2.5,
      borderColor: "#fff",
    },
  });
