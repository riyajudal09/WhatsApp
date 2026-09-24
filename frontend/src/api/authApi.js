// import api from '../services/Url.service';

// const unwrapError = (error, fallback) => {
//   throw new Error(
//     error?.response?.data?.message ||
//     error?.message ||
//     fallback
//   );
// };


// // LOGIN
// export async function loginWithPassword(
//   phoneNumber,
//   phoneSuffix,
//   email,
//   password
// ) {
//   try {
//     const payload = email
//       ? { email, password }
//       : { phoneNumber, phoneSuffix, password };

//     const { data } = await api.post('/auth/login', payload);

//     const token = data?.data?.token;

//     if (token) {
//       localStorage.setItem('auth_token', token);
//     }

//     return data;
//   } catch (error) {
//     return unwrapError(error, 'Unable to sign in');
//   }
// }


// // REGISTER
// export async function registerWithPassword(
//   phoneNumber,
//   phoneSuffix,
//   email,
//   password
// ) {
//   try {
//     const payload = email
//       ? { email, password }
//       : { phoneNumber, phoneSuffix, password };

//     const { data } = await api.post('/auth/register', payload);

//     const token = data?.data?.token;

//     if (token) {
//       localStorage.setItem('auth_token', token);
//     }

//     return data;
//   } catch (error) {
//     return unwrapError(error, 'Unable to create account');
//   }
// }


// // FORGOT PASSWORD
// export async function resetForgottenPassword(
//   phoneNumber,
//   phoneSuffix,
//   email,
//   newPassword
// ) {
//   try {
//     const payload = email
//       ? { email, newPassword }
//       : { phoneNumber, phoneSuffix, newPassword };

//     const { data } = await api.post(
//       '/auth/forgot-password',
//       payload
//     );

//     return data;
//   } catch (error) {
//     return unwrapError(error, 'Unable to reset password');
//   }
// }


// // UPDATE PROFILE
// export async function updateUserProfile(formData) {
//   try {
//     const { data } = await api.put(
//       '/auth/update-profile',
//       formData
//     );

//     return data;
//   } catch (error) {
//     return unwrapError(error, 'Unable to update profile');
//   }
// }


// // CHECK AUTH
// export async function checkUserAuth() {
//   try {
//     const { data } = await api.get('/auth/check-auth');

//     const session = data?.data;

//     return {
//       isAuthenticated: Boolean(session?.authenticated),
//       user: session?.user || null,
//     };
//   } catch (error) {
//     return {
//       isAuthenticated: false,
//       user: null,
//     };
//   }
// }


// // LOGOUT
// export async function logoutUser() {
//   try {
//     const { data } = await api.get('/auth/logout');

//     localStorage.removeItem('auth_token');

//     return data;
//   } catch (error) {
//     localStorage.removeItem('auth_token');

//     return unwrapError(error, 'Unable to logout');
//   }
// }


// // GET ALL USERS
// export async function getAllUser() {
//   try {
//     const { data } = await api.get('/auth/user');

//     return data;
//   } catch (error) {
//     return unwrapError(error, 'Unable to load users');
//   }
// }

import api from '../services/Url.service';

const unwrapError = (error, fallback) => {
  throw new Error(
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};


// =========================
// LOGIN
// =========================

export async function loginWithPassword(
  phoneNumber,
  phoneSuffix,
  email,
  password
) {
  try {
    const payload = email
      ? { email, password }
      : {
          phoneNumber,
          phoneSuffix,
          password,
        };

    const { data } = await api.post(
      '/auth/login',
      payload
    );

    const token = data?.data?.token;

    if (token) {
      localStorage.setItem(
        'auth_token',
        token
      );
    }

    return data;

  } catch (error) {
    return unwrapError(
      error,
      'Unable to sign in'
    );
  }
}


// =========================
// REGISTER
// =========================

export async function registerWithPassword(
  phoneNumber,
  phoneSuffix,
  email,
  password
) {
  try {
    const payload = email
      ? { email, password }
      : {
          phoneNumber,
          phoneSuffix,
          password,
        };

    const { data } = await api.post(
      '/auth/register',
      payload
    );

    const token = data?.data?.token;

    if (token) {
      localStorage.setItem(
        'auth_token',
        token
      );
    }

    return data;

  } catch (error) {
    return unwrapError(
      error,
      'Unable to create account'
    );
  }
}


// =========================
// FORGOT PASSWORD
// =========================

export async function resetForgottenPassword(
  phoneNumber,
  phoneSuffix,
  email,
  newPassword
) {
  try {
    const payload = email
      ? {
          email,
          newPassword,
        }
      : {
          phoneNumber,
          phoneSuffix,
          newPassword,
        };

    const { data } = await api.post(
      '/auth/forgot-password',
      payload
    );

    return data;

  } catch (error) {
    return unwrapError(
      error,
      'Unable to reset password'
    );
  }
}


// =========================
// UPDATE PROFILE
// =========================

export async function updateUserProfile(
  formData
) {
  try {
    const { data } = await api.put(
      '/auth/update-profile',
      formData
    );

    return data;

  } catch (error) {
    return unwrapError(
      error,
      'Unable to update profile'
    );
  }
}


// =========================
// CHECK AUTH
// =========================

export async function checkUserAuth() {
  try {
    const { data } = await api.get(
      '/auth/check-auth'
    );

    const session = data?.data;

    return {
      isAuthenticated:
        Boolean(session?.authenticated),

      user:
        session?.user || null,
    };

  } catch (error) {
    return {
      isAuthenticated: false,
      user: null,
    };
  }
}


// =========================
// LOGOUT
// =========================

export async function logoutUser() {
  try {
    const { data } = await api.get(
      '/auth/logout'
    );

    localStorage.removeItem(
      'auth_token'
    );

    return data;

  } catch (error) {
    localStorage.removeItem(
      'auth_token'
    );

    return unwrapError(
      error,
      'Unable to logout'
    );
  }
}


// =========================
// GET ALL USERS
// =========================

export async function getAllUser() {
  try {
    const { data } = await api.get(
      '/auth/user'
    );

    return data;

  } catch (error) {
    return unwrapError(
      error,
      'Unable to load users'
    );
  }
}


// =========================
// REMOVE / HIDE USER
// =========================

export async function removeUserFromList(
  userId
) {
  try {
    const { data } = await api.delete(
      `/auth/user/${userId}`
    );

    return data;

  } catch (error) {
    return unwrapError(
      error,
      'Unable to remove user'
    );
  }
}