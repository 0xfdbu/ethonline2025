// src/pages/Explorer.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNexus } from '@avail-project/nexus-widgets';
import { useAccount } from 'wagmi';
import { Clock, ArrowRight, CheckCircle, XCircle, Clock as Hourglass, AlertCircle } from 'lucide-react';

interface Intent {
  id?: string;
  status?: string;
  createdAt?: string;
  fromChainId?: number;
  toChainId?: number;
  inputAmount?: string;
  outputAmount?: string;
  tokenSymbol?: string;
  // Add more fields as per actual SDK response
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
};

const getStatusDisplay = (status?: string): string => {
  if (!status) return 'UNKNOWN';
  return status.toUpperCase();
};

const StatusIcon: React.FC<{ status?: string }> = ({ status }) => {
  const s = status?.toLowerCase();
  switch (s) {
    case 'completed':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'failed':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'pending':
      return <Hourglass className="w-5 h-5 text-yellow-500" />;
    default:
      return <AlertCircle className="w-5 h-5 text-gray-500" />;
  }
};

const IntentCard: React.FC<{ intent: Intent }> = ({ intent }) => (
  <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <StatusIcon status={intent.status} />
        <span className="text-sm font-medium text-slate-300">
          {getStatusDisplay(intent.status)}
        </span>
      </div>
      <span className="text-xs text-slate-500">
        {formatDate(intent.createdAt)}
      </span>
    </div>
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div>
        <span className="text-slate-400">From</span>
        <p className="font-semibold text-white">{intent.fromChainId ? `Chain ${intent.fromChainId}` : 'N/A'}</p>
      </div>
      <div>
        <span className="text-slate-400">To</span>
        <p className="font-semibold text-white">{intent.toChainId ? `Chain ${intent.toChainId}` : 'N/A'}</p>
      </div>
      <div>
        <span className="text-slate-400">Send</span>
        <p className="font-semibold text-white">{intent.inputAmount ? `${intent.inputAmount} ${intent.tokenSymbol || ''}` : 'N/A'}</p>
      </div>
      <div>
        <span className="text-slate-400">Receive</span>
        <p className="font-semibold text-white">{intent.outputAmount ? `${intent.outputAmount} ${intent.tokenSymbol || ''}` : 'N/A'}</p>
      </div>
    </div>
    <div className="flex items-center gap-2 text-xs text-slate-400">
      <Clock size={12} />
      <span>ID: {intent.id || 'N/A'}</span>
    </div>
  </div>
);

export function Explorer() {
  const { sdk: nexus, isSdkInitialized } = useNexus();
  const { isConnected, address } = useAccount();
  const [intents, setIntents] = useState<Intent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchIntents = useCallback(async () => {
    if (!nexus || !isSdkInitialized || !isConnected || !address) return;
    setLoading(true);
    setError('');
    try {
      const response = await nexus.getMyIntents({ limit: 20, offset: 0 });
      console.log('getMyIntents response:', response); // Log to inspect structure
      // Handle possible structures: direct array, or {intents: []}, etc.
      let intentList: Intent[] = [];
      if (Array.isArray(response)) {
        intentList = response;
      } else if (response && Array.isArray(response.intents)) {
        intentList = response.intents;
      } else if (response && response.data && Array.isArray(response.data)) {
        intentList = response.data;
      }
      // Filter out undefined items
      intentList = intentList.filter(intent => intent && intent.id);
      setIntents(intentList);
    } catch (err: any) {
      console.error('Error fetching intents:', err);
      setError('Failed to load intents');
    } finally {
      setLoading(false);
    }
  }, [nexus, isSdkInitialized, isConnected, address]);

  useEffect(() => {
    fetchIntents();
  }, [fetchIntents]);

  if (!isSdkInitialized || !isConnected) {
    return (
      <div className="flex-1 flex flex-col p-4 lg:p-8 relative min-h-screen items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-4">Initializing...</h2>
          <p className="text-slate-600 mb-6">
            SDK: {isSdkInitialized ? 'Ready' : 'Loading'} | Wallet: {isConnected ? 'Connected' : 'Connect'}
          </p>
          <div className="w-8 h-8 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-8 relative min-h-screen items-center justify-center mt-5 lg:mt-10">
      <div className="max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-slate-900 mb-8 text-center">Intent Explorer</h1>
        
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
            <span className="ml-2 text-slate-600">Loading intents...</span>
          </div>
        )}
        
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center mb-4">
            {error}
            <button
              onClick={fetchIntents}
              className="ml-2 underline hover:text-red-700"
            >
              Retry
            </button>
          </div>
        )}
        
        {!loading && intents.length === 0 && !error && (
          <div className="text-center py-12 text-slate-600">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No intents found.</p>
          </div>
        )}
        
        <div className="space-y-4">
          {intents.map((intent) => (
            <IntentCard key={intent.id || Math.random()} intent={intent} />
          ))}
        </div>
      </div>
    </div>
  );
}