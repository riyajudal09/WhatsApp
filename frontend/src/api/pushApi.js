import api from '../services/Url.service';


export async function getPushPublicKey() {

  const {
    data,
  } =
    await api.get(
      '/push/public-key'
    );


  return (
    data?.data?.publicKey ||
    null
  );
}


export async function savePushSubscription(
  subscription
) {

  const {
    data,
  } =
    await api.post(
      '/push/subscribe',
      subscription
    );


  return data;
}


export async function deletePushSubscription(
  endpoint
) {

  const {
    data,
  } =
    await api.delete(
      '/push/unsubscribe',
      {
        data: {
          endpoint,
        },
      }
    );


  return data;
}