import React, { memo } from 'react';
import { FlatList, FlatListProps } from 'react-native';

// Use a generic TItem for the data items
function areEqual<TItem>(
  prevProps: Readonly<FlatListProps<TItem>>,
  nextProps: Readonly<FlatListProps<TItem>>
) {
  // Basic check for data length and extraData.
  const prevData = prevProps.data;
  const nextData = nextProps.data;

  return (
    (prevData?.length === nextData?.length) &&
    prevProps.extraData === nextProps.extraData
    // For more robust comparison, consider iterating over items if they are simple,
    // or using a library for deep comparison if items are complex objects.
    // However, deep comparison can be expensive.
  );
}

// Define the inner component with a generic type and display name
const OptimizedFlatListInner = <TItem,>(props: FlatListProps<TItem>) => {
  return <FlatList<TItem> {...props} removeClippedSubviews={true} />;
};
OptimizedFlatListInner.displayName = 'OptimizedFlatListInner';

// Memoize the inner component
const OptimizedFlatList = memo(OptimizedFlatListInner, areEqual) as <TItem>(
  props: FlatListProps<TItem>
) => React.ReactElement;

// If the linter still complains about displayName on the memoized component,
// this is a common issue with React.memo and generics.
// The displayName on OptimizedFlatListInner is usually sufficient for dev tools.

export default OptimizedFlatList;
