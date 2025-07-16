# 💬 ChatTrip - Real-time Chat Application

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101" alt="Socket.io"/>
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express.js"/>
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" alt="JWT"/>
</div>

## 🌟 Overview

ChatTrip is a modern, feature-rich real-time chat application built with the MERN stack (MongoDB, Express.js, React, Node.js) and Socket.io. It provides a seamless communication experience with advanced features like group chats, real-time messaging, file sharing, and much more.

## ✨ Key Features

### 🔐 Authentication & Security

- **JWT Authentication**: Secure token-based authentication system
- **Email OTP Verification**: Two-factor authentication via email
- **Password Encryption**: BCrypt hashing for secure password storage
- **Protected Routes**: Middleware-based route protection
- **Session Management**: Automatic token refresh and session handling
- **Rate Limiting**: Protection against spam and abuse
- **Input Validation**: Comprehensive server-side validation
- **Security Headers**: XSS protection, CORS, and security headers

### 👤 User Management

- **User Registration**: Create accounts with email validation
- **User Authentication**: Secure login/logout functionality
- **Profile Management**: Edit name and profile picture
- **Avatar Upload**: Secure image upload with Cloudinary integration
- **User Search**: Search and find other users
- **Profile Customization**: Personalized user profiles

### 💬 Real-time Messaging

- **Instant Messaging**: Real-time message delivery with Socket.io
- **Message History**: Persistent message storage and retrieval
- **Typing Indicators**: Real-time typing status display
- **Smart Notifications**: Context-aware notification system
- **Message Persistence**: Messages saved across sessions
  <!-- - **Message Timestamps**: Detailed message timing information -->
  <!-- - **Message Status**: Read receipts and delivery confirmations -->

### 👥 Group Chat Features

- **Create Groups**: Start group conversations with multiple users
- **Group Management**: Add/remove members, rename groups
- **Group Admin**: Admin privileges for group management
- **Member Management**: View and manage group participants
- **Group Info**: Detailed group information and settings
- **Group Search**: Find and join existing groups
<!-- - **Group Notifications**: Customizable group notification settings -->

### 🎨 User Interface & Experience

- **Dark/Light Mode**: Toggle between themes with persistence
- **Responsive Design**: Mobile-first, cross-device compatibility
- **Modern UI**: Clean, intuitive interface with Chakra UI
- **Real-time Updates**: Live UI updates without page refresh
- **Smooth Animations**: Engaging micro-interactions
- **Loading States**: Informative loading indicators
- **Error Handling**: User-friendly error messages
- **Accessibility**: WCAG compliant interface elements

### 🔧 Technical Features

- **Real-time Communication**: WebSocket-based instant messaging
- **File Upload**: Secure image sharing with validation
- **Cloud Storage**: Cloudinary integration for media files
- **Database**: MongoDB with Mongoose ODM
- **API Design**: RESTful API with proper HTTP methods
- **Error Handling**: Comprehensive error management
- **Environment Configuration**: Secure environment variable handling
- **Middleware**: Custom middleware for authentication and validation

## 🛠️ Technology Stack

### Frontend

- **React 19.1.0**: Modern React with hooks and context
- **Chakra UI 3.22.0**: Modern component library
- **React Router 7.6.3**: Client-side routing
- **Socket.io Client 4.8.1**: Real-time communication
- **Axios 1.10.0**: HTTP client for API requests
- **React Lottie**: Beautiful animations
- **Lucide React**: Modern icon library

### Backend

- **Node.js**: JavaScript runtime environment
- **Express.js 5.1.0**: Web application framework
- **Socket.io 4.8.1**: Real-time bidirectional communication
- **MongoDB**: NoSQL database
- **Mongoose 8.16.3**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **BCrypt**: Password hashing
- **Multer**: File upload handling
- **CORS**: Cross-origin resource sharing

### Cloud Services

- **Cloudinary**: Image and video management
- **MongoDB Atlas**: Cloud database hosting

### Development Tools

- **Nodemon**: Development server with hot reload
- **ESLint**: Code linting and formatting
- **Git**: Version control system

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/chattrip.git
   cd chattrip
   ```

2. **Install dependencies**

   ```bash
   # Install backend dependencies
   npm install

   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

3. **Environment Setup**

   Create `.env` file in the root directory:

   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net
   DB_NAME=chattrip

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   CLOUDINARY_UPLOAD_PRESET=your_upload_preset

   # Security Configuration
   CORS_ORIGIN=http://localhost:3000
   MAX_FILE_SIZE=5242880
   ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
   ```

   Create `frontend/.env` file:

   ```env
   # Frontend Configuration
   REACT_APP_API_URL=http://localhost:5000

   # Cloudinary Configuration
   REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
   REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

   # Upload Configuration
   REACT_APP_MAX_FILE_SIZE=5242880
   REACT_APP_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
   ```

4. **Start the application**

   ```bash
   # Start backend server
   npm start

   # In another terminal, start frontend
   cd frontend
   npm start
   ```

5. **Open your browser**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

## 📱 Application Structure

```
chattrip/
├── backend/
│   ├── config/
│   │   ├── db.js                 # Database configuration
│   │   ├── cloudinary.js         # Cloudinary setup
│   │   └── generateToken.js      # JWT token generation
│   ├── controllers/
│   │   ├── userControllers.js    # User management logic
│   │   ├── chatControllers.js    # Chat management logic
│   │   └── messageControllers.js # Message handling logic
│   ├── middlewares/
│   │   ├── authMiddlewares.js    # Authentication middleware
│   │   ├── errorMiddlewares.js   # Error handling middleware
│   │   └── uploadMiddleware.js   # File upload middleware
│   ├── models/
│   │   ├── userModel.js          # User schema
│   │   ├── chatModel.js          # Chat schema
│   │   └── messageModel.js       # Message schema
│   ├── routes/
│   │   ├── userRoutes.js         # User API routes
│   │   ├── chatRoutes.js         # Chat API routes
│   │   ├── messageRoutes.js      # Message API routes
│   │   └── uploadRoutes.js       # File upload routes
│   └── server.js                 # Main server file
├── frontend/
│   ├── public/
│   │   ├── index.html            # HTML template
│   │   └── favicon.png           # Application icon
│   ├── src/
│   │   ├── components/
│   │   │   ├── Authentication/
│   │   │   │   ├── Login.js      # Login component
│   │   │   │   └── Signup.js     # Registration component
│   │   │   ├── miscellaneous/
│   │   │   │   ├── Header.jsx    # Navigation header
│   │   │   │   ├── MyChats.jsx   # Chat list component
│   │   │   │   ├── ChatBox.jsx   # Main chat interface
│   │   │   │   ├── SingleChat.jsx # Individual chat view
│   │   │   │   ├── ProfileDialogBox.jsx # User profile modal
│   │   │   │   ├── SideDrawer.jsx # User search drawer
│   │   │   │   └── CreateGroupChatDialogBox.jsx # Group creation
│   │   │   └── ui/               # Reusable UI components
│   │   ├── context/
│   │   │   └── ChatProvider.js   # Global state management
│   │   ├── Pages/
│   │   │   ├── HomePage.jsx      # Landing page
│   │   │   └── ChatPage.jsx      # Main chat page
│   │   ├── config/
│   │   │   └── ChatLogic.js      # Chat utility functions
│   │   ├── assets/               # Static assets
│   │   ├── App.js                # Main app component
│   │   └── index.js              # React entry point
├── .env                          # Environment variables
├── package.json                  # Dependencies and scripts
└── README.md                     # Project documentation
```

## 🔧 API Endpoints

### Authentication

- `POST /api/user/` - Register new user
- `POST /api/user/login` - User login
- `PUT /api/user/profile` - Update user profile
- `GET /api/user?search=` - Search users

### Chat Management

- `GET /api/chat/` - Get user's chats
- `POST /api/chat/` - Create/access one-on-one chat
- `POST /api/chat/group` - Create group chat
- `PUT /api/chat/rename` - Rename group chat
- `PUT /api/chat/groupadd` - Add user to group
- `PUT /api/chat/groupremove` - Remove user from group

### Messages

- `GET /api/message/:chatId` - Get all messages in chat
- `POST /api/message/` - Send new message

### File Upload

- `POST /api/upload/image` - Upload image file
- `POST /api/upload/signature` - Generate upload signature

## 🎯 Usage Guide

### Getting Started

1. **Registration**: Create an account with email and password
2. **Profile Setup**: Upload a profile picture and set your display name
3. **Find Users**: Use the search feature to find other users
4. **Start Chatting**: Click on a user to start a conversation

### Creating Group Chats

1. Click the "New Group Chat" button
2. Search and select users to add
3. Enter a group name
4. Click "Create Chat" to start the group

### Managing Groups

- **Add Members**: Click group settings and add new members
- **Remove Members**: Admin can remove members from the group
- **Rename Group**: Change the group name from settings
- **Leave Group**: Exit the group conversation

### Customization

- **Theme**: Light and Dark theme response with toggle feature
- **Profile**: Update your name and profile picture

## 🔮 Upcoming Features

### 🚀 Phase 1 (Next Release)

- **Email OTP Verification**: Two-factor authentication
- **Password Reset**: Secure password recovery
- **Message Reactions**: React to messages with emojis
- **Voice Messages**: Record and send voice notes
- **File Sharing**: Support for documents and files
- **Message Search**: Search within chat history

### 🚀 Phase 2 (Future)

- **Video Calls**: One-on-one video calling
- **Screen Sharing**: Share screen during calls
- **Message Forwarding**: Forward messages between chats
- **Chat Backup**: Export chat history
- **Custom Themes**: Personalized color schemes
- **Message Encryption**: End-to-end encryption

### 🚀 Phase 3 (Advanced)

- **Bot Integration**: Chatbots and automation
- **Channel Broadcasting**: Public channels
- **Story Feature**: Share temporary stories
- **Advanced Analytics**: Chat insights and statistics
- **API Webhooks**: Third-party integrations
- **Mobile App**: React Native mobile version

## 🔒 Security Features

### Implemented

- ✅ JWT-based authentication
- ✅ Password hashing with BCrypt
- ✅ Input validation and sanitization
- ✅ File upload security
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Security headers
- ✅ Environment variable protection

### Best Practices

- Regular security audits
- Dependency vulnerability scanning
- Secure coding practices
- Data encryption at rest and in transit
- Regular backup procedures
- Monitoring and logging

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and conventions
- Write descriptive commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📊 Performance Optimizations

### Frontend

- **Code Splitting**: Lazy loading of components
- **Memoization**: React.memo and useMemo optimizations
- **Image Optimization**: Cloudinary transformations
- **Bundle Optimization**: Webpack optimization
- **Caching**: Browser caching strategies

### Backend

- **Database Indexing**: Optimized MongoDB queries
- **Connection Pooling**: Efficient database connections
- **Response Compression**: Gzip compression
- **Rate Limiting**: Prevent abuse and overload
- **Memory Management**: Efficient memory usage

## 🐛 Troubleshooting

### Common Issues

1. **Connection Issues**

   - Check MongoDB connection string
   - Verify network connectivity
   - Check firewall settings

2. **Authentication Problems**

   - Verify JWT secret configuration
   - Check token expiration
   - Validate user credentials

3. **File Upload Issues**

   - Check Cloudinary configuration
   - Verify file size limits
   - Validate file types

4. **Socket.io Issues**
   - Check CORS configuration
   - Verify WebSocket support
   - Check network restrictions

### Getting Help

- Check the documentation
- Search existing issues
- Create a new issue with detailed description
- Join our community discussions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 About Me

**Lead Developer**: Parvesh Bansal

- 📧 Email: parvesh063@gmail.com
- 🌐 LinkedIn: [linkedin.com/in/parvesh-bansal](https://linkedin.com/in/parvesh-bansal)
- 🐙 GitHub: [github.com/parvesh-bansal](https://github.com/parve5h)

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - Frontend framework
- [Node.js](https://nodejs.org/) - Backend runtime
- [MongoDB](https://mongodb.com/) - Database
- [Socket.io](https://socket.io/) - Real-time communication
- [Chakra UI](https://chakra-ui.com/) - Component library
- [Cloudinary](https://cloudinary.com/) - Media management
- [JWT](https://jwt.io/) - Authentication tokens

## 📈 Project Status

**Current Version**: 1.0.0
**Status**: Active Development
**Last Updated**: January 2025

### Roadmap

- ✅ Basic chat functionality
- ✅ User authentication
- ✅ Group chats
- ✅ Real-time messaging
- ✅ Email OTP verification
- 📋 File sharing
- 📋 Voice messages (Planned)
- 📋 Video calls (Planned)
- 📋 Mobile app (Future)

---

<div align="center">
  <p>Made with ❤️ by Parvesh Bansal</p>
  <p>
    <a href="#top">Back to Top</a> •
    <a href="https://github.com/parve5h/chattrip">Repository</a> •
    <a href="https://github.com/parve5h/chattrip/issues">Report Bug</a> •
    <a href="https://github.com/parve5h/chattrip/issues">Request Feature</a>
  </p>
</div>
