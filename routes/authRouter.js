// External module
const express = require("express");

// Local Module
const authController = require("../controllers/authController");

const authRouter = express.Router();

authRouter.get("/login", authController.getLogin);
authRouter.get("/signup", authController.getSignUp);
authRouter.post("/login", authController.postLogin);
authRouter.post("/logout", authController.postLogout);
authRouter.post("/signup", authController.postSignUp);


module.exports = authRouter;
