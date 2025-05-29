# 🧠 Code Crux

> A powerful full-stack real-time collaborative coding platform powered by **Node.js**, **Express**, **Socket.IO**, and **React** with **Monaco Editor**. Supports role-based access control for seamless, scalable, and intuitive team coding sessions.

---

## 🚀 Features

- ⚡ Real-time collaborative coding using WebSockets
- 👥 Role-based access control:
  - 🛡️ **Admin**: Edit + Comment + Manage participants
  - ✍️ **Editor**: Edit only
  - 💬 **Commenter**: Comment only
- 🧠 Monaco Editor for powerful developer experience
- 🔗 RESTful API endpoints for session and user management
- 🛠️ Modular and clean architecture (backend + frontend)
- 🧩 In-memory session storage (MongoDB upgrade-ready)
- 🎯 Lightweight and production-ready

---

## 📁 Project Structure

```
ai-code-collab/
├── server/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── sockets/
│   ├── utils/
│   ├── index.js
│   └── package.json
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   └── styles.css
│   └── package.json
└── package.json (root)
```

---

## 🔧 Setup Instructions

### 📦 Step-by-Step Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/OJT-Sem-2-AI-Code-Collaborator-.git
   cd OJT-Sem-2-AI-Code-Collaborator-
   ```

2. **Install root dependencies**

   ```bash
   npm install
   ```

3. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Install frontend dependencies**

   ```bash
   cd frontend
   npm install
   cd ..
   ```

### 🚀 Run the Full App

Now run the entire application using:

```bash
npm run dev
```

This will **simultaneously start**:
- 🖥️ Frontend on `http://localhost:3001`
- ⚙️ Backend server on `http://localhost:5001`

> Powered by [`concurrently`](https://www.npmjs.com/package/concurrently) to handle both in parallel.

---

## 🔗 REST API Endpoints

### Users
- `POST /api/users` – Register user  
- `GET /api/users` – List all users

### Sessions
- `POST /api/sessions` – Create session  
- `GET /api/sessions` – List all sessions  
- `GET /api/sessions/:id` – Fetch specific session

---

## 📡 Socket.IO Events

| Event            | Direction        | Payload               | Description                        |
|------------------|------------------|------------------------|------------------------------------|
| `join-session`   | Client → Server  | `{ sessionId, user }`  | Join a specific session            |
| `code-change`    | Client → Server  | `{ code }`             | Send code update                   |
| `receive-code`   | Server → Client  | `{ code }`             | Receive and render updated code    |
| `send-comment`   | Client → Server  | `{ comment }`          | Post a comment                     |
| `receive-comment`| Server → Client  | `{ comment }`          | Receive and display comment        |
| `user-joined`    | Server → Client  | `{ user }`             | Notify others when someone joins   |

---

## 🧠 How It Works

- Users register with a **username** and select a **role**
- Join or create a **session**
- Backend handles user and session management
- Socket.IO enables **live collaboration**
- **Monaco Editor** handles real-time code updates
- Role-based rules apply to code and comments

---

## 🛠️ Tech Stack

**Frontend**  
- React.js  
- React Router   
- Socket.IO Client  
- Axios  

**Backend**  
- Node.js  
- Express.js  
- Socket.IO  
- UUID  
- CORS  

---

## 📌 Future Enhancements

- 🔐 JWT Authentication  
- 💾 MongoDB for persistent sessions  
- 🎬 Session History + Playback  
- 🌙 Theme toggling (Dark/Light)  
- 🛑 Admin Moderation Tools  
- 📂 File/Folder System    

---

## 👨‍💻 Contributors & Responsibilities

| Name       | Contribution |
|------------|--------------|
| **Soham** | Figma Design & Documentation, Backend – Role-Based Access Control, Minor Bug Fixes |
| **Prince** | Frontend – Editor Routing & Page Management |
| **Devesh** | Backend – Real-time Code Collaboration, Chat System, Input/Output Logic |
| **Sachin** | Frontend – Dashboard, Homepage, CSS, Login and Signup Pages |
| **Himkar** | Backend – Authentication System, JWT Integration, Google Auth, Session Timeout, Minor Bug Fixes |


---

## 🤝 Contributing

1. Fork this repo  
2. Create a new branch:

   ```bash
   git checkout -b feature/your-feature
   ```

3. Commit your changes:

   ```bash
   git commit -m "Add your feature"
   ```

4. Push and open a PR:

   ```bash
   git push origin feature/your-feature
   ```

---

**Made by Team Code Crux**
