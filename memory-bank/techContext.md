# Tech Context

## Technologies Used

- **Programming Language**: TypeScript
- **Framework/Library**: React (Next.js, if server-side rendering or static site generation is needed)
- **State Management**: React Query, Zustand/Context API
- **Blockchain Interaction**: Ethers.js
- **UI Components**: Chakra UI (as per current usage, with a note to use `react-icons` instead of `@chakra-ui/icons`)
- **Styling**: Chakra UI's styling system / Emotion
- **Version Control**: Git
- **Package Manager**: npm or yarn

## Development Setup

- Standard Node.js development environment.
- IDE/Editor: VS Code with relevant extensions (e.g., ESLint, Prettier).
- Linters and Formatters: ESLint, Prettier configured for the project.

## Technical Constraints

- Interactions with multiple blockchain networks (Mainnet, potentially testnets, and Rarichain).
- Handling different smart contract ABIs and addresses for various DAOs.
- Ensuring security in wallet interactions and transaction signing.
- Keeping up with potential changes in DAO governance mechanisms or smart contract upgrades.

## Dependencies

- `ethers`
- `react`
- `react-dom`
- `@tanstack/react-query`
- `zustand` (or other global state manager)
- `@chakra-ui/react`
- `@emotion/react`
- `@emotion/styled`
- `framer-motion` (dependency of Chakra UI)
- `react-icons`
- Build tools and type definitions (e.g., `typescript`, `@types/react`)

## Page Structure Notes (from .cursorrules)

- Be mindful of the duplicated page directories `_sites` and `[site]` when creating new pages.
