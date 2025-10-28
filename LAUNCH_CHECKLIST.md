# 🚀 NedaPay Launch Readiness Checklist

**Target: User Onboarding Ready**  
**Updated: October 28, 2025**

---

## 📊 Overview

This checklist covers everything needed to onboard banks and PSPs to NedaPay.

### Priority Levels
- 🔴 **CRITICAL** - Must have for launch
- 🟠 **HIGH** - Important for good UX
- 🟡 **MEDIUM** - Nice to have, can add later
- 🟢 **LOW** - Future enhancement

---

## Phase 1: Core Infrastructure (Week 1) 🔴 CRITICAL

### A. Settlement System
**Status:** 🟡 In Progress  
**Priority:** 🔴 CRITICAL

- [ ] **Run database migration**
  ```bash
  psql $DATABASE_URL < scripts/migrations/001_add_settlement_tracking.sql
  ```

- [ ] **Regenerate Prisma client**
  ```bash
  npx prisma generate
  ```

- [ ] **Test settlement service**
  - Create test order
  - Fulfill order
  - Verify USDC settlement triggered
  - Check transaction logs

- [ ] **Add settlement monitoring**
  - Create admin endpoint: `/api/admin/settlements/status`
  - View pending settlements
  - Retry failed settlements

**Files Created:**
- ✅ `scripts/migrations/001_add_settlement_tracking.sql`
- ✅ `lib/settlements/settlement-service.ts`
- ✅ Updated `app/api/provider/fulfill-order/route.ts`

**Files Needed:**
- [ ] `app/api/admin/settlements/status/route.ts`
- [ ] `app/api/admin/settlements/retry/route.ts`
- [ ] `app/api/cron/daily-settlements/route.ts` (optional backup)

---

### B. Thunes Integration (or Alternative)
**Status:** ⏳ Awaiting Terms Sheet  
**Priority:** 🟠 HIGH

- [ ] **Finalize Thunes agreement**
  - Sign terms sheet
  - Get API credentials
  - Get sandbox access

- [ ] **Create Thunes client**
  ```typescript
  // lib/fiat/thunes-client.ts
  - createQuotation()
  - createTransaction()
  - confirmTransaction()
  - getTransactionStatus()
  ```

- [ ] **Add to fulfillment methods**
  - Update provider configuration
  - Add Thunes as fulfillment option
  - Test sandbox transactions

- [ ] **Backup: Set up alternative** (parallel track)
  - M-Pesa business account
  - OR Flutterwave API
  - OR DPO Group

**Environment Variables:**
```bash
# .env
THUNES_API_KEY=your_api_key
THUNES_API_SECRET=your_api_secret
THUNES_ACCOUNT_ID=your_account_id
THUNES_ENVIRONMENT=sandbox # or production
```

**Files Needed:**
- [ ] `lib/fiat/thunes-client.ts`
- [ ] `lib/fiat/flutterwave-client.ts` (backup)
- [ ] `lib/fiat/fulfillment-router.ts` (smart routing)

---

### C. KYB Verification Workflow
**Status:** 🟢 Exists (verify completeness)  
**Priority:** 🔴 CRITICAL

- [ ] **Review existing KYB flow**
  - Check `/app/api/kyb/`
  - Verify document upload works
  - Test approval workflow

- [ ] **Add admin KYB dashboard**
  - List pending verifications
  - View documents
  - Approve/reject with notes
  - Email notifications

- [ ] **Add KYB status to onboarding**
  - Show verification progress
  - Upload requirements
  - Status tracking

**Files to Review:**
- [ ] `app/api/kyb/` (check completeness)
- [ ] `app/protected/admin/kyb/` (create if missing)

**Files Needed:**
- [ ] `components/admin/kyb-approval-queue.tsx`
- [ ] `app/api/admin/kyb/approve/route.ts`
- [ ] `app/api/admin/kyb/reject/route.ts`

---

## Phase 2: User Onboarding (Week 1) 🔴 CRITICAL

### A. Provider (PSP) Onboarding
**Status:** 🟢 Exists (needs enhancement)  
**Priority:** 🔴 CRITICAL

**Current State:**
- ✅ Basic wizard exists: `/app/(auth-pages)/onboarding/psp/`
- ✅ Treasury wallet setup
- ❓ Needs fiat infrastructure section

**Enhancements Needed:**

- [ ] **Step 1: Business Information** ✅ (verify complete)
  - Trading name
  - Business address
  - Contact information
  - Supported countries

- [ ] **Step 2: Fiat Fulfillment Methods** 🆕 ADD THIS
  ```typescript
  // Add to provider onboarding wizard
  
  Fulfillment Methods:
  □ M-Pesa
    - Provider: [Vodacom/Airtel/Tigo]
    - Business Number: [+255...]
    - Daily Limit: [$...]
    
  □ Bank Transfer
    - Bank: [CRDB/NMB/etc]
    - Account Number: [...]
    - Account Name: [...]
    
  □ Thunes API
    - Account ID: [...]
    - API Key: [...]
    - [Test Connection]
    
  □ Flutterwave API
    - Account ID: [...]
    - API Key: [...]
    - [Test Connection]
  ```

- [ ] **Step 3: Settlement Wallets** ✅ (keep existing)
  - Hedera wallet address
  - Base wallet (optional)
  - Test connection

- [ ] **Step 4: Commission & Terms** ✅ (verify exists)
  - Commission rate
  - Payment terms
  - Agreement acceptance

**Files to Update:**
- [ ] `app/(auth-pages)/onboarding/psp/page.tsx`
- [ ] `components/onboarding/psp-fulfillment-methods.tsx` (create)
- [ ] `app/api/onboarding/psp/fulfillment-methods/route.ts` (create)

---

### B. Sender (Bank) Onboarding
**Status:** 🟢 Exists (verify completeness)  
**Priority:** 🔴 CRITICAL

**Current State:**
- ✅ Basic wizard exists: `/app/(auth-pages)/onboarding/bank/`
- ❓ Verify completeness

**Requirements:**

- [ ] **Step 1: Bank Information**
  - Bank name
  - Registration number
  - Contact details
  - Countries served

- [ ] **Step 2: API Configuration**
  - Generate API key automatically
  - Show webhook configuration
  - Provide integration docs

- [ ] **Step 3: Markup Configuration**
  - Default markup percentage
  - Per-corridor markup (optional)
  - Revenue split

- [ ] **Step 4: White-Label Settings** (optional)
  - Logo upload
  - Brand colors
  - Custom domain

**Files to Review/Update:**
- [ ] `app/(auth-pages)/onboarding/bank/page.tsx`
- [ ] Verify API key generation works
- [ ] Add white-label configuration UI

---

### C. Onboarding Status Tracking
**Status:** 🔴 MISSING  
**Priority:** 🟠 HIGH

- [ ] **Add onboarding progress indicator**
  ```typescript
  OnboardingProgress {
    profile_created: true,
    kyb_submitted: true,
    kyb_approved: false, // ← User sees "Pending"
    wallet_configured: true,
    api_key_generated: true,
    ready_to_transact: false
  }
  ```

- [ ] **Onboarding status dashboard**
  - Show checklist of completed steps
  - Highlight blockers (e.g., "KYB pending approval")
  - Estimated time to go live

**Files Needed:**
- [ ] `app/api/onboarding/status/route.ts`
- [ ] `components/onboarding/progress-tracker.tsx`

---

## Phase 3: Dashboard Enhancements (Week 1-2) 🟠 HIGH

### A. Provider Dashboard Updates
**Status:** 🟡 Needs Settlement Info  
**Priority:** 🟠 HIGH

**Existing:**
- ✅ Total Liquidity
- ✅ Earnings (commissions)
- ✅ Orders Fulfilled

**Add:**
- [ ] **Settlement Status Card**
  ```typescript
  Settlement Status:
  - Pending: $234.50 (5 orders)
  - Last Settled: Oct 27, $1,245 USDC
  - [View Settlement History]
  ```

- [ ] **Update dashboard stats API**
  - Add pending settlement amount
  - Add last settlement date
  - Add settlement history count

**Files to Update:**
- [ ] `app/api/dashboard/stats/route.ts` - Add settlement info
- [ ] `components/dashboard/dashboard.tsx` - Add settlement card
- [ ] `app/api/dashboard/settlements/route.ts` (create) - Settlement history

---

### B. Sender Dashboard Updates
**Status:** ✅ Probably Complete  
**Priority:** 🟡 MEDIUM

**Verify exists:**
- ✅ Total Sent
- ✅ Active Orders
- ✅ Revenue (markup earned)

**Optional adds:**
- [ ] Cost savings vs traditional rails
- [ ] Average transaction time
- [ ] Success rate chart

---

### C. Admin Dashboard (Backstage)
**Status:** 🟡 Needs Settlement Monitoring  
**Priority:** 🟠 HIGH

**Required Sections:**

- [ ] **KYB Approvals**
  - Pending verifications queue
  - Document viewer
  - Approve/reject actions

- [ ] **Settlement Monitoring** 🆕
  - Today's settlements summary
  - Failed settlements (needs retry)
  - Settlement health metrics
  - Manual settlement trigger

- [ ] **Platform Metrics**
  - Total volume
  - Active users
  - Success rates
  - Revenue breakdown

**Files Needed:**
- [ ] `app/protected/admin/settlements/page.tsx`
- [ ] `app/api/admin/settlements/status/route.ts`
- [ ] `components/admin/settlement-monitoring.tsx`

---

## Phase 4: Testing & Validation (Week 1-2) 🔴 CRITICAL

### A. End-to-End Testing
**Priority:** 🔴 CRITICAL

**Test Scenarios:**

- [ ] **Provider Onboarding Flow**
  ```
  1. Sign up as PSP
  2. Complete business info
  3. Add fulfillment methods (M-Pesa/Thunes)
  4. Configure settlement wallet
  5. Submit KYB documents
  6. Wait for admin approval
  7. Verify dashboard access
  8. Check order queue works
  ```

- [ ] **Sender Onboarding Flow**
  ```
  1. Sign up as Bank
  2. Complete bank info
  3. Generate API key
  4. Configure webhook
  5. Submit KYB documents
  6. Wait for admin approval
  7. Test API with sandbox
  8. Verify dashboard access
  ```

- [ ] **Complete Transaction Flow**
  ```
  1. Bank creates order via API
  2. Order appears in provider queue
  3. Provider accepts order
  4. Provider fulfills with M-Pesa/Thunes
  5. Provider marks completed
  6. Settlement triggered automatically
  7. Provider receives USDC
  8. Bank receives webhook
  9. All dashboards update
  ```

- [ ] **Settlement System**
  ```
  1. Create 5 test orders
  2. Fulfill all orders
  3. Verify instant settlements triggered
  4. Check provider received USDC
  5. Verify settlement logs
  6. Test failed settlement retry
  7. Check pending settlements dashboard
  ```

### B. Integration Testing
**Priority:** 🟠 HIGH

- [ ] **Blockchain Integration**
  - Hedera testnet transactions
  - USDC token transfers
  - Transaction confirmation
  - Gas fee calculations

- [ ] **Thunes Integration** (when available)
  - Sandbox quotations
  - Sandbox transactions
  - Webhook handling
  - Error scenarios

- [ ] **API Testing**
  - All Bank API endpoints
  - Authentication works
  - Webhooks deliver
  - Error handling

### C. Performance Testing
**Priority:** 🟡 MEDIUM (can do after launch)

- [ ] Load testing with 100+ concurrent orders
- [ ] Settlement batch processing speed
- [ ] Dashboard load times
- [ ] API response times

---

## Phase 5: Documentation (Week 1-2) 🟠 HIGH

### A. User Documentation
**Priority:** 🟠 HIGH

- [ ] **Provider Onboarding Guide**
  - Step-by-step wizard walkthrough
  - Fulfillment method setup
  - Settlement wallet setup
  - How settlements work
  - FAQ

- [ ] **Sender Integration Guide**
  - API quickstart
  - Authentication
  - Creating orders
  - Webhook setup
  - Error codes
  - Code examples

- [ ] **Settlement Guide for Providers**
  - How USDC settlements work
  - When settlements happen
  - How to cash out USDC
  - Blockchain explorers

### B. Internal Documentation
**Priority:** 🟡 MEDIUM

- [ ] **Admin Playbook**
  - KYB approval process
  - Settlement monitoring
  - Incident response
  - Provider support

- [ ] **Operations Manual**
  - Daily settlement checks
  - Failed settlement resolution
  - Provider onboarding review
  - Compliance procedures

**Files Needed:**
- [ ] `docs/PROVIDER_ONBOARDING_GUIDE.md`
- [ ] `docs/BANK_API_GUIDE.md`
- [ ] `docs/SETTLEMENT_GUIDE.md`
- [ ] `docs/ADMIN_PLAYBOOK.md`

---

## Phase 6: Security & Compliance (Week 1) 🔴 CRITICAL

### A. Security Checklist
**Priority:** 🔴 CRITICAL

- [ ] **Environment Variables**
  - All secrets in `.env`
  - `.env` in `.gitignore`
  - Production keys separate
  - Thunes API keys encrypted

- [ ] **API Security**
  - API key authentication works
  - Rate limiting enabled
  - Input validation
  - SQL injection prevention

- [ ] **Data Protection**
  - KYB documents encrypted at rest
  - PII data access logging
  - Sensitive data not in logs
  - Database backups enabled

### B. Compliance
**Priority:** 🔴 CRITICAL

- [ ] **KYB Requirements**
  - Document collection complete
  - Verification workflow works
  - Record retention policy
  - Audit trail

- [ ] **Transaction Monitoring**
  - All transactions logged
  - Blockchain audit trail
  - Suspicious activity alerts (future)

- [ ] **Tanzania BoT Compliance**
  - No crypto exposure to banks/end-users ✅
  - Proper licensing (verify)
  - Reporting mechanisms

---

## Phase 7: Deployment (Week 2) 🟠 HIGH

### A. Pre-Deployment
**Priority:** 🔴 CRITICAL

- [ ] **Run migrations on production DB**
  ```bash
  psql $PRODUCTION_DATABASE_URL < scripts/migrations/001_add_settlement_tracking.sql
  ```

- [ ] **Set environment variables**
  - Hedera mainnet keys
  - Thunes production API
  - Database URL
  - All secrets

- [ ] **Database backup**
  - Backup current state
  - Test restore process
  - Document rollback procedure

### B. Deployment
**Priority:** 🔴 CRITICAL

- [ ] Deploy to production
- [ ] Run smoke tests
- [ ] Monitor error logs
- [ ] Check settlement cron jobs
- [ ] Verify webhooks work

### C. Post-Deployment Monitoring
**Priority:** 🔴 CRITICAL

- [ ] **Set up monitoring**
  - Error tracking (Sentry/similar)
  - Performance monitoring
  - Settlement success rate
  - API uptime

- [ ] **Alerts**
  - Failed settlements
  - API errors
  - High transaction volumes
  - Low blockchain balance

---

## Phase 8: User Acquisition (Week 2-4) 🟡 MEDIUM

### A. Pilot Users
**Priority:** 🟠 HIGH

- [ ] **Onboard 2-3 Provider PSPs**
  - Manual onboarding support
  - Test all flows with real users
  - Gather feedback
  - Fix issues

- [ ] **Onboard 1-2 Banks**
  - API integration support
  - Webhook testing
  - Volume testing
  - Success metrics

### B. Support Infrastructure
**Priority:** 🟠 HIGH

- [ ] **Support channels**
  - Email support
  - WhatsApp/Telegram group
  - Documentation site
  - FAQ

- [ ] **Monitoring dashboards**
  - Real-time transaction feed
  - Settlement status board
  - User activity metrics

---

## Quick Start: Minimum Viable Launch

**If you need to launch THIS WEEK, focus on:**

### Day 1-2: Core Settlement ✅
1. ✅ Run migration
2. ✅ Test settlement service
3. ✅ Verify blockchain integration works

### Day 3: Onboarding Polish
1. Review PSP onboarding wizard
2. Add fiat fulfillment methods section
3. Test complete flow

### Day 4: Testing
1. End-to-end transaction test
2. Settlement test
3. Dashboard verification

### Day 5: Documentation
1. Provider onboarding guide
2. Bank API quickstart
3. Settlement guide

### Day 6-7: Launch
1. Onboard first provider (you!)
2. Onboard first bank partner
3. Process first real transaction
4. Monitor closely

---

## Status Summary

### ✅ Complete
- Provider dashboard (basic)
- Sender dashboard (basic)
- Order fulfillment API
- Blockchain integration (Hedera)
- KYB verification (verify)
- API key generation

### 🟡 In Progress
- Settlement system (files created, need testing)
- Provider onboarding (needs fiat methods)
- Admin dashboard (needs settlement monitoring)

### 🔴 Missing / Critical
- Settlement tracking (database migration)
- Fiat fulfillment methods UI
- Admin settlement monitoring
- Thunes integration (awaiting approval)
- End-to-end testing

### 🟢 Future Enhancements
- Batch settlements
- Advanced analytics
- Multi-currency support
- Mobile apps

---

## Next Steps

1. **Run the migration**
   ```bash
   psql $DATABASE_URL < scripts/migrations/001_add_settlement_tracking.sql
   npx prisma generate
   ```

2. **Test settlement service**
   - Create test order
   - Fulfill it
   - Verify USDC sent

3. **Review and enhance onboarding**
   - Add fiat methods section
   - Test complete flow

4. **Finalize Thunes or alternative**
   - M-Pesa business account (backup)
   - Flutterwave (backup)

5. **Documentation sprint**
   - Provider guide
   - Bank API docs
   - Settlement guide

---

**Questions? Issues? Next actions?** Let me know what to focus on first!
