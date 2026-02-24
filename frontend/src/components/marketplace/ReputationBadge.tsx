// components/ReputationBadge.tsx
import React from 'react';
import { Shield, ShieldCheck, ShieldAlert, Heart, Flag } from 'lucide-react';

interface ReputationData {
  likesReceived: number;
  likesGiven: number;
  reportsReceived: number;
  successfulReports: number;
  reputationScore: number;
  isVerified: boolean;
  isBanned: boolean;
}

export const ReputationBadge: React.FC<{
  reputation: ReputationData;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ reputation, showDetails = false, size = 'md' }) => {
  const getBadge = () => {
    if (reputation.isBanned) {
      return {
        icon: ShieldAlert,
        color: 'text-red-500 bg-red-500/10 border-red-500/30',
        label: 'Banned',
      };
    }
    if (reputation.isVerified) {
      return {
        icon: ShieldCheck,
        color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
        label: 'Verified',
      };
    }
    if (reputation.reputationScore >= 100) {
      return {
        icon: Shield,
        color: 'text-green-400 bg-green-400/10 border-green-400/30',
        label: 'Trusted',
      };
    }
    return {
      icon: Shield,
      color: 'text-gray-400 bg-gray-400/10 border-gray-400/30',
      label: 'Member',
    };
  };

  const badge = getBadge();
  const Icon = badge.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <div className="flex flex-col gap-2">
      <div className={`inline-flex items-center gap-1.5 rounded-full border ${badge.color} ${sizeClasses[size]} font-medium`}>
        <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} />
        <span>{badge.label}</span>
      </div>

      {showDetails && (
        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-red-400" />
            {reputation.likesReceived} received
          </span>
          <span className="flex items-center gap-1">
            <Flag className="w-3 h-3 text-orange-400" />
            {reputation.successfulReports} reports
          </span>
          <span className={`font-medium ${reputation.reputationScore >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            Score: {reputation.reputationScore > 0 ? '+' : ''}{reputation.reputationScore}
          </span>
        </div>
      )}
    </div>
  );
};
