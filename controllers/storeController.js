const Home = require("../models/homes");
const User = require("../models/user");
const { sendBookingEmail } = require("../utils/sendEmail");

// Handling Home GET request
exports.getHomes = (req, res, next) => {
  
  if(!req.session.isLoggedIn){
    return res.redirect('/auth/login');
  }

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

  if(!req.session.isLoggedIn){
    return res.redirect('/auth/login');
  }

  res.render("store/bookings", {
    pageTitle: "My Bookings",
    currentPage: "bookings",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};

exports.getFavourites = async (req, res, next) => {

  if(!req.session.isLoggedIn){
    return res.redirect('/auth/login');
  }

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

  if(!req.session.isLoggedIn){
    return res.redirect('/auth/login');
  }

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

exports.postAddBooking = async (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/auth/login");
  }

  const userId = req.session.user._id;
  const homeId = req.body.homeId;

  try {
    const user = await User.findById(userId);
    const home = await Home.findById(homeId);

    if (!user.bookedHomes.includes(homeId)) {
      user.bookedHomes.push(homeId);
      await user.save();

      sendBookingEmail(user.email, user.name, home);

      // Store home for success page
      req.session.latestHome = home;
      
      return res.redirect("/bookings-success");
    } else {
      return res.redirect("/bookings");
    }

  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
};

exports.getBookingSuccess = async (req, res, next) => {

  if(!req.session.isLoggedIn){
    return res.redirect('/auth/login');
  } 
  
  const home = req.session.latestHome;

  res.render("store/bookingSuccess", {
    pageTitle: "Booking Successful",
    currentPage: "bookings",
    isLoggedIn: req.session.isLoggedIn,
    user: req.session.user,
    homeDetails: home
  });
}