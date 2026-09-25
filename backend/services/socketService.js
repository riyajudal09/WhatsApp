// const { Server } = require('socket.io');
// const User = require('../models/user');
// const { getAllowedOrigins } = require('../config/corsConfig');

// const onlineUsers = new Map();

// module.exports = function initializeSocket(server) {
//   const io = new Server(server, {
//     cors: {
//       origin:process.env.FRONTEND_URL || 'https://whatsapp-clonefrontend.onrender.com',
//       credentials: true,
//       methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     },
//   });

//   io.on('connection', (socket) => {
//     let currentUserId = null;

//     socket.on('user_connected', async (userId) => {
//       if (!userId) return;

//       currentUserId = String(userId);

//       onlineUsers.set(currentUserId, socket.id);
//       socket.join(currentUserId);

//       try {
//         await User.findByIdAndUpdate(currentUserId, {
//           isOnline: true,
//           lastSeen: new Date(),
//         });
//       } catch (error) {
//         console.error('Online status update error:', error.message);
//       }

//       io.emit('user_status', {
//         userId: currentUserId,
//         isOnline: true,
//         lastSeen: new Date(),
//       });
//     });

//     socket.on('typing_start', ({ receiverId, conversationId }) => {
//       if (!receiverId || !currentUserId) return;

//       io.to(String(receiverId)).emit('user_typing', {
//         userId: currentUserId,
//         conversationId,
//         isTyping: true,
//       });
//     });

//     socket.on('typing_stop', ({ receiverId, conversationId }) => {
//       if (!receiverId || !currentUserId) return;

//       io.to(String(receiverId)).emit('user_typing', {
//         userId: currentUserId,
//         conversationId,
//         isTyping: false,
//       });
//     });

//     socket.on('disconnect', async () => {
//       if (!currentUserId) return;

//       if (onlineUsers.get(currentUserId) === socket.id) {
//         onlineUsers.delete(currentUserId);
//       }

//       const lastSeen = new Date();

//       try {
//         await User.findByIdAndUpdate(currentUserId, {
//           isOnline: false,
//           lastSeen,
//         });
//       } catch (error) {
//         console.error('Offline status update error:', error.message);
//       }

//       io.emit('user_status', {
//         userId: currentUserId,
//         isOnline: false,
//         lastSeen,
//       });
//     });
//   });

//   io.socketUserMap = onlineUsers;

//   return io;
// };

const { Server } = require('socket.io');

const User = require('../models/user');

const onlineUsers = new Map();


module.exports = function initializeSocket(server) {

  const io = new Server(server, {
    cors: {
      origin:
        process.env.FRONTEND_URL ||
        'https://whatsapp-clonefrontend.onrender.com',

      credentials: true,

      methods: [
        'GET',
        'POST',
        'PUT',
        'DELETE',
      ],
    },
  });


  io.on('connection', (socket) => {

    let currentUserId = null;


    // =====================================================
    // USER CONNECTED / ONLINE
    // =====================================================

    socket.on(
      'user_connected',
      async (userId) => {

        if (!userId) {
          return;
        }


        currentUserId =
          String(userId);


        onlineUsers.set(
          currentUserId,
          socket.id
        );


        // Join room with user's MongoDB ID
        socket.join(
          currentUserId
        );


        try {

          await User.findByIdAndUpdate(
            currentUserId,
            {
              isOnline: true,
              lastSeen: new Date(),
            }
          );

        } catch (error) {

          console.error(
            'Online status update error:',
            error.message
          );
        }


        io.emit(
          'user_status',
          {
            userId:
              currentUserId,

            isOnline:
              true,

            lastSeen:
              new Date(),
          }
        );

      }
    );


    // =====================================================
    // TYPING START
    // =====================================================

    socket.on(
      'typing_start',
      ({
        receiverId,
        conversationId,
      }) => {

        if (
          !receiverId ||
          !currentUserId
        ) {
          return;
        }


        io
          .to(
            String(
              receiverId
            )
          )
          .emit(
            'user_typing',
            {
              userId:
                currentUserId,

              conversationId,

              isTyping:
                true,
            }
          );

      }
    );


    // =====================================================
    // TYPING STOP
    // =====================================================

    socket.on(
      'typing_stop',
      ({
        receiverId,
        conversationId,
      }) => {

        if (
          !receiverId ||
          !currentUserId
        ) {
          return;
        }


        io
          .to(
            String(
              receiverId
            )
          )
          .emit(
            'user_typing',
            {
              userId:
                currentUserId,

              conversationId,

              isTyping:
                false,
            }
          );

      }
    );


    // =====================================================
    // VIDEO CALL - OFFER
    // Caller sends WebRTC offer to receiver
    // =====================================================

    socket.on(
      'video_call_offer',
      ({
        to,
        offer,
      }) => {

        if (
          !currentUserId ||
          !to ||
          !offer
        ) {
          return;
        }


        console.log(
          `Video call offer: ${currentUserId} -> ${to}`
        );


        io
          .to(
            String(to)
          )
          .emit(
            'video_call_incoming',
            {
              from:
                currentUserId,

              offer,
            }
          );

      }
    );


    // =====================================================
    // VIDEO CALL - ANSWER
    // Receiver accepts call and sends WebRTC answer
    // =====================================================

    socket.on(
      'video_call_answer',
      ({
        to,
        answer,
      }) => {

        if (
          !currentUserId ||
          !to ||
          !answer
        ) {
          return;
        }


        console.log(
          `Video call accepted: ${currentUserId} -> ${to}`
        );


        io
          .to(
            String(to)
          )
          .emit(
            'video_call_accepted',
            {
              from:
                currentUserId,

              answer,
            }
          );

      }
    );


    // =====================================================
    // VIDEO CALL - ICE CANDIDATE
    // WebRTC network connection information
    // =====================================================

    socket.on(
      'video_call_ice',
      ({
        to,
        candidate,
      }) => {

        if (
          !currentUserId ||
          !to ||
          !candidate
        ) {
          return;
        }


        io
          .to(
            String(to)
          )
          .emit(
            'video_call_ice',
            {
              from:
                currentUserId,

              candidate,
            }
          );

      }
    );


    // =====================================================
    // VIDEO CALL - REJECT
    // Receiver rejects incoming video call
    // =====================================================

    socket.on(
      'video_call_reject',
      ({
        to,
        reason,
      }) => {

        if (
          !currentUserId ||
          !to
        ) {
          return;
        }


        console.log(
          `Video call rejected: ${currentUserId} -> ${to}`
        );


        io
          .to(
            String(to)
          )
          .emit(
            'video_call_rejected',
            {
              from:
                currentUserId,

              reason:
                reason ||
                'rejected',
            }
          );

      }
    );


    // =====================================================
    // VIDEO CALL - END
    // Either user ends active call
    // =====================================================

    socket.on(
      'video_call_end',
      ({
        to,
      }) => {

        if (
          !currentUserId ||
          !to
        ) {
          return;
        }


        console.log(
          `Video call ended: ${currentUserId} -> ${to}`
        );


        io
          .to(
            String(to)
          )
          .emit(
            'video_call_ended',
            {
              from:
                currentUserId,
            }
          );

      }
    );


    // =====================================================
    // VIDEO CALL - BUSY
    // Optional: tell caller that receiver is busy
    // =====================================================

    socket.on(
      'video_call_busy',
      ({
        to,
      }) => {

        if (
          !currentUserId ||
          !to
        ) {
          return;
        }


        io
          .to(
            String(to)
          )
          .emit(
            'video_call_rejected',
            {
              from:
                currentUserId,

              reason:
                'busy',
            }
          );

      }
    );


    // =====================================================
    // DISCONNECT
    // =====================================================

    socket.on(
      'disconnect',
      async () => {

        if (
          !currentUserId
        ) {
          return;
        }


        if (
          onlineUsers.get(
            currentUserId
          ) ===
          socket.id
        ) {

          onlineUsers.delete(
            currentUserId
          );

        }


        const lastSeen =
          new Date();


        try {

          await User.findByIdAndUpdate(
            currentUserId,
            {
              isOnline:
                false,

              lastSeen,
            }
          );

        } catch (error) {

          console.error(
            'Offline status update error:',
            error.message
          );
        }


        io.emit(
          'user_status',
          {
            userId:
              currentUserId,

            isOnline:
              false,

            lastSeen,
          }
        );

      }
    );

  });


  // Existing map used elsewhere in your app
  io.socketUserMap =
    onlineUsers;


  return io;
};