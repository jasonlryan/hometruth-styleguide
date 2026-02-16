# Live site (hometruth.io) vs styleguide — what’s missing or different

Comparison of **all live pages** with the styleguide. Fixes already made: **Features** in header/footer now link to `/#who-we-help` (was `/#how-it-works`).

---

## 1. Homepage (`/`)

| Area | Live (hometruth.io) | Styleguide | Status |
|------|----------------------|------------|--------|
| **Hero headline** | "Make smarter decisions with HomeTruth" | "Your Property Intelligence Platform" | Different copy |
| **Hero subline** | "Ask questions. Save answers. Upload documents." | "Get real answers for your property decisions — from someone who actually knows." | Different copy |
| **Ask HomeTruth tagline** | "Your AI copilot for buying, **selling**, and managing property." | "Your property assistant for buying, **owning**, and managing your home." | Different (selling vs owning) |
| **Assistant label** | "Home Truth AI Assistant Online" | "HomeTruth Assistant" + "Online" badge | Slightly different |
| **Main middle section** | "OUR BRAND PURPOSE" (2 paragraphs) | Not present (you removed it) | Intentional |
| **Steps section** | "How It Works" — Ask Questions, Personalize Profile, Get Smart Insights, Save What Matters | Replaced by **Who We Help** (First-Time Buyers, Homeowners, Landlords) | Intentional — different section |
| **Trust & Security** | Encryption, GDPR Compliance, Privacy (short lines) | Complete Records, GDPR Compliant, Your Privacy | Different first card + copy |
| **Final CTA headline** | "Ready to Transform Your Property Journey?" | "Start Making Better Property Decisions" | Different |
| **Final CTA subline** | "Join thousands of homeowners who trust HomeTruth..." | "Free to start. No credit card required." | Different |
| **Nav "Features"** | — | Was `/#how-it-works` | **Fixed** → now `/#who-we-help` |

---

## 2. About (`/about`)

| Area | Live | Styleguide | Status |
|------|------|------------|--------|
| **Hero** | "About us" | "Property Intelligence for Everyone" | Different |
| **Intro** | UK-based firm, shake up UK property market, home shouldn’t be complicated | — | Missing in styleguide |
| **Who We Are** | AI-powered PropTech, mission, vision (UK’s most trusted, digitised lives vs paper property) | — | Replaced by "Our Mission" block | Different structure |
| **The Problem We Solve** | 4 cards: Outdated Models, Widespread Regret (68%), Inefficient Processes, Fragmented Information | — | Not on styleguide About | **Missing** |
| **Our Solution** | 3 cards: Comprehensive Home Management, AI-Powered Insights, Trusted Marketplace | — | Not on styleguide | **Missing** |
| **What Makes Us Unique** | "Three Unique Ingredients" — Behavioural AI Coach, Tamper-Evident Blockchain Ledger | — | Not on styleguide | **Missing** |
| **Styleguide-only** | — | "What We Believe" (5 values), "How We're Different" (4), "Why This Matters" (63%, 42%, £40K, 37%) | Extra content not on live |
| **CTA** | "Visit Our FAQ Section" | "Get Started Free" | Different |

**Summary:** Live About is structured as: Who We Are → Problem (4 cards) → Solution (3 cards) → What Makes Us Unique (AI Coach + Blockchain). Styleguide About is Mission → What We Believe → How We're Different → Stats. So **live structure and several sections are missing** in the styleguide.

---

## 3. FAQ (`/faq`)

| Area | Live | Styleguide | Status |
|------|------|------------|--------|
| **Structure** | Single list of questions | Categories: Getting Started, Your Data, How It Works | Different |
| **Live questions** | What is HomeTruth? How does HomeTruth help me manage my home? What makes HomeTruth different? How does the AI understand my needs? Who is HomeTruth for? Subscription plans? Data secure? What is the 'HomeTruth Report'? Long-term vision? | Mix of overlapping + different Qs in 3 categories | Some live Qs may be missing or reworded |
| **Contact** | "Still have any questions? … Contact us" | CTA + contact in footer | Present but different placement |

**Summary:** Align FAQ **questions** with live (add any missing, e.g. "What is the HomeTruth Report?", "Long-term vision?"). You can keep categories if you prefer.

---

## 4. Pricing (`/pricing`)

- **Live:** Fetch failed (page may be behind auth, different URL, or not present).
- **Styleguide:** Has `/pricing` with Free / Pro tiers, gradient accent, FAQ accordion.
- **Action:** Manually confirm live pricing URL and copy; then align if needed.

---

## 5. Other routes

| Page | Live | Styleguide |
|------|------|------------|
| **Contact** | Linked from FAQ ("Contact us") | Footer: `mailto:hello@hometruth.io`; no `/contact` page | No dedicated contact page in styleguide |
| **Resources** | Not checked | `/resources` exists | — |
| **Pro** | Not checked | `/pro` exists | — |
| **Waitlist** | Not checked | `/waitlist` exists | — |
| **Dashboard, Documents, Chat, Settings, etc.** | App/product pages | Present in styleguide | — |

---

## 6. Quick fix list

1. **Done:** Header and footer "Features" → `/#who-we-help`.
2. **Homepage (optional):** If you want to match live: hero headline/subline, Ask HomeTruth tagline, Trust first card (Encryption vs Complete Records), final CTA headline/subline.
3. **About:** Add or align with live: **The Problem We Solve** (4 cards), **Our Solution** (3 cards), **What Makes Us Unique** (Behavioural AI Coach, Tamper-Evident Blockchain). Optionally align hero and "Who We Are" copy.
4. **FAQ:** Add any missing live questions (e.g. "What is the HomeTruth Report?", "What is HomeTruth's long-term vision?"); keep or merge categories.
5. **Pricing:** Confirm live pricing URL and copy when available; align if needed.
6. **Contact:** Add a simple `/contact` page if you want a dedicated page instead of only mailto.

If you tell me which page to do first (About, FAQ, or homepage copy), I can apply the changes in the codebase next.
