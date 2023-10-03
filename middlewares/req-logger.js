const requestLogger = (req, res, next) => {
  console.log(`${req.method} => ${req.url} => ${req.body}`);
  next();
};

export default requestLogger;
