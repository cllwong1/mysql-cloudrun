require('dotenv').config();
const jwt = require("jsonwebtoken");
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



/* Start of Register path */
/* Start of Register path */

app.post("/user/register", async (req, res) => {
    // const data = {
    //   first_name: req.body.first_name,
    //   last_name: req.body.last_name,
    //   email: req.body.email,
    //   password: req.body.password
    // }

      first_name = req.body.first_name
      last_name = req.body.last_name
      email = req.body.email
      password = req.body.password
      hash = "hehehe"      


    // const testing = "SELECT * FROM users WHERE email = ? OR mobile = ?"
    const testing = `SELECT * FROM users WHERE email='${req.body.email}'`
    // const query = "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)";
    const query = `INSERT INTO users (first_name, last_name, email, password, hash) VALUES ('${first_name}', '${last_name}', '${email}', '${password}', '${hash}')`;


    pool.query(testing, (error, results) => {
      
        if (results[0]){
          res.json({
              status: false,
              message: "Email already registered"
          })
          return   
      }


    //   pool.query(query, Object.values(data), (error, results) =>{
      pool.query(query, (error, results) =>{
          if (error) {
            res.json({ status: "failure", reason: error.code  });
          } else {
            // res.json({ status: "success", data: data});
            res.json({
                success: true
            })
          }        
      })
      
    });

});

/* End of Register path */
/* End of Register path */




//Check if it is connected
app.get("/", async (req, res) => {
    res.json({ status: "Bark bark! Ready to roll!" });
});



//Database details
const pool = mysql.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
});






//Listening on Port
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`BarkBark Rest API listening on port ${port}`);
});