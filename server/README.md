server/
├── config/                       # Configuration files
│   ├── db.js                     # MongoDB connection
│   └── socket.js                 # Socket.IO setup
│
├── controllers/                 # Handle incoming requests
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── post.controller.js
│   ├── comment.controller.js
│   ├── message.controller.js
│   └── notification.controller.js
│
├── middleware/                  # Custom middleware
│   ├── auth.middleware.js       # JWT auth check
│   └── error.middleware.js      # Error handler
│
├── models/                      # Mongoose schemas/models
│   ├── User.js
│   ├── Post.js
│   ├── Comment.js
│   ├── Message.js
│   └── Notification.js
│
├── routes/                      # Express routers
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── post.routes.js
│   ├── comment.routes.js
│   ├── message.routes.js
│   └── notification.routes.js
│
├── services/                    # Business logic & database ops
│   ├── auth.service.js
│   ├── user.service.js
│   ├── post.service.js
│   ├── comment.service.js
│   ├── message.service.js
│   └── notification.service.js
│
├── sockets/                     # Socket.IO events
│   ├── chat.socket.js
│   └── notification.socket.js
│
├── utils/                       # Utility functions (e.g., token, validators)
│   ├── jwt.js
│   └── hash.js
│
├── uploads/                     # Uploaded image storage (or S3/Cloudinary)
│   └── ...
│
├── .env                         # Environment variables
├── app.js                       # Express app config
├── server.js                    # Entry point, socket + express launch
├── package.json
└── README.md
