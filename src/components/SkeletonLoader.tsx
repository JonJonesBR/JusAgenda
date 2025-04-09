import React from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

const { width } = Dimensions.get("window");

interface SkeletonLoaderProps {
  type?: "list" | "card" | "profile";
  count?: number;
  height?: number;
  width?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = "list",
  count = 1,
  height = 20,
  width: customWidth,
}) => {
  const { theme } = useTheme();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      })
    ).start();
  }, [animatedValue]);

  const itemWidth = customWidth || width - 40;

  const interpolatedBackground = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [
      (theme.colors as any).skeleton || "#e0e0e0",
      (theme.colors as any).skeletonHighlight || "#f5f5f5",
    ],
  });

  const renderListItem = (index: number) => (
    <View key={`skeleton-${index}`} style={styles.listContainer}>
      <Animated.View
        style={[
          styles.circle,
          {
            backgroundColor: interpolatedBackground,
            height: height,
            width: height,
          },
        ]}
      />
      <View style={styles.lines}>
        <Animated.View
          style={[
            styles.line,
            {
              backgroundColor: interpolatedBackground,
              height: height * 0.5,
              width: itemWidth * 0.7,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.line,
            {
              backgroundColor: interpolatedBackground,
              height: height * 0.4,
              width: itemWidth * 0.9,
              marginTop: 6,
            },
          ]}
        />
      </View>
    </View>
  );

  const renderCardItem = (index: number) => (
    <View key={`skeleton-card-${index}`} style={styles.cardContainer}>
      <Animated.View
        style={[
          styles.cardHeader,
          {
            backgroundColor: interpolatedBackground,
            height: height * 0.8,
            width: itemWidth * 0.9,
          },
        ]}
      />
      <View style={styles.cardContent}>
        <Animated.View
          style={[
            styles.line,
            {
              backgroundColor: interpolatedBackground,
              height: height * 0.5,
              width: itemWidth * 0.8,
              marginTop: 10,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.line,
            {
              backgroundColor: interpolatedBackground,
              height: height * 0.4,
              width: itemWidth * 0.6,
              marginTop: 6,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.line,
            {
              backgroundColor: interpolatedBackground,
              height: height * 0.4,
              width: itemWidth * 0.7,
              marginTop: 6,
            },
          ]}
        />
      </View>
    </View>
  );

  const renderProfileItem = () => (
    <View style={styles.profileContainer}>
      <Animated.View
        style={[
          styles.profileImage,
          {
            backgroundColor: interpolatedBackground,
          },
        ]}
      />
      <View style={styles.profileInfo}>
        <Animated.View
          style={[
            styles.line,
            {
              backgroundColor: interpolatedBackground,
              height: 24,
              width: itemWidth * 0.5,
              marginBottom: 8,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.line,
            {
              backgroundColor: interpolatedBackground,
              height: 16,
              width: itemWidth * 0.7,
            },
          ]}
        />
      </View>
    </View>
  );

  let content;
  switch (type) {
    case "card":
      content = Array.from({ length: count }).map((_, i) => renderCardItem(i));
      break;
    case "profile":
      content = renderProfileItem();
      break;
    case "list":
    default:
      content = Array.from({ length: count }).map((_, i) => renderListItem(i));
      break;
  }

  return <View style={styles.container}>{content}</View>;
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
  },
  cardContent: {
    padding: 10,
  },
  cardHeader: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  circle: {
    borderRadius: 25,
  },
  container: {
    padding: 10,
  },
  line: {
    borderRadius: 4,
  },
  lines: {
    flex: 1,
    marginLeft: 10,
  },
  listContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 16,
  },
  profileContainer: {
    alignItems: "center",
    flexDirection: "row",
    padding: 16,
  },
  profileImage: {
    borderRadius: 40,
    height: 80,
    width: 80,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
});

export default SkeletonLoader;
