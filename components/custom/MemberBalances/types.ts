/**
 * A single member's net position within the group.
 *
 * Sign convention (same as the rest of the app):
 *   amount > 0  → the group owes them  → "gets back"
 *   amount < 0  → they owe the group   → "owes"
 *   amount ≈ 0  → settled
 */
export interface MemberBalance {
  /** Stable identity for list keys. Falls back to name+index if omitted. */
  id?: string | number;
  name: string;
  amount: number;
  avatarUrl?: string;
}
