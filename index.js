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

/*Start: Get all the user by id */

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

/* End: Get all the user by id */

/*Start: Get all the user */

app.get("/user", verifyToken, async (req, res) => {
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
        loggedIn: req.user,
      });
    }
  });
});

/* End: Get all the user */

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

    const password = await bcrypt.hash(req.body.password, 10);

    const token = signToken(
      {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
      },
      "1h"
    );

    const rawJWT = jwt.decode(token);

    const query = `INSERT INTO users (first_name, last_name, email, password) VALUES ('${req.body.first_name}', '${req.body.last_name}', '${req.body.email}', '${password}')`;

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

/* Start of Login path */
/* Start of Login path */
app.post("/user/login", async (req, res) => {
  const testing = `SELECT * FROM users WHERE email='${req.body.email}'`;

  pool.query(testing, async (error, results) => {
    if (results[0]) {
      const authenticated = await bcrypt.compare(
        req.body.password,
        results[0].password
      );
      if (authenticated) {
        const token = signToken(
          {
            first_name: results[0].first_name,
            last_name: results[0].last_name,
            email: results[0].email,
          },
          "1h"
        );
        const rawJWT = jwt.decode(token);
        res.status(200).json({
          success: true,
          token: token,
          expiresAt: rawJWT.exp,
          message: "Log in successful",
        });
      } else {
        res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
  });
});
/* End of Login path */
/* End of Login path */

//Check if it is connected

app.get("/", async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Ready to rock",
  });
});

//Start of Database details //

const pool = mysql.createPool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
});

//End of Database details //

// Start of signtoken //

const signToken = (payload, expiresIn) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    // algorithm: "RS256",
    expiresIn,
  });

  return token;
};

// End of signtoken //

// Start of verifyToken //

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token === null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// End of verifyToken //

//Listening on Port
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`BarkBark Rest API listening on port ${port}`);
});
