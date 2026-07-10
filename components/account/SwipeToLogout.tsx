import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Alert,
  Dimensions,
} from 'react-native';
import { scale } from 'react-native-size-matters';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/store/themeStore';
import { ThemePalette } from '@/constants/Colors';
import { FONTS } from '@/constants/Fonts';
import { Dimens } from '@/constants/Dimes';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';



const SwipeToLogout = ({ onLogout }: { onLogout: () => void }) => {
  const colors = useColors();

  const screenWidth = Dimensions.get('window').width;
  const translateX = useRef(new Animated.Value(0)).current;
  const maxSwipeDistance = screenWidth - Dimens.paddingMarginHorizontal * 2 - scale(100);

  const chevronAnim1 = useRef(new Animated.Value(0)).current;
  const chevronAnim2 = useRef(new Animated.Value(0)).current;
  const chevronAnim3 = useRef(new Animated.Value(0)).current;
  const bottomSheetRef = useRef<BottomSheet>(null);


  useEffect(() => {
    // Smooth pulsing animation
    const createChevronAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
          }),
        ])
      );
    };
    

    const anim1 = createChevronAnimation(chevronAnim1, 0);
    const anim2 = createChevronAnimation(chevronAnim2, 150);
    const anim3 = createChevronAnimation(chevronAnim3, 300);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: (_, gestureState) => {
        const newX = Math.max(0, Math.min(gestureState.dx, maxSwipeDistance));
        translateX.setValue(newX);
      },
      onPanResponderRelease: (_, gestureState) => {
        const swipeThreshold = maxSwipeDistance * 0.8;

        if (gestureState.dx >= swipeThreshold) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          Animated.spring(translateX, {
            toValue: maxSwipeDistance,
            useNativeDriver: false,
          }).start(() => {
            Alert.alert(
              'Log Out',
              'Are you sure you want to log out?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                  onPress: () => {
                    Animated.spring(translateX, {
                      toValue: 0,
                      useNativeDriver: false,
                    }).start();
                  },
                },
                {
                  text: 'Log Out',
                  style: 'destructive',
                  onPress: onLogout,
                },
              ]
            );
          });
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const textOpacity = translateX.interpolate({
    inputRange: [0, maxSwipeDistance * 0.3],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const backgroundWidth = translateX.interpolate({
    inputRange: [0, maxSwipeDistance],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const chevronOpacity1 = chevronAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const chevronOpacity2 = chevronAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const chevronOpacity3 = chevronAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  return (
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        {/* Background fill */}
        <Animated.View
          style={[styles.backgroundFill, { width: backgroundWidth }]}
        />

        {/* Row layout instead of absolute positioning */}
        <View style={styles.row}>
          <Animated.View
            style={[styles.sliderButton, { transform: [{ translateX }] }]}
            {...panResponder.panHandlers}
          >
            <Feather name="log-out" size={scale(24)} color="white" />
          </Animated.View>

          <View style={styles.rightSide}>
            <Animated.View style={[styles.centerContent, { opacity: textOpacity }]}>
              <Text style={styles.text}>Slide to Logout</Text>
              <View style={styles.chevronGroup}>
                <Animated.View style={{ opacity: chevronOpacity1 }}>
                  <Feather name="chevron-right" size={scale(24)} color="#EF4444" />
                </Animated.View>
                <Animated.View style={{ opacity: chevronOpacity2, marginLeft: scale(-8) }}>
                  <Feather name="chevron-right" size={scale(24)} color="#EF4444" />
                </Animated.View>
                <Animated.View style={{ opacity: chevronOpacity3, marginLeft: scale(-8) }}>
                  <Feather name="chevron-right" size={scale(24)} color="#EF4444" />
                </Animated.View>
              </View>
            </Animated.View>
          </View>

        </View>
      </View>
      <GestureHandlerRootView style={styles.stCont}>
      <BottomSheet
        ref={bottomSheetRef}
        onChange={handleSheetChanges}
      >
        <BottomSheetView style={styles.contentContainer}>
          <Text>Awesome 🎉</Text>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
    </View>
  );
};

export default SwipeToLogout;

const styles = StyleSheet.create({
  outerContainer: {
    marginTop: scale(18),
    marginHorizontal: Dimens.paddingMarginHorizontal,
  },
  stC: {
    flex: 1,
    backgroundColor: 'grey',
  },
  contentContainer: {
    flex: 1,
    padding: 36,
    alignItems: 'center',
  },

  container: {
    backgroundColor: '#FFF8F9',
    borderRadius: scale(44),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(16,24,40,0.04)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 8,
    padding: scale(5),
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backgroundFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,93,76,0.12)',
    borderRadius: scale(44),
  },

  rightSide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  centerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },

  text: {
    fontSize: scale(17),
    fontFamily: FONTS.medium,
    color: '#EF4444',
  },

  chevronGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: scale(6),
  },

  sliderButton: {
    padding: scale(12),
    borderRadius: scale(50),
    backgroundColor: '#FF5A5F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF5A5F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
});
