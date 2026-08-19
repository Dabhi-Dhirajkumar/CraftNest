const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if(!authHeader) return res.status(403).json({ error: 'No token provided' });
  
  const token = authHeader.split(' ')[1];
  if(!token) return res.status(403).json({ error: 'Bearer token missing' });

  jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_here', (err, decoded) => {
    if(err) return res.status(401).json({ error: 'Unauthorized!' });
    req.user = decoded;
    next();
  });
};

exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ error: 'Require Admin Role!' });
  }
};

exports.isFacultyOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'Admin' || req.user.role === 'Faculty')) {
    next();
  } else {
    res.status(403).json({ error: 'Require Admin or Faculty Role!' });
  }
};
