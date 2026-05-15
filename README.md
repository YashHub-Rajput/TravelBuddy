# ✈️ TravelBuddy – Smart Travel Companion Finder

A full-stack MERN application that connects travelers with compatible companions using a smart matching algorithm.

---

## 🏗️ Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Auth**: JWT
- **Real-time**: Socket.io
- **Security**: bcryptjs, helmet, rate-limiting

---

## 📁 Project Structure

```
travelbuddy/
├── client/                  # React frontend (Vite)
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── pages/           # Route-level page components
│       ├── services/        # Axios API calls
│       ├── hooks/           # Custom React hooks
│       ├── context/         # React Context (Auth, Socket)
│       └── utils/           # Helper functions
├── server/                  # Node.js + Express backend
│   ├── controllers/         # Request handlers (MVC)
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express routes
│   ├── middlewares/         # Auth, error, validation
│   ├── services/            # Business logic (matching, socket)
│   ├── config/              # DB connection
│   └── utils/               # Helper utilities
└── README.md
```

---

## ⚡ Quick Start (Development)

### Prerequisites
- Node.js v18+ and npm v9+
- MongoDB (local or Atlas)

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/travelbuddy.git
cd travelbuddy

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure Environment
```bash
# In /server, copy the example env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Run in Development
```bash
# Terminal 1 – Start backend
cd server && npm run dev

# Terminal 2 – Start frontend
cd client && npm run dev
```

App runs at: http://localhost:3000

---

## 🧠 Matching Algorithm

The scoring function weights three factors:

| Factor           | Weight | Description |
|-----------------|--------|-------------|
| Date Overlap     | 40%    | % of trip dates that overlap |
| Interest Match   | 35%    | Jaccard similarity of interest sets |
| Budget Similarity| 25%    | Range overlap score |

Final score: 0–100

---

## 🔐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login & get JWT |
| GET | /api/auth/me | Get current user |

### Trips
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/trips | Browse public trips |
| POST | /api/trips | Create trip |
| GET | /api/trips/my | My trips |
| GET | /api/trips/:id | Single trip |
| PUT | /api/trips/:id | Update trip |
| DELETE | /api/trips/:id | Delete trip |
| POST | /api/trips/:id/join | Request to join |

### Matches
| GET | /api/matches | Get top matches |

### Chat
| GET | /api/chats | My conversations |
| POST | /api/chats/direct/:userId | Start DM |
| GET | /api/chats/:id/messages | Load messages |

### Expenses
| POST | /api/expenses | Add expense |
| GET | /api/expenses/trip/:id | Trip expenses |
| PATCH | /api/expenses/:id/settle/:userId | Mark paid |
