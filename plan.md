# Implementation Plan - Dashboard & Profile Enhancements

This plan outlines the steps to fulfill the user's request for profile management, real-time balance updates, agent status workflow, and UI refinements.

## 1. Type & Translation Updates
- Update `User` interface in `src/types/index.ts` to include `username`.
- Update translation files (`en.json`, etc.) with new keys for "Flight Booking", "Agent Status", and form fields.

## 2. Profile & Authentication Enhancements
- **Profile Icon**: Replace Dicebear avatars with Lucide `User` icons in `Dashboard.tsx` and `ProfileView`.
- **Edit Profile Modal**: 
    - Update `src/components/EditProfileModal.tsx` to include `username` and `password` fields.
    - Implement `supabase.auth.updateUser({ password })` for secure password updates.
    - Implement `profiles` table update for `username`, `full_name`, and `phone`.

## 3. Real-time Wallet Updates
- In `src/App.tsx`, refine the profile fetching logic or add a real-time subscription to the `profiles` table for the current user's ID to update the `user` state whenever `wallet_balance` changes.

## 4. Agent Status Workflow
- Create `src/components/AgentUpgradeModal.tsx`.
- Implement validation logic:
    - Check if `joinedAt` is >= 7 days ago.
    - Query `transactions` table for the last 7 days where `status = 'success'` and sum the `amount`.
    - Verify if sum >= 10,000.
- Form fields: Address, Target Users, Date of Birth.
- Submit to a new `agent_requests` table or handle via a flag in `profiles`.

## 5. Dashboard UI Refinements
- **Quick Services**: 
    - Initially show only DATA, AIRTIME, CABLE, ELECTRICITY.
    - Add "Flight Booking" to the full list.
    - "View All" button to expand/collapse or open a full services list.
- **Transaction History**:
    - Make "See All" navigate to the transactions tab.
    - Add search (by TXID) and filter (by type) to the `TransactionsView`.
- **Referral Section**:
    - Update the promotion card to show the referral code explicitly with a "Copy" button.
- **Mobile FAB**:
    - Change the FAB click action to open a `ServicesModal` showing all available services.
- **Mobile Logout**:
    - Ensure the logout icon in the mobile nav is functional (currently calling `onLogout`).

## 6. Verification
- Validate build.
- Test all flows: Profile update, Agent upgrade validation, Transaction filtering, Mobile FAB.
