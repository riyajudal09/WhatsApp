import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import countries from '../../utils/countriles';
import { loginWithPassword, registerWithPassword, updateUserProfile, resetForgottenPassword } from '../../api/authApi';
import useUserStore from '../../store/useUserStore';

const avatars = [
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Alex',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Sam',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Riya',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Kabir',
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Nova',
];

export default function Login() {
  const navigate = useNavigate();
  const setUser = useUserStore((s) => s.setUser);
  const [step, setStep] = useState(1);
  const [accountMode, setAccountMode] = useState('login');
  const [mode, setMode] = useState('phone');
  const [dialCode, setDialCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotPassword, setForgotPassword] = useState('');
  const [forgotConfirm, setForgotConfirm] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [about, setAbout] = useState('Hey there! I am using WhatsApp Clone.');
  const [avatar, setAvatar] = useState(avatars[0]);
  const [profileFile, setProfileFile] = useState(null);
  const [preview, setPreview] = useState('');
  const fileRef = useRef(null);

  const countryOptions = useMemo(() => {
    const seen = new Set();
    return countries.filter((c) => {
      const key = `${c.name}-${c.dialCode}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, []);

  const switchAccountMode = (nextMode) => {
    setAccountMode(nextMode);
    setPassword('');
    setConfirmPassword('');
  };

  function openForgotPassword() {
    setShowForgot(true);
    setPassword('');
    setConfirmPassword('');
    setForgotPassword('');
    setForgotConfirm('');
  }

  function closeForgotPassword() {
    setShowForgot(false);
    setForgotPassword('');
    setForgotConfirm('');
  }

  async function handleAuth(e) {
    e.preventDefault();

    const digits = phone.replace(/\D/g, '');
    const passwordValue = password.trim();
    const confirmValue = confirmPassword.trim();

    if (mode === 'phone' && !/^\d{6,14}$/.test(digits)) {
      return toast.error('Enter a valid mobile number');
    }
    if (mode === 'email' && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return toast.error('Enter a valid email address');
    }
    if (passwordValue.length < 6) return toast.error('Password must be at least 6 characters');
    if (accountMode === 'register' && passwordValue !== confirmValue) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      const phoneValue = mode === 'phone' ? digits : null;
      const dialValue = mode === 'phone' ? dialCode : null;
      const emailValue = mode === 'email' ? email.trim().toLowerCase() : null;

      const result = accountMode === 'register'
        ? await registerWithPassword(phoneValue, dialValue, emailValue, passwordValue)
        : await loginWithPassword(phoneValue, dialValue, emailValue, passwordValue);

      const user = result?.data?.user;
      setUser(user);

      if (user?.username) {
        toast.success(accountMode === 'register' ? 'Account created' : 'Signed in');
        navigate('/');
      } else {
        setStep(2);
        toast.success(accountMode === 'register' ? 'Account created. Complete your profile.' : 'Signed in. Complete your profile.');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();

    const digits = phone.replace(/\D/g, '');
    const nextPassword = forgotPassword.trim();
    const nextConfirm = forgotConfirm.trim();

    if (mode === 'phone' && !/^\d{6,14}$/.test(digits)) {
      return toast.error('Enter a valid mobile number');
    }
    if (mode === 'email' && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return toast.error('Enter a valid email address');
    }
    if (nextPassword.length < 6) return toast.error('New password must be at least 6 characters');
    if (nextPassword !== nextConfirm) return toast.error('New passwords do not match');

    setLoading(true);
    try {
      const phoneValue = mode === 'phone' ? digits : null;
      const dialValue = mode === 'phone' ? dialCode : null;
      const emailValue = mode === 'email' ? email.trim().toLowerCase() : null;

      await resetForgottenPassword(phoneValue, dialValue, emailValue, nextPassword);
      toast.success('Password updated. Please sign in with your new password.');
      closeForgotPassword();
      setAccountMode('login');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleProfile(e) {
    e.preventDefault();
    if (!username.trim()) return toast.error('Please enter your name');
    const form = new FormData();
    form.append('username', username.trim());
    form.append('about', about.trim());
    form.append('agreed', 'true');
    if (profileFile) form.append('profilepicture', profileFile);
    else form.append('profilePicture', avatar);
    setLoading(true);
    try {
      const result = await updateUserProfile(form);
      setUser(result.data);
      toast.success('Profile ready');
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        {(step === 2 || showForgot) && (
          <button className="back-link" onClick={() => (showForgot ? closeForgotPassword() : setStep(1))}>←</button>
        )}
        <div className="wa-logo">☎</div>
        <h1>{showForgot ? 'Reset Password' : accountMode === 'register' ? 'Create WhatsApp Account' : 'WhatsApp Login'}</h1>
        <div className="progress"><span style={{ width: step === 1 ? '50%' : '100%' }} /></div>

        {step === 1 && showForgot && (
          <form onSubmit={handleForgotPassword} className="login-form">
            <p className="muted">
              Confirm your mobile number or email, then set a new password.
            </p>

            <div className="mode-tabs">
              <button type="button" className={mode === 'phone' ? 'active' : ''} onClick={() => setMode('phone')}>Mobile</button>
              <button type="button" className={mode === 'email' ? 'active' : ''} onClick={() => setMode('email')}>Email</button>
            </div>

            {mode === 'phone' ? (
              <div className="phone-row">
                <select value={dialCode} onChange={(e) => setDialCode(e.target.value)} aria-label="Country code">
                  {countryOptions.map((c) => <option key={`${c.alpha2}-${c.dialCode}`} value={c.dialCode}>{c.flag} {c.dialCode}</option>)}
                </select>
                <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="Mobile number" autoComplete="tel" />
              </div>
            ) : (
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" type="email" autoComplete="email" />
            )}

            <div className="password-field">
              <input
                value={forgotPassword}
                onChange={(e) => setForgotPassword(e.target.value)}
                placeholder="New password"
                type={showForgotPassword ? 'text' : 'password'}
                autoComplete="new-password"
                maxLength={128}
              />
              <button type="button" className="password-toggle" onClick={() => setShowForgotPassword((v) => !v)}>
                {showForgotPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <input
              value={forgotConfirm}
              onChange={(e) => setForgotConfirm(e.target.value)}
              placeholder="Confirm new password"
              type={showForgotPassword ? 'text' : 'password'}
              autoComplete="new-password"
              maxLength={128}
            />

            <button className="primary-btn" disabled={loading}>
              {loading ? 'Please wait...' : 'Reset password'}
            </button>
            <p className="tiny-note">You'll need to sign in again with your new password.</p>
          </form>
        )}

        {step === 1 && !showForgot && (
          <form onSubmit={handleAuth} className="login-form">
            <p className="muted">
              {accountMode === 'login'
                ? 'Sign in using your mobile number or email and password.'
                : 'Create an account using your mobile number or email and password.'}
            </p>

            <div className="account-tabs">
              <button type="button" className={accountMode === 'login' ? 'active' : ''} onClick={() => switchAccountMode('login')}>Sign in</button>
              <button type="button" className={accountMode === 'register' ? 'active' : ''} onClick={() => switchAccountMode('register')}>Create account</button>
            </div>

            <div className="mode-tabs">
              <button type="button" className={mode === 'phone' ? 'active' : ''} onClick={() => setMode('phone')}>Mobile</button>
              <button type="button" className={mode === 'email' ? 'active' : ''} onClick={() => setMode('email')}>Email</button>
            </div>

            {mode === 'phone' ? (
              <div className="phone-row">
                <select value={dialCode} onChange={(e) => setDialCode(e.target.value)} aria-label="Country code">
                  {countryOptions.map((c) => <option key={`${c.alpha2}-${c.dialCode}`} value={c.dialCode}>{c.flag} {c.dialCode}</option>)}
                </select>
                <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="Mobile number" autoComplete="tel" />
              </div>
            ) : (
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" type="email" autoComplete="email" />
            )}

            <div className="password-field">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={accountMode === 'login' ? 'current-password' : 'new-password'}
                maxLength={128}
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {accountMode === 'register' && (
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                maxLength={128}
              />
            )}

            {accountMode === 'login' && (
              <button type="button" className="forgot-link" onClick={openForgotPassword}>
                Forgot password?
              </button>
            )}

            <button className="primary-btn" disabled={loading}>
              {loading ? 'Please wait...' : accountMode === 'register' ? 'Create account' : 'Sign in'}
            </button>
            <p className="tiny-note">Use the same password next time you sign in. Password must be at least 6 characters.</p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleProfile} className="login-form">
            <p className="muted">Complete your profile</p>
            <button type="button" className="avatar-upload" onClick={() => fileRef.current?.click()}>
              <img src={preview || avatar} alt="Profile preview" />
              <span>Change photo</span>
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
            {!profileFile && <div className="avatar-grid">{avatars.map((a) => <img key={a} src={a} className={avatar === a ? 'selected' : ''} onClick={() => setAvatar(a)} alt="avatar" />)}</div>}
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your name" maxLength={40} />
            <textarea value={about} onChange={(e) => setAbout(e.target.value)} placeholder="About" maxLength={140} rows={3} />
            <button className="primary-btn" disabled={loading}>{loading ? 'Saving...' : 'Continue to WhatsApp'}</button>
          </form>
        )}
      </div>
    </div>
  );
}
