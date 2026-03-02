// components/ModeratorDashboard.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, CheckCircle, XCircle, Flag, Eye } from 'lucide-react';

interface Report {
  id: number;
  reporter: string;
  reportedItem: string;
  itemType: string;
  reason: string;
  description: string;
  evidenceUrl?: string;
  timestamp: number;
  status: 'pending' | 'under_review' | 'resolved_valid' | 'resolved_invalid';
}

// FIXED: Changed from = { to = () => {
export const ModeratorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved' | 'flagged'>('pending');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const { data: reports } = useQuery({
    queryKey: ['reports', activeTab],
    queryFn: async () => {
      const res = await fetch(`/api/admin/reports?status=${activeTab}`);
      return res.json();
    },
  });

  const handleResolve = async (reportId: number, isValid: boolean, notes: string) => {
    await fetch('/api/admin/resolve-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, isValid, notes }),
    });
  };

  return (
    <div className="max-w-6xl mx-auto bg-[#12121a] rounded-2xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-cyan-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Moderator Dashboard</h2>
            <p className="text-gray-400">Review reports and manage community safety</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {[
          { id: 'pending', label: 'Pending', count: 12 },
          { id: 'resolved', label: 'Resolved', count: 156 },
          { id: 'flagged', label: 'Flagged Items', count: 8 },
        ].map((tab: any) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-400/5'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
            <span className="ml-2 px-2 py-0.5 bg-gray-800 rounded-full text-xs">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="divide-y divide-gray-800">
        {reports?.data?.map((report: Report) => (
          <div
            key={report.id}
            className="p-6 hover:bg-[#1a1a25] transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Flag className="w-5 h-5 text-red-400" />
                  <span className="font-bold text-white capitalize">{report.reason}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(report.timestamp * 1000).toLocaleString()}
                  </span>
                </div>

                <p className="text-gray-300 mb-2">{report.description}</p>

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>Reporter: {report.reporter.slice(0, 10)}...</span>
                  <span>Item: {report.reportedItem.slice(0, 20)}...</span>
                  <span className="capitalize">Type: {report.itemType}</span>
                </div>

                {report.evidenceUrl && (
                  <a
                    href={report.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-cyan-400 hover:underline"
                  >
                    View Evidence
                  </a>
                )}
              </div>

              {report.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleResolve(report.id, false, '')}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
