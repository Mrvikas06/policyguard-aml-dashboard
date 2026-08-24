const rateLimitMap = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 200;

function cleanup() {
  const now = Date.now();
  for (const [key, data] of rateLimitMap.entries()) {
    if (now - data.windowStart > WINDOW_MS * 2) {
      rateLimitMap.delete(key);
    }
  }
}

setInterval(cleanup, 5 * 60 * 1000);

export function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const key = `${ip}:${req.path}`;
  const now = Date.now();
  
  let data = rateLimitMap.get(key);
  
  if (!data || now - data.windowStart > WINDOW_MS) {
    data = { count: 0, windowStart: now };
    rateLimitMap.set(key, data);
  }
  
  data.count++;
  
  res.set({
    'X-RateLimit-Limit': MAX_REQUESTS,
    'X-RateLimit-Remaining': Math.max(0, MAX_REQUESTS - data.count),
    'X-RateLimit-Reset': new Date(data.windowStart + WINDOW_MS).toISOString()
  });
  
  if (data.count > MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((data.windowStart + WINDOW_MS - now) / 1000)
    });
  }
  
  next();
}

export function strictRateLimiter(maxRequests = 20, windowMs = 60 * 1000) {
  const map = new Map();
  
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const key = `${ip}:${req.path}`;
    const now = Date.now();
    
    let data = map.get(key);
    if (!data || now - data.windowStart > windowMs) {
      data = { count: 0, windowStart: now };
      map.set(key, data);
    }
    
    data.count++;
    
    if (data.count > maxRequests) {
      return res.status(429).json({
        error: 'Too Many Requests',
        retryAfter: Math.ceil((data.windowStart + windowMs - now) / 1000)
      });
    }
    
    next();
  };
}