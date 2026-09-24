// import api from '../services/Url.service';

// const unwrapError = (error, fallback) => {
//   throw new Error(error?.response?.data?.message || error?.message || fallback);
// };

// export async function loginWithPassword(phoneNumber, phoneSuffix, email, password) {
//   try {
//     const payload = email
//       ? { email, password }
//       : { phoneNumber, phoneSuffix, password };
//     const { data } = await api.post('/auth/login', payload);
//     return data;
//   } catch (error) { return unwrapError(error, 'Unable to sign in'); }
// }

// export async function registerWithPassword(phoneNumber, phoneSuffix, email, password) {
//   try {
//     const payload = email
//       ? { email, password }
//       : { phoneNumber, phoneSuffix, password };
//     const { data } = await api.post('/auth/register', payload);
//     return data;
//   } catch (error) { return unwrapError(error, 'Unable to create account'); }
// }

// export async function resetForgottenPassword(phoneNumber, phoneSuffix, email, newPassword) {
//   try {
//     const payload = email
//       ? { email, newPassword }
//       : { phoneNumber, phoneSuffix, newPassword };
//     const { data } = await api.post('/auth/forgot-password', payload);
//     return data;
//   } catch (error) { return unwrapError(error, 'Unable to reset password'); }
// }

// export async function updateUserProfile(formData) {
//   try {
//     // Let Axios/browser set multipart Content-Type including its boundary.
//     const { data } = await api.put('/auth/update-profile', formData);
//     return data;
//   } catch (error) { return unwrapError(error, 'Unable to update profile'); }
// }

// export async function checkUserAuth() {
//   try {
//     const { data } = await api.get('/auth/check-auth');
//     const session = data?.data;
//     return {
//       isAuthenticated: Boolean(session?.authenticated),
//       user: session?.user || null,
//     };
//   } catch (_) {
//     return { isAuthenticated: false, user: null };
//   }
// }

// export async function logoutUser() {
//   try { return (await api.get('/auth/logout')).data; }
//   catch (error) { return unwrapError(error, 'Unable to logout'); }
// }

// export async function getAllUser() {
//   try { return (await api.get('/auth/user')).data; }
//   catch (error) { return unwrapError(error, 'Unable to load users'); }
// }
import api from '../services/Url.service';

const unwrapError = (error, fallback) => {
  throw new Error(
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};

const { data } = await api.post('/auth/login', payload);

const token = data?.data?.token;

if (token) {
  localStorage.setItem('auth_token', token);
}

return data;

// =========================
// LOGIN WITH PASSWORD
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
      : { phoneNumber, phoneSuffix, password };

    const { data } = await api.post('/auth/login', payload);

    const token = data?.data?.token;

    if (token) {
      localStorage.setItem('auth_token', token);
    }

    return data;
  } catch (error) {
    return unwrapError(error, 'Unable to sign in');
  }
}

// =========================
// CREATE ACCOUNT
// =========================

export async function registerWithPassword(
  phoneNumber,
  phoneSuffix,
  email,
  password
) {
  try {
    const payload = email
      ? {
          email,
          password,
        }
      : {
          phoneNumber,
          phoneSuffix,
          password,
        };

    const { data } = await api.post('/auth/register', payload);

    // Save JWT token after registration
    const token = data?.data?.token;

    if (token) {
      localStorage.setItem('auth_token', token);
    }

    return data;
  } catch (error) {
    return unwrapError(error, 'Unable to create account');
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
    return unwrapError(error, 'Unable to reset password');
  }
}


// =========================
// UPDATE PROFILE
// =========================

export async function updateUserProfile(formData) {
  try {
    // Browser/Axios automatically sets multipart boundary
    const { data } = await api.put(
      '/auth/update-profile',
      formData
    );

    return data;
  } catch (error) {
    return unwrapError(error, 'Unable to update profile');
  }
}


// =========================
// CHECK LOGIN / AUTH
// =========================

export async function checkUserAuth() {
  try {
    const { data } = await api.get('/auth/check-auth');

    const session = data?.data;

    return {
      isAuthenticated: Boolean(session?.authenticated),
      user: session?.user || null,
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
    const { data } = await api.get('/auth/logout');

    // Remove JWT from browser
    localStorage.removeItem('auth_token');

    return data;
  } catch (error) {
    // Remove it even if backend logout request fails
    localStorage.removeItem('auth_token');

    return unwrapError(error, 'Unable to logout');
  }
}


// =========================
// GET ALL USERS
// =========================

export async function getAllUser() {
  try {
    const { data } = await api.get('/auth/user');

    return data;
  } catch (error) {
    return unwrapError(error, 'Unable to load users');
  }
}