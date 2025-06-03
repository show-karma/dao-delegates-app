# Active Context

## Current Work Focus

✅ **COMPLETED**: Full RARI DAO mainnet delegation functionality integration with network switching and configuration setup
✅ **NEW**: Custom Mainnet RPC Configuration

**ALL PHASES COMPLETED INCLUDING MAINNET CONFIGURATION**:

1.  **Setup and Constants** ✅:

    - Created `resources/rari/constants.ts` with contract addresses and timeframe mappings
    - Added Ethereum mainnet chain ID constant (`RARI_TARGET_CHAIN_ID = 1`)
    - Week-based timeframe calculations with helper functions
    - Defined RARI and veRARI contract addresses
    - Configured timeframe options (1 month, 3 months, 6 months, 1 year, 2 years)

2.  **Core Hooks Implementation** ✅:

    - `useRariToken()`: Handles RARI balance, allowance, and approval functionality with network checking
    - `useVeRari()`: Manages veRARI balance and user locks
    - `useProspectiveVeRari()`: Calculates expected veRARI for given RARI amount and timeframe
    - `useRariLock()`: Handles locking RARI tokens to get veRARI and delegate with network switching
    - `useVeRariDelegation()`: Manages delegation of existing veRARI locks
    - **NEW**: `useRariNetwork()`: Handles network detection and switching to Ethereum mainnet
    - **NEW**: `useRariConfig()`: Configuration-based access to RARI-specific settings

3.  **UI Components** ✅:

    - `RariLockAndDelegateModal`: Main modal with tabs for locking and delegating
    - `LockRariTab`: Complete implementation with network switching UI and two-step approval flow
    - `DelegateExistingTab`: UI for delegating existing veRARI locks with network checking

4.  **Integration** ✅:

    - Modified `DelegateCard` component to detect RARI DAO context using configuration
    - Integrated RARI locking modal with delegate cards
    - Complete delegation flow with network switching: Click "Delegate" → Check network → Switch if needed → Lock & Delegate or Delegate existing locks

5.  **Configuration Setup** ✅:

    - **Updated `IDAOConfig` interface** to support `CUSTOM_DELEGATION` property
    - **Updated `resources/rari/index.ts`** with dual delegation system configuration:
      - Both mainnet and rarichain contract addresses
      - Custom delegation flags and settings
      - Network targeting configuration
    - **Configuration-based detection** instead of hardcoded string comparisons
    - **Type-safe configuration access** through `useRariConfig` hook

6.  **Custom Mainnet RPC Configuration** ✅:
    - **Created `utils/mainnet/rpc.ts`** with comprehensive mainnet configuration
    - **Multiple RPC providers** with redundancy: LlamaRPC, Ankr, Alchemy, Infura
    - **Environment variable support** for conditional Alchemy/Infura integration
    - **Standard Ethereum contracts** including ENS, Multicall3
    - **Block explorer configurations** with Etherscan and Blockscout
    - **viem/wagmi compatibility** following the same pattern as RARI chain config
    - **HTTP and WebSocket support** for all RPC providers

## Mainnet Configuration Features

**Complete configuration system**:

- **Dual network support**: Both Ethereum Mainnet and Rarichain contracts in DAO config
- **Custom delegation flags**: `ENABLE_CUSTOM_DELEGATION` to control modal behavior
- **Contract address management**: Centralized contract addresses in configuration
- **Chain targeting**: Primary and secondary chain configuration for delegation systems
- **Configuration-based detection**: No more hardcoded DAO name comparisons

**Type safety and maintainability**:

- Extended `IDAOConfig` interface with proper TypeScript types
- Created `useRariConfig` hook for accessing RARI-specific configuration
- Helper functions for timeframe calculations (`getTimeframeInSeconds`)
- Week-based timeframe system with proper contract conversion

## Network Switching Features

**Comprehensive network management**:

- **Automatic network detection**: Checks if user is on Ethereum Mainnet (chainId: 1)
- **User-friendly switching**: Prompts users to switch networks with one-click buttons
- **Visual feedback**: Disabled states and alerts when on wrong network
- **Error handling**: Graceful handling of user rejection or switching failures
- **Toast notifications**: Clear feedback for successful/failed network switches

**UI integration**:

- Warning alerts at the top of both tabs when on wrong network
- Disabled form controls and buttons when not on Ethereum Mainnet
- Visual opacity changes to indicate disabled states
- "Switch to Ethereum Mainnet" buttons in alerts
- Dynamic button text changes based on network state

## Implementation Summary

The RARI DAO integration now provides:

- **Multi-network delegation support**:
  - **Ethereum Mainnet**: Lock RARI → get veRARI → delegate veRARI (comprehensive locking system)
  - **Rarichain**: Direct RARI delegation (simple, immediate delegation)
- **Seamless network switching**: Built-in network selector with one-click switching
- **Dynamic UI adaptation**: Different tabs and content based on current network
- **Configuration-driven architecture**: All settings driven by DAO configuration
- **Real-time network detection**: Automatic detection and appropriate UI rendering
- **Professional UX**: Consistent design with clear network status indicators

## Network-Specific Features

**Ethereum Mainnet (veRARI System)**:

- Network check → Streamlined Approve & Lock → Delegate flow
- Real-time veRARI calculation with proper week conversions
- Manage existing locks and delegate them individually
- Automatic lock execution after approval

**Rarichain (Direct Delegation)**:

- Simple direct RARI token delegation
- **Real-time RARI balance display** on Rarichain network
- **Delegation amount visualization** showing how much will be delegated
- No locking required - immediate delegation
- Lower gas fees on Rarichain network
- Can be changed at any time
- **Smart button states** based on balance availability

**Network Switching**:

- Visual network selector with clear labels
- One-click switching between supported networks
- Network status indicators and delegation type labels
- Graceful handling of unsupported networks

## Next Steps

With RARI integration, network switching, and configuration setup complete, future enhancements could include:

1. Real user lock history implementation (replacing mock data)
2. Event querying for better lock management
3. Support for Rarichain delegation (if needed)
4. Additional DAO integrations following this configuration pattern
5. Multi-network support for other DAOs using the same configuration approach

## Recent Changes

- ✅ **NEW**: Extended `IDAOConfig` interface to support `CUSTOM_DELEGATION`
- ✅ **NEW**: Updated RARI configuration with dual delegation system
- ✅ **NEW**: Created `useRariConfig` hook for configuration-based access
- ✅ **NEW**: Replaced hardcoded DAO detection with configuration-based approach
- ✅ **NEW**: Added helper functions for week-to-seconds conversion
- ✅ **NEW**: Fixed TypeScript error in `useRariNetwork` hook
- ✅ **NEW**: Complete configuration-driven architecture for custom delegation
- ✅ **CLARIFIED**: Updated lock function to use weeks (not seconds) for slope and cliff parameters
- ✅ **FIXED**: Updated useProspectiveVeRari to properly pass slopePeriod and cliff in weeks
- ✅ **FIXED**: Updated approval amount to use exact user input instead of hardcoded value
- ✅ **IMPROVED**: Added toString() to parseEther in approval config for proper contract interface
- ✅ **ENHANCED**: Automatic lock function execution after approval succeeds
- ✅ **UX IMPROVED**: Streamlined button flow with "Approve & Lock RARI" single-step process
- ✅ **MULTI-NETWORK**: Enhanced useRariNetwork to support both Ethereum Mainnet and Rarichain
- ✅ **NETWORK SWITCHING**: Added NetworkSelector component for seamless network switching
- ✅ **DUAL DELEGATION**: Added RarichainDelegateTab for direct RARI delegation
- ✅ **DYNAMIC UI**: Modal now shows different tabs and content based on current network
- ✅ **RARICHAIN BALANCE**: Created useRarichainToken hook to fetch RARI balance on Rarichain
- ✅ **DELEGATION AMOUNT**: RarichainDelegateTab now shows balance and delegation amount information

## Active Decisions Made

- **Configuration Strategy**: Use DAO configuration instead of hardcoded values
- **Type Safety**: Extended interface types to support new configuration properties
- **Week-based Calculations**: Simplified timeframe management with helper functions
- **Contract Parameters**: Use weeks directly for slope and cliff (not seconds conversion)
- **Lock Function**: Use `lock` function (not `delegateTo`) for the "Lock RARI to Delegate" flow
- **Network Strategy**: Target Ethereum Mainnet (chainId: 1) for RARI DAO contracts
- **Maintainability**: Created reusable hooks and configuration patterns for other DAOs
- **Progressive Enhancement**: All features work on correct network, graceful degradation on wrong network
