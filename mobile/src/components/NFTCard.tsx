// mobile/components/NFTCard.tsx
import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.44;

interface NFTCardProps {
  id: string;
  name: string;
  image: string;
  price: string;
  currency: string;
  type: 'fixed' | 'auction';
  timeLeft?: number;
  onLike?: () => void;
  onQuickBuy?: () => void;
}

export const NFTCard: React.FC<NFTCardProps> = ({
  name,
  image,
  price,
  currency,
  type,
  timeLeft,
  onLike,
  onQuickBuy,
}) => {
  const navigation = useNavigation();
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const translateX = useSharedValue(0);

  // Double tap to like
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withSpring(1.2, {}, () => {
        scale.value = withSpring(1);
      });
      if (onLike) runOnJS(onLike)();
    });

  // Long press for quick preview
  const longPress = Gesture.LongPress()
    .onStart(() => {
      scale.value = withSpring(0.95);
    })
    .onEnd(() => {
      scale.value = withSpring(1);
    });

  // Swipe right for quick buy
  const swipe = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = Math.max(0, event.translationX);
      rotate.value = interpolate(
        event.translationX,
        [0, 100],
        [0, 10],
        Extrapolate.CLAMP
      );
    })
    .onEnd((event) => {
      if (event.translationX > 80) {
        translateX.value = withSpring(100);
        if (onQuickBuy) runOnJS(onQuickBuy)();
      } else {
        translateX.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const composed = Gesture.Race(doubleTap, longPress, swipe);

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <Pressable
          onPress={() => navigation.navigate('NFTDetail', { name, image, price })}
          style={styles.pressable}
        >
          {/* Image */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
            
            {/* Type Badge */}
            <View style={[
              styles.badge,
              type === 'auction' ? styles.auctionBadge : styles.fixedBadge
            ]}>
              <Text style={styles.badgeText}>
                {type === 'auction' ? '⏰ AUCTION' : '🏷️ FIXED'}
              </Text>
            </View>

            {/* Timer for auctions */}
            {type === 'auction' && timeLeft && (
              <View style={styles.timerBadge}>
                <Text style={styles.timerText}>
                  {formatTime(timeLeft)}
                </Text>
              </View>
            )}
          </View>

          {/* Info */}
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{price}</Text>
              <Text style={styles.currency}>{currency}</Text>
            </View>
          </View>

          {/* Swipe hint */}
          <View style={styles.swipeHint}>
            <Text style={styles.swipeText}>← Swipe to buy</Text>
          </View>
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    margin: 8,
  },
  pressable: {
    backgroundColor: '#1a1a25',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#252535',
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  fixedBadge: {
    backgroundColor: 'rgba(0, 212, 255, 0.9)',
  },
  auctionBadge: {
    backgroundColor: 'rgba(184, 41, 221, 0.9)',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  timerBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  timerText: {
    color: '#ff0080',
    fontFamily: 'SpaceMono',
    fontSize: 12,
    fontWeight: 'bold',
  },
  info: {
    padding: 12,
  },
  name: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  price: {
    color: '#00d4ff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  currency: {
    color: '#606070',
    fontSize: 12,
  },
  swipeHint: {
    position: 'absolute',
    right: -60,
    top: '50%',
    backgroundColor: '#00ffa3',
    padding: 8,
    borderRadius: 8,
    transform: [{ rotate: '90deg' }],
  },
  swipeText: {
    color: '#0a0a0f',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
