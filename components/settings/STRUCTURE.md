# Settings Components Structure - Final Organization

## 📁 Directory Structure

```
components/settings/
├── 📁 shared/                    # Components used by BOTH senders and providers
│   ├── 📄 profile-settings.tsx   # User profile management
│   ├── 📄 api-key-manager.tsx    # API key management
│   └── 📄 index.ts               # Shared exports
│
├── 📁 sender/                    # SENDER-ONLY components
│   ├── 📄 trading-configurations.tsx    # Token trading settings
│   ├── 📄 server-configurations.tsx     # Webhooks & domain whitelist
│   └── 📄 index.ts               # Sender exports
│
├── 📁 provider/                  # PROVIDER-ONLY components
│   ├── 📄 provider-configurations.tsx   # Liquidity & provision settings
│   └── 📄 index.ts               # Provider exports
│
├── 📄 settings-page.tsx          # Main settings page orchestrator
├── 📄 index.ts                   # Main exports
├── 📄 README.md                  # Documentation
└── 📄 STRUCTURE.md               # This file
```

## 🏷️ Component Naming Convention

### ✅ Clear Naming Pattern
- **Shared**: `ProfileSettings`, `ApiKeyManager`
- **Sender**: `SenderTradingConfigurations`, `SenderServerConfigurations`  
- **Provider**: `ProviderLiquidityConfigurations`

### ✅ Descriptive Titles
- "Sender Server Configurations" (not just "Server Configurations")
- "Provider Liquidity Configurations" (not just "Provider Configurations")

## 🎯 Component Responsibilities

### 🔄 Shared Components (Both User Types)
| Component | Purpose | Used By |
|-----------|---------|---------|
| `ProfileSettings` | User profile info, display name, contact details | Senders & Providers |
| `ApiKeyManager` | Create, view, delete API keys | Senders & Providers |

### 📤 Sender-Only Components
| Component | Purpose | Features |
|-----------|---------|----------|
| `SenderTradingConfigurations` | Token trading settings | Fee percentages, fee addresses, refund addresses |
| `SenderServerConfigurations` | Server integration settings | Webhook notifications, webhook URL, domain whitelist |

### 🏦 Provider-Only Components
| Component | Purpose | Features |
|-----------|---------|----------|
| `ProviderLiquidityConfigurations` | Liquidity provision settings | Go live toggle, rates, slippage, wallet addresses, provision mode |

## 📋 Settings Page Tab Structure

### For Senders (6 tabs):
1. **Profile** (shared)
2. **Trading** (sender-only) 
3. **Server** (sender-only)
4. **API Keys** (shared)
5. **Notifications** (shared)
6. **Security** (shared)

### For Providers (5 tabs):
1. **Profile** (shared)
2. **Provider** (provider-only)
3. **API Keys** (shared) 
4. **Notifications** (shared)
5. **Security** (shared)

## 🚀 Import Examples

```typescript
// Clean organized imports
import { ProfileSettings, ApiKeyManager } from "@/components/settings/shared";
import { SenderTradingConfigurations, SenderServerConfigurations } from "@/components/settings/sender";
import { ProviderLiquidityConfigurations } from "@/components/settings/provider";

// Or import main page
import { SettingsPage } from "@/components/settings";
```

## ✅ Benefits of This Structure

1. **🔍 Easy to Spot**: Immediately clear which settings are for which user type
2. **📦 Better Organization**: Related components grouped together
3. **🔧 Maintainable**: Easy to add new sender/provider-specific settings
4. **📚 Self-Documenting**: File structure tells the story
5. **🚀 Clean Imports**: Organized import paths
6. **🎯 Single Responsibility**: Each component has a clear purpose

This structure makes it impossible to confuse sender settings with provider settings!
