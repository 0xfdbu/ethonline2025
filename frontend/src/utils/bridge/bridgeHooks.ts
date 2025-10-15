// src/utils/bridge/bridgeHooks.ts

import { SunMedium } from 'lucide-react';
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

export const useQuote = (
  nexus: any,
  toNetwork: any,
  fromToken: any,
  toToken: any,
  balance: string,
  sourceChains: number[],
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
      const chainsStr = sourceChains.sort().join(',');
      return `${toNetwork?.id}_${fromToken?.symbol}_${chainsStr}_${inputAmount}`;
    },
    [toNetwork?.id, fromToken?.symbol, sourceChains]
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
    async (desiredAmount: string) => {
      if (isFetchingRef.current) {
        console.log('Already fetching quote, skipping...');
        return;
      }

      if (desiredAmount === lastAmountRef.current) {
        console.log('Same amount as last fetch, skipping...');
        return;
      }

      // Check cache first
      const cachedQuote = getFromCache(desiredAmount);
      if (cachedQuote) {
        setQuote(cachedQuote);
        setIsFetchingQuote(false);
        lastAmountRef.current = desiredAmount;
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

      lastAmountRef.current = desiredAmount;

      if (
        !desiredAmount ||
        parseFloat(desiredAmount) < 0.001 ||
        !nexus ||
        fromToken?.symbol !== toToken?.symbol ||
        !toNetwork?.id
      ) {
        setQuote(null);
        setIsFetchingQuote(false);
        if (fromToken?.symbol !== toToken?.symbol) {
          onError('Source and destination tokens must match for bridging.');
        }
        return;
      }

      const desiredNum = parseFloat(desiredAmount);
      const balanceNum = parseFloat(balance);
      if (desiredNum > balanceNum) {
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
        const simulation = await nexus.simulateBridge({
          token: fromToken.symbol,
          amount: desiredAmount,
          chainId: toChainId,
          sourceChains: sourceChains.length > 0 ? sourceChains : undefined,
        });
        console.log(simulation);
        if (simulation.intent) {
          const input = simulation.intent.sourcesTotal;
          const output = simulation.intent.destination.amount;
          const fees = simulation.intent.fees;
          const allSources = simulation.intent.allSources || [];
          const inputNum = parseFloat(input || '0');

          if (inputNum > balanceNum) {
            onError(
              `Required send (${inputNum.toFixed(6)}) exceeds available balance (${balanceNum.toFixed(6)}) for ${fromToken.symbol}. Try a smaller amount.`
            );
            setQuote(null);
            setIsFetchingQuote(false);
            isFetchingRef.current = false;
            return;
          }

          const quoteData = {
            input,
            output,
            gasFee: parseFloat(fees.caGas || '0').toFixed(6),
            bridgeFee: parseFloat(fees.total || '0').toFixed(6),
            slippage: '0',
            allSources,
          };

          saveToCache(desiredAmount, quoteData);
          setQuote(quoteData);
          lastFetchTimeRef.current = Date.now();
        } else {
          throw new Error('Invalid simulation response');
        }
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
        const fallbackInput = (desiredNum * 1.007).toFixed(6);
        const fallbackOutput = desiredAmount;
        const fallbackFees = (parseFloat(fallbackInput) - desiredNum).toFixed(6);
        const fallbackQuote = {
          input: fallbackInput,
          output: fallbackOutput,
          gasFee: '0.00',
          bridgeFee: fallbackFees,
          slippage: '0',
          allSources: [],
        };

        saveToCache(desiredAmount, fallbackQuote);
        setQuote(fallbackQuote);
        lastFetchTimeRef.current = Date.now();
      } finally {
        setIsFetchingQuote(false);
        isFetchingRef.current = false;
      }
    },
    [nexus, toNetwork, fromToken, toToken, balance, sourceChains, onError, getFromCache, saveToCache]
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