require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const express = require("express");
const mysql = require("mysql");
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "https://angular-cloud-run-7teekrs4qq-uc.a.run.app",
  })
);
app.options("*", cors());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,X-Auth-Token,X-Language');
//     res.setHeader('Access-Control-Allow-Credentials', true);
//     next();
// });

app.get("/user/:user_id", async (req, res) => {
  const query = "SELECT * FROM users WHERE user_id = ?";
  pool.query(query, [req.params.user_id], (error, results) => {
    if (results.length === 0) {
      res.status(404).json({
        success: false,
        message: "Error getting user id",
      });
    } else {
      res.status(200).json({
        success: true,
        data: results[0],
      });
    }
  });
});

app.get("/user", async (req, res) => {
  const query = "SELECT * FROM users";
  pool.query(query, (error, results) => {
    if (results.length === 0) {
      // if (results="[]") {
      res.status(404).json({
        success: false,
        message: "No user found",
      });
    } else {
      res.status(200).json({
        success: true,
        data: results,
      });
    }
  });
});

/* Start of Register path */
/* Start of Register path */

app.post("/user/register", async (req, res) => {
  // const testing = "SELECT * FROM users WHERE email = ? OR mobile = ?"
  const testing = `SELECT * FROM users WHERE email='${req.body.email}'`;
  // const query = "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)";

  pool.query(testing, async (error, results) => {
    if (results.length > 0) {
      res.status(400).json({
        status: false,
        message: "Email already registered",
      });
      return;
    }

    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const email = req.body.email;
    const password = await bcrypt.hash(req.body.password, 10);

    const token = signToken(
      { first_name: first_name, last_name: last_name, email: email },
      "1h"
    );
    const rawJWT = jwt.decode(token);

    const query = `INSERT INTO users (first_name, last_name, email, password) VALUES ('${first_name}', '${last_name}', '${email}', '${password}')`;

    //   pool.query(query, Object.values(data), (error, results) =>{
    pool.query(query, async (error, results) => {
      if (error) {
        res.status(500).json({
          success: false,
          message: "Error registering user",
        });
        return;
      }
      res.status(201).json({
        success: true,
        token: token,
        expiresAt: rawJWT.exp,
        message: "Registration Successful",
      });
    });
  });
});

/* End of Register path */
/* End of Register path */

//Check if it is connected
app.get("/", async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Ready to rock",
  });
});

//Database details
const pool = mysql.createPool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
});

// signtoken
const signToken = (payload, expiresIn) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    // algorithm: "RS256",
    expiresIn,
  });

  return token;
};

//Listening on Port
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`BarkBark Rest API listening on port ${port}`);
});
