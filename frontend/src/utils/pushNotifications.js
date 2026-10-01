import {
  getPushPublicKey,
  savePushSubscription,
  deletePushSubscription,
} from '../api/pushApi';


function urlBase64ToUint8Array(
  base64String
) {

  const padding =
    '='.repeat(
      (
        4 -
        (
          base64String.length %
          4
        )
      ) %
      4
    );


  const base64 =
    (
      base64String +
      padding
    )
      .replace(
        /-/g,
        '+'
      )
      .replace(
        /_/g,
        '/'
      );


  const rawData =
    window.atob(
      base64
    );


  return Uint8Array.from(
    [
      ...rawData,
    ].map(
      (
        character
      ) =>
        character.charCodeAt(
          0
        )
    )
  );
}


export async function enablePushNotifications() {

  if (
    !(
      'serviceWorker' in
      navigator
    ) ||
    !(
      'PushManager' in
      window
    ) ||
    !(
      'Notification' in
      window
    )
  ) {

    console.warn(
      'Push notifications are not supported on this browser'
    );

    return false;
  }


  let permission =
    Notification.permission;


  if (
    permission ===
    'default'
  ) {

    permission =
      await Notification
        .requestPermission();
  }


  if (
    permission !==
    'granted'
  ) {

    return false;
  }


  const registration =
    await navigator
      .serviceWorker
      .register(
        '/sw.js'
      );


  await navigator
    .serviceWorker
    .ready;


  let subscription =
    await registration
      .pushManager
      .getSubscription();


  if (!subscription) {

    const publicKey =
      await getPushPublicKey();


    if (!publicKey) {

      throw new Error(
        'Push public key is missing'
      );
    }


    subscription =
      await registration
        .pushManager
        .subscribe({
          userVisibleOnly:
            true,

          applicationServerKey:
            urlBase64ToUint8Array(
              publicKey
            ),
        });
  }


  await savePushSubscription(
    subscription.toJSON()
  );


  return true;
}


export async function disablePushNotifications() {

  if (
    !(
      'serviceWorker' in
      navigator
    )
  ) {

    return;
  }


  const registration =
    await navigator
      .serviceWorker
      .getRegistration();


  if (!registration) {
    return;
  }


  const subscription =
    await registration
      .pushManager
      .getSubscription();


  if (!subscription) {
    return;
  }


  try {

    await deletePushSubscription(
      subscription.endpoint
    );

  } catch (error) {

    console.error(
      'Unable to remove server push subscription:',
      error
    );
  }


  await subscription
    .unsubscribe();
}