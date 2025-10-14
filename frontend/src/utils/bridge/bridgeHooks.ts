// src/utils/bridge/bridgeHooks.ts

import { useState, useEffect, useCallback, useRef } from 'react';

export const useBalance = (nexus: any, isConnected: boolean, address: string | undefined, isSdkInitialized: boolean, fromToken: any, fromNetwork: any) => {
  const [balance, setBalance] = useState('0.00');
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBalance = async () => {
      if (!nexus || !isConnected || !address || !fromToken?.symbol || !fromNetwork?.id || !isSdkInitialized) {
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
          const chainBal = asset.breakdown.find((b: any) => b?.chain?.id === fromChainId);
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
          setError('Chain Abstraction account not initialized. Please ensure your wallet is connected properly.');
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

export const useQuote = (nexus: any, toNetwork: any, fromToken: any, toToken: any, balance: string, fromNetwork: any, amount: string, onError: (msg: string) => void) => {
  const [quote, setQuote] = useState<any>(null);
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchQuote = useCallback(async (inputAmount: string) => {
    if (!inputAmount || parseFloat(inputAmount) < 0.001 || !nexus || fromToken?.symbol !== toToken?.symbol || fromNetwork.id === toNetwork.id) {
      setQuote(null);
      setIsFetchingQuote(false);
      if (fromNetwork.id === toNetwork.id) {
        onError('Source and destination networks must be different.');
      } else if (fromToken?.symbol !== toToken?.symbol) {
        onError('Source and destination tokens must match for bridging.');
      }
      return;
    }

    setIsFetchingQuote(true);
    onError('');

    try {
      const toChainId = parseInt(toNetwork.id);
      const simulation = await nexus.simulateBridge({
        token: fromToken.symbol,
        amount: inputAmount,
        chainId: toChainId,
      });

      if (simulation.success) {
        const fees = parseFloat(simulation.intent?.fees || '0.001');
        const output = (parseFloat(inputAmount) - fees).toFixed(6);
        setQuote({
          output,
          gasFee: 'Included',
          bridgeFee: fees.toFixed(6),
          slippage: '0',
          duration: 'N/A',
        });
      } else {
        const estimatedFees = 0.001;
        const output = (parseFloat(inputAmount) - estimatedFees).toFixed(6);
        setQuote({
          output,
          gasFee: 'Included',
          bridgeFee: estimatedFees.toFixed(6),
          slippage: '0',
          duration: 'N/A',
        });
        onError(`Simulation warning: ${simulation.error || 'Unknown simulation issue'}. Using estimated fees.`);
      }
    } catch (err: any) {
      console.error('Quote fetch error:', err);
      let errorMessage = 'Failed to fetch quote. Please try again.';
      if (err.message && err.message.includes('Insufficient balance')) {
        errorMessage = `Insufficient balance for ${fromToken.symbol}. Your current balance is ${balance} ${fromToken.symbol}. Please enter a lower amount or deposit more funds.`;
      } else if (err.message && err.message.includes('InternalRpcError')) {
        errorMessage = 'RPC error occurred. Please check your network connection and try again.';
      } else if (err.message && (err.message.includes('GrpcWebError') || err.message.includes('TIMED_OUT') || err.message.includes('Response closed without headers'))) {
        errorMessage = 'Network timeout or service unavailable. Please check your internet connection and try again later.';
      }
      onError(errorMessage);
      const estimatedFees = 0.001;
      const output = (parseFloat(inputAmount) - estimatedFees).toFixed(6);
      setQuote({
        output,
        gasFee: 'Included',
        bridgeFee: estimatedFees.toFixed(6),
        slippage: '0',
        duration: 'N/A',
      });
    } finally {
      setIsFetchingQuote(false);
    }
  }, [nexus, toNetwork, fromToken, toToken, balance, fromNetwork, onError]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      fetchQuote(amount);
    }, 500);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [amount, fetchQuote]);

  return { quote, isFetchingQuote };
};