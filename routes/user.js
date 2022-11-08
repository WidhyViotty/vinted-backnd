const express = require("express");
const router = express.Router();
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const User = require("../models/User");

router.post("/user/signup", async (req, res) => {
  const { username, email, password, newsletter } = req.fields;

  try {
    //EMAIL EXISTANT ?
    const user = await User.findOne({ email: email });

    //EMAIL EXISTANT = MESSAGE ERREUR
    if (user) {
      res.status(409).json({ message: "This email already exist" });
      //EMAIL NON EXISTANT = CREATION USER
    } else {
      if (email && username && password) {
        //ENCRYPTER MDP
        const token = uid2(64);
        const salt = uid2(64);
        const hash = SHA256(password + salt).toString(encBase64);
        //CRETATION USER
        const newUser = new User({
          email: email,
          account: {
            username: username,
          },
          newsletter: newsletter,
          token: token,
          hash: hash,
          salt: salt,
        });
        //SAUVEGARDER USER DANS BDD
        await newUser.save();
        //REPONSE AU CLIENT
        res.status(200).json({
          _id: newUser._id,
          email: newUser.email,
          token: newUser.token,
          account: newUser.account,
        });
      } else {
        res.status(400).json({
          message: "Missing field",
        });
      }
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.fields;
    const userToCheck = await User.findOne({ email: email });
    if (userToCheck === null) {
      res.status(401).json({ message: "Unregistered email" });
    } else {
      const newHash = SHA256(req.fields.password + userToCheck.salt).toString(
        encBase64
      );

      //console.log("newHash==>", newHash);
      //console.log("hashToCheck", userToCheck.hash);
      if (userToCheck.hash === newHash) {
        res.json({
          _id: userToCheck._id,
          token: userToCheck.token,
          account: userToCheck.account,
        });
      } else {
        res.status(401).json({ message: "Wrong password" });
      }
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
