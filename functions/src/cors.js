const cors = require("cors")({
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

const corsHandler = (handler) => {
  return (req, res) => {
    return cors(req, res, () => {
      return handler(req, res);
    });
  };
};

module.exports = {corsHandler}; 