client/
├── public/
│   └── favicon.svg
│
├── src/
│   ├── assets/
│   │   └── logo.png
│
│   ├── components/                     # Shared reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Avatar.jsx
│   │   ├── Modal.jsx
│   │   ├── Loader.jsx
│   │   └── NotificationIcon.jsx       # Bell icon with badge count
│
│   ├── features/
│   │   ├── auth/                       # Login / Register
│   │   │   ├── pages/LoginPage.jsx
│   │   │   ├── pages/RegisterPage.jsx
│   │   │   ├── components/AuthForm.jsx
│   │   │   ├── authSlice.js
│   │   │   └── authService.js
│   │   │
│   │   ├── posts/                      # Feed, post details
│   │   │   ├── pages/Feed.jsx
│   │   │   ├── pages/PostDetail.jsx
│   │   │   ├── components/PostCard.jsx
│   │   │   ├── components/CreatePost.jsx
│   │   │   ├── postSlice.js
│   │   │   └── postService.js
│   │   │
│   │   ├── comments/                   # Comment box under each post
│   │   │   ├── components/CommentBox.jsx
│   │   │   ├── commentSlice.js
│   │   │   └── commentService.js
│   │   │
│   │   ├── users/                      # Profile, follow/unfollow
│   │   │   ├── pages/UserProfile.jsx
│   │   │   ├── components/UserCard.jsx
│   │   │   ├── components/EditProfile.jsx
│   │   │   ├── userSlice.js
│   │   │   └── userService.js
│   │   │
│   │   ├── explore/                    # Explore/search
│   │   │   ├── pages/Explore.jsx
│   │   │   └── exploreService.js
│   │   │
│   │   ├── messages/                   # Direct messaging (real-time)
│   │   │   ├── pages/Inbox.jsx         # List of chats
│   │   │   ├── pages/ChatRoom.jsx      # Chat with a single user
│   │   │   ├── components/ChatBox.jsx  # Chat input + messages
│   │   │   ├── messageSlice.js
│   │   │   └── messageService.js
│   │   │
│   │   ├── notifications/              # Real-time notifications
│   │   │   ├── pages/Notifications.jsx
│   │   │   ├── components/NotificationItem.jsx
│   │   │   ├── notificationSlice.js
│   │   │   └── notificationService.js
│
│   ├── layouts/                        # Page layout shells
│   │   ├── MainLayout.jsx
│   │   └── AuthLayout.jsx
│
│   ├── pages/                          # Static pages
│   │   ├── Home.jsx
│   │   ├── NotFound.jsx
│   │   └── PrivacyPolicy.jsx
│
│   ├── routes/
│   │   ├── AppRouter.jsx
│   │   └── ProtectedRoute.jsx
│
│   ├── services/
│   │   ├── api.js                      # Axios base setup
│   │   └── socket.js                   # Socket.io client setup
│
│   ├── store/
│   │   ├── index.js
│   │   └── rootReducer.js
│
│   ├── styles/
│   │   ├── main.css
│   │   └── variables.css
│
│   ├── utils/
│   │   ├── formatDate.js
│   │   └── validateForm.js
│
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useClickOutside.js
│
│   ├── config.js
│   ├── App.jsx
│   ├── main.jsx
│   └── vite-env.d.ts
│
├── .env
├── index.html
├── package.json
└── vite.config.js




--------------------------------------

src/
├── assets/            # Images, fonts, static files
├── components/        # React components
├── features/          # Redux slice files (for each feature)
├── hooks/             # Custom hooks (like `useAppDispatch`, `useAppSelector`)
├── utils/             # Utility functions
├── app/               # Redux store and global configurations
├── services/          # API calls, external services
├── styles/            # Global styles, themes
├── index.js           # Entry point
└── App.js             # Main component