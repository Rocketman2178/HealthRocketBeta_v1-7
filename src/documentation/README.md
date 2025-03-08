# Health Rocket Documentation

## Overview
Health Rocket is a gamified health optimization platform that helps users add 20+ years to their healthspan through engaging challenges, quests, and daily actions.

## Core Features

### 1. Challenge System
- **Regular Challenges**: 21-day focused improvements in specific health areas
- **Premium Challenges**: Contest-style challenges with entry fees and prize pools
- **Verification System**: In-app verification posts with specific requirements
- **Challenge Chat**: Real-time communication between challenge participants

### 2. Quest System
- 90-day transformational journeys
- Multiple related challenges
- Daily boost requirements
- Expert-driven protocols

### 3. Daily Boosts
- Quick daily actions for consistent progress
- Tier 1 and Tier 2 (Pro) boosts
- Burn streak system with bonuses
- Category-specific actions

### 4. Health Metrics
- HealthScore (1-10 scale)
- +HealthSpan years tracking
- Category-specific scores
- Monthly assessments

## Architecture

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Lucide React for icons
- Vite for development and building

### Backend
- Supabase for database and authentication
- Edge Functions for serverless operations
- Real-time subscriptions for live updates
- Row Level Security for data protection

### Payment Processing
- Stripe integration for premium features
- Secure payment processing
- Subscription management
- Prize pool distribution