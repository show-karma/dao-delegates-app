# System Patterns

## System Architecture

- **Frontend**: React-based single-page application (SPA).
- **State Management**: React Query for server state management and Zustand/Context API for global UI state.
- **Blockchain Interaction**: Ethers.js or a similar library for interacting with Ethereum-based smart contracts.
- **Component Library**: Chakra UI (or similar, as per project evolution).
- **Styling**: CSS-in-JS (e.g., styled-components or Emotion if not using a UI library with built-in styling).

## Key Technical Decisions

- **Modularity**: Design components and hooks to be reusable and specific to DAO functionalities (e.g., a generic delegation hook adaptable for different DAOs, specific hooks for complex delegation like Rari's veRARI).
- **Data Fetching**: Prioritize `react-query` for fetching blockchain data and other asynchronous operations to leverage its caching, refetching, and state management capabilities.
- **Contract ABIs and Addresses**: Store contract ABIs and addresses in a structured way, likely in JSON files within a `resources` or `constants` directory, organized by DAO and network.
- **Error Handling**: Implement robust error handling for wallet connections, transaction submissions, and data fetching.

## Design Patterns in Use

- **Hook-based Logic**: Encapsulate reusable logic, especially for blockchain interactions and state management, within custom React hooks (e.g., `useDAO`, `useDelegation`, `useVeRARI`).
- **Provider Pattern**: For global context like wallet connection status, user information, and selected DAO.
- **Container/Presentational Components**: Separate data-fetching and logic (containers) from UI rendering (presentational components) where appropriate.

## Component Relationships

- A top-level `App` component will manage routing and global providers.
- DAO-specific pages/views will utilize shared components for displaying information and interacting with delegation mechanisms.
- Delegation components will be designed to be adaptable to different DAO requirements, potentially through props or specialized versions.
