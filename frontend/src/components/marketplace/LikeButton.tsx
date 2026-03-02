// components/LikeButton.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useGetAccountInfo } from '../../hooks/sdkStubs';

interface LikeButtonProps {
  targetType: 'nft' | 'collection' | 'user' | 'listing';
  targetId: string;
  initialLikes: number;
  initialLiked?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
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
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [isAnimating, setIsAnimating] = useState(false);

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
      // Show connect wallet modal
      return;
    }

    setIsAnimating(true);

    try {
      if (isLiked) {
        // Unlike
        await fetch('/api/social/unlike', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetType,
            targetId,
          }),
        });
        setLikeCount(prev => prev - 1);
        setIsLiked(false);
      } else {
        // Like
        await fetch('/api/social/like', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetType,
            targetId,
          }),
        });
        setLikeCount(prev => prev + 1);
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Like failed:', error);
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
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
