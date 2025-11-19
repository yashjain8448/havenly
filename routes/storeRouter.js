// External module
const express = require("express");

// Local Module
const storeController = require("../controllers/storeController");

const storeRouter = express.Router();

storeRouter.get("/", storeController.getIndex);
storeRouter.get("/homes", storeController.getHomes);
storeRouter.get("/bookings", storeController.getBookings);
storeRouter.get("/favourites", storeController.getFavourites);
storeRouter.get("/homes/:homeID", storeController.getHomeDetails);
storeRouter.post("/favourites", storeController.postAddToFavourites);
storeRouter.post(
  "/favourites/delete-home/:homeId",
  storeController.postDeleteFromFavourites
);

module.exports = storeRouter;
