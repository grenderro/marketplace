// components/ReportModal.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Flag, CheckCircle } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'nft' | 'collection' | 'user' | 'listing';
  targetId: string;
  targetName: string;
  targetImage?: string;
}

const REPORT_REASONS = [
  { id: 0, label: 'Spam', description: 'Unwanted or repetitive content' },
  { id: 1, label: 'Scam', description: 'Fraudulent or deceptive activity' },
  { id: 2, label: 'Fake Collection', description: 'Counterfeit or unauthorized collection' },
  { id: 3, label: 'Copyright Violation', description: 'Stolen intellectual property' },
  { id: 4, label: 'Inappropriate Content', description: 'NSFW or offensive material' },
  { id: 5, label: 'Price Manipulation', description: 'Artificially inflating/deflating prices' },
  { id: 6, label: 'Wash Trading', description: 'Fake volume through self-trading' },
  { id: 7, label: 'Other', description: 'Something else' },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
  targetImage,
}) => {
  const [step, setStep] = useState<'reason' | 'details' | 'submitting' | 'success'>('reason');
  const [selectedReason, setSelectedReason] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');

  const handleSubmit = async () => {
    if (selectedReason === null) return;

    setStep('submitting');

    try {
      const response = await Promise.resolve({ ok: true, json: async () => ({}) }) as any; // backendless: disabled
      /*
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType,
          targetId,
          reason: selectedReason,
          description,
          evidenceUrl: evidenceUrl || undefined,
        }),
      });
      */

      if (response.ok) {
        setStep('success');
        setTimeout(() => {
          onClose();
          setStep('reason');
          setSelectedReason(null);
          setDescription('');
          setEvidenceUrl('');
        }, 2000);
      }
    } catch (error) {
      console.error('Report failed:', error);
      alert('Failed to submit report. Please try again.');
      setStep('details');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#12121a] rounded-2xl border border-gray-800 max-w-md w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-400" />
              <h3 className="font-bold text-white">Report Item</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Target Preview */}
          <div className="p-4 bg-[#1a1a25] flex items-center gap-3">
            {targetImage && (
              <img src={targetImage} alt="" className="w-12 h-12 rounded-lg object-cover" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-400 capitalize">{targetType}</p>
              <p className="font-medium text-white truncate">{targetName}</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {step === 'reason' && (
              <div className="space-y-2">
                <p className="text-sm text-gray-400 mb-3">Why are you reporting this?</p>
                {REPORT_REASONS.map((reason) => (
                  <button
                    key={reason.id}
                    onClick={() => {
                      setSelectedReason(reason.id);
                      setStep('details');
                    }}
                    className="w-full text-left p-3 rounded-xl bg-[#1a1a25] border border-gray-800 hover:border-red-500/50 hover:bg-red-500/5 transition-all group"
                  >
                    <p className="font-medium text-white group-hover:text-red-400">{reason.label}</p>
                    <p className="text-sm text-gray-500">{reason.description}</p>
                  </button>
                ))}
              </div>
            )}

            {step === 'details' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Additional Details (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please provide more information about the issue..."
                    rows={4}
                    className="w-full bg-[#1a1a25] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-red-500 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Evidence URL (optional)
                  </label>
                  <input
                    type="url"
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#1a1a25] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep('reason')}
                    className="flex-1 py-3 border border-gray-700 rounded-xl text-gray-400 hover:text-white"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-bold text-white"
                  >
                    Submit Report
                  </button>
                </div>
              </div>
            )}

            {step === 'submitting' && (
              <div className="py-12 text-center">
                <div className="w-12 h-12 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white">Submitting report...</p>
              </div>
            )}

            {step === 'success' && (
              <div className="py-12 text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <p className="text-xl font-bold text-white mb-2">Report Submitted</p>
                <p className="text-gray-400">Thank you for helping keep our community safe.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {step !== 'success' && (
            <div className="p-4 bg-[#1a1a25] border-t border-gray-800">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <AlertTriangle className="w-4 h-4" />
                <span>False reports may affect your reputation</span>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
