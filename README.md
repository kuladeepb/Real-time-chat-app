
My interrnid-CITS1866

# Premium Real-Time Chat Application (MERN + Socket.IO)

A full-stack, real-time private messaging application styled with a sleek glassmorphic modern layout (reminiscent of WhatsApp & Telegram). Featuring real-time message delivery, online/offline presence states, last seen timestamps, live typing indicators, unread message count badges, dark/light theme toggles, and infinite scrolling message history.

---

## Technical Stack
- **Frontend**: React.js (Functional components & hooks), Vite, React Router, Context API, Tailwind CSS, Lucide Icons, Emoji Picker React, Axios.
- **Backend**: Node.js, Express.js, Socket.IO, JWT, bcrypt.
- **Database**: MongoDB (via Mongoose ODM).

---

## Project Structure

```text
/
├── client/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx
│       ├── index.css
│       ├── App.jsx
│       ├── components/
│       │   ├── ChatWindow.jsx
│       │   ├── Sidebar.jsx
│       │   ├── MessageBubble.jsx
│       │   └── ThemeToggle.jsx
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   └── Dashboard.jsx
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── SocketContext.jsx
│       ├── services/
│       │   └── api.js
│       └── utils/
│           └── helpers.js
└── server/
    ├── server.js
    ├── .env
    ├── config/
    │   └── db.js
    ├── controllers/
    │   ├── authController.js
    │   ├── messageController.js
    │   └── userController.js
    ├── models/
    │   ├── User.js
    │   └── Message.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── messageRoutes.js
    │   └── userRoutes.js
    ├── middleware/
    │   └── authMiddleware.js
    └── socket/
        └── socketHandler.js
```

---

## Environment Variable Configuration

### Server Configuration (`server/.env`)
Create a file named `.env` in the `server` directory:

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/chat_app
JWT_SECRET=supersecret_chat_jwt_key_998877
CLIENT_URL=http://localhost:5173
```

---

## MongoDB Schema Design

The application uses two core collections: `users` and `messages`.

### 1. User Schema (`User.js`)
Stores user credentials, profile descriptors (avatar URLs), and status details.

| Field Name | Type | Options | Description |
| :--- | :--- | :--- | :--- |
| `username` | String | Required, Unique, Trim, minLength: 3 | Unique display name. |
| `email` | String | Required, Unique, Lowercase, Trim | Email address used for authentication. |
| `password` | String | Required, minLength: 6 | BCRYPT hashed password string. |
| `avatar` | String | Default: `""` | Dicebear avatar svg URL. |
| `onlineStatus`| String | Enum: `['online', 'offline']`, Default: `'offline'` | Current connectivity status. |
| `lastSeen` | Date | Default: `Date.now` | Timestamp of last activity when offline. |
| `createdAt` | Date | Auto-managed | User registration timestamp. |
| `updatedAt` | Date | Auto-managed | Last profile update timestamp. |

### 2. Message Schema (`Message.js`)
Tracks direct messages exchanged, sorting dates, and read receipts.

| Field Name | Type | Options | Description |
| :--- | :--- | :--- | :--- |
| `senderId` | ObjectId | Ref: `'User'`, Required, Index | Sender's User ID. |
| `receiverId` | ObjectId | Ref: `'User'`, Required, Index | Recipient's User ID. |
| `content` | String | Required, Trim | Message text body. |
| `readStatus` | String | Enum: `['sent', 'delivered', 'seen']`, Default: `'sent'` | Read receipt indicator. |
| `createdAt` | Date | Auto-managed | Timestamp message was created. |

---

## REST API Documentation

All request bodies are JSON. Protected endpoints require the header `Authorization: Bearer <JWT_TOKEN>`.

### Authentication Routes

#### 1. Register User
- **Endpoint**: `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "_id": "64efc82...",
    "username": "johndoe",
    "email": "john@example.com",
    "avatar": "https://api.dicebear.com/...",
    "onlineStatus": "offline",
    "lastSeen": "2026-06-08T11:45:00.000Z",
    "token": "eyJhbGciOi..."
  }
  ```

#### 2. Authenticate / Login User
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "_id": "64efc82...",
    "username": "johndoe",
    "email": "john@example.com",
    "avatar": "https://api.dicebear.com/...",
    "onlineStatus": "online",
    "lastSeen": "2026-06-08T11:45:00.000Z",
    "token": "eyJhbGciOi..."
  }
  ```

#### 3. Get Current User Profile
- **Endpoint**: `GET /api/auth/me`
- **Access**: Private (JWT Required)
- **Response (200 OK)**:
  ```json
  {
    "_id": "64efc82...",
    "username": "johndoe",
    "email": "john@example.com",
    "avatar": "https://api.dicebear.com/...",
    "onlineStatus": "online",
    "lastSeen": "2026-06-08T11:45:00.000Z"
  }
  ```

---

### User/Contact Routes

#### 1. Search & List Users
Retrieves all other users in the platform. Appends metadata of the last message shared and unread count badges.
- **Endpoint**: `GET /api/users`
- **Query Params**: `search=johndoe` (optional regex search term)
- **Access**: Private (JWT Required)
- **Response (200 OK)**:
  ```json
  [
    {
      "_id": "64efd98...",
      "username": "maryjane",
      "email": "mary@example.com",
      "avatar": "https://api.dicebear.com/...",
      "onlineStatus": "online",
      "lastSeen": "2026-06-08T12:00:00.000Z",
      "lastMessage": {
        "content": "Hey! Did you check the build?",
        "createdAt": "2026-06-08T12:05:00.000Z",
        "senderId": "64efd98...",
        "readStatus": "delivered"
      },
      "unreadCount": 1
    }
  ]
  ```

---

### Message Routes

#### 1. Fetch Chat Messages (Paginated)
Retrieves the messages between the logged-in user and target user sorted chronologically. Supports cursor parameter `before` (timestamp ISO) to fetch preceding batches of older messages for infinite scrolling.
- **Endpoint**: `GET /api/messages/:userId`
- **Query Params**: `limit=30` (default: 30), `before=2026-06-08T12:00:00.000Z` (optional cursor)
- **Access**: Private (JWT Required)
- **Response (200 OK)**:
  ```json
  [
    {
      "_id": "64efe01...",
      "senderId": "64efc82...",
      "receiverId": "64efd98...",
      "content": "Hello Mary!",
      "readStatus": "seen",
      "createdAt": "2026-06-08T11:58:00.000Z",
      "updatedAt": "2026-06-08T11:58:10.000Z"
    }
  ]
  ```

#### 2. Mark Messages as Seen
Marks all unread messages sent by the specific user to the logged-in user as read.
- **Endpoint**: `PUT /api/messages/seen/:senderId`
- **Access**: Private (JWT Required)
- **Response (200 OK)**:
  ```json
  {
    "message": "Messages marked as seen",
    "modifiedCount": 3
  }
  ```

---

## Socket.IO Event Flow

Connection handshake intercepts the JWT token at `socket.handshake.auth.token`.

### Client Events (Sent from Client to Server)
1. **`send_message`**: Sends a new text message.
   - Payload: `{ receiverId: string, content: string }`
2. **`typing`**: Notifies the receiver that the sender is currently typing.
   - Payload: `{ receiverId: string }`
3. **`stop_typing`**: Notifies the receiver that the sender stopped typing.
   - Payload: `{ receiverId: string }`
4. **`mark_messages_seen`**: Notifies the sender that their messages to current user were read.
   - Payload: `{ senderId: string }`

### Server Events (Received by Client from Server)
1. **`online_users_list`**: Pushes the list of currently online user IDs.
   - Payload: `string[]` (Array of user IDs)
2. **`user_status_change`**: Notifies of status changes (online/offline) of another user.
   - Payload: `{ userId: string, onlineStatus: 'online'|'offline', lastSeen: Date }`
3. **`message_sent`**: Confirmation back to sender with saved message entity containing IDs/timestamps.
   - Payload: `{ _id, senderId, receiverId, content, readStatus, createdAt }`
4. **`receive_message`**: Forwards new message delivery payload to recipient.
   - Payload: `{ _id, senderId, receiverId, content, readStatus, createdAt }`
5. **`typing_status`**: Informs the client if their chat partner is typing.
   - Payload: `{ senderId: string, isTyping: boolean }`
6. **`messages_marked_seen`**: Confirmation that sent messages were viewed.
   - Payload: `{ seenBy: string }`

---

## Setup & Deployment Guide

### Prerequisites
- Node.js (v18+)
- MongoDB server running locally (or Atlas connection URI)

### Quick Start Installation

1. Navigate to the root project directory:
   ```bash
   cd /Users/leelagowtham/Downloads/project
   ```

2. Configure environment variables in `server/.env` (see section above).

3. Install all dependencies (both client and server packages) using the root script:
   ```bash
   npm run install-all
   ```

4. Launch both backend and client dev servers concurrently:
   ```bash
   npm run dev
   ```

5. Access the application in your browser:
   - URL: [http://localhost:5173](http://localhost:5173)

---

## Production Build & Deployment

To bundle the frontend for optimized production static file hosting:

1. Navigate to the client folder and build:
   ```bash
   cd client
   npm run build
   ```
   This generates static web files under `/client/dist`.

2. To serve these static assets directly from your Node/Express server, add static directories routing inside `server/server.js`:
   ```javascript
   import path from 'path';
   import { fileURLToPath } from 'url';
   const __filename = fileURLToPath(import.meta.url);
   const __dirname = path.dirname(__filename);

   app.use(express.static(path.join(__dirname, '../client/dist')));
   app.get('*', (req, res) => {
     res.sendFile(path.join(__dirname, '../client/dist/index.html'));
   });
   ```
3. Run the optimized backend environment:
   ```bash
   NODE_ENV=production npm start
   ```
