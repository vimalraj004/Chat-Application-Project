# Chat Application

## Introduction

This is a fully functional **Chat Application** built using the MERN stack and Socket.IO for real-time communication. The application allows users to connect, chat, and manage groups efficiently. It also features an intuitive UI with both light and dark modes.

---

## Features

### 1. **User Registration & Authentication**
   - Register with **Name, Email, Password, and Profile Picture**.
   - Secure login system to access your account.

### 2. **Online Users**
   - View all registered users.
   - Start **one-to-one conversations** with any user.
   - **Delete all messages for everyone** functionality for private chats.

### 3. **Available Groups**
   - View groups you are part of.
   - Receive notifications when added to a group.
   - **Admin-only functionalities**:
     - Add members to the group.
     - Remove members from the group.
   - **Self-exit** option available for all users.

### 4. **Create Group Chat**
   - Create a new group chat with:
     - **Group Name**.
     - **Group Display Picture (DP)**.
     - Ability to add up to **5 members at a time**.
   - Notifications are sent to all members when a group is created.

### 5. **Dark Mode/Light Mode**
   - Switch between dark and light themes for better user experience.

### 6. **Logout**
   - Securely logout from the application.

---

## Technologies Used

### Frontend:
   - **React.js**
   - **Redux** for state management.
   - **Socket.IO** for real-time messaging.
   - **Canva.js** for editing profile pictures.
   - **Debounce** functionality for optimizing user search.

### Backend:
   - **Node.js**
   - **Express.js**
   - **MongoDB** for database management.
   - **Multer** for handling file uploads (Profile pictures).
   - Advanced MongoDB features like **populate** and **select**.

### Deployment:
   - **Frontend** hosted on **Vercel**.
   - **Backend** hosted on **AWS EC2**.
   - **NGINX** used as a reverse proxy.
   - **SSL Certificates** configured for secure connections.

---

## Key Learnings

1. **Real-Time Communication**:
   - Implemented with Socket.IO for real-time message sending and receiving.
2. **MongoDB Advanced Features**:
   - Learned about **populate**, **select**, and advanced query techniques.
3. **Deployment**:
   - Gained experience with **AWS EC2** and **NGINX** for backend hosting.
   - Configured SSL certificates for secure connections.

---

## Future Enhancements

1. **Face Recognition Login**:
   - Implement a secure and convenient **face recognition login** system for enhanced authentication.

2. **Voice-to-Text Messaging**:
   - Add a feature where users can simply **speak**, and the app will automatically convert speech into text for seamless chatting.

3. **Additional Multimedia Features**:
   - Enable sharing of multimedia files like images, videos, and documents in chats.

4. **Improved Group Management**:
   - Introduce group-level settings for message pinning and announcements.


