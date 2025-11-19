// Handling Add Home GET request
const e = require("express");
const Home = require("../models/homes");
const fs = require("fs");

exports.getAddHome = (req, res, next) => {
  res.render("host/editHome", {
    pageTitle: "Add Home",
    currentPage: "Add Home",
    editing: false,
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};

exports.getHostHomes = (req, res, next) => {
  // find is expecting a callback so we are passsing a function
  // which need an array
  Home.find().then((registeredHomes) => {
    res.render("host/hostHomeList", {
      registeredHomes: registeredHomes,
      pageTitle: "Host Home List",
      currentPage: "hostHomesList",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};

// Handling Add Home POST request
exports.postAddHome = (req, res, next) => {
  const { houseName, location, rating, price, description } = req.body;

  const homeImage = req.files?.homeImage?.[0]?.path;
  const homeBrochurePath = req.files?.homeBrochurePath?.[0]?.path; // temp uploaded PDF

  if (!homeImage) {
    return res.status(422).send("No image provided or invalid image format");
  }
  if (!homeBrochurePath) {
    return res
      .status(422)
      .send("No brochure provided or invalid brochure format");
  }

  const home = new Home({
    houseName,
    location,
    rating,
    homeImage,
    homeBrochurePath,
    price,
    description,
  });
  home.save().then(() => {
    console.log("Home saved!");
  });
  res.redirect("/host/host-homes-list");
};

exports.getEditHome = (req, res, next) => {
  const homeId = req.params.homeId;
  const editing = req.query.editing === "true";

  Home.findById(homeId).then((home) => {
    if (!home) {
      // if home not found
      console.log("No home Found");
      res.redirect("/host/host-homes-list");
    } else {
      console.log(homeId, editing, home);
      res.render("host/editHome", {
        home: home,
        pageTitle: "Edit your Home",
        currentPage: "hostHomesList",
        editing: editing,
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
      });
    }
  });
};

exports.postEditHome = (req, res, next) => {
  const { id, houseName, location, rating, price, description } = req.body;

  Home.findById(id)
    .then((home) => {
      (home.houseName = houseName),
        (home.rating = rating),
        (home.price = price),
        (home.location = location),
        (home.description = description);

      const newImage = req.files?.homeImage?.[0];
      const newBrochure = req.files?.homeBrochurePath?.[0];

      // update image
      if (newImage) {
        home.homeImage = newImage.path;
      }

      // update brochure
      if (newBrochure) {
        home.homeBrochurePath = newBrochure.path;
      }

      home
        .save()
        .then((result) => {
          console.log("Home Updated", result);
        })
        .catch((error) => {
          console.log(error);
        });
      res.redirect("/host/host-homes-list");
    })
    .catch((error) => {
      console.log("Error while finding home", error);
    });
};

exports.postDeleteHome = (req, res, next) => {
  const homeId = req.params.homeId;
  Home.findByIdAndDelete(homeId)
    .then(() => {
      res.redirect("/host/host-homes-list");
    })
    .catch((error) => {
      console.log(error);
    });
};
