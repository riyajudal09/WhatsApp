self.addEventListener(
  'push',
  (
    event
  ) => {

    let data = {};


    try {

      data =
        event.data
          ? event.data.json()
          : {};

    } catch (error) {

      data = {
        title:
          'New message',

        body:
          event.data?.text() ||
          'You received a new message',
      };
    }


    const title =
      data.title ||
      'New message';


    const options = {
      body:
        data.body ||
        'You received a new message',

      icon:
        data.icon ||
        '/whatsappimage.jpg',

      badge:
        '/whatsappimage.jpg',

      tag:
        data.tag ||
        'whatsapp-message',

      renotify:
        true,

      vibrate: [
        200,
        100,
        200,
      ],

      data: {
        url:
          data.url ||
          '/',

        senderId:
          data.senderId,

        conversationId:
          data.conversationId,
      },
    };


    event.waitUntil(
      self.registration
        .showNotification(
          title,
          options
        )
    );
  }
);


self.addEventListener(
  'notificationclick',
  (
    event
  ) => {

    event.notification
      .close();


    const targetUrl =
      new URL(
        event.notification
          ?.data
          ?.url ||
        '/',
        self.location.origin
      ).href;


    event.waitUntil(
      clients
        .matchAll({
          type:
            'window',

          includeUncontrolled:
            true,
        })

        .then(
          async (
            clientList
          ) => {

            for (
              const client
              of clientList
            ) {

              if (
                'navigate' in
                client
              ) {

                try {

                  await client
                    .navigate(
                      targetUrl
                    );

                } catch (_) {}
              }


              if (
                'focus' in
                client
              ) {

                return client
                  .focus();
              }
            }


            if (
              clients.openWindow
            ) {

              return clients
                .openWindow(
                  targetUrl
                );
            }


            return null;
          }
        )
    );
  }
);