# 🎧 Support Script: PSP Wallet Setup

## Quick Reference for Support Team

Use this script when helping PSPs set up their settlement wallets.

---

## 📞 INITIAL CONTACT

### Greeting:
```
"Hi [PSP Name]! This is [Your Name] from NedaPay support. 
I'm here to help you set up your settlement wallets. 
This will take about 10 minutes. Do you have time now?"

If NO: "No problem! When would be a good time for me to call you back?"
If YES: "Great! Let's get started."
```

---

## 🔍 PRE-CHECK

### Questions to Ask:
```
1. "Have you received our onboarding email with the setup guide?"
   - If NO: "Let me resend that to you right now."
   - If YES: "Perfect! Have you had a chance to review it?"

2. "Do you have access to a computer or smartphone right now?"
   - If NO: "That's okay, we can schedule this for when you do."
   - If YES: "Great, we'll need that for the setup."

3. "Are you comfortable following links and creating accounts?"
   - If NO: "No worries! I'll guide you through every single step."
   - If YES: "Excellent! This will be quick then."
```

---

## 🌐 PART 1: HEDERA ACCOUNT SETUP

### Introduction:
```
"First, we'll set up your primary settlement wallet on the Hedera network. 
This is where you'll receive about 95% of your payments. 
The fees are super low - just $0.0001 per transaction instead of $0.03."
```

### Step-by-Step Guidance:

#### Step 1: Navigate to Hedera Portal
```
"Okay, please open your browser and go to: 
H-T-T-P-S colon slash slash portal dot hedera dot com

[Spell it out slowly]

Do you see a page with 'Create Account' button?"
```

**If they say YES:** Continue to Step 2
**If they say NO:** "What do you see on the screen?" → Troubleshoot

#### Step 2: Create Account
```
"Great! Now please click the blue 'Create Account' button.

You'll see options for Mainnet, Testnet, or Previewnet. 
Please select 'Testnet' - that's T-E-S-T-N-E-T.

Now click 'Continue'."
```

#### Step 3: Sign Up
```
"Now you'll enter your details:
1. Email address - what's your work email?"
   [Wait for response, repeat back to confirm]

2. "Create a strong password - at least 8 characters with numbers and symbols."
   [Give them time]

3. "Click 'Create Account'"

4. "Check your email inbox for a verification link from Hedera."
   [Wait for them to find it]

5. "Click that link to verify your account."
```

#### Step 4: Get Account ID
```
"Perfect! Now you should see your Hedera dashboard. 
At the top, you'll see something like 'Account ID: 0.0.1234567'

Can you read that number to me?"
[Listen carefully, repeat back to confirm]

"Great! Keep that number handy - we'll need it in a moment."
```

#### Step 5: Get Test HBAR
```
"On the left side menu, do you see 'Faucet'?

Click that, then click 'Request HBAR'.

This gives you some free test HBAR - think of it like gas money for transactions.
You'll need this to receive payments.

It might take 30 seconds. Do you see your balance updated to about 100 HBAR?"
```

**If balance shows:** "Perfect! Let's move to the next step."
**If no balance:** "Let's wait another minute... [wait 60 seconds] ...try refreshing the page."

#### Step 6: Backup Keys (Critical!)
```
"This next step is VERY important for security.

Click 'Settings' then 'Backup Keys'.

You'll see a list of 24 words. These are your recovery phrase.

PLEASE write these down on paper - yes, actual paper, not your computer. 
I'll wait while you do that."

[Give them 2-3 minutes]

"Have you written all 24 words down?"

"Good! Store that paper somewhere safe - like a safe or locked drawer. 
Never share those words with anyone, not even NedaPay staff. 
They're like your bank PIN but more important."
```

---

## ⛓️ PART 2: METAMASK WALLET SETUP

### Introduction:
```
"Now let's set up your backup wallet on the Base network. 
This handles about 5% of payments when Hedera needs maintenance. 
We'll use MetaMask - it's like a digital wallet app."
```

### Step-by-Step Guidance:

#### Step 1: Install MetaMask
```
"Are you on a computer or phone right now?"

IF COMPUTER:
"Great! Go to: M-E-T-A-M-A-S-K dot I-O slash download

Do you see browser options like Chrome, Firefox?"
[Help them select their browser]

"Click 'Install MetaMask for [Browser]' then 'Add Extension'"

IF PHONE:
"No problem! Open your App Store (iPhone) or Google Play (Android).

Search for 'MetaMask - Blockchain Wallet'

It's the one with the orange and white fox logo.

Tap 'Install' or 'Get'"
```

#### Step 2: Set Up Wallet
```
"Once MetaMask opens, you'll see a welcome screen.

Click 'Create a new wallet'.

Read the terms, then click 'I agree'.

Now create a password - make it strong and write it down."
```

#### Step 3: Backup Recovery Phrase
```
"This is important again - MetaMask will show you 12 words.

Write these down on DIFFERENT paper from your Hedera phrase.

Keep them separate and safe.

[Give them time]

Now you'll need to confirm the words by clicking them in order.

Let me know when you're done."
```

#### Step 4: Get Wallet Address
```
"Perfect! You should now see your MetaMask wallet.

At the top, you'll see your account name with an address below it.

The address starts with '0x' and has a bunch of letters and numbers.

Click on your account name to copy the address.

Can you paste it somewhere temporarily? We'll need it in a moment."
```

---

## 💾 PART 3: ADD TO NEDAPAY

### Introduction:
```
"Great work! Now let's add these wallets to your NedaPay account 
so you can start receiving payments."
```

### Step-by-Step Guidance:

#### Step 1: Log into NedaPay
```
"Please go to: app dot nedapay dot com slash login

Use the email and password you created when you signed up for NedaPay.

[Wait for them to log in]

Do you see your dashboard?"
```

#### Step 2: Navigate to Settings
```
"At the top right, click your profile picture or name.

In the dropdown, click 'Settings'.

Now click 'Provider Configuration' in the left menu.

Scroll down until you see 'Wallet Addresses'."
```

#### Step 3: Enter Hedera Account
```
"You should see a section for 'Hedera Testnet' with a box to enter your account ID.

Remember that number from earlier? It looked like 0.0.1234567?

Type that into the Hedera box.

Make sure you type it exactly - the numbers must match perfectly."

[Have them read it back to confirm]
```

#### Step 4: Enter Base Address
```
"Below that, you'll see 'Base Sepolia' with another box.

This is where you'll paste your MetaMask address.

It starts with '0x' and should be 42 characters long.

Paste that address into the Base box."

[Have them confirm first 6 and last 4 characters]
```

#### Step 5: Save
```
"Perfect! Double-check both addresses are correct.

Hedera: [repeat their number]
Base: Starts with [repeat first 6 chars]

If everything looks good, click 'Update' at the bottom.

You should see a success message."
```

---

## ✅ PART 4: VERIFICATION

### Test Payment:
```
"Excellent! Your wallets are now configured. 

I'm going to send you a test payment of $1 USDC to make sure everything works.

This will take about 5 seconds.

[Send test payment]

Okay, payment sent! 

For Hedera, go to: hashscan dot io slash testnet

Search for your account ID: [their number]

Do you see a recent transaction?"
```

**If YES:** "Perfect! Your Hedera wallet is working."
**If NO:** "Let's wait 30 more seconds... [wait] ...refresh the page."

---

## 🎓 PART 5: EDUCATION

### What Happens Next:
```
"Great! You're all set up. Let me explain what happens next:

1. When a bank creates a payment order, it might be assigned to you

2. You'll see it in your dashboard under 'Order Queue'

3. USDC will be sent to your Hedera wallet (most of the time)

4. You fulfill the order by settling in the destination currency

5. You mark the order complete, and we credit your commission

6. At the end of the month, you can withdraw your earnings to your bank


Do you have any questions about this process?"
```

### Security Reminders:
```
"Three important security reminders:

1. Never share your recovery phrases with anyone - not even NedaPay

2. Write them on paper, not digitally

3. Store them in separate, secure locations


Got it?"
```

---

## 📚 ADDITIONAL RESOURCES

### Provide Resources:
```
"I'm going to email you:

1. The full onboarding guide (PDF)
2. Video tutorials for each step
3. My direct contact info for questions
4. Link to our help center


You'll also get a welcome email tomorrow with your first test order.

Is there anything else I can help you with today?"
```

---

## ❌ COMMON ISSUES & SOLUTIONS

### Issue: "Hedera portal won't load"
```
SOLUTION:
"Let's try a different browser. Do you have Chrome, Firefox, or Safari?

Sometimes browser extensions can interfere. 
Try opening in an incognito/private window."
```

### Issue: "Didn't receive verification email"
```
SOLUTION:
"Let's check your spam folder first.

[Wait]

If it's not there, let's try a different email address.
What's another email you can use?"
```

### Issue: "MetaMask won't install"
```
SOLUTION:
"What browser are you using?

[Based on answer]

Chrome works best for MetaMask. 
Can you try downloading Chrome and installing MetaMask there?

Or we can use the mobile app if you have a smartphone."
```

### Issue: "Lost recovery phrase"
```
SOLUTION:
"That's a serious issue. You'll need to create a new wallet.

Unfortunately, any funds in the old wallet may be unrecoverable.

Let's create a new one right now, and THIS TIME:
1. Write the phrase on paper
2. Store it in a safe place
3. Take a photo and store in a password manager

Shall we start over?"
```

### Issue: "Address won't save in NedaPay"
```
SOLUTION:
"Let's check the format:

For Hedera: Should be 0.0.[numbers] like 0.0.7099612
For Base: Should be 0x[40 characters] like 0x742d35...

Can you read me what you entered?

[Check for typos, spaces, wrong network]"
```

### Issue: "Test payment didn't arrive"
```
SOLUTION:
"Let's troubleshoot:

1. Verify the address was saved correctly in NedaPay
2. Check HashScan: hashscan.io/testnet/account/[their-id]
3. Wait 2 minutes and refresh
4. If still nothing, let me resend the test payment"
```

---

## 📊 POST-CALL CHECKLIST

After completing the call, mark these items:

```
PSP Information:
[ ] Name: _______________
[ ] Email: _______________
[ ] Company: _______________
[ ] Phone: _______________

Setup Status:
[ ] Hedera account created
[ ] Hedera Account ID: _______________
[ ] Base wallet created
[ ] Base Address: _______________
[ ] Both added to NedaPay
[ ] Test payment sent
[ ] Test payment received

Follow-up Actions:
[ ] Send confirmation email
[ ] Add to onboarding spreadsheet
[ ] Schedule follow-up call (1 week)
[ ] Add to monthly check-in list

Notes:
___________________________________
___________________________________
___________________________________
```

---

## 🎯 SUCCESS METRICS

Track these for each PSP onboarding:

- **Call Duration:** Target: 10-15 minutes
- **Issues Encountered:** Document for improvement
- **Follow-up Needed:** Yes/No
- **PSP Satisfaction:** Rate 1-5

---

## 💬 CLOSING SCRIPT

### Successful Setup:
```
"Congratulations [Name]! You're all set up and ready to receive payments.

Your first test order will arrive tomorrow. 
Try fulfilling it so you're comfortable with the process.

I'll check in with you next week to see how things are going.

In the meantime, if you have ANY questions - even if they seem small - 
please don't hesitate to email me at [your email] or call [your number].

Welcome to the NedaPay family! We're excited to work with you."
```

### Requires Follow-up:
```
"We've made great progress today, [Name]. 

We still need to [list remaining items].

I'm going to send you an email summarizing what we completed and next steps.

Can we schedule another call for [suggest time]?"
```

---

## 🆘 ESCALATION PROCESS

### When to Escalate:

**Technical Issues:**
- Portal/MetaMask repeatedly failing
- Test payments not arriving after 10 minutes
- Database errors when saving addresses

**Escalate to:** Technical Team (tech@nedapay.com)

**Complex Questions:**
- Regulatory/compliance questions
- Large volume negotiations
- Custom integration requests

**Escalate to:** Account Manager (am@nedapay.com)

**Urgent Issues:**
- PSP can't receive payments
- Security concerns
- Funds missing

**Escalate to:** Senior Support (urgent@nedapay.com) + Call immediately

---

**Remember:** 
- Be patient and friendly
- Never rush the PSP
- Confirm understanding at each step
- Document everything
- Follow up is crucial!

*Last Updated: October 2025*  
*Version: 1.0*
