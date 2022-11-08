const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");

//CREATION SERVEUR
const app = express();
app.use(formidable());

//IMPORT ROUTES
const userRoutes = require("./routes/user");
app.use(userRoutes);

const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

//CONNEXION A LA BDD
mongoose.connect("mongodb://localhost/vinted-bknd", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//MESSAGE ERREUR POUR ROUTES INEXISTANTES
app.all("*", (req, res) => {
  res.status(404).json({ message: "Cette route n'existe pas" });
});

//LANCEMENT SERVEUR
app.listen(3000, () => {
  console.log("server has started");
});
