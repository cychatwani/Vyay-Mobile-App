<div align="center">

# Vyay

**A UPI-first expense splitting app built for India.**

Split expenses with friends, roommates, couples, and travel groups — without spreadsheets, manual math, or payment confusion.

![Expo SDK](https://img.shields.io/badge/Expo-SDK%2053-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.79-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey)

</div>

Vyay pairs an intuitive mobile experience with a backend built for correctness and scale. This repository is the **mobile client**; the API lives in [VyayCore](#-backend).

---

## 📱 Screenshots

> _Coming soon._

---

## ✨ Features

- 🔐 **Secure auth** — email/password + Google sign-in, JWT with refresh tokens
- ⚡ **Silent login** — refresh-token handshake on launch, behind a branded Lottie splash
- 💸 **Groups & expenses** — trips, roommates, couples, events, with multiple split methods
- ⚖️ **Balance dashboard** — spend-by-category breakdown and recent expense feed
- 🤝 **Settlement workflow** between members
- 📷 **QR identity** — branded QR at high error-correction, plus native invite-link sharing
- 🎨 **Light & dark themes** on a semantic token system
- 🇮🇳 **UPI-first** experience designed for how India actually settles up

> **Status:** Auth is wired to the live backend. Group, expense, and settlement screens are built and run on local data while API integration lands.

---

## 🛠 Tech Stack

**Mobile** — Expo SDK 53 · React Native 0.79 · Expo Router · TypeScript

**State** — Zustand (client) · TanStack Query (server) · react-hook-form · Zod

**UI** — @gorhom/bottom-sheet · react-native-reanimated · react-native-gesture-handler · FlashList · react-native-qrcode-svg · Expo Vector Icons

**Camera** — react-native-vision-camera _(integrated; QR scanning in progress)_

---

## 🎨 Design System

Every colour resolves through a **semantic token layer** (`constants/ColorsV2.ts`). Components never touch a hex value — they ask for a _role_, and the active theme decides what it means.

**14 status roles**, each a complete set (`bg` · `surface` · `border` · `text` · `icon` · `solid` · `onSolid`), so any financial state renders as a subtle tint, an outlined chip, or a solid CTA without picking new colours:

`income` · `expense` · `success` · `error` · `warning` · `info` · `pending` · `processing` · `failed` · `refunded` · `danger` · `savings` · `invest` · `rewards`

One deliberate call worth calling out: **expense rose is softer than error red.** Overspending isn't a failure state, and colouring it like one makes the app feel punitive. `danger` is reserved for genuinely destructive actions.

Shared helpers in `constants/Styles.ts` encode the app's **elevation language** — one card surface, radius, hairline border, and shadow used everywhere — so surfaces stay consistent by construction, not by discipline. Spacing and radii come from a single scale; sizing is device-aware via `react-native-size-matters`.

A rebrand or a new theme is a token change, not a find-and-replace across sixty components.

---

## 🧩 Global Bottom Sheet Architecture

Instead of rendering a `BottomSheetModal` inside every screen, Vyay mounts a **single sheet host** above the navigation tree.

This solves a real failure mode: imperative sheets get stuck when driven by a boolean `isOpen`. Setting a flag to `true` when it's already `true` is a no-op — so one stuck flag means a permanently dead sheet. Vyay uses a **monotonic counter** instead, which guarantees every open request is unique and can never bail out silently.

```tsx
openSheet(<IdentityQr value={inviteLink} />, {
  snapPoints: ["60%"],
});
```

**Why:**

- One sheet instance for the whole app
- No prop drilling — callable from anywhere
- Screens stay lightweight; they own no sheet state
- Immune to stale-state bugs by construction

> **Note:** Sheet content is a detached snapshot. Interactive sheet components should own their local state rather than relying on parent re-renders.

---

## 🏗 Architecture

**Routing** — File-based via Expo Router. Route groups separate the auth flow, the tab navigator, and the group stack. The root layout owns fonts, the splash gate, and the silent-login redirect, so no screen has to reason about auth state.

**State** — Split by ownership. **Zustand** for client state (session, theme, sheet); **TanStack Query** for server state (fetching, caching, invalidation). Keeping them separate stops request lifecycle from tangling with local UI flags — a common source of stale-cache bugs.

**Forms** — `react-hook-form` for state, `zod` for schemas, shared `FormInput` / `FormButton` primitives. Validation rules live in one place.

**Networking** — A single `ApiHelper` wraps fetch with base-URL resolution, auth headers, and refresh-token retry. No screen builds a request by hand.

---

## 📁 Project Structure

```text
app/
├── (auth)/                Login flow
├── (tabs)/                Home · Friends · Account
├── (groupDetail)/         Group detail + photo view
└── _layout.tsx            Root layout
                             • Font loading
                             • Splash handling
                             • Silent login
                             • Global SheetHost

components/
├── account/               Identity card, QR, logout + confirm sheet
├── home/                  Balance, category breakdown, recent expenses, FAB
├── friends/               Friend + group cards, tab switcher
├── custom/BottomSheet/    SheetHost — the app's single sheet instance
└── ui/                    FormInput, FormButton, tab bar primitives

store/
├── authStore.ts           Session
├── themeStore.ts          Theme + token resolution
└── sheetStore.ts          Global sheet control

auth/                      Login, Google auth, refresh-token utils
schemas/                   Zod validation schemas
constants/                 Colours, spacing, typography, shared styles
utils/                     API helper, logger
config/                    URLs, storage keys
```

---

## 🚀 Getting Started

**Prerequisites** — Node 20+, [Expo CLI](https://docs.expo.dev/get-started/installation/), and an emulator or a device with Expo Go.

**1. Clone**

```bash
git clone https://github.com/cychatwani/Vyay-Mobile-App.git
cd Vyay-Mobile-App
```

**2. Install**

```bash
npm install
```

**3. Configure the backend**

Point `config/urls.ts` at your running VyayCore instance:

```ts
export const URL_CONFIGS = {
  CORE_API_BASE_URL: "http://192.168.x.x:8080",
};
```

**4. Run**

```bash
npx expo start
```

Then press `a` for Android, `i` for iOS, or scan the QR with Expo Go.

### Scripts

| Command           | Description               |
| ----------------- | ------------------------- |
| `npm start`       | Start the Expo dev server |
| `npm run android` | Build and run on Android  |
| `npm run ios`     | Build and run on iOS      |
| `npm run lint`    | Lint the project          |

---

## 🔌 Backend

Vyay talks to **VyayCore**, a Spring Boot service handling authentication, groups, expenses, balances, and settlements.

**Stack** — Spring Boot 3.5 · Java 21 · PostgreSQL 18 · Flyway · Hibernate · JWT

**Implemented** — Authentication · Groups · Members · Expenses · Settlements · Balance engine

**Planned** — Cloudflare R2 file storage · Receipt uploads · Group photos · Push notifications · Offline sync · OCR receipt scanning · Recurring expenses · UPI deep-link settlements

---

## 🎯 Design Principles

- **Correctness first** — financial data should always be accurate.
- **Fast interactions** — responsive UI with efficient caching.
- **Scalable architecture** — clear separation of UI, client state, and server state.
- **UPI-native** — designed around how users in India actually settle expenses.
- **Maintainability** — modular, feature-oriented organisation.

---

## 🚧 Current Status

**Active development.**

**Shipped** — Authentication · Design system & theming · Global bottom sheet architecture · Account, home, friends, and group screens · QR identity

**In progress** — API integration for groups/expenses/settlements · QR scanning · Receipt attachments · Notifications · Offline support

---

## 📄 License

Under active development; not yet licensed for public use.

<div align="center">
Built by <a href="https://github.com/cychatwani">Chirag Chatwani</a>
</div>
