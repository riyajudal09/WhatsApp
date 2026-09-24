const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Conversation = require('../models/conversation');
const Message = require('../models/message');

const response = require('../utils/responseHandler');
const generateToken = require('../utils/generateToken');

const {
  uploadFileToCloudinary,
} = require('../config/cloudinaryConfig');

const normalizePhone = require('../utils/phoneNumber');

const {
  validatePassword,
  hashPassword,
  verifyPassword,
} = require('../utils/password');


// ========================================
// SET AUTH COOKIE
// ========================================

const setAuthCookie = (res, token) => {
  res.cookie('auth_token', token, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 30,

    sameSite:
      process.env.NODE_ENV === 'production'
        ? 'none'
        : 'lax',

    secure:
      process.env.NODE_ENV === 'production',
  });
};


// ========================================
// PUBLIC USER
// ========================================

const publicUser = (user) => {
  const value = user?.toObject
    ? user.toObject()
    : { ...(user || {}) };

  delete value.passwordHash;

  return value;
};


// ========================================
// NORMALIZE EMAIL
// ========================================

const normalizeEmail = (email) => {
  const value = String(email || '')
    .trim()
    .toLowerCase();

  if (!/^\S+@\S+\.\S+$/.test(value)) {
    throw new Error('Enter a valid email address');
  }

  return value;
};


// ========================================
// GET LOGIN IDENTITY
// ========================================

const getAuthIdentity = ({
  email,
  phoneNumber,
  phoneSuffix,
}) => {

  // EMAIL LOGIN
  if (email) {
    const normalizedEmail = normalizeEmail(email);

    return {
      query: {
        email: normalizedEmail,
      },

      createData: {
        email: normalizedEmail,
      },

      label: 'email',
    };
  }


  // MOBILE LOGIN
  if (!phoneNumber || !phoneSuffix) {
    throw new Error(
      'Mobile number and country code are required'
    );
  }

  const normalized = normalizePhone(
    phoneNumber,
    phoneSuffix
  );

  return {
    query: {
      $or: [
        {
          fullPhoneNumber:
            normalized.fullPhoneNumber,
        },

        {
          phoneNumber:
            normalized.phoneNumber,

          phoneSuffix:
            normalized.phoneSuffix,
        },
      ],
    },

    createData: normalized,

    label: 'mobile number',
  };
};


// ========================================
// REGISTER
// ========================================

exports.register = async (req, res) => {
  try {

    const identity =
      getAuthIdentity(req.body || {});

    const password =
      validatePassword(req.body?.password);

    const existing =
      await User.findOne(identity.query)
        .select('+passwordHash');

    if (existing) {
      return response(
        res,
        409,
        `An account with this ${identity.label} already exists. Please sign in.`
      );
    }

    const user = new User({
      ...identity.createData,

      passwordHash:
        hashPassword(password),

      isverified: true,
    });

    await user.save();

    const token =
      generateToken(user._id);

    setAuthCookie(res, token);

    return response(
      res,
      201,
      'Account created successfully',
      {
        token,
        user: publicUser(user),
      }
    );

  } catch (error) {

    console.error(
      'register:',
      error
    );

    if (error?.code === 11000) {
      return response(
        res,
        409,
        'An account with this email or mobile number already exists'
      );
    }

    const message =
      error?.message ||
      'Unable to create account';

    const status =
      /valid|password|mobile|country/i.test(
        message
      )
        ? 400
        : 500;

    return response(
      res,
      status,
      message
    );
  }
};


// ========================================
// LOGIN
// ========================================

exports.login = async (req, res) => {
  try {

    const identity =
      getAuthIdentity(req.body || {});

    const password =
      validatePassword(req.body?.password);

    const user =
      await User.findOne(identity.query)
        .select('+passwordHash');

    if (!user) {
      return response(
        res,
        401,
        'Invalid email/mobile number or password'
      );
    }

    if (!user.passwordHash) {
      return response(
        res,
        409,
        'This is an older OTP account and has no password yet. Recreate this test account with password login.'
      );
    }

    if (
      !verifyPassword(
        password,
        user.passwordHash
      )
    ) {
      return response(
        res,
        401,
        'Invalid email/mobile number or password'
      );
    }

    user.isverified = true;
    user.lastSeen = new Date();

    await user.save();

    const token =
      generateToken(user._id);

    setAuthCookie(res, token);

    return response(
      res,
      200,
      'Signed in successfully',
      {
        token,
        user: publicUser(user),
      }
    );

  } catch (error) {

    console.error(
      'login:',
      error
    );

    const message =
      error?.message ||
      'Unable to sign in';

    const status =
      /valid|mobile|country|required/i.test(
        message
      )
        ? 400
        : 500;

    return response(
      res,
      status,
      message
    );
  }
};


// ========================================
// FORGOT PASSWORD
// ========================================

exports.forgotPassword =
  async (req, res) => {

    try {

      const identity =
        getAuthIdentity(req.body || {});

      const newPassword =
        validatePassword(
          req.body?.newPassword
        );

      const user =
        await User.findOne(
          identity.query
        );

      if (!user) {
        return response(
          res,
          404,
          `No account found with this ${identity.label}. Please check the details or create an account instead.`
        );
      }

      user.passwordHash =
        hashPassword(newPassword);

      await user.save();

      return response(
        res,
        200,
        'Password updated. Please sign in with your new password.'
      );

    } catch (error) {

      console.error(
        'forgotPassword:',
        error
      );

      const message =
        error?.message ||
        'Unable to reset password';

      const status =
        /valid|password|mobile|country|required/i.test(
          message
        )
          ? 400
          : 500;

      return response(
        res,
        status,
        message
      );
    }
  };


// ========================================
// UPDATE PROFILE
// ========================================

exports.updateProfile =
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.user.userId
        );

      if (!user) {
        return response(
          res,
          404,
          'User not found'
        );
      }

      const {
        username,
        about,
        agreed,
        profilePicture,
      } = req.body;

      if (req.file) {

        const uploaded =
          await uploadFileToCloudinary(
            req.file,
            req
          );

        user.profilepicture =
          uploaded?.secure_url || '';

      } else if (profilePicture) {

        user.profilepicture =
          profilePicture;
      }

      if (username !== undefined) {
        user.username =
          String(username).trim();
      }

      if (about !== undefined) {
        user.about =
          String(about).trim();
      }

      if (agreed !== undefined) {
        user.agreed =
          String(agreed) === 'true' ||
          agreed === true;
      }

      await user.save();

      return response(
        res,
        200,
        'Profile updated',
        publicUser(user)
      );

    } catch (error) {

      console.error(
        'updateProfile:',
        error
      );

      return response(
        res,
        500,
        error.message ||
          'Unable to update profile'
      );
    }
  };


// ========================================
// CHECK AUTH
// ========================================

exports.checkAuth =
  async (req, res) => {

    /*
      First check Bearer token.

      This is important for Render because
      frontend and backend are on separate
      Render domains.
    */

    const bearer =
      req.headers.authorization
        ?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null;


    // IMPORTANT FIX
    const token =
      bearer ||
      req.cookies?.auth_token;


    if (
      !token ||
      !process.env.JWT_SECRET
    ) {

      return response(
        res,
        200,
        'Not authenticated',
        {
          authenticated: false,
          user: null,
        }
      );
    }


    try {

      const decoded =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );

      const userId =
        decoded.userId ||
        decoded.id;


      if (!userId) {
        return response(
          res,
          200,
          'Not authenticated',
          {
            authenticated: false,
            user: null,
          }
        );
      }


      const user =
        await User.findById(userId);


      if (!user) {
        return response(
          res,
          200,
          'Not authenticated',
          {
            authenticated: false,
            user: null,
          }
        );
      }


      return response(
        res,
        200,
        'Authenticated',
        {
          authenticated: true,
          user: publicUser(user),
        }
      );


    } catch (error) {

      console.error(
        'checkAuth:',
        error.message
      );

      return response(
        res,
        200,
        'Not authenticated',
        {
          authenticated: false,
          user: null,
        }
      );
    }
  };


// ========================================
// LOGOUT
// ========================================

exports.logout =
  async (req, res) => {

    try {

      if (req.user?.userId) {

        await User.findByIdAndUpdate(
          req.user.userId,
          {
            isOnline: false,
            lastSeen: new Date(),
          }
        );
      }

    } catch (error) {

      console.error(
        'logout status:',
        error.message
      );
    }


    res.clearCookie(
      'auth_token',
      {
        sameSite:
          process.env.NODE_ENV ===
          'production'
            ? 'none'
            : 'lax',

        secure:
          process.env.NODE_ENV ===
          'production',
      }
    );


    return response(
      res,
      200,
      'Logged out'
    );
  };


// ========================================
// GET ALL USERS
// ========================================

exports.getAllUser =
  async (req, res) => {

    try {

      const loggedInUser =
        req.user.userId;


      const users =
        await User.find({
          _id: {
            $ne: loggedInUser,
          },

          isverified: true,
        })

          .select(
            'username profilepicture about phoneNumber phoneSuffix fullPhoneNumber lastSeen isOnline'
          )

          .lean();


      const result =
        await Promise.all(

          users.map(
            async (user) => {

              const conversation =
                await Conversation.findOne({
                  participants: {
                    $all: [
                      loggedInUser,
                      user._id,
                    ],

                    $size: 2,
                  },
                })

                  .populate({
                    path:
                      'lastMessage',

                    select:
                      'content contentType mediaUrl createdAt sender receiver messageStatus',
                  })

                  .lean();


              let unreadCount = 0;


              if (conversation) {

                unreadCount =
                  await Message.countDocuments({
                    conversation:
                      conversation._id,

                    receiver:
                      loggedInUser,

                    messageStatus: {
                      $ne: 'read',
                    },

                    deletedForEveryone:
                      false,
                  });
              }


              return {
                ...user,
                conversation:
                  conversation || null,
                unreadCount,
              };
            }
          )
        );


      result.sort(
        (a, b) => {

          const at =
            a.conversation?.updatedAt
              ? new Date(
                  a.conversation.updatedAt
                ).getTime()
              : 0;


          const bt =
            b.conversation?.updatedAt
              ? new Date(
                  b.conversation.updatedAt
                ).getTime()
              : 0;


          return bt - at;
        }
      );


      return response(
        res,
        200,
        'Users retrieved',
        result
      );


    } catch (error) {

      console.error(
        'getAllUser:',
        error
      );

      return response(
        res,
        500,
        'Unable to retrieve users'
      );
    }
  };