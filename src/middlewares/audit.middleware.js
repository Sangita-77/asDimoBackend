export const auditLogger = (req, res, next) => {
  const { method, originalUrl, ip, user } = req;
  console.log(`[AUDIT] ${method} ${originalUrl} from ${ip} ${user ? `user=${user._id || user.id}` : "anon"}`);
  next();
};
