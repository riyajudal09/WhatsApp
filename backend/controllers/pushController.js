const User =
  require('../models/user');

const response =
  require('../utils/responseHandler');


exports.getPublicKey =
  async (
    req,
    res
  ) => {

    if (
      !process.env
        .VAPID_PUBLIC_KEY
    ) {

      return response(
        res,
        500,
        'Push notification public key is not configured'
      );
    }


    return response(
      res,
      200,
      'Push public key',
      {
        publicKey:
          process.env
            .VAPID_PUBLIC_KEY,
      }
    );
  };


exports.subscribe =
  async (
    req,
    res
  ) => {

    try {

      const userId =
        req.user.userId;


      const subscription =
        req.body;


      if (
        !subscription?.endpoint ||
        !subscription?.keys?.p256dh ||
        !subscription?.keys?.auth
      ) {

        return response(
          res,
          400,
          'Invalid push subscription'
        );
      }


      const user =
        await User.findById(
          userId
        );


      if (!user) {

        return response(
          res,
          404,
          'User not found'
        );
      }


      user.pushSubscriptions =
        (
          user.pushSubscriptions ||
          []
        ).filter(
          (
            item
          ) =>
            item.endpoint !==
            subscription.endpoint
        );


      user.pushSubscriptions.push({
        endpoint:
          subscription.endpoint,

        expirationTime:
          subscription.expirationTime ||
          null,

        keys: {
          p256dh:
            subscription.keys.p256dh,

          auth:
            subscription.keys.auth,
        },
      });


      // Maximum 10 devices/browser subscriptions
      if (
        user.pushSubscriptions.length >
        10
      ) {

        user.pushSubscriptions =
          user.pushSubscriptions.slice(
            -10
          );
      }


      await user.save();


      return response(
        res,
        200,
        'Push notification enabled'
      );

    } catch (error) {

      console.error(
        'Push subscribe:',
        error
      );


      return response(
        res,
        500,
        'Unable to enable push notifications'
      );
    }
  };


exports.unsubscribe =
  async (
    req,
    res
  ) => {

    try {

      const userId =
        req.user.userId;


      const endpoint =
        String(
          req.body?.endpoint ||
          ''
        );


      if (!endpoint) {

        return response(
          res,
          400,
          'Subscription endpoint is required'
        );
      }


      await User.findByIdAndUpdate(
        userId,
        {
          $pull: {
            pushSubscriptions: {
              endpoint,
            },
          },
        }
      );


      return response(
        res,
        200,
        'Push notification disabled'
      );

    } catch (error) {

      console.error(
        'Push unsubscribe:',
        error
      );


      return response(
        res,
        500,
        'Unable to disable push notifications'
      );
    }
  };