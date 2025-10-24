// src/components/NexusInitializer.tsx
import { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useNexus } from '@avail-project/nexus-widgets';

export const NexusInitializer = () => {
  const { address, isConnected, connector, chainId } = useAccount();
  // Destructure the correct, context-aware initialize function
  const { sdk: nexus, isSdkInitialized, initializeSdk } = useNexus(); 
  const isInitializingRef = useRef(false);

  useEffect(() => {
    const init = async () => {
      // This check is correct
      if (!isConnected || !connector?.getProvider || isSdkInitialized || isInitializingRef.current) {
        return;
      }

      // Check if the function we need is available
      if (!initializeSdk) {
        console.warn("NexusInitializer: initializeSdk function not available from useNexus.");
        return;
      }

      isInitializingRef.current = true;
      console.log('NexusInitializer: Starting SDK initialization...');
      try {
        const provider = await connector.getProvider();
        if (provider) {
            // *** THIS IS THE FIX ***
            // Use the context-aware function, not the direct sdk method
            await initializeSdk(provider); 
            
            console.log('NexusInitializer: initializeSdk() completed successfully');
        } else {
          console.warn("NexusInitializer: Wallet connector did not provide a provider.");
        }
      } catch (err) {
        console.error('Nexus SDK initialization failed in Initializer:', err);
      } finally {
        isInitializingRef.current = false;
      }
    };

    const deinit = () => {
      // This deinitialization logic is correct
      if (!isConnected && isSdkInitialized && nexus) {
        nexus.deinitialize();
        console.log('Nexus SDK deinitialized successfully');
      }
    };

    if (isConnected) {
      init();
    } else {
      deinit();
    }
    
    // Add initializeSdk to the dependency array
  }, [isConnected, connector, address, chainId, isSdkInitialized, nexus, initializeSdk]); 

  // This component renders nothing, it just manages the side effect.
  return null; 
};