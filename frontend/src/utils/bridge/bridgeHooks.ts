// src/utils/bridge/bridgeHooks.ts

import { SunMedium } from 'lucide-react';
import { useState, useCallback, useRef } from 'react';

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

  const fetchBalance = useCallback(async () => {
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
  }, [nexus, isConnected, address, isSdkInitialized, fromToken, fromNetwork]);

  return { balance, isFetchingBalance, error, fetchBalance };
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
  const isFetchingRef = useRef(false);

  const fetchQuote = useCallback(
    async (desiredAmount: string) => {
      console.log('fetchQuote called with amount:', desiredAmount); // Debug log
      if (isFetchingRef.current) {
        console.log('Already fetching quote, skipping...');
        return;
      }

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
        console.log('Calling nexus.simulateBridge with params:', {
          token: fromToken.symbol,
          amount: desiredAmount,
          chainId: toChainId,
          sourceChains: sourceChains.length > 0 ? sourceChains : undefined,
        }); // Debug log
        const simulation = await nexus.simulateBridge({
          token: fromToken.symbol,
          amount: desiredAmount,
          chainId: toChainId,
          sourceChains: sourceChains.length > 0 ? sourceChains : undefined,
        });
        console.log('Simulation response:', simulation);
        if (simulation.intent) {
          const input = simulation.intent.sourcesTotal;
          const output = simulation.intent.destination.amount;
          const fees = simulation.intent.fees;
          const sources = simulation.intent.sources || [];
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
            sources,
            allSources,
            detailedFees: {
              caGas: parseFloat(fees.caGas || '0').toFixed(6),
              gasSupplied: parseFloat(fees.gasSupplied || '0').toFixed(6),
              protocol: parseFloat(fees.protocol || '0').toFixed(6),
              solver: parseFloat(fees.solver || '0').toFixed(6),
              total: parseFloat(fees.total || '0').toFixed(6),
            },
          };

          setQuote(quoteData);
        } else {
          throw new Error('Invalid simulation response');
        }
      } catch (err: any) {
        console.error('Quote fetch error:', err);
        let errorMessage = 'Failed to fetch quote. Please try again.';
        let useFallback = true;

        if (err.message && err.message.includes('Token not supported')) {
          errorMessage = 'The selected token is not supported on the destination chain. Please choose a different token or chain.';
          useFallback = false;
        } else if (
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

        if (useFallback) {
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
            sources: [],
            allSources: [],
            detailedFees: {
              caGas: '0.000000',
              gasSupplied: '0',
              protocol: '0.000005',
              solver: '0.00000201',
              total: fallbackFees,
            },
          };

          setQuote(fallbackQuote);
        } else {
          setQuote(null);
        }

      } finally {
        setIsFetchingQuote(false);
        isFetchingRef.current = false;
      }
    },
    [nexus, toNetwork, fromToken, toToken, balance, sourceChains, onError]
  );

  return { quote, isFetchingQuote, fetchQuote };
};