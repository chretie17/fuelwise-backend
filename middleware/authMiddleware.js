// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, '563f9b4f5b4c7d356ad3865ad60b67be44e42066739d75ce8022afc5a54ce5fa', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
