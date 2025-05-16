import React from 'react';
import { StyleSheet, Animated } from 'react-native'; // Removido View
import { useEffect, useRef } from 'react';

import { ViewStyle } from 'react-native'; // Import ViewStyle for better type safety

interface LoadingSkeletonProps {
  width: number | string;
  height: number;
  style?: ViewStyle | object; // Use ViewStyle or a general object for style
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ width, height, style }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, opacity },
        style,
      ]}
    />
  );
};

const componentColors = {
  skeletonBackground: '#E1E9EE',
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: componentColors.skeletonBackground,
    borderRadius: 4,
  },
});

export default LoadingSkeleton;
