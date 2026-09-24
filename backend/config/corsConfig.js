function getAllowedOrigins() {
  const configured = String(process.env.FRONTEND_URL || 'https://whatsapp-clonefrontend.onrender.com')
    .split(',')
    .map((value) => value.trim().replace(/\/$/, ''))
    .filter(Boolean);

  if (process.env.NODE_ENV !== 'production') {
    configured.push('http://localhost:3000');
  }

  return [...new Set(configured)];
}

function createCorsOriginValidator() {
  const allowedOrigins = getAllowedOrigins();

  return (origin, callback) => {
    // Requests without an Origin header (health checks, server-to-server calls)
    // are safe to allow. Browser requests must match FRONTEND_URL.
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS blocked origin: ${origin}`));
  };
}

module.exports = { getAllowedOrigins, createCorsOriginValidator };
