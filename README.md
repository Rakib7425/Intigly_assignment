# CollabDocs - Real-time Collaborative Document Editor

A full-stack React and Node.js application with real-time collaboration features, similar to Google Docs. Built with modern technologies including Liveblocks for real-time collaboration, JWT authentication, and a clean, minimalistic UI.

## 🚀 Features

- **Real-time Collaboration**: Multiple users can edit documents simultaneously with live cursor positions and presence indicators
- **JWT Authentication**: Secure user authentication with JWT tokens
- **Document Management**: Create, read, update, and delete documents
- **Live User Presence**: See who's online and typing in real-time
- **Responsive Design**: Clean, minimalistic UI that works on all devices
- **Auto-save**: Documents are automatically saved as you type
- **WebSocket Communication**: Real-time updates using Socket.IO

## 🛠️ Tech Stack

### Frontend

- **React 18** with TypeScript
- **React Router** for navigation
- **Liveblocks** for real-time collaboration
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Vite** for build tooling

### Backend

- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** with Drizzle ORM
- **Redis** for caching and presence
- **Socket.IO** for WebSocket communication
- **JWT** for authentication
- **Liveblocks** server-side integration

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **Redis** (v6 or higher)
- **Yarn** or **npm**

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd collaborative-docs
```

### 2. Backend Setup

```bash
cd backend
yarn install
```

#### Environment Configuration

Create a `.env` file in the `backend` directory:

```bash
cp env.example .env
```

Update the `.env` file with your configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/collaborative_docs

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Liveblocks Configuration
LIVEBLOCKS_SECRET_KEY=sk_test_your-liveblocks-secret-key

# Server Configuration
PORT=3001
CORS_ORIGIN=http://localhost:5173

# Environment
NODE_ENV=development
```

#### Database Setup

1. Create a PostgreSQL database:

```sql
CREATE DATABASE collaborative_docs;
```

2. Run database migrations:

```bash
yarn db:repair
```

#### Start the Backend Server

```bash
yarn dev
```

The backend server will start on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend
yarn install
```

#### Environment Configuration

Create a `.env` file in the `frontend` directory:

```bash
cp env.example .env
```

Update the `.env` file:

```env
# Backend API URL
VITE_APP_BACKEND_URL=http://localhost:3001

# Liveblocks Configuration
VITE_LIVEBLOCKS_PUBLIC_KEY=pk_test_your-liveblocks-public-key
```

#### Start the Frontend Development Server

```bash
yarn dev
```

The frontend will start on `http://localhost:5173`

## 🔑 Liveblocks Setup

1. Sign up for a [Liveblocks](https://liveblocks.io) account
2. Create a new project in your Liveblocks dashboard
3. Copy your **Secret Key** and **Public Key** from the project settings
4. Add the **Secret Key** to your backend `.env` file as `LIVEBLOCKS_SECRET_KEY`
5. Add the **Public Key** to your frontend `.env` file as `VITE_LIVEBLOCKS_PUBLIC_KEY`

## 🚀 Running the Application

### Development Mode

1. Start the backend server:

```bash
cd backend
yarn dev
```

2. Start the frontend development server:

```bash
cd frontend
yarn dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Production Build

1. Build the frontend:

```bash
cd frontend
yarn build
```

2. Start the backend in production mode:

```bash
cd backend
yarn build
yarn start
```

## 📁 Project Structure

```
collaborative-docs/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # API controllers
│   │   ├── db/             # Database configuration and schema
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── socket/         # Socket.IO handlers
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   ├── drizzle/            # Database migrations
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── stores/         # State management
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Verify JWT token

### Documents

- `GET /api/documents` - Get all documents
- `GET /api/documents/:id` - Get document by ID
- `POST /api/documents` - Create new document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

### Liveblocks

- `POST /api/liveblocks/authorize` - Authorize user for Liveblocks room
- `GET /api/liveblocks/room/:roomId` - Get room information

## 🎨 UI Features

- **Clean Design**: Minimalistic interface inspired by modern document editors
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Real-time Indicators**: See who's online and typing
- **Auto-save**: Documents save automatically as you type
- **Error Handling**: User-friendly error messages and loading states

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: API endpoints require valid authentication
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Input Validation**: Server-side validation for all inputs

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**

   - Ensure PostgreSQL is running
   - Check your `DATABASE_URL` in the `.env` file
   - Verify database credentials

2. **Redis Connection Error**

   - Ensure Redis is running
   - Check your `REDIS_URL` in the `.env` file

3. **Liveblocks Connection Error**

   - Verify your Liveblocks API keys
   - Check that your Liveblocks project is active

4. **CORS Issues**
   - Ensure `CORS_ORIGIN` matches your frontend URL
   - Check that both servers are running on the correct ports

### Development Tips

- Use the browser's developer tools to check for console errors
- Check the backend logs for server-side errors
- Verify environment variables are loaded correctly
- Ensure all dependencies are installed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Liveblocks](https://liveblocks.io) for real-time collaboration features
- [React](https://reactjs.org) for the frontend framework
- [Express](https://expressjs.com) for the backend framework
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Drizzle ORM](https://orm.drizzle.team) for database management

## 📞 Support

If you encounter any issues or have questions, please:

1. Check the troubleshooting section above
2. Search existing issues in the repository
3. Create a new issue with detailed information about your problem

---

**Happy Collaborating! 🎉**
