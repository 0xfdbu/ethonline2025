## Introduction: My Project and Experience with Nexus SDK

Hello Avail team,

I'm **@0xfdbu**, an independent developer focused on multichain applications. For EthOnline 2025, I developed **UniVail**, a React-based frontend for intent-driven bridging powered by the Avail Nexus SDK. The application features wallet integration, bridge simulation and execution across EVM chains, an intent explorer with card-based visualization, and detailed intent views. It uses Tailwind CSS for styling, Wagmi for wallet management, and the Nexus SDK for core blockchain interactions.

I reviewed the documentation comprehensively during integration, covering setup, unified balances, intent creation, and querying. The SDK provided a strong foundation, but integration revealed opportunities for enhancement. This feedback is constructive, based on delivering a functional application, and includes suggestions prioritized by impact. Supporting materials (screenshots) are in the repo's `docs/` folder.

## Strengths of the Documentation and SDK

The intent-based architecture excels in simplifying cross-chain operations. Key positives include:

  - **Setup and Wallet Integration**: The `useNexus` hook integrated seamlessly with AppKit and Wagmi, requiring minimal configuration (\~10 minutes). Documentation clearly outlines provider handling, with the automatic initialization on connection/disconnection reducing boilerplate. See screenshot of implementation in `Header.tsx`: [docs/sdk-init.png](docs/sdk-init.png).

  - **Unified Balances**: The `getUnifiedBalance(symbol)` method performed reliably, enabling a portfolio dropdown in the header (limited to ETH, USDC, USDT). It efficiently aggregates across multiple chains, with the `breakdown` array ideal for total value computations.

  - **Intent Creation and Querying**: `createIntent` and `getMyIntents` executed as expected, supporting quote simulation and execution. Pagination parameters facilitated fetching up to 20 intents, with status filtering. Documentation examples were directly applicable. Explorer grid visualization: [docs/intents-grid.png](docs/intents-grid.png).

  - **Error Handling**: Errors are descriptive (e.g., "Invalid chain ID"), allowing effective try/catch wrapping for user-facing notifications. Typed errors would further improve robustness.

The core workflow—connect, balance check, intent creation, exploration—was intuitive. The "Why Intents?" section effectively introduces the concept with practical examples.

## Areas for Improvement

While the SDK enabled a complete application, certain limitations impacted development efficiency. Below are prioritized suggestions, with critical items first.

-----

### 1\. **Critical: Single Intent Retrieval by ID (Essential for Detail Views)**

  - **Issue**: There is **no method to retrieve an individual intent by ID**. For the `/intents/:id` route, I resorted to `getMyIntents({ limit: 50 })` followed by client-side filtering via `.find()`. This is inefficient for users with many intents and prevents targeted refreshes or deep-linking.
  - **Impact**: Delayed detail page development by approximately one day; client-side processing scales poorly and lacks real-time status updates.
  - **Recommendation**: Implement `getIntentById(intentId: number)` returning the complete intent (sources, destinations, status). Include error handling for non-existent IDs (e.g., 404-like response). Documentation example:
    ```ts
    try {
      const intent = await nexus.getIntentById(123);
      console.log(intent.status); // e.g., 'fulfilled'
    } catch (error) {
      if (error.code === 'INTENT_NOT_FOUND') { /* Handle gracefully */ }
    }
    ```
    Consider future extensions like subscriptions for status changes.
  - **Supporting Material**: Screenshot of workaround inefficiency: [docs/intent-fetch-hack.png](docs/intent-fetch-hack.png).
  - **Documentation Enhancement**: Introduce a "Common Queries" section with CRUD patterns for better discoverability.

-----

### 2\. **Critical: Flexible Quoting – Support Source-First Simulation**

  - **Issue**: Quoting and simulation are **destination-first**, requiring manual reversal for source-based inputs (e.g., "Send X ETH"). I implemented a JavaScript workaround (`output / (1 - slippage) + fees`), but this is prone to precision errors and doesn't leverage solver optimizations.
  - **Impact**: Required additional development time for UI toggles; users found the destination-first flow counterintuitive compared to standards like Uniswap.
  - **Recommendation**: Add a `simulateFromSource` option or dedicated method like `getQuoteFromSource(sourceAmount, token, chains)` to return adjusted output, fees, and slippage. This would enable bidirectional flows natively.
  - **Supporting Material**: Screenshot of custom toggle implementation: [docs/source-toggle.png](docs/source-toggle.png).
  - **Documentation Enhancement**: A "Flexible Quoting" section with examples for both directions, including caveats for volatility.

-----

### 3\. **Critical: Session Persistence (Avoid Re-signing on Refresh)**

  - **Issue**: The current SDK initialization logic requires the user to **sign a meta-transaction** (or similar key-delegation action) **on every page refresh**. This heavily degrades user experience and creates friction.

  - **Impact**: Increased user frustration; high drop-off rate for returning users.

  - **Recommendation**: Provide a mechanism within the **`<NexusProvider>`** component to enable **session persistence**. This allows the SDK to save the delegated key/session token securely (e.g., to IndexedDB or `localStorage`) and automatically restore the session without requiring a new signature upon page reload.

    **Documentation Enhancement/Example:**

    ```tsx
    // Root component (e.g., App.tsx)
    import { NexusProvider } from '@avail-project/nexus-widgets';

    <NexusProvider
      // The necessary configuration to enable persistence
      config={{ 
        persistence: true, 
        storage: 'indexedDB', // Or 'localStorage'
        // Optional: sessionTimeout: 3600 // 1 hour expiration
      }}
    >
      <UniVailApp />
    </NexusProvider>
    ```

-----

### 4\. **Medium: Pre-Built Visualizer Component in Widgets**

  - **Issue**: No ready-made visualizer for bridge flows (e.g., source/destination chains with amounts). I built a custom one for the bridge page, allowing multi-source selection – it took several hours of React Flow + manual state management.
  - **Impact**: Diverted focus from core features; a reusable component would accelerate prototyping.
  - **Recommendation**: Include a **`<Visualizer>`** widget in `@avail-project/nexus-widgets` for rendering flows (e.g., chains as nodes, amounts as edges, multi-select sources). Props for customization: `sources`, `destinations`, `onSourceToggle`. Example:
    ```tsx
    <Visualizer
      sources={selectedSources}
      destinations={destChains}
      onSourceToggle={handleToggle}
      token={fromToken}
    />
    ```
    This would standardize UIs and save time for similar apps.
  - **Supporting Material**: Screenshot of custom visualizer: [docs/custom-visualizer.png](docs/custom-visualizer.png).
  - **Documentation Enhancement**: Widget gallery with integration guides.

-----

### 5\. **Minor Suggestions**

  - **Source Chains Input Flexibility**: The `sourceChains` parameter accepts **only decimal chain IDs**, leading to errors when passing hex values (common from Wagmi's `useChainId`). This caused a runtime issue during testing, requiring manual conversion.
      - **Recommendation**: Enable **dual support (hex or decimal)** with internal normalization. Documentation: Explicitly note accepted formats with conversion examples.
      - **Supporting Material**: Error log from hex input: [docs/hex-chain-error.png](docs/hex-chain-error.png).
  - **Token and Chain Metadata**: While mappings exist, expand documentation with utilities for dynamic resolution (e.g., `getTokenMetadata(address)`). Include testnet examples to avoid mainnet assumptions.
  - **Intent Lifecycle**: Add diagrams for expiry/refund flows, with methods like `refundIntent(id)`.
  - **TypeScript Nuances**: Clarify `bigint` handling in JS (e.g., precision loss in divisions).
  - **Error Granularity**: Introduce specific codes (e.g., `INSUFFICIENT_BALANCE`) for better UX.

## Conclusion

The Nexus SDK offers a promising foundation for intent-driven applications, enabling a polished product like UniVail in under two weeks. With enhancements to querying, simulation flexibility, **session persistence**, and UI widgets, it could become indispensable for multichain builders. Overall rating: **8/10** – lean and focused, with room for polish.

I'm available for discussions or contributions via GitHub issues. Thank you for the opportunity to build with Avail.

Best regards,  
@0xfdbu  
Repository: [https://github.com/0xfdbu/ethonline2025](https://github.com/0xfdbu/ethonline2025)  
Built for EthOnline 2025