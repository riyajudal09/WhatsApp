const webpush =
  require('web-push');

const User =
  require('../models/user');


let configured = false;


function configureWebPush() {
  if (configured) {
    return true;
  }


  const publicKey =
    process.env.VAPID_PUBLIC_KEY;

  const privateKey =
    process.env.VAPID_PRIVATE_KEY;

  const subject =
    process.env.VAPID_SUBJECT ||
    'mailto:admin@example.com';


  if (
    !publicKey ||
    !privateKey
  ) {
    console.warn(
      'VAPID keys are not configured'
    );

    return false;
  }


  webpush.setVapidDetails(
    subject,
    publicKey,
    privateKey
  );


  configured = true;

  return true;
}


exports.sendPushToUser =
  async (
    userId,
    payload
  ) => {

    if (
      !configureWebPush()
    ) {
      return;
    }


    const user =
      await User.findById(
        userId
      ).select(
        'pushSubscriptions'
      );


    if (
      !user ||
      !user.pushSubscriptions?.length
    ) {
      return;
    }


    const invalidEndpoints = [];


    await Promise.allSettled(

      user.pushSubscriptions.map(
        async (
          subscription
        ) => {

          try {

            await webpush
              .sendNotification(
                {
                  endpoint:
                    subscription.endpoint,

                  expirationTime:
                    subscription.expirationTime,

                  keys: {
                    p256dh:
                      subscription.keys.p256dh,

                    auth:
                      subscription.keys.auth,
                  },
                },

                JSON.stringify(
                  payload
                )
              );

          } catch (error) {

            console.error(
              'Push notification error:',
              error?.statusCode ||
              error?.message
            );


            // Subscription expired / removed by browser
            if (
              error?.statusCode ===
                404 ||
              error?.statusCode ===
                410
            ) {

              invalidEndpoints.push(
                subscription.endpoint
              );
            }
          }
        }
      )
    );


    if (
      invalidEndpoints.length
    ) {

      await User.findByIdAndUpdate(
        userId,
        {
          $pull: {
            pushSubscriptions: {
              endpoint: {
                $in:
                  invalidEndpoints,
              },
            },
          },
        }
      );
    }
  };