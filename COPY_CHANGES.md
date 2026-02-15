# HomeTruth Copy Audit — Changes Implemented

**Branch:** `jasonlryan/copy-audit-updates`
**Date:** 15 February 2026
**Sources:** Brand manifesto (`brand/`), copy specifications (`copy_spec/`), brand implementation guide

---

## Legend

- **[BANNED-WORD]** = Uses word explicitly banned in consumer copy (AI, platform, blockchain, seamless, etc.)
- **[BANNED-PHRASE]** = Uses phrase explicitly banned ("Make smarter decisions", "Transform your property journey", etc.)
- **[SPEC-MISMATCH]** = Copy spec provides different copy
- **[SPELLING]** = US English instead of British English
- **[VAGUE]** = Too vague/generic per brand guidelines
- **[TONE]** = Wrong tone (corporate, condescending, or off-brand)
- **[OUTCOMES]** = Describes features instead of outcomes
- **[GRAMMAR]** = Typo or grammatical error

---

## 1. HOMEPAGE — `app/page.tsx`

19 changes, 8 keeps.

| # | Element | Before | After | Decision | Reason |
|---|---------|--------|-------|----------|--------|
| 1.1 | Hero title | "Make smarter decisions with HomeTruth" | "Your Property Intelligence Platform" | **CHANGED** | [BANNED-PHRASE] [SPEC-MISMATCH] "Make smarter decisions" is explicitly banned |
| 1.2 | Hero subtitle | "Ask questions. Save answers. Upload documents." | "Get real answers for your property decisions — from someone who actually knows." | **CHANGED** | [OUTCOMES] [SPEC-MISMATCH] Listed features; spec leads with value |
| 1.3 | Ask HomeTruth title | "Ask HomeTruth" | — | **KEPT** | Clean, direct, on-brand |
| 1.4 | Ask HomeTruth subtitle | "Your AI copilot for buying, selling, and managing property." | "Your property assistant for buying, owning, and managing your home." | **CHANGED** | [BANNED-WORD] "AI copilot" uses banned term |
| 1.5 | Chat label | "HomeTruth AI Assistant" | "HomeTruth Assistant" | **CHANGED** | [BANNED-WORD] |
| 1.6 | Chat intro message | "Hi! I'm your property assistant..." | — | **KEPT** | Friendly, no violations |
| 1.7 | Sample questions | "How much stamp duty...", etc. | — | **KEPT** | Specific, UK-focused, good |
| 1.8 | Input placeholder | "Ask any property question..." | — | **KEPT** | Simple, clear |
| 1.9 | CTA buttons | "Start Free" / "Explore Pro Features" | — | **KEPT** | Clean, actionable |
| 1.10 | How It Works subhead | "Four simple steps to transform your property journey" | "Four steps to real answers about your property" | **CHANGED** | [BANNED-PHRASE] "Transform your property journey" is explicitly banned |
| 1.11 | Step 1 title | "Ask Questions" | "Add Your Property" | **CHANGED** | [SPEC-MISMATCH] Spec has different step flow |
| 1.12 | Step 1 desc | "Start by asking any property-related question to our AI assistant" | "Start with your address. We'll pull in the basics." | **CHANGED** | [BANNED-WORD] [SPEC-MISMATCH] |
| 1.13 | Step 2 title | "Personalize Profile" | "Upload Your Records" | **CHANGED** | [SPEC-MISMATCH] [SPELLING] |
| 1.14 | Step 2 desc | "Tell us about your preferences to get more tailored advice" | "Add documents, receipts, photos. Everything that matters about your property." | **CHANGED** | [SPEC-MISMATCH] |
| 1.15 | Step 3 title | "Get Smart Insights" | "Ask Questions" | **CHANGED** | [VAGUE] [SPEC-MISMATCH] |
| 1.16 | Step 3 desc | "Receive personalized insights based on your specific situation" | "Get answers specific to your property — not generic advice." | **CHANGED** | [VAGUE] [SPEC-MISMATCH] |
| 1.17 | Step 4 title | "Save What Matters" | "Stay Proactive" | **CHANGED** | [SPEC-MISMATCH] |
| 1.18 | Step 4 desc | "Bookmark important information and create notes..." | "We'll tell you what's coming up, what to watch, what matters." | **CHANGED** | [SPEC-MISMATCH] |
| 1.19 | Trust subhead | "Your data and privacy are our top priorities" | "Your information stays yours. Always." | **CHANGED** | [VAGUE] [TONE] Corporate boilerplate |
| 1.20 | Trust card 1 title | "Encryption" | "Complete Records" | **CHANGED** | [SPEC-MISMATCH] |
| 1.21 | Trust card 1 body | "Your data is encrypted with industry-standard security protocols" | "Your property history is permanent and tamper-proof." | **CHANGED** | [VAGUE] [TONE] [SPEC-MISMATCH] Corporate jargon |
| 1.22 | Trust card 2 title | "GDPR Compliance" | "GDPR Compliant" | **CHANGED** | [SPEC-MISMATCH] Minor alignment |
| 1.23 | Trust card 2 body | "We respect your privacy and comply with all data protection regulations" | "Your privacy is built into how we work." | **CHANGED** | [VAGUE] [SPEC-MISMATCH] |
| 1.24 | Trust card 3 title | "Privacy" | "Your Privacy" | **CHANGED** | [SPEC-MISMATCH] |
| 1.25 | Trust card 3 body | "We prioritize your information safety and never share your data" | "Your information stays yours, period." | **CHANGED** | [SPELLING] [VAGUE] [SPEC-MISMATCH] |
| 1.26 | Final CTA headline | "Ready to Transform Your Property Journey?" | "Start Making Better Property Decisions" | **CHANGED** | [BANNED-PHRASE] [SPEC-MISMATCH] |
| 1.27 | Final CTA subtext | "Join thousands of homeowners who trust HomeTruth for smarter property decisions" | "Free to start. No credit card required." | **CHANGED** | [BANNED-PHRASE] [VAGUE] Unsubstantiated claim |
| 1.28 | Final CTA button | "Start Free Today" | — | **KEPT** | Clean, actionable |

---

## 2. SIDEBAR NAV — `components/sidebar-nav.tsx`

1 change.

| # | Element | Before | After | Decision | Reason |
|---|---------|--------|-------|----------|--------|
| 2.1 | Nav label | "Ask AI" | "Ask HomeTruth" | **CHANGED** | [BANNED-WORD] Visible on every authenticated page |
| 2.2 | All other labels | Dashboard, Notes, Documents, etc. | — | **KEPT** | Functional, no violations |

---

## 3. FOOTER — `components/footer.tsx`

3 copy changes + link wiring.

| # | Element | Before | After | Decision | Reason |
|---|---------|--------|-------|----------|--------|
| 3.1 | Landing tagline | "Making property investment and ownership simpler, smarter, and more profitable." | "Real answers for every property decision." | **CHANGED** | [VAGUE] Generic triple-adjective pattern |
| 3.2 | App tagline | "Built Around You." | — | **KEPT** | Short, confident |
| 3.3 | Copyright (both variants) | "2025" | "2026" | **CHANGED** | Outdated year |
| 3.4 | About link | `href="#"` | `href="/about"` | **CHANGED** | Dead link wired to new page |
| 3.5 | Pricing link | `href="#"` | `href="/pricing"` | **CHANGED** | Dead link wired to new page |
| 3.6 | FAQ link | Did not exist | `href="/faq"` | **ADDED** | New page created |
| 3.7 | Contact link | `href="#"` | `href="mailto:hello@hometruth.io"` | **CHANGED** | Dead link wired to email |
| 3.8 | Features link | `href="#"` | `href="/#how-it-works"` | **CHANGED** | Dead link wired to section anchor |

---

## 4. PRO FEATURES PAGE — `app/pro/page.tsx`

11 changes, 2 keeps.

| # | Element | Before | After | Decision | Reason |
|---|---------|--------|-------|----------|--------|
| 4.1 | Hero subtitle | "Your Home. Your Terms. Powered by AI." | "Your Home. Your Terms. Your Advantage." | **CHANGED** | [BANNED-WORD] |
| 4.2 | Hero desc | "...unlock document analysis, personalized alerts, and insights designed around your property journey." | "Get answers that draw on your actual documents, alerts before things go wrong, and guidance specific to your property." | **CHANGED** | [TONE] [OUTCOMES] [SPELLING] |
| 4.3 | Card: "Document-Aware AI Chat" | Title + desc | Title: "Chat With Your Documents" / Desc: "Upload legal documents and ask questions — get answers based on what's actually in them." | **CHANGED** | [BANNED-WORD] |
| 4.4 | Card: "Document Vault" | Full card | — | **KEPT** | Clear, no violations |
| 4.5 | Card: "Smart Notes & Organization" | Title + desc | Title: "Notes & Organisation" / Desc: "Save unlimited notes and organise your conversations by topic, timeline, or property." | **CHANGED** | [BANNED-WORD] [SPELLING] |
| 4.6 | Card: "Profile-Driven AI" | Title + desc | Title: "Answers Shaped by You" / Desc: "Your assistant adapts to your preferences, communication style, and needs." | **CHANGED** | [BANNED-WORD] |
| 4.7 | Card: "Listing Bookmarks via Extension" | Title + desc | Title: "Save Listings as You Browse" / Desc: "Bookmark homes from any property site and view them all on your dashboard." | **CHANGED** | [OUTCOMES] Implementation detail in title |
| 4.8 | Card: "Budget Planner" | Full card | — | **KEPT** | Clear, acceptable |
| 4.9 | Price | "Upgrade for £50/month" | "Upgrade for £8/month per property" | **CHANGED** | [SPEC-MISMATCH] User confirmed £8/mo per spec |
| 4.10 | Price desc | "...organized, and informed throughout your home journey." | "...organised, and informed about your property." | **CHANGED** | [SPELLING] |
| 4.11 | Trust card 1 | "Your data is encrypted." | "Records that can't be changed or lost." | **CHANGED** | [VAGUE] [SPEC-MISMATCH] |
| 4.12 | Trust card 2 | "We respect your privacy." | "GDPR compliant from the ground up." | **CHANGED** | [VAGUE] [SPEC-MISMATCH] |
| 4.13 | Trust card 3 | "We prioritize your information safety." | "We never sell your data." | **CHANGED** | [SPELLING] [SPEC-MISMATCH] |

---

## 5. DASHBOARD — `app/dashboard/page.tsx`

2 changes.

| # | Element | Before | After | Decision | Reason |
|---|---------|--------|-------|----------|--------|
| 5.1 | Welcome subtitle | "Ask questions, get insights, and make smarter decisions." | "Ask questions, get real answers, and stay on top of your property." | **CHANGED** | [BANNED-PHRASE] |
| 5.2 | Saved Notes card desc | "Access your saved information" | "Review your saved notes and property details" | **CHANGED** | [VAGUE] |
| 5.3 | All other dashboard copy | Quick actions, getting started | — | **KEPT** | Clear, specific, on-brand |

---

## 6. ONBOARDING

9 changes across 5 files.

| # | File | Element | Before | After | Decision | Reason |
|---|------|---------|--------|-------|----------|--------|
| 6.1 | `welcome/page.tsx` | Welcome message | "What's your vibe? A few fun questions and we'll craft your unique match." | "A few quick questions so we can give you answers specific to your situation." | **CHANGED** | [TONE] Dating-app language, not property-intelligence tone |
| 6.2 | `welcome/page.tsx` | Info box | "This will only take 2-3 minutes and will help us provide with better recommendations." | "This takes 2-3 minutes and helps us give you guidance specific to your property." | **CHANGED** | [GRAMMAR] Missing "you"; [VAGUE] |
| 6.3 | `complete/page.tsx` | Description | "...customize your dashboard, insights, and tone." | "...customise your dashboard, guidance, and tone." | **CHANGED** | [SPELLING] |
| 6.4 | `complete/page.tsx` | Badge text | "Your personalized HomeTruth experience is ready!" | "Your personalised HomeTruth experience is ready!" | **CHANGED** | [SPELLING] |
| 6.5 | `quiz/page.tsx` | Step subtitle (all 8 steps) | "Help us personalize your experience..." | "Help us personalise your experience..." | **CHANGED** | [SPELLING] Applied via replace_all |
| 6.6 | `quiz-steps.tsx` | Q7 | "When your biggest fear about homebuying, in your own words?" | "What's your biggest fear about buying a home?" | **CHANGED** | [GRAMMAR] "When" should be "What's" |
| 6.7 | `quiz-steps.tsx` | Q8 | "What theories factors should we prioritize when recommending properties?" | "What factors should we prioritise when recommending properties?" | **CHANGED** | [GRAMMAR] [SPELLING] "theories" is a typo |
| 6.8 | `quiz-steps.tsx` | Q6 option | "Schoolcatchings" | "School catchment areas" | **CHANGED** | [GRAMMAR] |
| 6.9 | `quiz-steps.tsx` | Q6 text | "...we prioritize..." | "...we prioritise..." | **CHANGED** | [SPELLING] |
| 6.10 | `page.tsx` (signup) | Subtitle | "Join us to find your perfect home." | "Get real answers about your property." | **CHANGED** | [VAGUE] Positions product as property search, not intelligence |

---

## 7. WAITLIST PAGE — `app/waitlist/page.tsx`

5 changes, 4 keeps.

| # | Element | Before | After | Decision | Reason |
|---|---------|--------|-------|----------|--------|
| 7.1 | Hero headline | "All of the Truth. None of the Noise." | — | **KEPT** | Strong, confident, on-brand |
| 7.2 | Hero subhead | "Your home, fully understood." | — | **KEPT** | Clean, outcome-focused |
| 7.3 | About section heading | "The Home Truth Platform" | "The HomeTruth Difference" | **CHANGED** | [BANNED-WORD] "Platform" |
| 7.4 | About body | "We are building The Truth Platform, your single source of property truth." | "We are building your single source of property truth." | **CHANGED** | [BANNED-WORD] Removed "The Truth Platform" |
| 7.5 | Advisor heading | "Your Trusted Advisor" | "Your Property Guide" | **CHANGED** | [BANNED-PHRASE] Echoes banned "Your trusted partner" |
| 7.6 | Advisor desc | "An AI-powered helper guiding you through every aspect of homeownership." | "Guiding you through every aspect of homeownership. You stay in control — always." | **CHANGED** | [BANNED-WORD] |
| 7.7 | Three pillars | "One Source of Truth", "Clarity When It Counts", "No Nasty Surprises" | — | **KEPT** | Excellent brand-aligned copy |
| 7.8 | Copyright | "2025" | "2026" | **CHANGED** | Outdated year |
| 7.9 | Pillar descriptions | "Everything about your home, together and trusted." etc. | — | **KEPT** | Clean, outcome-focused |

---

## 8. SETTINGS PAGES

12 changes across 3 files.

### 8a. Preferences — `app/settings/preferences/page.tsx`

| # | Element | Before | After | Decision | Reason |
|---|---------|--------|-------|----------|--------|
| 8.1 | Page subtitle | "...prioritizes...personalizes...insights" | "...prioritises...personalises...guidance" | **CHANGED** | [SPELLING] x2 + [VAGUE] |
| 8.2 | Card title | "AI Behavior Settings" | "Assistant Behaviour" | **CHANGED** | [BANNED-WORD] [SPELLING] |
| 8.3 | Card desc | "Control how much the AI adapts to you." | "Control how much your assistant adapts to you." | **CHANGED** | [BANNED-WORD] |
| 8.4 | Tags desc | "Tags are used for AI search and checklist personalization." | "Tags are used for search and checklist personalisation." | **CHANGED** | [BANNED-WORD] [SPELLING] |
| 8.5 | Personalisation card title | "Personalization Settings" | "Personalisation Settings" | **CHANGED** | [SPELLING] |
| 8.6 | Toggle label | "...behavior to personalize..." | "...behaviour to personalise..." | **CHANGED** | [SPELLING] x2 |
| 8.7 | Toggle label | "...tone personalization" | "...tone personalisation" | **CHANGED** | [SPELLING] |

### 8b. Notifications — `app/settings/notifications/page.tsx`

| # | Element | Before | After | Decision | Reason |
|---|---------|--------|-------|----------|--------|
| 8.8 | Page subtitle | "...AI follow-ups..." | "...follow-ups..." | **CHANGED** | [BANNED-WORD] |
| 8.9 | Checklist desc | "...personalized..." | "...personalised..." | **CHANGED** | [SPELLING] |
| 8.10 | Toggle desc | "...scanned by AI." | "...reviewed." | **CHANGED** | [BANNED-WORD] |
| 8.11 | Card title | "AI Chat Follow-ups" | "Chat Follow-ups" | **CHANGED** | [BANNED-WORD] |
| 8.12 | Toggle label | "New AI insights available" | "New property guidance available" | **CHANGED** | [BANNED-WORD] |
| 8.13 | Card desc | "...platform improvements..." | "...product improvements..." | **CHANGED** | [BANNED-WORD] |
| 8.14 | Toggle desc | "...platform enhancements." | "...product updates." | **CHANGED** | [BANNED-WORD] |

### 8c. Data Privacy — `app/settings/data-privacy/page.tsx`

| # | Element | Before | After | Decision | Reason |
|---|---------|--------|-------|----------|--------|
| 8.15 | Page subtitle | "...personalized..." | "...personalised..." | **CHANGED** | [SPELLING] |
| 8.16 | Card title | "AI Personalization Preferences" | "Personalisation Preferences" | **CHANGED** | [BANNED-WORD] [SPELLING] |
| 8.17 | Card desc | "...behavior..." | "...behaviour..." | **CHANGED** | [SPELLING] |
| 8.18 | Toggle label | "...behavior-based personalization" | "...behaviour-based personalisation" | **CHANGED** | [SPELLING] x2 |
| 8.19 | Consent desc | "...the platform." | "...HomeTruth." | **CHANGED** | [BANNED-WORD] |

---

## 9. OTHER COMPONENTS

| # | File | Element | Before | After | Decision | Reason |
|---|------|---------|--------|-------|----------|--------|
| 9.1 | `components/chat-interface.tsx` | Label | "HomeTruth AI Assistant" | "HomeTruth Assistant" | **CHANGED** | [BANNED-WORD] |
| 9.2 | `components/chatbot.tsx` | Label | "HomeTruth AI Assistant" | "HomeTruth Assistant" | **CHANGED** | [BANNED-WORD] |
| 9.3 | `components/budget-intro-screen.tsx` | Greeting | "Hi, I'm your AI Financial Advisor!" | "Hi, I'm your mortgage calculator!" | **CHANGED** | [BANNED-WORD] Also potentially misleading |
| 9.4 | `components/budget-intro-screen.tsx` | Body | "...what kind of real estate best fits your lifestyle..." | "...what you can afford..." | **CHANGED** | [SPELLING] "real estate" is US English |
| 9.5 | `components/budget-intro-screen.tsx` | Prompt | "...down payment..." | "...deposit amount..." | **CHANGED** | [SPELLING] US English |
| 9.6 | `app/documents/page.tsx` | Sort option | "AI relevance" | "Most relevant" | **CHANGED** | [BANNED-WORD] Applied via replace_all to type + UI |
| 9.7 | `app/resources/page.tsx` | Card desc | "...powers the AI copilot." | "...powers your property assistant." | **CHANGED** | [BANNED-WORD] |
| 9.8 | `app/resources/page.tsx` | Default desc | "...personalize the experience." | "...personalise the experience." | **CHANGED** | [SPELLING] |
| 9.9 | `app/resources/page.tsx` | Hero desc | "...personalized outcomes..." | "...personalised outcomes..." | **CHANGED** | [SPELLING] |
| 9.10 | `app/layout.tsx` | Meta description | "AI-powered property guidance for buying, selling, and managing property with confidence" | "Real answers for your property decisions. Property intelligence for buying, owning, and managing your home." | **CHANGED** | [BANNED-WORD] |

---

## 10. NEW PAGES CREATED

Three pages created from copy specifications. These pages did not exist locally or on the live site.

### 10.1 About Page — `app/about/page.tsx`

**Source:** `copy_spec/hometruth-about-preview.html`

Created as a server component with the following sections:
- **Hero:** "We believe every homeowner deserves the full picture." / Subtext about clarity and control
- **Mission section:** What HomeTruth does and why
- **5 Values:** Real Answers Over Easy Answers, Clarity Over Complexity, Proactive Over Reactive, Evidence Over Opinion, Accessible Over Exclusive
- **4 Differentiators:** Property-specific answers, Document intelligence, Proactive guidance, Complete records
- **Proof stats:** 63% homeowners feel unprepared, 42% miss critical deadlines, £40K average cost of wrong decisions, 37% overpay on maintenance
- **CTA:** "Start getting real answers about your property"

Uses existing components: `Header`, `Footer`, `Card`, `CardContent`, `Button`, `Badge`.

### 10.2 Pricing Page — `app/pricing/page.tsx` + `app/pricing/faq-accordion.tsx`

**Source:** `copy_spec/hometruth-pricing-preview.html`

Created as a server component (page) + client component (FAQ accordion) with:
- **Hero:** "Simple, transparent pricing." / "Start free. Upgrade when you're ready."
- **3 Tiers:**
  - Free (£0): Chat, save notes, basic property profile
  - Pro (£8/month per property): Document chat, vault, notes & organisation, personalised answers, listing bookmarks, budget planner
  - Landlords (£6/month per property): Portfolio dashboard, tenant document packs, compliance calendar, multi-property chat
- **HomeTruth Report callout:** £29 one-off — full property intelligence report
- **3 Pricing FAQs:** Trial, cancellation, property count
- **CTA:** "Start making better property decisions"

Price confirmed by user at £8/month per property per the copy spec.

### 10.3 FAQ Page — `app/faq/page.tsx`

**Source:** `copy_spec/hometruth-faq-preview.html`

Created as a client component with accordion functionality:
- **Hero:** "Frequently Asked Questions" / "Everything you need to know about HomeTruth"
- **3 Categories, 8 Questions:**
  - Getting Started: What is HomeTruth? / How do I get started? / Is HomeTruth free?
  - Your Data: How is my data protected? / Can I delete my data?
  - How It Works: How does the property assistant work? / What documents can I upload? / Do you sell my information?
- **Contact CTA:** hello@hometruth.io

---

## 11. ITEMS INTENTIONALLY NOT CHANGED

| # | Location | Content | Reason for keeping |
|---|----------|---------|-------------------|
| 11.1 | API routes / system prompts | "AI" in server-side prompt instructions | Backend code, not consumer-facing copy |
| 11.2 | Code comments | "AI" in developer comments | Not visible to users |
| 11.3 | JavaScript API calls | `behavior: "smooth"` in scrollIntoView | JavaScript API parameter, not copy |
| 11.4 | Waitlist pillars | "One Source of Truth" / "Clarity When It Counts" / "No Nasty Surprises" | Already excellent brand-aligned copy |
| 11.5 | Chat intro message | "Hi! I'm your property assistant..." | Friendly, no violations |
| 11.6 | Sample questions | "How much stamp duty...", etc. | Specific, UK-focused, good |
| 11.7 | App footer tagline | "Built Around You." | Short, confident, on-brand |
| 11.8 | Document Vault card | Full card copy | Clear, no violations |
| 11.9 | Budget Planner card | Full card copy | Clear, acceptable |
| 11.10 | Quick action labels | Dashboard quick actions | Functional, clear |

---

## Summary

| Category | Count |
|----------|-------|
| **Total copy changes in existing files** | ~62 |
| **New pages created** | 3 (+1 supporting component) |
| **Banned word removals (AI, platform)** | 24 |
| **Spec-aligned rewrites** | 15 |
| **British English corrections** | 14 |
| **Tone/vague fixes** | 8 |
| **Grammar/typo fixes** | 4 |
| **Dead links wired up** | 5 |
| **Items kept as-is** | ~30 |

## Files Modified

**Existing files (19):**

1. `app/page.tsx` — 19 copy changes
2. `app/pro/page.tsx` — 11 copy changes (includes pricing to £8/mo)
3. `components/sidebar-nav.tsx` — 1 change
4. `components/footer.tsx` — 3 copy changes + link wiring + refactored to shared link arrays
5. `app/layout.tsx` — 1 change (meta description)
6. `components/chat-interface.tsx` — 1 change
7. `components/chatbot.tsx` — 1 change
8. `app/settings/preferences/page.tsx` — 7 changes
9. `app/settings/notifications/page.tsx` — 7 changes
10. `app/settings/data-privacy/page.tsx` — 5 changes
11. `app/onboarding/welcome/page.tsx` — 2 changes
12. `app/onboarding/complete/page.tsx` — 2 changes
13. `app/onboarding/quiz/page.tsx` — 1 change (applied to all 8 steps)
14. `components/onboarding/quiz-steps.tsx` — 4 changes
15. `app/onboarding/page.tsx` — 1 change
16. `app/waitlist/page.tsx` — 5 changes
17. `app/dashboard/page.tsx` — 2 changes
18. `components/budget-intro-screen.tsx` — 3 changes
19. `app/documents/page.tsx` — 1 change
20. `app/resources/page.tsx` — 3 changes

**New files (4):**

21. `app/about/page.tsx` — About page from copy spec
22. `app/pricing/page.tsx` — Pricing page from copy spec (£8/mo confirmed)
23. `app/pricing/faq-accordion.tsx` — FAQ accordion client component for pricing page
24. `app/faq/page.tsx` — FAQ page from copy spec
