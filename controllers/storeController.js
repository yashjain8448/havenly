const Home = require("../models/homes");
const User = require("../models/user");

// Handling Home GET request
exports.getHomes = (req, res, next) => {
  Home.find().then((registeredHomes) => {
    res.render("store/homeList", {
      registeredHomes: registeredHomes,
      pageTitle: "Home List",
      currentPage: "homesList",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.postAddToFavourites = async (req, res, next) => {
  const homeId = req.body.homeId;
  const userId = req.session.user._id;
  const user = await User.findById(userId);
  // if not already in favourites, then only add
  if (!user.favourites.includes(homeId)) {
    user.favourites.push(homeId);
    await user.save();
  }
  res.redirect("/favourites");
};

exports.getIndex = (req, res, next) => {
  // find is expecting a callback so we are passsing a function
  // which need an array
  Home.find().then((registeredHomes) => {
    res.render("store/index", {
      registeredHomes: registeredHomes,
      pageTitle: "Havenly Home",
      currentPage: "Home",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};

exports.getBookings = (req, res, next) => {
  res.render("store/bookings", {
    pageTitle: "My Bookings",
    currentPage: "bookings",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};

exports.getFavourites = async (req, res, next) => {
  // populate() tells Mongoose to replace the referenced ObjectId (homeId) with the actual document it points to in another collection (likely Home).

  const userId = req.session.user._id;
  const user = await User.findById(userId).populate("favourites");

  res.render("store/favouriteList", {
    favouriteHomes: user.favourites,
    pageTitle: "My Favourites",
    currentPage: "favourites",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};

exports.getHomeDetails = (req, res, next) => {
  const homeID = req.params.homeID; // getting homeID from the path
  Home.findById(homeID).then((home) => {
    if (!home) {
      console.log("Home not found");
      res.redirect("/homes");
    } else {
      res.render("store/homeDetails", {
        home: home,
        pageTitle: "Home Details",
        currentPage: "homesList",
        isLoggedIn: req.isLoggedIn,
        user: req.session.user,
      });
    }
  });
};

exports.postDeleteFromFavourites = async (req, res, next) => {
  const homeId = req.params.homeId;
  const userId = req.session.user._id;
  const user = await User.findById(userId);

  // remove only if favourite Home exists
  if (user.favourites.includes(homeId)) {
    user.favourites.pull(homeId);
    await user.save();
  }
  res.redirect("/favourites");
};

