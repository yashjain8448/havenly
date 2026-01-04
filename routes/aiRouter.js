// External module
const express = require("express");

const aiController = require("../controllers/aiController");

const aiRouter = express.Router();

aiRouter.post("/suggest-price", aiController.suggestPrice);

module.exports = aiRouter;