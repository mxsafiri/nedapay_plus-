# Settings Components Structure

This directory contains all settings-related components organized by user type and functionality.

## Directory Structure

```
components/settings/
├── shared/           # Components used by both senders and providers
│   ├── profile-settings.tsx
│   ├── api-key-manager.tsx
│   └── index.ts
├── sender/           # Sender-specific settings
│   ├── trading-configurations.tsx
│   ├── server-configurations.tsx
│   └── index.ts
├── provider/         # Provider-specific settings
│   ├── provider-configurations.tsx
│   └── index.ts
├── settings-page.tsx # Main settings page component
├── index.ts          # Main exports
└── README.md         # This file
```

## Component Naming Convention

### Shared Components
- `ProfileSettings` - User profile management (both senders & providers)
- `ApiKeyManager` - API key management (both senders & providers)

### Sender-Specific Components
- `SenderTradingConfigurations` - Token trading settings, fees, refund addresses
- `SenderServerConfigurations` - Webhook notifications, webhook URL, domain whitelist

### Provider-Specific Components
- `ProviderLiquidityConfigurations` - Rates, slippage, wallet addresses, provision mode

## Usage

```typescript
// Import shared components
import { ProfileSettings, ApiKeyManager } from "@/components/settings/shared";

// Import sender-specific components
import { SenderTradingConfigurations, SenderServerConfigurations } from "@/components/settings/sender";

// Import provider-specific components
import { ProviderLiquidityConfigurations } from "@/components/settings/provider";

// Or import everything
import { SettingsPage, ProfileSettings, SenderTradingConfigurations } from "@/components/settings";
```

## Component Responsibilities

### Shared Components
- **ProfileSettings**: User profile information, display name, contact details
- **ApiKeyManager**: Create, view, delete API keys for both user types

### Sender Components
- **SenderTradingConfigurations**: Configure trading settings for tokens (fees, addresses)
- **SenderServerConfigurations**: Configure webhooks and domain whitelisting

### Provider Components
- **ProviderLiquidityConfigurations**: Configure liquidity provision (rates, wallets, provision mode)

This structure makes it immediately clear which settings are available to which user type and promotes better code organization and maintainability.
