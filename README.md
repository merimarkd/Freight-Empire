# Freight Empire Server

Backend server for Freight Empire MMO — a persistent, real-time multiplayer freight logistics business simulation.

## Project Structure

freight-empire-server/

├── server.js              # Main entry point

├── package.json           # Dependencies

├── .env.example           # Environment template

├── .gitignore

├── README.md              # Setup & deployment guide

├── src/

│   ├── db/

│   │   └── connection.js  # PostgreSQL pool & schema

│   ├── routes/

│   │   ├── auth.js        # Player & company endpoints

│   │   └── game.js        # Game mechanics endpoints

│   ├── models/            # (TBD) Database models

│   ├── middleware/        # (TBD) Auth, validation

│   └── utils/             # (TBD) Helpers, constants

└── public/                # (TBD) Frontend static files

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Real-time**: Socket.io
- **Database**: PostgreSQL (managed via DigitalOcean)
- **Hosting**: DigitalOcean Droplet

## Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/freight-empire-server.git
cd freight-empire-server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your DigitalOcean Database credentials:
- `DB_HOST` — Your managed database hostname
- `DB_NAME` — `freight_empire`
- `DB_USER` — Your database user
- `DB_PASSWORD` — Your secure password
- `DB_PORT` — Usually `25060` for DigitalOcean managed DB

### 4. Run Locally (Development)

```bash
npm run dev
```

Server will start on `http://localhost:5000`

Check health: `curl http://localhost:5000/health`

Check DB connection: `curl http://localhost:5000/db-health`

### 5. Deploy to DigitalOcean Droplet

**From your local machine:**

```bash
# SSH into the droplet
ssh -i /path/to/your/ssh/key root@143.198.176.234

# Once connected, run:
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git

# Clone the repo
git clone https://github.com/yourusername/freight-empire-server.git
cd freight-empire-server

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your real DB credentials
nano .env

# Test the server
npm run dev

# Once verified, set up PM2 for persistent background running
sudo npm install -g pm2
pm2 start server.js --name freight-empire
pm2 startup
pm2 save
```

## API Endpoints

### Authentication
- `POST /api/auth/create-company` — Create new company + player
- `POST /api/auth/load-company` — Load existing company
- `GET /api/auth/player/:playerId` — Get full player state

### Game Mechanics
- `POST /api/game/buy-truck` — Purchase a truck
- `POST /api/game/hire-driver` — Hire a driver
- `POST /api/game/assign-driver` — Assign driver to truck
- `POST /api/game/create-load` — Create a freight load
- `POST /api/game/assign-load` — Assign load to truck
- `GET /api/game/trucks/:companyId` — Get all trucks
- `GET /api/game/drivers/:companyId` — Get all drivers
- `GET /api/game/loads/:companyId` — Get all loads

## Database Schema

Automatically created on startup. Tables:
- `companies` — Company/carrier data
- `players` — Player accounts
- `trucks` — Fleet vehicles
- `drivers` — Driver roster
- `loads` — Freight loads

## Socket.io Events

**Client → Server:**
- `player-join` — Player connects to game world

**Server → Client:**
- `player-status` — Broadcast player online/offline status

## Next Steps (Phase 2+)

- [ ] Complete database schema (HQ upgrades, violations, inspections, etc.)
- [ ] Implement simulation engine (ticks, tick order, truck movement)
- [ ] Add authentication middleware
- [ ] Implement ISS scoring algorithm
- [ ] Integrate real-time load board API
- [ ] Add weather/NOAA integration
- [ ] Build real-time truck tracking via Socket.io
- [ ] Deploy frontend (Cloudflare Workers)

## Monitoring

Check server logs:
```bash
pm2 logs freight-empire
```

Check database connection:
```bash
curl http://your-server-ip:5000/db-health
```

## Support

For issues or questions, check the project repository or contact the developer.
