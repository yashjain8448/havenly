require("dotenv").config();
const path = require("path");
// External Modules
const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const multer = require("multer");
const cloudinary = require("./config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");


// Local Modules
const hostRouter = require("./routes/hostRouter");
const storeRouter = require("./routes/storeRouter");
const rootDir = require("./utils/PathUtils");
const errorController = require("./controllers/error");
const { default: mongoose } = require("mongoose");
const authRouter = require("./routes/authRouter");
const { getRandomString } = require("./utils/getRandomStringFunction");

const app = express();
const url = process.env.MONGO_URI;

const store = new MongoDBStore({
  uri: url,
  collection: "sessions",
});

app.set("view engine", "ejs"); // to embeed ejs into our project
app.set("views", "Views");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {

    // Detect file type
    const isPDF = file.mimetype === "application/pdf";

    return {
      folder: isPDF ? "Havenly/Brochures" : "Havenly/Images",
      
      // IMPORTANT: PDFs must be 'raw', images remain 'image'
      resource_type: isPDF ? "raw" : "image",

      // Remove accidental double-extension
      public_id: `${Date.now()}_${file.originalname.replace(/\.[^/.]+$/, "")}`,

      // Set format correctly
      format: isPDF ? "pdf" : file.mimetype.split("/")[1],
    };
  },
});



// to ensure on backend as well that only images are uploaded
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const multerOptions = {
  storage: storage,
  fileFilter: fileFilter,
};

// to parse the request
app.use(express.urlencoded());
app.use(express.static(path.join(rootDir, "public"))); // to make public folder files accessible for browser
app.use(
  multer(multerOptions).fields([
    { name: "homeImage", maxCount: 1 },
    { name: "homeBrochurePath", maxCount: 1 },
  ])
);
app.use("/host/uploads", express.static(path.join(rootDir, "uploads")));
app.use("/homes/uploads", express.static(path.join(rootDir, "uploads")));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    // do not save session if unmodified
    resave: false,
    // create session for uninitialized sessions
    saveUninitialized: true,
    store: store,
  })
);

app.use((req, res, next) => {
  // setting the isLoggedIn
  req.isLoggedIn = req.session.isLoggedIn;
  next();
});

// make currentPage available to all views (so partials can highlight active links)
app.use((req, res, next) => {
  const p = req.path;
  if (p === "/") res.locals.currentPage = "Home";
  else if (p === "/host/add-home") res.locals.currentPage = "Add Home";
  else res.locals.currentPage = "";
  next();
});

// this is done to make code modular
app.use(storeRouter);
app.use("/host", hostRouter);
app.use(authRouter);

app.use(errorController.getPageNotFound);

mongoose
  .connect(url)
  .then(() => {
    app.listen(process.env.PORT || 3001, () => {
      console.log("server listening");
    });
  })
  .catch((error) => {
    console.log(error);
  });