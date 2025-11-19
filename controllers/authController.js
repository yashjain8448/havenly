const { check, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    pageTitle: "Login",
    currentPage: "login",
    editing: false,
    isLoggedIn: false,
    errorMessages: [],
    oldInput: { email: "" },
    user:{}
  });
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      currentPage: "login",
      editing: false,
      errorMessages: ["User does not exist"],
      oldInput: { email: email },
      isLoggedIn: false,
      user:{},
    });
  }

  // checking password matches or not
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      currentPage: "login",
      editing: false, 
      errorMessages: ["Invalid password"],
      oldInput: { email: email },
      isLoggedIn: false,
      user:{},
    });
  }

  req.session.isLoggedIn = true;
  req.session.user = user;
  await req.session.save();

  res.redirect("/");
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};

exports.getSignUp = (req, res, next) => {
  res.render("auth/signup", {
    pageTitle: "Sign Up",
    currentPage: "signup",
    isLoggedIn: false,
    errorMessages: [],
    user:{},
    oldInput: {
      firstName: "",
      lastName: "",
      email: "",
      userType: "guest",
    },
  });
};

exports.postSignUp = [
  check("firstName")
    .notEmpty()
    .withMessage("First Name cannot be empty")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First Name must be at least 2 characters long")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("First Name must contain characters only"),

  check("lastName")
    .trim()
    .matches(/^[A-Za-z\s]*$/)
    .withMessage("Last Name must contain characters only"),

  check("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail({ gmail_remove_dots: false }),

  check("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[\W_]/)
    .withMessage("Password must contain at least one special character")
    .trim(),

  check("confirmPassword")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password does not match");
      }
      return true;
    }),

  check("userType")
    .notEmpty()
    .withMessage("Please select a user type")
    .isIn(["guest", "host"])
    .withMessage("Invalid user type selected"),

  check("terms").custom((value) => {
    if (value !== "on") {
      throw new Error("You must accept the terms and conditions");
    }
    return true;
  }),

  (req, res, next) => {
    const { firstName, lastName, email, userType } = req.body;
    // to get validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(422).render("auth/signup", {
        pageTitle: "Sign Up",
        currentPage: "signup",
        isLoggedIn: false,
        user:{},
        errorMessages: errors.array().map((err) => err.msg),
        oldInput: {
          firstName,
          lastName,
          email,
          userType,
        },
      });
    }

    bcrypt.hash(req.body.password, 12).then((hashedPassword) => {
      const newUser = new User({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword,
        userType: userType,
      });
      return newUser
        .save()
        .then(() => {
          res.redirect("/login");
        })
        .catch((err) => {
          return res.status(422).render("auth/signup", {
            pageTitle: "Sign Up",
            currentPage: "signup",
            isLoggedIn: false,
            user:{},
            errorMessages: [err.message],
            oldInput: {
              firstName,
              lastName,
              email,
              userType,
            },
          });
        });
    });
  },
];
