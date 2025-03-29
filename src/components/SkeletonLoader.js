import React from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const SkeletonLoader = ({ type = 'list', count = 1, height = 20, width: customWidth }) => {
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
    outputRange: [theme.colors.skeleton, theme.colors.skeletonHighlight]
  });

  const renderListItem = (index) => (
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

  const renderCardItem = (index) => (
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
    case 'card':
      content = Array.from({ length: count }).map((_, i) => renderCardItem(i));
      break;
    case 'profile':
      content = renderProfileItem();
      break;
    case 'list':
    default:
      content = Array.from({ length: count }).map((_, i) => renderListItem(i));
      break;
  }

  return <View style={styles.container}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  listContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  circle: {
    borderRadius: 25,
  },
  lines: {
    marginLeft: 10,
    flex: 1,
  },
  line: {
    borderRadius: 4,
  },
  cardContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardHeader: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardContent: {
    padding: 10,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
});

export default SkeletonLoader;