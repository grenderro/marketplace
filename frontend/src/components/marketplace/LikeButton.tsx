// components/LikeButton.tsx — Client-side likes using localStorage (decentralized fallback)
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks';

interface LikeButtonProps {
  targetType: 'nft' | 'collection' | 'user' | 'listing';
  targetId: string;
  initialLikes: number;
  initialLiked?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

const STORAGE_KEY = 'marketplace_likes';

function getLikedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* ignore */ }
  return new Set();
}

function setLikedSet(set: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  targetType,
  targetId,
  initialLikes,
  initialLiked = false,
  size = 'md',
  showCount = true,
}) => {
  const { address } = useGetAccountInfo();
  const key = `${targetType}:${targetId}`;
  const likedSet = getLikedSet();
  const [isLiked, setIsLiked] = useState(likedSet.has(key) || initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsLiked(likedSet.has(key) || initialLiked);
  }, [key, initialLiked]);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleLike = async () => {
    if (!address) {
      alert('Please connect your wallet to like items');
      return;
    }

    setIsAnimating(true);

    const set = getLikedSet();
    if (isLiked) {
      set.delete(key);
      setLikeCount(prev => Math.max(0, prev - 1));
      setIsLiked(false);
    } else {
      set.add(key);
      setLikeCount(prev => prev + 1);
      setIsLiked(true);
    }
    setLikedSet(set);

    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button
      onClick={handleLike}
      className={`relative flex items-center gap-2 ${sizeClasses[size]} rounded-full transition-all ${
        isLiked
          ? 'bg-red-500/20 text-red-500'
          : 'bg-gray-800 text-gray-400 hover:text-red-400 hover:bg-red-500/10'
      }`}
      disabled={isAnimating}
    >
      <div className="relative flex-1 flex justify-center">
        <AnimatePresence>
          {isAnimating && isLiked && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Heart className="w-full h-full text-red-500 fill-red-500" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          animate={isAnimating && isLiked ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Heart
            className={`${iconSizes[size]} ${isLiked ? 'fill-current' : ''} transition-transform`}
          />
        </motion.div>
      </div>

      {showCount && (
        <span className={`pr-3 font-medium ${size === 'sm' ? 'text-sm' : ''}`}>
          {likeCount.toLocaleString()}
        </span>
      )}
    </button>
  );
};
