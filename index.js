require('dotenv').config()

const cors = require("cors");
const express = require("express");
const mysql = require("mysql");
const app = express();

app.use(express.json());
app.use(
    cors({
        origin: 'https://angular-cloud-run-7teekrs4qq-uc.a.run.app'
    })
);
app.options("*",cors());

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


app.get("/user/:id", async (req, res) => {
    const query = "SELECT * FROM users WHERE id = ?";
    pool.query(query, [req.params.id], (error, results) => {
      if (!results[0]) {
        res.json({ status:"Not found!" });
      } else {
        res.json(results[0]);
      }
    });
});

app.get("/user", async (req, res) => {
    const query = "SELECT * FROM users";
    pool.query(query, (error, results) => {
        if (!results[0]) {
        // if (results="[]") {
        res.json({ status:"Not found!" });
      } else {
        res.json(results);
      }
    });
});

app.post("/", async (req, res) => {
    const data = {
      fullname: req.body.fullname,
      email: req.body.email,
      mobile: req.body.mobile
    }

    // const testing = "SELECT * FROM users WHERE email = ? OR mobile = ?"
    const testing = `SELECT * FROM users WHERE email='${req.body.email}' OR mobile='${req.body.mobile}'`
    const query = "INSERT INTO users (fullname, email, mobile) VALUES (?, ?, ?)";
    pool.query(testing, (error, results) => {
      
        if (results[0]){
          res.json({
              status: "data exists",
              results: results[0]
          })
          return          
      }

      pool.query(query, Object.values(data), (error, results) =>{
          if (error) {
            res.json({ status: "failure", reason: error.code  });
          } else {
            res.json({ status: "success", data: data});
          }        
      })
      
    });

});

app.get("/", async (req, res) => {
    res.json({ status: "Bark bark! Ready to roll!" });
});


const pool = mysql.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
});


const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`BarkBark Rest API listening on port ${port}`);
});