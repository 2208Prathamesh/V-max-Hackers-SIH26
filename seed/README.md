# WeatherGPT Modular Seeding System

This directory houses the demo datasets and database population logic for development and testing.

## Directory Structure

```
seed/
├── data/
│   ├── alerts.seed.js          # Extreme, high, and moderate weather alerts
│   ├── conversations.seed.js   # Conversation histories and WeatherGPT messages
│   ├── locations.seed.js       # Geographic saved points across metros and extreme zones
│   ├── notifications.seed.js   # Read and unread notifications
│   ├── preferences.seed.js     # Default units and appearance configurations
│   └── users.seed.js           # Multi-user accounts for testing
├── index.js                    # Seeder engine with CLI argument support
└── README.md                   # Documentation
```

## How to Run

From root or backend:

```bash
# Seed fresh data (cleans old records and populates new demo data)
npm run seed

# Clean all collections without populating
npm run seed:clean

# Direct CLI execution
node seed/index.js --fresh
node seed/index.js --clean
```

## Default Demo Accounts

| Name | Email | Password |
|---|---|---|
| Sid Patil | `sidpatil@gmail.com` | `password123` |
| Aarav Sharma | `aarav.sharma@example.com` | `password123` |
| Elena Rostova | `elena.rostova@weathergpt.io` | `password123` |
