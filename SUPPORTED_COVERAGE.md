# Supported Coverage

This page explains how to retrieve the currently supported payout destinations (fiat currencies / countries) and supported blockchain settlement networks.

The supported list can change over time. Do not rely on hardcoded lists; always query the APIs below.

- `GET /api/v1/currencies` (supported payout currencies)
- `GET /api/networks` (enabled blockchain networks)

## Supported payout countries / currencies (source of truth)

Call:

```http
GET /api/v1/currencies
```

Response shape (example):

```json
{
  "success": true,
  "currencies": [
    { "code": "XXX", "name": "...", "country": "...", "flag": "..." }
  ],
  "count": 1
}
```

## Supported blockchain networks (source of truth)

Blockchain networks are used for token settlement (e.g., USDC) before fiat delivery.

Call:

```http
GET /api/networks
```

Response shape (example):

```json
{
  "networks": [
    {
      "id": "1",
      "identifier": "...",
      "network_type": "evm",
      "priority": 1,
      "is_testnet": true,
      "is_enabled": true
    }
  ]
}
```

## Requesting a new country or chain

Share the following with the NedaPay team:

- The destination country and preferred payout method (bank transfer, mobile money, etc.)
- Expected monthly volume and average ticket size
- Any compliance constraints (KYB/KYC requirements, sanctions screening expectations)
- For chain additions: chain name, mainnet/testnet, and token(s) you need (USDC/USDT)
