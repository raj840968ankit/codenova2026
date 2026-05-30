# CodeNova 🚀

A modern, full-stack AI-powered code collaboration platform built with **React**, **Node.js**, **MongoDB**, and **WebSocket** technology. CodeNova enables real-time collaborative coding with AI assistance powered by Google's Generative AI.

**🌐 Live Demo:** [https://codenova2026.vercel.app](https://codenova2026.vercel.app)

## ✨ Features

- **🤖 AI-Powered Code Generation** - Get intelligent code suggestions and completions using Google Gemini AI
- **👥 Real-Time Collaboration** - Write code together with multiple users simultaneously via WebSocket
- **🔐 Secure Authentication** - OAuth support (Google, GitHub) with JWT tokens
- **💾 MongoDB Integration** - Persistent data storage with Mongoose ODM
- **⚡ Redis Caching** - High-performance caching layer for optimized speed
- **📝 Monaco Editor** - Professional code editor with syntax highlighting
- **💬 Email Support** - Multiple email services (SendGrid, Resend, Nodemailer)
- **🎨 Beautiful UI** - Modern, responsive design with Tailwind CSS
- **📱 Full-Stack TypeScript Ready** - Scalable architecture

## 🏗️ Project Structure

```
CodeNova/
├── frontend/                  # React + Vite frontend
│   ├── src/
│   │   ├── pages/            # Application pages
│   │   ├── routes/           # Route configuration
│   │   ├── auth/             # Authentication logic
│   │   ├── context/          # React Context providers
│   │   ├── config/           # Configuration files
│   │   └── assets/           # Static assets
│   ├── package.json
│   ├── .env                  # Frontend environment variables
│   └── vite.config.js        # Vite configuration
│
├── backend/                   # Node.js + Express backend
│   ├── api/                  # API layer
│   ├── routes/               # Express routes
│   ├── controllers/          # Route controllers
│   ├── models/               # MongoDB schemas
│   ├── middleware/           # Express middleware
│   ├── services/             # Business logic
│   ├── oauth/                # OAuth configurations
│   ├── config/               # Server configuration
│   ├── app.js               # Express app setup
│   ├── server.js            # Server entry point
│   ├── package.json
│   ├── .env                 # Backend environment variables
│   └── vercel.json          # Vercel deployment config
│
└── documentation/            # Project documentation
```

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Monaco Editor** - Advanced code editor
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express 5** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Redis** - In-memory data store
- **Socket.io** - Real-time bidirectional communication
- **Google Generative AI** - AI-powered code assistance
- **JWT** - Authentication tokens

### Deployment
- **Vercel** - Frontend & Backend hosting
- **MongoDB Atlas** - Cloud database
- **Redis Cloud** - Cloud caching

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account
- Redis Cloud account
- Google OAuth credentials

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/yourusername/CodeNova.git
cd CodeNova
```

#### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

Fill in your environment variables in `.env`:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:3000
GOOGLE_AI_KEY=your_google_ai_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_secret
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_secret
MAIL_USER=your_email
MAIL_PASS=your_email_password
SENDGRID_API_KEY=your_sendgrid_key
ADMIN_JWT_SECRET=your_admin_secret
RESEND_API_KEY=your_resend_key
EMAIL_FROM=your_email_address
```

Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:3000`

#### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

Fill in your environment variables in `.env`:
```env
VITE_API_URL=http://localhost:3000
```

Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📖 Available Scripts

### Frontend
```bash
npm run dev      # Start Vite development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### Backend
```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start production server
npm run vercel-build  # Build for Vercel deployment
```

## 🔐 Environment Variables

### Backend (.env)
See [`backend/.env.example`](./backend/.env.example) for a complete reference.

Key variables:
- `MONGODB_URI` - MongoDB connection string
- `GOOGLE_AI_KEY` - Google Generative AI API key
- `JWT_SECRET` - Secret for JWT token signing
- `REDIS_HOST/PORT/PASSWORD` - Redis connection details
- OAuth credentials for Google and GitHub

### Frontend (.env)
See [`frontend/.env.example`](./frontend/.env.example) for a complete reference.

Key variables:
- `VITE_API_URL` - Backend API base URL

## 🔗 API Integration

The frontend communicates with the backend via:
- **REST API** - For CRUD operations and authentication
- **WebSocket (Socket.io)** - For real-time collaboration and AI responses

Base URL (development): `http://localhost:3000`

## 🌍 Deployment

### Frontend Deployment (Vercel)
```bash
# Build
npm run build

# Deploy to Vercel
vercel deploy
```

Update `VITE_API_URL` in frontend `.env` to production backend URL.

### Backend Deployment (Vercel)
Backend includes `vercel.json` for seamless deployment.

Ensure all environment variables are set in Vercel project settings.

## 🔑 OAuth Setup

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Set authorized redirect URIs: `http://localhost:3000/auth/callback`
6. Copy Client ID and Secret to `.env`

### GitHub OAuth
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth application
3. Set Authorization callback URL: `http://localhost:3000/auth/github/callback`
4. Copy Client ID and Secret to `.env`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 👨‍💻 Author

**Ankit Raj** - Full-stack developer and creator of CodeNova

## 📞 Support

For support, email rajankit840968@gmail.com or open an issue in the repository.

## 🙏 Acknowledgments

- Google Generative AI for AI capabilities
- MongoDB and Redis for data persistence
- Socket.io for real-time communication
- Vercel for deployment infrastructure
- React and Node.js communities

---

**Made with ❤️ by Ankit Raj**

**Live Link:** [https://codenova2026.vercel.app](https://codenova2026.vercel.app)
