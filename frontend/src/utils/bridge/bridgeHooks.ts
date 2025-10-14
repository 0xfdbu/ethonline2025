// src/utils/bridge/bridgeHooks.ts

import { useState, useEffect, useCallback, useRef } from 'react';

interface CachedQuote {
  amount: string;
  quote: any;
  timestamp: number;
}

export const useBalance = (
  nexus: any,
  isConnected: boolean,
  address: string | undefined,
  isSdkInitialized: boolean,
  fromToken: any,
  fromNetwork: any
) => {
  const [balance, setBalance] = useState('0.00');
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBalance = async () => {
      if (
        !nexus ||
        !isConnected ||
        !address ||
        !fromToken?.symbol ||
        !fromNetwork?.id ||
        !isSdkInitialized
      ) {
        setBalance('0.00');
        if (!isConnected || !address) {
          setError('Please connect your wallet to view balances.');
        }
        return;
      }

      setIsFetchingBalance(true);
      setError('');
      try {
        const fromChainId = parseInt(fromNetwork.id);
        const asset = await nexus.getUnifiedBalance(fromToken.symbol);
        if (asset?.breakdown && asset.breakdown.length > 0) {
          const chainBal = asset.breakdown.find(
            (b: any) => b?.chain?.id === fromChainId
          );
          if (chainBal) {
            const balNum = Number(chainBal.balance);
            setBalance(isNaN(balNum) ? '0.00' : balNum.toFixed(2));
            return;
          }
        }
        setBalance('0.00');
      } catch (err: any) {
        console.error('Balance fetch error:', err);
        setBalance('0.00');
        if (err.message?.includes('CA not initialized')) {
          setError(
            'Chain Abstraction account not initialized. Please ensure your wallet is connected properly.'
          );
        } else {
          setError(`Failed to fetch balance: ${err.message || 'Unknown error'}`);
        }
      } finally {
        setIsFetchingBalance(false);
      }
    };

    fetchBalance();
  }, [nexus, isConnected, address, isSdkInitialized, fromToken, fromNetwork]);

  return { balance, isFetchingBalance, error };
};

// Helper: Binary search to find max receive amount R such that sim(R).sourcesTotal <= sendAmount S
const findMaxReceiveForSend = async (
  nexus: any,
  token: string,
  sendAmountStr: string,
  sourceChainId: number,
  toChainId: number,
  maxIterations = 8
) => {
  const sendAmount = parseFloat(sendAmountStr);
  if (isNaN(sendAmount) || sendAmount <= 0) {
    return { output: '0', bridgeFee: '0', allSources: [] };
  }

  let low = 0;
  let high = sendAmount; // Max possible receive <= send

  let bestValidR = 0;
  let bestSources: any[] = [];

  for (let i = 0; i < maxIterations; i++) {
    const mid = (low + high) / 2;
    try {
      const simulation = await nexus.simulateBridge({
        token,
        amount: mid.toFixed(18),
        chainId: toChainId,
        sourceChains: [sourceChainId],
      });

      console.log(
        `Binary search iteration ${i}: mid receive=${mid.toFixed(6)}, sourcesTotal=${
          simulation.intent?.sourcesTotal || 'N/A'
        }`
      );

      if (simulation.intent) {
        const neededSend = parseFloat(simulation.intent.sourcesTotal || '0');
        if (neededSend <= sendAmount) {
          bestValidR = mid;
          bestSources = simulation.intent.allSources || [];
          low = mid;
        } else {
          high = mid;
        }
      } else if (simulation.success) {
        bestValidR = mid;
        bestSources = simulation.intent?.allSources || [];
        low = mid;
      } else {
        high = mid;
      }
    } catch (err: any) {
      console.log(`Binary search iteration ${i} error for mid=${mid.toFixed(6)}:`, err.message);
      if (err.message?.includes('Insufficient')) {
        high = mid;
      } else {
        console.warn('Unexpected sim error in binary search:', err);
        high = mid;
      }
    }
  }

  const output = bestValidR.toFixed(6);
  const fees = (sendAmount - bestValidR).toFixed(6);
  console.log(
    'Binary search complete: send=',
    sendAmount,
    ', receive=',
    output,
    ', fee=',
    fees,
    ', sources used=',
    bestSources.length
  );

  return { output, bridgeFee: fees, allSources: bestSources };
};

export const useQuote = (
  nexus: any,
  toNetwork: any,
  fromToken: any,
  toToken: any,
  balance: string,
  fromNetwork: any,
  amount: string,
  onError: (msg: string) => void
) => {
  const [quote, setQuote] = useState<any>(null);
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastAmountRef = useRef<string>('');
  const isFetchingRef = useRef(false);
  const cacheRef = useRef<Map<string, CachedQuote>>(new Map());
  const lastFetchTimeRef = useRef<number>(0);
  const CACHE_TTL = 15000; // 15 seconds cache
  const MIN_FETCH_INTERVAL = 15000; // Minimum 15 seconds between fetches

  const getCacheKey = useCallback(
    (inputAmount: string): string => {
      return `${fromNetwork?.id}_${toNetwork?.id}_${fromToken?.symbol}_${inputAmount}`;
    },
    [fromNetwork?.id, toNetwork?.id, fromToken?.symbol]
  );

  const getFromCache = useCallback(
    (inputAmount: string): any | null => {
      const key = getCacheKey(inputAmount);
      const cached = cacheRef.current.get(key);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log('Using cached quote for amount:', inputAmount);
        return cached.quote;
      }
      return null;
    },
    [getCacheKey]
  );

  const saveToCache = useCallback(
    (inputAmount: string, quoteData: any) => {
      const key = getCacheKey(inputAmount);
      cacheRef.current.set(key, {
        amount: inputAmount,
        quote: quoteData,
        timestamp: Date.now(),
      });
      // Keep cache size reasonable (max 20 entries)
      if (cacheRef.current.size > 20) {
        const firstKey = cacheRef.current.keys().next().value;
        if (firstKey) cacheRef.current.delete(firstKey);
      }
    },
    [getCacheKey]
  );

  const fetchQuote = useCallback(
    async (inputAmount: string) => {
      if (isFetchingRef.current) {
        console.log('Already fetching quote, skipping...');
        return;
      }

      if (inputAmount === lastAmountRef.current) {
        console.log('Same amount as last fetch, skipping...');
        return;
      }

      // Check cache first
      const cachedQuote = getFromCache(inputAmount);
      if (cachedQuote) {
        setQuote(cachedQuote);
        setIsFetchingQuote(false);
        lastAmountRef.current = inputAmount;
        return;
      }

      // Rate limiting: enforce 15-second minimum interval between fetches
      const timeSinceLastFetch = Date.now() - lastFetchTimeRef.current;
      if (timeSinceLastFetch < MIN_FETCH_INTERVAL && lastAmountRef.current) {
        console.log(
          `Rate limiting: ${(MIN_FETCH_INTERVAL - timeSinceLastFetch) / 1000}s until next fetch allowed`
        );
        return;
      }

      lastAmountRef.current = inputAmount;

      if (
        !inputAmount ||
        parseFloat(inputAmount) < 0.001 ||
        !nexus ||
        fromToken?.symbol !== toToken?.symbol ||
        fromNetwork.id === toNetwork.id
      ) {
        setQuote(null);
        setIsFetchingQuote(false);
        if (fromNetwork.id === toNetwork.id) {
          onError('Source and destination networks must be different.');
        } else if (fromToken?.symbol !== toToken?.symbol) {
          onError('Source and destination tokens must match for bridging.');
        }
        return;
      }

      const inputNum = parseFloat(inputAmount);
      const balanceNum = parseFloat(balance);
      if (inputNum > balanceNum) {
        onError(
          `Insufficient CA balance for ${fromToken.symbol}. CA balance: ${balance} ${fromToken.symbol}. Enter lower or fund CA.`
        );
        setQuote(null);
        setIsFetchingQuote(false);
        return;
      }

      isFetchingRef.current = true;
      setIsFetchingQuote(true);
      onError('');

      try {
        const toChainId = parseInt(toNetwork.id);
        const sourceChainId = parseInt(fromNetwork.id);
        const { output, bridgeFee, allSources } = await findMaxReceiveForSend(
          nexus,
          fromToken.symbol,
          inputAmount,
          sourceChainId,
          toChainId
        );

        const quoteData = {
          output,
          gasFee: 'Included',
          bridgeFee,
          slippage: '0',
          duration: 'N/A',
          sources: allSources,
          sourceCount: allSources?.length || 0,
        };

        saveToCache(inputAmount, quoteData);
        setQuote(quoteData);
        lastFetchTimeRef.current = Date.now();
      } catch (err: any) {
        console.error('Quote fetch error:', err);
        let errorMessage = 'Failed to fetch quote. Please try again.';
        if (
          err.message &&
          (err.message.includes('Insufficient balance') ||
            err.message.includes('Insufficient funds'))
        ) {
          errorMessage = `Insufficient funds in CA for ${fromToken.symbol} (fees/approvals). CA balance: ${balance} ${fromToken.symbol}. Try smaller amount or fund CA.`;
        } else if (err.message && err.message.includes('InternalRpcError')) {
          errorMessage = 'RPC error. Check network and try again.';
        } else if (
          err.message &&
          (err.message.includes('GrpcWebError') ||
            err.message.includes('TIMED_OUT') ||
            err.message.includes('Response closed without headers'))
        ) {
          errorMessage = 'Network timeout. Check connection and try later.';
        } else {
          errorMessage = `Unexpected error: ${err.message || 'Unknown'}. Refresh and try again.`;
        }
        onError(errorMessage);

        // Fallback quote
        const sendAmount = parseFloat(inputAmount);
        const fallbackOutput = (sendAmount * 0.993).toFixed(6);
        const fallbackFees = (sendAmount - parseFloat(fallbackOutput)).toFixed(6);
        const fallbackQuote = {
          output: fallbackOutput,
          gasFee: 'Included',
          bridgeFee: fallbackFees,
          slippage: '0',
          duration: 'N/A',
          sources: [],
          sourceCount: 0,
        };

        saveToCache(inputAmount, fallbackQuote);
        setQuote(fallbackQuote);
        lastFetchTimeRef.current = Date.now();
      } finally {
        setIsFetchingQuote(false);
        isFetchingRef.current = false;
      }
    },
    [nexus, toNetwork, fromToken, toToken, balance, fromNetwork, onError, getFromCache, saveToCache]
  );

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Increased debounce to 1500ms to reduce API calls
    debounceRef.current = setTimeout(() => {
      fetchQuote(amount);
    }, 1500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [amount, fetchQuote]);

  return { quote, isFetchingQuote };
};