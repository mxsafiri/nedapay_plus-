"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, ShieldCheck, Banknote, Network, Code2, Globe2 } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";

type TrackId = "banks" | "fintechs" | "psps";

export default function PublicDocsLanding() {
  const router = useRouter();
  const [activeTrack, setActiveTrack] = useState<TrackId>("banks");
  const [activeGlance, setActiveGlance] = useState<
    "order" | "rails" | "compliance" | null
  >("order");

  const personas = [
    {
      id: "banks",
      title: "Banks & Financial Institutions",
      badge: "Senders",
      description:
        "Offer cross-border payouts to your customers without building settlement rails from scratch. NedaPay acts as the orchestration and settlement layer behind your existing channels.",
      bullets: [
        "Initiate cross-border payouts via a simple REST API",
        "Keep full control of pricing and markup",
        "White-label experience for web and mobile channels",
      ],
    },
    {
      id: "fintechs",
      title: "Fintechs & Platforms",
      badge: "B2B2C",
      description:
        "Embed cross-border settlement flows into your product. Use NedaPay as the payment fabric while you own the end-customer relationship.",
      bullets: [
        "Server-side APIs for initiating and tracking payment orders",
        "Webhook-first design for status and reconciliation",
        "Multi-tenant friendly for marketplaces and platforms",
      ],
    },
    {
      id: "psps",
      title: "PSPs & Liquidity Providers",
      badge: "Providers",
      description:
        "Plug your payout infrastructure into NedaPay to receive order flow from banks and platforms.",
      bullets: [
        "Expose your fiat corridors and limits via a single integration",
        "Receive assigned orders with full metadata",
        "Track commissions and settlement performance",
      ],
    },
  ];

  const steps = [
    {
      step: "Step 1",
      title: "Create an account & complete KYB",
      description:
        "Sign up to NedaPay, choose whether you are a bank, fintech, or PSP, and complete KYB once. The same profile powers all API access and routing.",
    },
    {
      step: "Step 2",
      title: "Generate API keys in Settings",
      description:
        "From the dashboard, go to Settings → API Keys to create keys for test and live environments. Keys are used as bearer tokens for all API calls.",
    },
    {
      step: "Step 3",
      title: "Create your first payment order",
      description:
        "Use the Payment Orders API to create a cross-border payout. NedaPay orchestrates routing across digital-asset tokens and fiat payout partners behind the scenes.",
    },
    {
      step: "Step 4",
      title: "Handle webhooks & reconcile",
      description:
        "Subscribe to webhooks to receive real-time status updates, then reconcile using your internal references and the NedaPay dashboard.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="fixed right-4 top-4 z-50">
        <ThemeSwitcher />
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
              <span>For banks, fintechs & PSPs</span>
            </div>

            <h1 className="hero-docs-heading text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Get started with the NedaPay integration
            </h1>

            <p className="text-sm text-slate-700 dark:text-slate-300 sm:text-base">
              NedaPay is a B2B2C payment infrastructure layer. Banks, fintechs, and
              payment service providers use our APIs to initiate cross-border
              payouts, while NedaPay manages orchestration, digital-asset token
              settlement, and downstream fiat delivery.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => router.push("https://nedapayplus.xyz/auth/login")}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-slate-50 shadow-lg shadow-blue-500/25 transition hover:bg-blue-500"
              >
                Create an account
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                href="/protected/docs-v2"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-500 hover:text-blue-400"
              >
                Skip to authenticated API docs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Network className="h-3.5 w-3.5 text-blue-500" />
                <span>Omni-channel payment layer</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe2 className="h-3.5 w-3.5 text-blue-500" />
                <span>Pay anywhere, settle everywhere</span>
              </div>
            </div>
          </div>

          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl shadow-slate-950/60">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-blue-400">
              Integration at a glance
            </p>
            <div className="space-y-4 text-xs text-slate-300">
              <button
                type="button"
                onClick={() =>
                  setActiveGlance((prev) => (prev === "order" ? null : "order"))
                }
                className={`w-full text-left flex flex-col gap-2 rounded-xl p-3 transition border
                  ${
                    activeGlance === "order"
                      ? "border-blue-500/70 bg-slate-900/90 shadow-lg shadow-blue-500/10"
                      : "border-transparent bg-slate-900/80 hover:bg-slate-900"
                  }`}
              >
                <div className="flex items-start gap-3">
                  <Banknote className="mt-0.5 h-4 w-4 text-blue-500" />
                  <div>
                    <p className="font-medium">Initiate a payment order</p>
                    <p className="text-[11px] text-slate-400">
                      Your backend creates a payment order with amount, corridor,
                      and recipient details. NedaPay assigns the optimal route
                      (digital-asset tokens or fiat partners) behind the scenes.
                    </p>
                  </div>
                </div>
                {activeGlance === "order" && (
                  <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-950/80 p-3 text-[10px] text-slate-100">
{`POST /api/v1/payment-orders
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "sourceCurrency": "TZS",
  "destinationCurrency": "KES",
  "amount": 100000,
  "reference": "INVOICE-001"
}`}
                  </pre>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveGlance((prev) => (prev === "rails" ? null : "rails"))
                }
                className={`w-full text-left flex flex-col gap-2 rounded-xl p-3 transition border
                  ${
                    activeGlance === "rails"
                      ? "border-blue-500/70 bg-slate-900/90 shadow-lg shadow-blue-500/10"
                      : "border-transparent bg-slate-900/80 hover:bg-slate-900"
                  }`}
              >
                <div className="flex items-start gap-3">
                  <Code2 className="mt-0.5 h-4 w-4 text-blue-500" />
                  <div>
                    <p className="font-medium">Use one API, multiple fulfillment rails</p>
                    <p className="text-[11px] text-slate-400">
                      You integrate once with NedaPay. We handle routing across
                      digital-asset token settlement and fiat payout networks like
                      local PSPs or bank partners.
                    </p>
                  </div>
                </div>
                {activeGlance === "rails" && (
                  <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-950/80 p-3 text-[10px] text-slate-100">
{`curl https://api.nedapayplus.com/api/v1/payment-orders \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "settlementRail": "digital_asset_token"
  }'`}
                  </pre>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveGlance((prev) =>
                    prev === "compliance" ? null : "compliance"
                  )
                }
                className={`w-full text-left flex flex-col gap-2 rounded-xl p-3 transition border
                  ${
                    activeGlance === "compliance"
                      ? "border-blue-500/70 bg-slate-900/90 shadow-lg shadow-blue-500/10"
                      : "border-transparent bg-slate-900/80 hover:bg-slate-900"
                  }`}
              >
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-blue-500" />
                  <div>
                    <p className="font-medium">Compliance-friendly wording</p>
                    <p className="text-[11px] text-slate-400">
                      The platform abstracts digital-asset tokens used for
                      settlement so banks and regulators see a clean, fiat-first
                      experience in dashboards and reports.
                    </p>
                  </div>
                </div>
                {activeGlance === "compliance" && (
                  <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-950/80 p-3 text-[10px] text-slate-100">
{`// Example: settlement rail described in a dashboard
{
  "settlementRail": "digital_asset_token", // tokens for digital assets
  "reportedToBankAs": "Cross-border payout"
}`}
                  </pre>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Local hero heading animation */}
        <style jsx>{`
          .hero-docs-heading {
            opacity: 0;
            transform: translateY(14px);
            animation: hero-docs-slide-up 0.85s ease-out forwards;
          }

          @keyframes hero-docs-slide-up {
            0% {
              opacity: 0;
              transform: translateY(18px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>

        {/* Personas */}
        <section className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-50 sm:text-xl">
              Who NedaPay is for
            </h2>
            <p className="max-w-xl text-xs text-slate-600 dark:text-slate-400">
              Start with the track that matches your role. The underlying APIs
              are the same; what changes is how you expose them to your
              customers and how revenue is shared.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {personas.map((persona) => (
              <div
                key={persona.id}
                className="group flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900/40 p-4 transition hover:border-emerald-500/70 hover:bg-slate-900/70"
              >
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {persona.badge}
                </div>
                <h3 className="text-sm font-semibold text-slate-50">
                  {persona.title}
                </h3>
                <p className="mt-2 text-xs text-slate-400">{persona.description}</p>
                <ul className="mt-3 space-y-1.5 text-[11px] text-slate-300">
                  {persona.bullets.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1 h-1 w-1 rounded-full bg-emerald-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => {
                    setActiveTrack(persona.id as TrackId);
                    const el = document.getElementById("integration-steps");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="mt-4 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300 group-hover:text-emerald-200"
                >
                  View integration steps
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Integration steps - code-focused */}
        <section id="integration-steps" className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-50 sm:text-xl">
                Step-by-step integration
              </h2>
              <p className="max-w-xl pt-1 text-xs text-slate-600 dark:text-slate-400">
                Choose the track that matches your role. Each guide walks through
                authentication, creating a payment order, handling webhooks, and
                reconciling payouts across digital-asset tokens and fiat rails.
              </p>
            </div>
          </div>

          {/* Track tabs */}
          <div className="inline-flex gap-2 rounded-full border border-slate-800 bg-slate-900/70 p-1 text-[11px] font-medium text-slate-300">
            {personas.map((persona) => (
              <button
                key={persona.id}
                onClick={() => setActiveTrack(persona.id as TrackId)}
                className={`rounded-full px-3 py-1 transition ${
                  activeTrack === persona.id
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-transparent text-slate-300 hover:bg-slate-800"
                }`}
              >
                {persona.badge}
              </button>
            ))}
          </div>

          {/* Track content */}
          <div className="grid gap-5 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.1fr)]">
            <div className="space-y-4">
              {activeTrack === "banks" && (
                <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-[11px] text-slate-200">
                  <h3 className="text-sm font-semibold text-slate-50">
                    Banks & Financial Institutions – server-side flow
                  </h3>
                  <ol className="list-decimal space-y-2 pl-4">
                    <li>
                      <span className="font-medium">Create an API key</span> in
                      Settings → API Keys (test first, then live).
                    </li>
                    <li>
                      <span className="font-medium">Call the Payment Orders API</span>{" "}
                      from your core banking backend or integration layer.
                    </li>
                    <li>
                      <span className="font-medium">Fund the route</span> using your
                      chosen settlement method (digital-asset tokens or fiat).
                    </li>
                    <li>
                      <span className="font-medium">Listen to webhooks</span> to update
                      customer-facing channels and back-office systems.
                    </li>
                  </ol>
                  <p className="pt-1 text-[10px] text-slate-400">
                    Example: initiate a cross-border payout from your bank backend.
                  </p>
                  <pre className="overflow-x-auto rounded-lg bg-slate-950/70 p-3 text-[10px] text-slate-100">
{`POST /api/v1/payment-orders
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "sourceCurrency": "TZS",
  "destinationCurrency": "KES",
  "amount": 100000,
  "settlementRail": "digital_asset_token", // tokens for digital assets
  "recipient": {
    "name": "Jane Doe",
    "bankAccount": "0123456789",
    "bankCode": "ABCDKENX"
  },
  "reference": "INVOICE-2025-001",
  "webhookUrl": "https://yourbank.com/nedapay/webhook"
}`}
                  </pre>
                  <p className="pt-1 text-[10px] text-slate-400">
                    NedaPay will route this order over the optimal rail – digital-asset
                    token off-ramp to fiat, or fiat corridors via partners covering 130+
                    countries – and push state changes to your webhook URL.
                  </p>
                </div>
              )}

              {activeTrack === "fintechs" && (
                <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-[11px] text-slate-200">
                  <h3 className="text-sm font-semibold text-slate-50">
                    Fintechs & Platforms – embedded payouts
                  </h3>
                  <ol className="list-decimal space-y-2 pl-4">
                    <li>
                      Use your own auth/session layer for end users; NedaPay only
                      sees your platform as the API client.
                    </li>
                    <li>
                      From your backend, create payment orders on behalf of your
                      merchants or customers.
                    </li>
                    <li>
                      Store the NedaPay <code className="font-mono">orderId</code> and
                      your internal reference for reconciliation.
                    </li>
                    <li>
                      Fan out webhook events into your own event bus or queue.
                    </li>
                  </ol>
                  <p className="pt-1 text-[10px] text-slate-400">
                    Example: platform backend creating an order for a merchant.
                  </p>
                  <pre className="overflow-x-auto rounded-lg bg-slate-950/70 p-3 text-[10px] text-slate-100">
{`curl https://api.nedapayplus.com/api/v1/payment-orders \
  -H "Authorization: Bearer YOUR_PLATFORM_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceCurrency": "USD",
    "destinationCurrency": "NGN",
    "amount": 2500,
    "settlementRail": "digital_asset_token",
    "metadata": {
      "merchantId": "mch_123",
      "customerId": "cus_456"
    },
    "webhookUrl": "https://yourplatform.com/webhooks/nedapay"
  }'`}
                  </pre>
                  <p className="pt-1 text-[10px] text-slate-400">
                    Use the webhook payloads to update balances, invoices, and payout
                    screens in your product.
                  </p>
                </div>
              )}

              {activeTrack === "psps" && (
                <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-[11px] text-slate-200">
                  <h3 className="text-sm font-semibold text-slate-50">
                    PSPs & Liquidity Providers – receiving order flow
                  </h3>
                  <ol className="list-decimal space-y-2 pl-4">
                    <li>
                      Complete KYB as a provider and configure your fiat methods
                      (mobile money, bank accounts, or global payout networks).
                    </li>
                    <li>
                      Define which corridors you support and any operational limits.
                    </li>
                    <li>
                      Receive assigned orders via the provider dashboard or
                      provider-facing APIs.
                    </li>
                    <li>
                      Confirm fulfillment so NedaPay can close the loop with the
                      originating bank or platform.
                    </li>
                  </ol>
                  <p className="pt-1 text-[10px] text-slate-400">
                    Example: provider querying recently assigned orders.
                  </p>
                  <pre className="overflow-x-auto rounded-lg bg-slate-950/70 p-3 text-[10px] text-slate-100">
{`GET /api/v1/provider/orders?status=pending
Authorization: Bearer YOUR_PROVIDER_KEY

// Response (truncated)
{
  "data": [
    {
      "id": "po_123",
      "destinationCurrency": "TZS",
      "amount": 500000,
      "settlementRail": "fiat_network",
      "payoutDetails": { "channel": "bank_transfer" }
    }
  ]
}`}
                  </pre>
                  <p className="pt-1 text-[10px] text-slate-400">
                    As new fiat corridors are unlocked (including global networks
                    reaching 130+ countries), they appear here without changing the
                    integration surface.
                  </p>
                </div>
              )}
            </div>

            {/* Generic lifecycle / webhooks */}
            <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-[11px] text-slate-200">
              <h3 className="text-sm font-semibold text-slate-50">
                Common lifecycle & webhook example
              </h3>
              <p className="text-[11px] text-slate-700 dark:text-slate-300">
                Regardless of the track, every integration follows the same
                pattern: create an order, fund or fulfill it, receive status
                updates, and reconcile.
              </p>
              <pre className="overflow-x-auto rounded-lg bg-slate-950/70 p-3 text-[10px] text-slate-100">
{`// Example webhook payload (order.completed)
{
  "type": "order.completed",
  "data": {
    "id": "po_123",
    "reference": "INVOICE-2025-001",
    "sourceCurrency": "TZS",
    "destinationCurrency": "KES",
    "amount": 100000,
    "settlementRail": "digital_asset_token",
    "status": "completed",
    "completedAt": "2025-01-01T10:23:45Z"
  }
}

// Your webhook handler should:
// 1. Verify signature (if configured)
// 2. Match reference/id to your internal records
// 3. Mark payout as settled in your system
// 4. Emit events or update customer-facing UIs`}
              </pre>
            </div>
          </div>
        </section>

        {/* Deep docs CTA */}
        <section className="mt-4 flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:flex-row sm:items-center">
          <div className="space-y-1.5">
            <h2 className="text-sm font-semibold text-slate-50 sm:text-base">
              Ready for full API details?
            </h2>
            <p className="max-w-xl text-xs text-slate-600 dark:text-slate-400">
              Log in to access the authenticated documentation, API reference,
              and live API playground. There you can generate API keys, test
              requests, and inspect responses in real time.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="https://nedapayplus.xyz/auth/login"
              className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-900 shadow-sm hover:bg-white"
            >
              Sign in to dashboard
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/protected/docs-v2"
              className="inline-flex items-center gap-2 text-xs font-medium text-emerald-300 hover:text-emerald-200"
            >
              Open authenticated docs
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
