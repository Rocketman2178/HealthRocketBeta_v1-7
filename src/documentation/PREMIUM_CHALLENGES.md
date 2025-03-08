# Premium Challenges System

## Overview
Premium Challenges are contest-style challenges that require entry fees and offer prize pools for top performers.

## Key Components

### Challenge Structure
- Entry fee requirement
- Minimum player threshold
- Fixed start date
- Prize pool distribution
- Verification requirements

### Registration Process
1. User views challenge details
2. Registers with entry fee
3. Stripe processes payment
4. User added to challenge roster

### Scoring System
- Daily verification posts
- Category-specific boosts
- Bonus point opportunities
- Real-time leaderboard

### Prize Distribution
- Top 10% share 75% of prize pool
- Top 50% get entry fee back
- Automated distribution via Stripe

## Technical Implementation

### Database Schema
```sql
-- Premium challenges table
CREATE TABLE premium_challenges (
  id uuid PRIMARY KEY,
  challenge_id text NOT NULL,
  entry_fee numeric(10,2) NOT NULL,
  min_players integer NOT NULL,
  start_date timestamptz NOT NULL,
  prize_pool numeric(10,2) NOT NULL
);

-- Registrations table
CREATE TABLE premium_challenge_registrations (
  id uuid PRIMARY KEY,
  premium_challenge_id uuid REFERENCES premium_challenges,
  user_id uuid REFERENCES users,
  payment_status text NOT NULL
);
```

### API Endpoints
- `create-premium-challenge-session`: Creates Stripe payment session
- `check-payment-status`: Verifies payment and registers user
- `get-challenge-leaderboard`: Retrieves current rankings
- `distribute-prizes`: Handles prize distribution

### Security Measures
- Payment verification
- Participation validation
- Score verification
- Prize distribution checks