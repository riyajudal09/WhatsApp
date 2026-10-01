// require('dotenv').config();

// const express = require('express');
// const http = require('http');
// const path = require('path');
// const cookieParser = require('cookie-parser');
// const cors = require('cors');

// const connectDb = require('./config/dbconnect');
// const initializeSocket = require('./services/socketService');

// const authRoutes = require('./routes/authRoute');
// const chatRoutes = require('./routes/chatRoute');
// const statusRoutes = require('./routes/statusRoute');

// const { createCorsOriginValidator } = require('./config/corsConfig');

// const app = express();
// const server = http.createServer(app);

// app.set('trust proxy', 1);

// app.use(
//   cors({
//     origin: createCorsOriginValidator(),
//     credentials: true,
//   })
// );

// app.use(express.json({ limit: '2mb' }));
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// const io = initializeSocket(server);

// app.use((req, _res, next) => {
//   req.io = io;
//   req.socketUserMap = io.socketUserMap;
//   next();
// });


// // ROOT ROUTE
// app.get('/', (req, res) => {
//   res.json({
//     status: 'success',
//     message: 'WhatsApp Clone Backend is running'
//   });
// });


// // HEALTH CHECK ROUTE
// app.get('/api/health', (_req, res) => {
//   res.json({
//     status: 'success',
//     message: 'API is running'
//   });
// });


// // API ROUTES
// app.use('/api/auth', authRoutes);
// app.use('/api/chat', chatRoutes);
// app.use('/api/status', statusRoutes);


// // ERROR HANDLER
// app.use((err, _req, res, _next) => {
//   console.error(err);

//   res.status(500).json({
//     status: 'error',
//     message: err.message || 'Internal server error',
//     data: null
//   });
// });


// const PORT = Number(process.env.PORT || 5000);

// connectDb()
//   .then(() => {
//     server.listen(PORT, () => {
//       console.log(`WhatsApp Clone API running on port ${PORT}`);
//     });
//   })
//   .catch((error) => {
//     console.error('Failed to start server:', error);
//     process.exit(1);
//   });

require('dotenv').config();

const express = require('express');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const connectDb = require('./config/dbconnect');
const initializeSocket = require('./services/socketService');

const authRoutes = require('./routes/authRoute');
const chatRoutes = require('./routes/chatRoute');
const statusRoutes = require('./routes/statusRoute');
const pushRoutes = require('./routes/pushRoute');

const {
  createCorsOriginValidator,
} = require('./config/corsConfig');


const app = express();
const server = http.createServer(app);


app.set('trust proxy', 1);


// ==========================================
// CORS
// ==========================================

app.use(
  cors({
    origin:
      createCorsOriginValidator(),

    credentials: true,
  })
);


// ==========================================
// BODY PARSERS
// ==========================================

app.use(
  express.json({
    limit: '2mb',
  })
);


app.use(
  express.urlencoded({
    extended: true,
  })
);


app.use(
  cookieParser()
);


// ==========================================
// STATIC UPLOADS
// ==========================================

app.use(
  '/uploads',
  express.static(
    path.join(
      __dirname,
      'uploads'
    )
  )
);


// ==========================================
// SOCKET.IO
// ==========================================

const io =
  initializeSocket(
    server
  );


app.use(
  (
    req,
    _res,
    next
  ) => {

    req.io =
      io;


    req.socketUserMap =
      io.socketUserMap;


    next();
  }
);


// ==========================================
// ROOT ROUTE
// ==========================================

app.get(
  '/',
  (
    req,
    res
  ) => {

    res.json({
      status:
        'success',

      message:
        'WhatsApp Clone Backend is running',
    });
  }
);


// ==========================================
// HEALTH CHECK
// ==========================================

app.get(
  '/api/health',
  (
    _req,
    res
  ) => {

    res.json({
      status:
        'success',

      message:
        'API is running',
    });
  }
);


// ==========================================
// API ROUTES
// ==========================================

app.use(
  '/api/auth',
  authRoutes
);


app.use(
  '/api/chat',
  chatRoutes
);


app.use(
  '/api/status',
  statusRoutes
);


// ==========================================
// PUSH NOTIFICATION ROUTES
// ==========================================

app.use(
  '/api/push',
  pushRoutes
);


// ==========================================
// ERROR HANDLER
// ==========================================

app.use(
  (
    err,
    _req,
    res,
    _next
  ) => {

    console.error(
      err
    );


    res
      .status(500)
      .json({
        status:
          'error',

        message:
          err.message ||
          'Internal server error',

        data:
          null,
      });
  }
);


// ==========================================
// START SERVER
// ==========================================

const PORT =
  Number(
    process.env.PORT ||
    5000
  );


connectDb()
  .then(
    () => {

      server.listen(
        PORT,
        () => {

          console.log(
            `WhatsApp Clone API running on port ${PORT}`
          );
        }
      );
    }
  )

  .catch(
    (
      error
    ) => {

      console.error(
        'Failed to start server:',
        error
      );


      process.exit(
        1
      );
    }
  );