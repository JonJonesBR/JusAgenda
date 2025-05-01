import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import { useTheme } from '../contexts/ThemeContext';

interface LoadingSkeletonProps {
  type: 'calendar' | 'list' | 'card' | 'form' | 'details';
  style?: ViewStyle;
  count?: number;
}

/**
 * Loading skeleton component that displays different types of placeholders
 * depending on the UI context being loaded
 */
const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  type, 
  style, 
  count = 1 
}) => {
  // We use ThemeContext but don't need theme variable directly as it's passed through SkeletonLoader
  useTheme();

  const renderSkeleton = () => {
    switch (type) {
      case 'calendar':
        return (
          <View style={[styles.container, style]}>
            {/* Calendar header */}
            <View style={styles.calendarHeader}>
              <SkeletonLoader 
                type="text" 
                width={150} 
                height={24} 
                style={styles.monthTitle} 
              />
              <SkeletonLoader 
                type="circle" 
                size={32} 
                style={styles.calendarControl} 
              />
            </View>
            
            {/* Days of the week */}
            <View style={styles.weekDays}>
              {Array(7).fill(0).map((_, index) => (
                <SkeletonLoader 
                  key={`weekday-${index}`}
                  type="text" 
                  width={30} 
                  height={16} 
                />
              ))}
            </View>
            
            {/* Calendar grid */}
            <View style={styles.calendarGrid}>
              {Array(35).fill(0).map((_, index) => (
                <View key={`day-${index}`} style={styles.dayContainer}>
                  <SkeletonLoader 
                    type="text" 
                    width={24} 
                    height={24} 
                    style={styles.dayNumber} 
                  />
                  {index % 5 === 0 && (
                    <SkeletonLoader 
                      type="circle" 
                      size={8} 
                      style={styles.eventDot} 
                    />
                  )}
                </View>
              ))}
            </View>
            
            {/* Day events */}
            <View style={styles.eventsContainer}>
              {Array(3).fill(0).map((_, index) => (
                <View key={`event-${index}`} style={styles.eventItem}>
                  <SkeletonLoader 
                    type="text" 
                    width={'90%'} 
                    height={20} 
                    style={styles.eventTitle} 
                  />
                  <SkeletonLoader 
                    type="text" 
                    width={'60%'} 
                    height={16} 
                    style={styles.eventDetail} 
                  />
                </View>
              ))}
            </View>
          </View>
        );
        
      case 'list':
        return (
          <View style={[styles.container, style]}>
            {Array(count).fill(0).map((_, index) => (
              <View key={`list-item-${index}`} style={styles.listItem}>
                <SkeletonLoader 
                  type="text" 
                  width={'70%'} 
                  height={20} 
                  style={styles.listTitle} 
                />
                <SkeletonLoader 
                  type="text" 
                  width={'90%'} 
                  height={16} 
                  style={styles.listSubtitle} 
                />
                <SkeletonLoader 
                  type="text" 
                  width={'40%'} 
                  height={14} 
                  style={styles.listDetail} 
                />
              </View>
            ))}
          </View>
        );
        
      case 'card':
        return (
          <View style={[styles.container, style]}>
            {Array(count).fill(0).map((_, index) => (
              <View key={`card-${index}`} style={styles.card}>
                <SkeletonLoader 
                  type="text" 
                  width={'80%'} 
                  height={24} 
                  style={styles.cardTitle} 
                />
                <SkeletonLoader 
                  type="text" 
                  width={'100%'} 
                  height={16} 
                  style={styles.cardContent} 
                />
                <SkeletonLoader 
                  type="text" 
                  width={'100%'} 
                  height={16} 
                  style={styles.cardContent} 
                />
                <View style={styles.cardFooter}>
                  <SkeletonLoader 
                    type="text" 
                    width={80} 
                    height={16} 
                  />
                  <SkeletonLoader 
                    type="circle" 
                    size={24} 
                  />
                </View>
              </View>
            ))}
          </View>
        );
        
      case 'form':
        return (
          <View style={[styles.container, style]}>
            {Array(count).fill(0).map((_, index) => (
              <View key={`form-field-${index}`} style={styles.formField}>
                <SkeletonLoader 
                  type="text" 
                  width={120} 
                  height={16} 
                  style={styles.formLabel} 
                />
                <SkeletonLoader 
                  type="text" 
                  width={'100%'} 
                  height={40} 
                  style={styles.formInput} 
                />
              </View>
            ))}
          </View>
        );
        
      case 'details':
        return (
          <View style={[styles.container, style]}>
            <SkeletonLoader 
              type="text" 
              width={'70%'} 
              height={28} 
              style={styles.detailsTitle} 
            />
            
            <View style={styles.detailsSection}>
              <SkeletonLoader 
                type="text" 
                width={'40%'} 
                height={20} 
                style={styles.sectionTitle} 
              />
              
              <View style={styles.detailsRow}>
                <SkeletonLoader 
                  type="text" 
                  width={'30%'} 
                  height={16} 
                  style={styles.detailsLabel} 
                />
                <SkeletonLoader 
                  type="text" 
                  width={'60%'} 
                  height={16} 
                  style={styles.detailsValue} 
                />
              </View>
              
              <View style={styles.detailsRow}>
                <SkeletonLoader 
                  type="text" 
                  width={'30%'} 
                  height={16} 
                  style={styles.detailsLabel} 
                />
                <SkeletonLoader 
                  type="text" 
                  width={'60%'} 
                  height={16} 
                  style={styles.detailsValue} 
                />
              </View>
            </View>
            
            <View style={styles.detailsSection}>
              <SkeletonLoader 
                type="text" 
                width={'40%'} 
                height={20} 
                style={styles.sectionTitle} 
              />
              
              <SkeletonLoader 
                type="text" 
                width={'100%'} 
                height={60} 
                style={styles.detailsContent} 
              />
            </View>
          </View>
        );
        
      default:
        return (
          <View style={[styles.container, style]}>
            <SkeletonLoader 
              type="text" 
              width={'100%'} 
              height={20} 
              count={count} 
            />
          </View>
        );
    }
  };

  return renderSkeleton();
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
  },
  
  // Styles for calendar skeleton
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthTitle: {
    marginLeft: 8,
  },
  calendarControl: {
    marginRight: 8,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayContainer: {
    width: '14%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dayNumber: {
    borderRadius: 12,
  },
  eventDot: {
    marginTop: 4,
  },
  eventsContainer: {
    marginTop: 16,
  },
  eventItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  eventTitle: {
    marginBottom: 8,
  },
  eventDetail: {
    marginBottom: 4,
  },
  
  // Styles for list skeleton
  listItem: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  listTitle: {
    marginBottom: 8,
  },
  listSubtitle: {
    marginBottom: 8,
  },
  listDetail: {
    marginBottom: 4,
  },
  
  // Styles for card skeleton
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  cardTitle: {
    marginBottom: 16,
  },
  cardContent: {
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  
  // Styles for form skeleton
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    marginBottom: 8,
  },
  formInput: {
    borderRadius: 4,
  },
  
  // Styles for details skeleton
  detailsTitle: {
    marginBottom: 24,
    alignSelf: 'center',
  },
  detailsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailsLabel: {
    marginRight: 16,
  },
  detailsValue: {},
  detailsContent: {
    borderRadius: 8,
  },
});

export default LoadingSkeleton;