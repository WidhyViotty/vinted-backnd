const express = require("express");
const router = express.Router();
const isAuthenticated = require("..//middlewares/isAuthenticated");
const cloudinary = require("cloudinary").v2;

const Offer = require("../models/Offer");

cloudinary.config({
  cloud_name: "dldm9qwvd",
  api_key: "183974827523223",
  api_secret: "U-YgI7HvHb86j_R2MTqjeCxqAYI",
});

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  //   console.log(req.fields);
  //   console.log(req.files.picture);
  try {
    const newOffer = new Offer({
      product_name: req.fields.title,
      product_description: req.fields.description,
      product_price: req.fields.price,
      product_details: [
        { MARQUE: req.fields.brand },
        { TAILLE: req.fields.size },
        { ETAT: req.fields.condition },
        { COULEUR: req.fields.color },
        { EMPLACEMENT: req.fields.city },
      ],
      owner: req.user,
    });

    //CLOUDINARY
    const result = await cloudinary.uploader.upload(req.files.picture.path, {
      folder: "vinted/offers",
      public_id: `${req.fields.title} - ${newOffer._id}`,
    });

    //AJOUTER RESULT A PRODUCT_IMAGE
    newOffer.product_image = result;

    //ENREGISTRE L'ANNONCE
    await newOffer.save();
    res.json(newOffer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/offers", async (req, res) => {
  try {
    let filters = {};
    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");
    }

    let page;
    if (Number(req.query.page) < 1) {
      page = 1;
    } else {
      page = Number(req.query.page);
    }

    let limit = 3;

    const offers = await Offer.find(filters)
      .select("product_name product_price")
      .skip((page - 1) * limit)
      .limit(limit);
    res.status(200).json(offers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const offer = await Offer.findById(id).populate({
      path: "owner",
      select: "account.username",
    });
    res.status(200).json(offer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
