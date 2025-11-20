require('dotenv').config()

const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyParser.json());

app.use(   // Serve images statically
  "/uploads/images",
  express.static(path.join(__dirname, "uploads", "images"))
);


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

  next();
});

app.use("/api/places", placesRoutes); // => /api/places...
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  // Roll back uploaded file if an error occurred and a file exists
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log("Rollback delete:", err || "File removed successfully");
    });
  }
  if (res.headersSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "Unknown server error." });
});

mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    app.listen(5005);
  })
  .catch((err) => {
    console.log(err);
  });
