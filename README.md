# Vyay

> **A UPI-first expense splitting app built for India.**  
> Split expenses with friends, roommates, couples, and travel groups—without spreadsheets, manual calculations, or payment confusion.

Vyay is designed to make shared finances effortless by combining an intuitive mobile experience with a backend built for correctness, scalability, and future offline support.

---

## ✨ Features

- 💸 Create groups for trips, roommates, couples, events, and more
- 🧾 Add and split expenses using multiple split methods
- ⚖️ Real-time balance calculation
- 🤝 Settlement workflow between members
- 📱 UPI-first experience designed for Indian users
- 🎨 Modern Material-inspired UI with light & dark themes
- 🔐 Secure JWT authentication with refresh tokens
- 📷 QR identity generation _(scanner integration coming soon)_

---

# Tech Stack

## Mobile

- Expo SDK 53
- React Native 0.79
- Expo Router
- TypeScript

## State Management

- Zustand
- TanStack Query
- react-hook-form
- Zod

## UI

- @gorhom/bottom-sheet
- react-native-qrcode-svg
- react-native-reanimated
- react-native-gesture-handler
- FlashList
- Expo Vector Icons

## Camera

- react-native-vision-camera _(integrated, QR scanning coming soon)_

---

# Project Structure

```text
app/
├── (auth)/                Authentication screens
├── (tabs)/                Home, Friends, Account
├── (groupDetail)/         Group detail flow
└── _layout.tsx            Root layout
                            • Font loading
                            • Splash handling
                            • Silent login
                            • Global SheetHost

components/
├── account/               Account components
├── custom/
│   └── BottomSheet/       Global SheetHost
└── ui/                    Shared UI components

store/
├── authStore.ts
├── themeStore.ts
└── sheetStore.ts

constants/
├── ColorsV2.ts
└── Styles.ts

config/
└── urls.ts                Backend configuration
```

---

# Global Bottom Sheet Architecture

Instead of rendering a `BottomSheetModal` inside every screen, Vyay uses a **single global sheet host** mounted above the navigation tree.

This solves an issue where imperative bottom sheets can become stuck when driven by a boolean state (`isOpen`). Rather than toggling visibility, the app uses a monotonic counter that guarantees every open request is unique.

```tsx
openSheet(<IdentityQr value={inviteLink} />, {
  snapPoints: ["60%"],
});
```

### Why this approach?

- Single BottomSheet instance
- No prop drilling
- Accessible from anywhere
- Eliminates duplicate sheet implementations
- Prevents stale state bugs
- Keeps screens lightweight

> **Note:** Sheet content is rendered as a detached snapshot. Interactive sheet components should own their own local state instead of relying on parent re-renders.

---

# Getting Started

## 1. Clone the repository

```bash
git clone <repository-url>
cd vyay
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure the backend

Update `config/urls.ts` with your running **VyayCore** instance.

```ts
export const CORE_API_BASE_URL = "http://192.168.x.x:8080";
```

## 4. Start the app

```bash
npx expo start
```

Run using:

- Android Emulator
- Physical Android Device
- iOS Simulator (macOS)

---

# Backend

Vyay communicates with **VyayCore**, a Spring Boot backend responsible for authentication, expense management, settlements, and balance computation.

### Stack

- Spring Boot 3.5
- Java 21
- PostgreSQL 18
- Flyway
- Hibernate
- JWT Authentication

### Implemented

- Authentication
- Groups
- Members
- Expenses
- Settlements
- Balance Engine

### Planned

- Cloudflare R2 file storage
- Receipt uploads
- Group photos
- Push notifications
- Offline synchronization
- OCR receipt scanning
- Recurring expenses
- UPI deep-link settlements

---

# Design Principles

Vyay is built around a few core principles:

- **Correctness first** — financial data should always be accurate.
- **Fast interactions** — responsive UI with efficient caching.
- **Scalable architecture** — clear separation of UI, client state, and server state.
- **UPI-native** — designed around how users in India actually settle expenses.
- **Maintainability** — modular components with feature-oriented organization.

---

# Current Status

🚧 **Active Development**

### ✅ Completed

- Authentication
- Group management
- Expense creation
- Balance calculations
- Settlement workflow
- Global bottom sheet system
- Modern design system

### 🚀 In Progress

- QR scanning
- Receipt attachments
- Notifications
- Cloudflare R2 integration
- Offline support

---

# License

This project is currently under active development and is not yet licensed for public use.
