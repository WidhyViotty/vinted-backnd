const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  //console.log(req.headers.authorization);
  if (req.headers.authorization) {
    const user = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", ""),
    });
    //console.log(user);
    if (user) {
      //TOKEN VALIDE DONC ENVOI DES INFOS A LA ROUTE OFFER
      req.user = user;
      next();
    } else {
      res.status(401).json({ error: "Token présent mais non valide !" });
    }
  } else {
    res.status(401).json({ error: "Token non envoyé !" });
  }
};

module.exports = isAuthenticated;
