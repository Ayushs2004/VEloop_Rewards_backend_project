# Database Design & Ledger Schema — VELoop Rewards

## 1. Schema Specifications

### 1.1 `User` Collection
Stores authenticated user records, roles, and security credentials.
```javascript
{
  _id: ObjectId,
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  accountStatus: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'FLAGGED'], default: 'ACTIVE', index: true },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER', index: true },
  createdAt: Date,
  updatedAt: Date
}
```

### 1.2 `Wallet` Collection
Represents the user's current platform balances across all 5 virtual platform currencies.
```javascript
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true, unique: true, index: true },
  ves: { type: Number, default: 0, min: 0 },    // Primary redeemable currency
  sves: { type: Number, default: 0, min: 0 },   // Seasonal VEs
  gems: { type: Number, default: 0, min: 0 },   // VIP / Quest Gems
  tokens: { type: Number, default: 0, min: 0 }, // Arcade / Mini-game Tokens
  spins: { type: Number, default: 0, min: 0 },  // Reward Wheel Spins
  createdAt: Date,
  updatedAt: Date
}
```

### 1.3 `WalletTransaction` Collection (The Immutable Ledger)
Records every single credit, debit, reward, or adjustment that mutates a balance.
```javascript
{
  _id: ObjectId,
  transactionId: { type: String, required: true, unique: true, index: true },
  userId: { type: ObjectId, ref: 'User', required: true, index: true },
  currency: { type: String, enum: ['VEs', 'SVEs', 'Gems', 'Tokens', 'Spins'], default: 'VEs' },
  type: { type: String, enum: ['CREDIT', 'DEBIT'], required: true },
  amount: { type: Number, required: true, min: 0 },
  balanceBefore: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  source: { type: String, required: true }, // REWARD, BONUS, REFERRAL, WITHDRAWAL, WITHDRAWAL_REFUND, etc.
  referenceId: { type: String, index: true, default: null }, // e.g. withdrawalId
  status: { type: String, enum: ['SUCCESS', 'FAILED', 'PENDING'], default: 'SUCCESS', index: true },
  description: { type: String, required: true },
  metadata: { type: Mixed, default: {} },
  createdAt: Date,
  updatedAt: Date
}
```
**Compound Indexes:**
- `{ userId: 1, createdAt: -1 }` (Optimizes user transaction pagination)
- `{ userId: 1, currency: 1 }` (Optimizes currency filtering)

### 1.4 `Withdrawal` Collection
Tracks user redemption requests through the payout lifecycle.
```javascript
{
  _id: ObjectId,
  withdrawalId: { type: String, required: true, unique: true, index: true },
  userId: { type: ObjectId, ref: 'User', required: true, index: true },
  method: { type: String, enum: ['UPI', 'PAYPAL', 'AMAZON_GIFT_CARD', 'GOOGLE_PLAY_GIFT_CARD'], required: true, index: true },
  optionId: { type: String, required: true, index: true },
  currency: { type: String, default: 'VEs' },
  currencyAmount: { type: Number, required: true, min: 1 },
  payoutAmount: { type: Number, required: true, min: 0.01 },
  payoutCurrency: { type: String, default: 'INR' },
  payoutDetails: { type: Mixed, required: true },
  status: { type: String, enum: ['PENDING', 'PROCESSING', 'APPROVED', 'REJECTED', 'CANCELLED'], default: 'PENDING', index: true },
  rejectionReason: { type: String, default: null },
  reviewNote: { type: String, default: null },
  transactionId: { type: String, required: true, index: true },
  idempotencyKey: { type: String, index: true, default: null },
  requestedAt: { type: Date, default: Date.now },
  processedAt: { type: Date, default: null },
  createdAt: Date,
  updatedAt: Date
}
```
**Compound Indexes:**
- `{ userId: 1, idempotencyKey: 1 }` (unique: true, sparse: true)
- `{ userId: 1, createdAt: -1 }`
- `{ status: 1, createdAt: -1 }`

### 1.5 `PayoutOption` Collection
Database-driven catalog for denominations and exchange rates.
```javascript
{
  _id: ObjectId,
  optionId: { type: String, required: true, unique: true, index: true },
  method: { type: String, required: true, index: true },
  name: { type: String, required: true },
  type: { type: String, default: 'INSTANT_PAYOUT' },
  currency: { type: String, default: 'VEs' },
  payoutValue: { type: Number, required: true },
  payoutCurrency: { type: String, default: 'INR' },
  requiredAmount: { type: Number, required: true },
  active: { type: Boolean, default: true, index: true },
  eligibility: { type: Mixed, default: {} },
  metadata: { type: Mixed, default: {} },
  createdAt: Date,
  updatedAt: Date
}
```
**Compound Index:**
- `{ method: 1, active: 1 }`

### 1.6 `AuditLog` Collection
Stores immutable traces of sensitive operations.
```javascript
{
  _id: ObjectId,
  auditId: { type: String, required: true, unique: true, index: true },
  actorId: { type: ObjectId, ref: 'User', default: null, index: true },
  action: { type: String, required: true, index: true },
  targetUserId: { type: ObjectId, ref: 'User', default: null, index: true },
  targetType: { type: String, required: true },
  referenceId: { type: String, index: true },
  metadata: { type: Mixed, default: {} },
  ip: { type: String, default: null },
  userAgent: { type: String, default: null },
  createdAt: { type: Date, default: Date.now, index: true }
}
```

---

## 2. Ledger Reconstruction & Balance Verification Query

To verify that the current wallet balance matches the historical ledger sum:

```javascript
// MongoDB Aggregation Pipeline:
const ledgerAggregate = await WalletTransaction.aggregate([
  {
    $match: {
      userId: targetUserId,
      currency: 'VEs',
      status: 'SUCCESS'
    }
  },
  {
    $group: {
      _id: null,
      totalCredits: {
        $sum: { $cond: [{ $eq: ['$type', 'CREDIT'] }, '$amount', 0] }
      },
      totalDebits: {
        $sum: { $cond: [{ $eq: ['$type', 'DEBIT'] }, '$amount', 0] }
      }
    }
  },
  {
    $project: {
      calculatedNetBalance: { $subtract: ['$totalCredits', '$totalDebits'] }
    }
  }
]);

// Must equal Wallet.ves!
```
