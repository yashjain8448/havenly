const user = require("../models/user");

exports.getPageNotFound = (req, res, next) => {
  res.status(404).render("pageNotFound", {
    pageTitle: "Page Not Found",
    currentPage: "pageNotFound",
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};
