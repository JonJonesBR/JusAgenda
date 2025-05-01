import React from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

const { width } = Dimensions.get("window");

interface SkeletonLoaderProps {
  type?: "list" | "card" | "profile" | "text" | "circle";
  count?: number;
  height?: number | string;
  width?: number | string;
  size?: number;
  style?: any;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = "list",
  count = 1,
  height = 20,
  width: customWidth,
  size,
  style,
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

  // Helper function to ensure we're working with numbers for calculations
  const getNumericValue = (value: number | string): number => {
    if (typeof value === 'number') return value;
    return parseInt(value, 10) || 0; // Default to 0 if parsing fails
  };

  // We don't need this variable as we calculate width in each render function
  // const itemWidth = customWidth !== undefined ? getNumericValue(customWidth) : width - 40;

  const interpolatedBackground = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [
      (theme.colors as any).skeleton || "#e0e0e0",
      (theme.colors as any).skeletonHighlight || "#f5f5f5",
    ],
  });

  const renderListItem = (index: number) => {
    const numericHeight = getNumericValue(height);
    const numericWidth = getNumericValue(customWidth || width - 40);
    
    return (
      <View key={`skeleton-${index}`} style={styles.listContainer}>
        <Animated.View
          style={[
            styles.circle,
            {
              backgroundColor: interpolatedBackground,
              height: numericHeight, // Use numeric value to fix type error
              width: numericHeight,  // Use numeric value to fix type error
            },
          ]}
        />
        <View style={styles.lines}>
          <Animated.View
            style={[
              styles.line,
              {
                backgroundColor: interpolatedBackground,
                height: numericHeight * 0.5,
                width: numericWidth * 0.7,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.line,
              {
                backgroundColor: interpolatedBackground,
                height: numericHeight * 0.4,
                width: numericWidth * 0.9,
                marginTop: 6,
              },
            ]}
          />
        </View>
      </View>
    );
  };

  const renderCardItem = (index: number) => {
    const numericHeight = getNumericValue(height);
    const numericWidth = getNumericValue(customWidth || width - 40);
    
    return (
      <View key={`skeleton-card-${index}`} style={styles.cardContainer}>
        <Animated.View
          style={[
            styles.cardHeader,
            {
              backgroundColor: interpolatedBackground,
              height: numericHeight * 0.8,
              width: numericWidth * 0.9,
            },
          ]}
        />
        <View style={styles.cardContent}>
          <Animated.View
            style={[
              styles.line,
              {
                backgroundColor: interpolatedBackground,
                height: numericHeight * 0.5,
                width: numericWidth * 0.8,
                marginTop: 10,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.line,
              {
                backgroundColor: interpolatedBackground,
                height: numericHeight * 0.4,
                width: numericWidth * 0.6,
                marginTop: 6,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.line,
              {
                backgroundColor: interpolatedBackground,
                height: numericHeight * 0.4,
                width: numericWidth * 0.7,
                marginTop: 6,
              },
            ]}
          />
        </View>
      </View>
    );
  };

  const renderProfileItem = () => {
    const numericWidth = getNumericValue(customWidth || width - 40);
    
    return (
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
                width: numericWidth * 0.5,
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
                width: numericWidth * 0.7,
              },
            ]}
          />
        </View>
      </View>
    );
  };

  // Render a simple text (used for text placeholders)
  const renderTextItem = (index: number) => {
    const numericHeight = getNumericValue(height);
    const numericWidth = getNumericValue(customWidth || width - 40);
    
    return (
      <Animated.View
        key={`skeleton-text-${index}`}
        style={[
          {
            backgroundColor: interpolatedBackground,
            height: numericHeight,
            width: customWidth || numericWidth,
            borderRadius: 4,
            ...style,
          },
        ]}
      />
    );
  };

  // Render a circle (used for avatars, icons, etc)
  const renderCircleItem = (index: number) => {
    const circleSize = size || height;
    const numericSize = getNumericValue(circleSize);
    const borderRadiusValue = size ? size / 2 : numericSize / 2;
    
    return (
      <Animated.View
        key={`skeleton-circle-${index}`}
        style={[
          {
            backgroundColor: interpolatedBackground,
            height: numericSize,
            width: numericSize,
            borderRadius: borderRadiusValue,
            ...style,
          },
        ]}
      />
    );
  };

  let content;
  switch (type) {
    case "card":
      content = Array.from({ length: count }).map((_, i) => renderCardItem(i));
      break;
    case "profile":
      content = renderProfileItem();
      break;
    case "text":
      content = Array.from({ length: count }).map((_, i) => renderTextItem(i));
      break;
    case "circle":
      content = Array.from({ length: count }).map((_, i) => renderCircleItem(i));
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
