# ClassApex Competitive Landscape & Parity Matrix

> **Version:** 1.0  
> **Date:** 2026-05-27  
> **Scope:** Global and regional LMS market analysis to guide ClassApex product vision, positioning, and roadmap priorities.  
> **Methodology:** Public API documentation review, pricing analysis, feature benchmarking against 12 direct and indirect competitors.

---

## 📊 Market Positioning Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                         LMS MARKET POSITIONING MAP (2026)                               │
│                                                                                         │
│  Enterprise / Institutional          │          SMB / Trainer / Creator                 │
│  (Universities, K-12, Corporate)     │          (Coaches, Bootcamps, SMEs)              │
│                                      │                                                  │
│     ┌──────────────────────┐         │         ┌──────────────────────┐                │
│     │  🏛️ Blackboard Ultra │         │         │  🎓 Teachizy.fr      │                │
│     │  🏛️ D2L Brightspace  │         │         │  🎓 Thinkific        │                │
│     │  🏛️ Canvas           │◄────────┼────────►│  🎓 Teachable        │                │
│     │  🏛️ Moodle Workplace │         │         │  🎓 LearnDash        │                │
│     └──────────────────────┘         │         └──────────────────────┘                │
│                                      │                                                  │
│  ────────────────────────────────────┼───────────────────────────────────────────────  │
│                                      │                                                  │
│     ┌──────────────────────┐         │         ┌──────────────────────┐                │
│     │  🏫 Google Classroom │         │         │  💼 TalentLMS        │                │
│     │  🏫 MS Teams Edu     │         │         │  💼 360Learning      │                │
│     │  🏫 Schoology        │         │         │  💼 Litmos           │                │
│     └──────────────────────┘         │         └──────────────────────┘                │
│                                                                                         │
│   High Customization / Open ──────────────────────────────►  Turnkey / SaaS-First       │
│                                                                                         │
│                         ⭐ CLASSAPEX TARGET ZONE ⭐                                     │
│              (Modern UI + Canvas API backbone + Open Architecture)                      │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏆 Competitor Profiles

### Tier 1 — Institutional Giants

| Competitor | Founded | Users (est.) | Primary Market | Deployment |
|:-----------|:-------:|:------------:|:---------------|:-----------|
| **Canvas (Instructure)** | 2008 | 45M+ students | Higher Ed, K-12 | Cloud / Self-hosted |
| **Moodle** | 2002 | 400M+ users | All segments | Self-hosted / Moodle Cloud |
| **Blackboard Ultra (Anthology)** | 1997 | 15M+ students | Higher Ed, Gov | Cloud |
| **D2L Brightspace** | 1999 | 15M+ students | Higher Ed, Corp | Cloud |
| **Google Classroom** | 2014 | 150M+ users | K-12 primarily | Cloud (free) |
| **Schoology (PowerSchool)** | 2009 | 20M+ users | K-12 primarily | Cloud |

### Tier 2 — Corporate & SMB

| Competitor | Founded | Users (est.) | Primary Market | Deployment |
|:-----------|:-------:|:------------:|:---------------|:-----------|
| **Microsoft Teams for Education** | 2017 | 100M+ users | K-12, Corp | Cloud (M365) |
| **TalentLMS (Epignosis)** | 2012 | 70K+ orgs | SMB, Corp training | Cloud |
| **360Learning** | 2013 | 2,000+ orgs | Corp, France | Cloud |
| **LMS365** | 2015 | 3M+ users | Microsoft shops | Cloud (SharePoint) |

### Tier 3 — Creator / Trainer Economy

| Competitor | Founded | Users (est.) | Primary Market | Deployment |
|:-----------|:-------:|:------------:|:---------------|:-----------|
| **Teachizy.fr** | 2020 | 5K+ trainers | FR freelancers, coaches | Cloud |
| **Thinkific** | 2012 | 50K+ creators | Course creators | Cloud |
| **Teachable** | 2014 | 100K+ creators | Course creators | Cloud |
| **LearnDash (WordPress)** | 2013 | 50K+ sites | WordPress sites | Plugin / Self-hosted |

---

## 🔬 Feature Parity Matrix

### Legend

| Symbol | Meaning |
|:------:|:--------|
| ⭐ **Best-in-class** | Industry leader for this capability |
| ✅ **Full** | Comprehensive implementation |
| 🟡 **Partial** | Limited or basic implementation |
| ❌ **Missing** | Not available |
| 💰 **Paid tier only** | Locked behind premium pricing |

---

### 1. Core Learning Experience

| Feature | Canvas | Moodle | Blackboard Ultra | D2L Brightspace | Google Classroom | MS Teams Edu | Schoology | ClassApex |
|:--------|:------:|:------:|:----------------:|:---------------:|:----------------:|:------------:|:---------:|:---------:|
| **Course authoring (RCE)** | ✅ | ✅ | ✅ | ✅ | 🟡 | 🟡 | ✅ | ✅ |
| **Module / topic structure** | ✅ | ✅ | ✅ | ✅ | 🟡 | 🟡 | ✅ | ✅ |
| **File management** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Page versioning / history** | ✅ | 🟡 | 🟡 | ✅ | ❌ | ❌ | 🟡 | ✅ |
| **Learning pathways / branching** | 🟡 | ✅ | 🟡 | ✅ | ❌ | ❌ | 🟡 | ✅ |
| **Mobile-native app** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡¹ |
| **Offline access** | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | ❌ |
| **LTI 1.3 / Advantage** | ✅ | ✅ | ✅ | ✅ | 🟡 | 🟡 | ✅ | ✅ |
| **SCORM 2004 / xAPI** | 🟡 | ✅ | 🟡 | ✅ | ❌ | ❌ | 🟡 | ✅ |

> ¹ ClassApex is PWA-ready but lacks a dedicated native app store presence.

---

### 2. Assessment & Evaluation

| Feature | Canvas | Moodle | Blackboard Ultra | D2L Brightspace | Google Classroom | MS Teams Edu | Schoology | ClassApex |
|:--------|:------:|:------:|:----------------:|:---------------:|:----------------:|:------------:|:---------:|:---------:|
| **Classic quizzes (MC, T/F, Essay)** | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | ✅ |
| **Advanced question types** | ✅ | ⭐ | ✅ | ✅ | ❌ | ❌ | 🟡 | ✅ |
| **Formula / calculated questions** | ✅ | ⭐ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Randomized question pools** | ✅ | ✅ | ✅ | ✅ | 🟡 | ❌ | ✅ | ✅ |
| **Question banks (shared)** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | 🟡 | ✅ |
| **Peer assessment / review** | ✅ | ✅ | 🟡 | ✅ | ❌ | ❌ | 🟡 | ✅ |
| **Rubric-based grading** | ✅ | ✅ | ✅ | ✅ | 🟡 | 🟡 | ✅ | ✅ |
| **Outcome / standards alignment** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | 🟡 | ✅ |
| **Proctoring integrations** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | 🟡 | 🟡² |
| **Plagiarism detection (Turnitin)** | ✅ | ✅ | ✅ | ✅ | 🟡 | 🟡 | ✅ | ✅ |
| **Quiz regrade on edit** | ✅ | ✅ | 🟡 | ✅ | ❌ | ❌ | ❌ | ✅ |
| **New Quizzes engine** | ✅ | ❌ | N/A | N/A | N/A | N/A | N/A | ✅³ |

> ² Proctoring checkbox exists in ClassApex UI but is not wired to a specific vendor API (placeholder).  
> ³ ClassApex routes to Canvas New Quizzes via iframe; full build/take/moderate lifecycle supported.

---

### 3. Communication & Collaboration

| Feature | Canvas | Moodle | Blackboard Ultra | D2L Brightspace | Google Classroom | MS Teams Edu | Schoology | ClassApex |
|:--------|:------:|:------:|:----------------:|:---------------:|:----------------:|:------------:|:---------:|:---------:|
| **Discussion forums (threaded)** | ✅ | ✅ | ✅ | ✅ | 🟡 | 🟡 | ✅ | ✅ |
| **Real-time chat / messaging** | 🟡 | 🟡 | ✅ | 🟡 | ✅ | ⭐ | 🟡 | ✅⁴ |
| **Announcements with scheduling** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Video conferencing integration** | ✅ | 🟡 | ✅ | ✅ | ✅ | ⭐ | 🟡 | ✅ |
| **Conferences (native)** | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| **Collaborative documents** | 🟡 | 🟡 | 🟡 | 🟡 | ⭐ | ⭐ | 🟡 | 🟡 |
| **Group workspaces** | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | ✅ | ✅ |
| **Inbox / Conversations** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Notifications (push, email, SMS)** | ✅ | 🟡 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅⁵ |
| **Calendar integration (iCal / ICS)** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

> ⁴ ClassApex Inbox supports threaded conversations with file attachments and bulk messaging via Canvas API.  
> ⁵ ClassApex has push notification subscription management (localStorage persistence) and Toast UI; delivery via Canvas notification preferences.

---

### 4. Analytics & Reporting

| Feature | Canvas | Moodle | Blackboard Ultra | D2L Brightspace | Google Classroom | MS Teams Edu | Schoology | ClassApex |
|:--------|:------:|:------:|:----------------:|:---------------:|:----------------:|:------------:|:---------:|:---------:|
| **Course-level analytics** | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | ✅ | ✅ |
| **Student engagement insights** | ✅ | 🟡 | ✅ | ✅ | 🟡 | ✅ | ✅ | ✅ |
| **Learning analytics (LA) standard** | 🟡 | ✅ | 🟡 | ✅ | ❌ | ❌ | 🟡 | 🟡 |
| **Predictive risk / at-risk students** | 💰 | ❌ | 💰 | 💰 | ❌ | 🟡 | 🟡 | ❌ |
| **Custom report builder** | ✅ | ✅ | ✅ | ✅ | ❌ | 🟡 | ✅ | ✅ |
| **Grade export (CSV, PDF)** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Admin audit logs** | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | ✅ | ✅ |
| **Real-time dashboards** | 🟡 | 🟡 | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ |
| **SIS integration (exports)** | ✅ | ✅ | ✅ | ✅ | 🟡 | 🟡 | ✅ | 🟡 |

---

### 5. Administration & Extensibility

| Feature | Canvas | Moodle | Blackboard Ultra | D2L Brightspace | Google Classroom | MS Teams Edu | Schoology | ClassApex |
|:--------|:------:|:------:|:----------------:|:---------------:|:----------------:|:------------:|:---------:|:---------:|
| **Role-based access control (RBAC)** | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | ✅ | ✅ |
| **Masquerade / view-as-student** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | 🟡 | ✅ |
| **Theme / brand customization** | ✅ | ⭐ | ✅ | ✅ | 🟡 | 🟡 | ✅ | ✅ |
| **Custom CSS injection** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Multi-tenancy / sub-accounts** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | 🟡 | ✅ |
| **Feature flags (toggle)** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **REST API depth** | ⭐ | ✅ | ✅ | ✅ | 🟡 | 🟡 | ✅ | ⭐⁶ |
| **GraphQL support** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 🟡 |
| **Webhooks / event streaming** | ✅ | ✅ | 🟡 | ✅ | ❌ | 🟡 | 🟡 | 🟡 |
| **Plugin / app marketplace** | ✅ | ⭐ | ✅ | ✅ | ❌ | 🟡 | ✅ | 🟡⁷ |
| **SAML / SSO / OAuth2** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Developer keys / API management** | ✅ | ✅ | 🟡 | ✅ | 🟡 | ✅ | 🟡 | ✅ |

> ⁶ ClassApex inherits Canvas's deep REST API and adds modern React Query caching, pagination, and rate-limit handling via `@schoolapex/core`.  
> ⁷ ClassApex supports LTI tool installation and global navigation placements; no dedicated marketplace UI yet.

---

### 6. AI & Automation

| Feature | Canvas | Moodle | Blackboard Ultra | D2L Brightspace | Google Classroom | MS Teams Edu | Schoology | ClassApex |
|:--------|:------:|:------:|:----------------:|:---------------:|:----------------:|:------------:|:---------:|:---------:|
| **AI-generated quiz questions** | 💰 | 🟡 | 💰 | 💰 | ❌ | ❌ | ❌ | ❌ |
| **AI writing assistant / feedback** | 💰 | ❌ | 💰 | 💰 | ❌ | ❌ | ❌ | ❌ |
| **Smart search (natural language)** | 🟡 | ❌ | 🟡 | 🟡 | ✅ | ✅ | 🟡 | 🟡 |
| **Auto-grading (AI-assisted)** | 🟡 | ❌ | 🟡 | 🟡 | ❌ | ❌ | ❌ | ❌ |
| **Intelligent recommendations** | 🟡 | ❌ | 🟡 | 🟡 | ❌ | ❌ | ❌ | 🟡 |
| **AI tutor / chatbot** | 💰 | ❌ | 💰 | 💰 | ❌ | ❌ | ❌ | 🟡⁸ |

> ⁸ ClassApex has an `AIAssistantDrawer.tsx` UI component but it is not yet wired to a generative AI backend.

---

### 7. Commerce & Monetization

| Feature | Canvas | Moodle | Blackboard Ultra | D2L Brightspace | Google Classroom | MS Teams Edu | Schoology | ClassApex |
|:--------|:------:|:------:|:----------------:|:---------------:|:----------------:|:------------:|:---------:|:---------:|
| **Course marketplace / catalog** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 🟡 |
| **Payment processing (native)** | ❌ | 🟡 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Subscription / cohort billing** | ❌ | 🟡 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Certificates / badges** | ✅ | ✅ | ✅ | ✅ | 🟡 | 🟡 | ✅ | ✅ |
| **Open Badges 2.0 / 3.0** | 🟡 | ✅ | 🟡 | 🟡 | ❌ | ❌ | 🟡 | 🟡 |

---

## 🎯 Niche Competitor Deep-Dive: Teachizy.fr

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             TEACHIZY.FR PROFILE                             │
│                                                                             │
│  🇫🇷 French market-focused LMS for independent trainers & SMEs              │
│  💶 Pricing: Free (Discovery) → €49/mo (PRO) → €99/mo (EXPERT)            │
│  📱 Native mobile app available                                             │
│  🔌 Integrations: Stripe, PayPal, Zapier, WordPress, Wix, GA, FB           │
│  ✅ Qualiopi-certified (French training funding compliance)                 │
│                                                                             │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐        │
│  │         STRENGTHS            │  │         WEAKNESSES           │        │
│  │ • Drip / unlockable lessons  │  │ • No 2FA / SAML              │        │
│  │ • Anti-stall email automation│  │ • Limited API depth          │        │
│  │ • AI copywriter for sales    │  │ • Single-language (FR)       │        │
│  │ • GDPR-native + Qualiopi     │  │ • No LTI / SCORM depth       │        │
│  │ • Clean, modern UI           │  │ • No institutional SIS       │        │
│  │ • Built-in payment collection│  │ • No advanced assessment     │        │
│  └──────────────────────────────┘  └──────────────────────────────┘        │
│                                                                             │
│  🎯 CLASSAPEX DIFFERENTIATOR:                                               │
│     Teachizy wins on monetization simplicity for solo trainers.             │
│     ClassApex wins on institutional scale, assessment depth,                │
│     LTI ecosystem, and multi-role academic workflows.                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Teachizy.fr vs. ClassApex — Side by Side

| Dimension | Teachizy.fr | ClassApex |
|:----------|:-----------:|:---------:|
| **Target user** | Solo trainer, coach, SME | School, university, training org |
| **Course limit** | Unlimited (paid tiers) | Unlimited (Canvas-backed) |
| **Quiz engine** | Basic (MC, T/F, fill-blank) | Full (9 types + formula + regrade) |
| **LTI support** | ❌ | ✅ |
| **SCORM support** | ❌ | ✅ |
| **Student view / role switching** | ❌ | ✅ |
| **Gradebook with analytics** | 🟡 | ✅ |
| **Payment collection** | ✅ (Stripe/PayPal native) | ❌ (not yet) |
| **Drip content / scheduling** | ✅ | ✅ (Canvas modules + requirements) |
| **Anti-stall / re-engagement** | ✅ (automated emails) | ❌ |
| **AI copywriter** | ✅ | ❌ |
| **Mobile app** | ✅ (native) | 🟡 (PWA-ready) |
| **White-label domain** | ✅ | ✅ (brand config + CSS) |
| **Multi-language** | ❌ (French only) | ✅ (i18n framework + locale switch) |
| **SIS integration** | ❌ | 🟡 (Canvas SIS imports) |

---

## 📈 Strategic Opportunity Map

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                    CLASSAPEX STRATEGIC OPPORTUNITY ZONES                                │
│                                                                                         │
│   HIGH IMPACT │  🚀 AI-Assisted Grading          🚀 Native Mobile App                 │
│               │  🚀 Predictive Analytics         🚀 Offline-First Sync                 │
│               │  🚀 Advanced Proctoring          🚀 Payment / Monetization Layer       │
│               │                                                                   │
│   MEDIUM      │  ✅ Smart Search (semantic)      ✅ Open Badges 3.0                  │
│   IMPACT      │  ✅ Webhook Event Streaming      ✅ Plugin Marketplace UI            │
│               │  ✅ Collaborative Whiteboard     ✅ Anti-Stall Engagement            │
│               │                                                                   │
│   LOW HANGING │  🟡 GraphQL API Gateway          🟡 Course Marketplace               │
│   FRUIT       │  🟡 AI Tutor Chatbot             🟡 Enhanced SIS Connectors         │
│               │                                                                   │
│   ────────────────────────────────────────────────────────────────────────────────   │
│                                                                                         │
│   DIFFICULTY  │  Low ◄──────────────────────────────────────────────────► High       │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 UI/UX Modernity Scorecard

| Platform | Design Language | Responsiveness | Accessibility (WCAG) | Dark Mode | Custom Themes |
|:---------|:---------------:|:--------------:|:--------------------:|:---------:|:-------------:|
| **Canvas Native** | Classic / utilitarian | ✅ | 2.1 AA | 🟡 (partial) | Limited |
| **Moodle 4.x** | Improved but dated | ✅ | 2.1 AA | 🟡 | Extensive |
| **Blackboard Ultra** | Modern, card-based | ✅ | 2.1 AA | ✅ | Limited |
| **D2L Brightspace** | Clean, corporate | ✅ | 2.1 AA | ✅ | Moderate |
| **Google Classroom** | Minimal, Google Material | ✅ | 2.1 AA | 🟡 | None |
| **MS Teams Edu** | Microsoft Fluent | ✅ | 2.1 AA | ✅ | Limited |
| **Schoology** | Functional | ✅ | 2.1 AA | 🟡 | Limited |
| **Teachizy.fr** | Modern, playful | ✅ | Unknown | 🟡 | Moderate |
| **ClassApex** | **Modern, custom design system** | ✅ | **2.1 AA target** | ✅ | **Deep (CSS vars + brand config)** |

> **ClassApex advantage:** Built on a custom CSS variable design system (`--cx-*` tokens) with runtime theme switching, high-contrast mode, reduced-motion support, and per-tenant brand configuration — exceeding native Canvas theming capabilities.

---

## 💰 Pricing Comparison (Annual, per-user approx.)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRICING LANDSCAPE (2026)                            │
│                                                                             │
│  FREE TIER          │  Google Classroom    │  Moodle (self-hosted)          │
│  ($0)               │  MS Teams Edu (M365) │  Canvas Free (limited)         │
│                     │                      │                                │
│  LOW ($5–15/user)   │  Schoology           │  Canvas K-12 / Higher Ed       │
│                     │  TalentLMS Basic     │  MoodleCloud Starter           │
│                     │                      │                                │
│  MID ($15–40/user)  │  D2L Brightspace     │  Blackboard Ultra              │
│                     │  Canvas Enterprise   │  360Learning                   │
│                     │                      │                                │
│  HIGH ($40+/user)   │  Blackboard Enterprise│  Custom Canvas / D2L          │
│                     │                      │                                │
│  CREATOR MODEL      │  Teachizy (€49–99/mo)│  Thinkific ($36–149/mo)        │
│  (flat rate)        │  Teachable ($39–199/mo)│  LearnDash ($199/yr)         │
│                                                                             │
│  CLASSAPEX POSITION │  Inherits Canvas pricing tier + modernization value  │
│                     │  (institutional license + ClassApex UI layer)        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛣️ ClassApex Roadmap Recommendations

### Phase 1 — Close Institutional Gaps (Q3 2026)
1. **Native Mobile Apps** (iOS / Android) — Gap vs. all major competitors.
2. **Advanced Proctoring API Integration** — Lock to Honorlock, Proctorio, or Respondus.
3. **Predictive Analytics Dashboard** — At-risk student identification using Canvas data.
4. **GraphQL API Gateway** — Reduce over-fetching and enable richer client queries.

### Phase 2 — Differentiate (Q4 2026)
5. **AI-Assisted Grading** — Auto-score essays and short answers with feedback suggestions.
6. **Semantic Smart Search** — Natural language query across courses, assignments, and people.
7. **Anti-Stall Engagement System** — Automated re-engagement emails + push notifications.
8. **Payment / Monetization Layer** — Course catalog with Stripe/PayPal checkout for open enrollment.

### Phase 3 — Market Expansion (2027)
9. **Plugin Marketplace** — Third-party React widget ecosystem for ClassApex.
10. **Regional Compliance Packs** — Qualiopi (FR), FERPA (US), GDPR (EU) audit certifications.
11. **Offline-First PWA** — Service worker sync for content and submissions.
12. **Creator Economy Tier** — Solo trainer pricing tier to compete with Teachizy / Thinkific.

---

## 📋 Summary Scorecard

| Competitor | Overall Score | Best For | Biggest Weakness | ClassApex Edge |
|:-----------|:-------------:|:---------|:-----------------|:---------------|
| **Canvas Native** | 8.5/10 | Institutions | Dated UI, slow feature cycle | Modern React UX, faster iteration |
| **Moodle** | 8/10 | Technical teams | Setup complexity, hosting burden | Zero-setup cloud + modern UI |
| **Blackboard Ultra** | 7.5/10 | Enterprise | Cost, vendor lock-in | Open API + customizability |
| **D2L Brightspace** | 7.5/10 | Corporate | UX friction | Student-centric design |
| **Google Classroom** | 6/10 | K-12 simplicity | No assessment depth | Full academic workflow support |
| **MS Teams Edu** | 6.5/10 | M365 schools | Not a true LMS | Purpose-built learning architecture |
| **Schoology** | 7/10 | K-12 districts | Limited higher-ed depth | Cross-segment flexibility |
| **TalentLMS** | 7/10 | SMB training | No academic features | Institutional + corporate hybrid |
| **Teachizy.fr** | 6/10 | FR solo trainers | No scale, no LTI | Enterprise depth + modern UX |
| **ClassApex** | **8/10** | **Modern institutions** | **Native app gap, no AI yet** | **Best-in-class UI on Canvas backbone** |

---

> **Document Owner:** ClassApex Product Team  
> **Next Review:** 2026-08-27  
> **Feedback:** Submit updates via PR to `docs/Competitor_Parity_Matrix.md`
