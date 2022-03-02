require('dotenv').config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
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
    const data = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      password: req.body.password
    }

    //   first_name = req.body.first_name
    //   last_name = req.body.last_name
    //   email = req.body.email
      
          


    // const testing = "SELECT * FROM users WHERE email = ? OR mobile = ?"
    const testing = `SELECT * FROM users WHERE email='${req.body.email}'`
    // const query = "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)";
    


    pool.query(testing, async (error, results) => {
      
        if (results[0]){
          res.json({
              status: false,
              message: "Email already registered"
          })
          return   
      }

      const first_name = req.body.first_name
      const last_name = req.body.last_name
      const email = req.body.email      
      const password = await bcrypt.hash(req.body.password, 10)
      const jwt_secret = process.env.JWT_SECRET      

    //   const token = signToken({first_name: first_name, last_name: last_name, email: email}, "1h")
    //   const rawJWT = jwt.decode(token);
      
      const query = `INSERT INTO users (first_name, last_name, email, password) VALUES ('${first_name}', '${last_name}', '${email}', '${password}')`;

    //   const token = jwt.sign(
    //     {
    //       first_name: req.body.first_name,
    //       last_name: req.body.last_name,
    //       email: req.body.email,
    //     },
    //     process.env.JWT_SECRET,
    //     {
    //       expiresIn: "1h",
    //     }
    //   );            
    
    //   const rawJWT = jwt.decode(token);
      
    //   pool.query(query, Object.values(data), (error, results) =>{
      pool.query(query, async (error, results) =>{
          if (error) {
            res.json({ status: "failure", reason: error.code  });
            return
          } 
        //   else {
        //     // res.json({ status: "success", data: data});
        //     res.json({
        //         success: true,
        //         token: token,
        //         // expiresAt: rawJWT.exp,
        //         // message: "Registration Successful",
        //         data: data
        //     })
        //   }
            pool.query(testing, async (error, results) => {
                
                //   const token = jwt.sign(
                //         {
                //           id:results[0].user_id
                //         },
                //         jwt_secret,
                //         {
                //           expiresIn: "1h",
                //         }
                //       );            
                      const token = signToken ({id: results[0].user_id}, "1h")
                      const rawJWT = jwt.decode(token);

                res.json({
                    success: true,
                    token: token,
                    expiresAt: rawJWT.exp,
                    message: "Registration Successful",
                })

            })
            
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



// signtoken
const signToken = (payload, expiresIn) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      // algorithm: "RS256",
      expiresIn,
    });
  
    return token;
};

const token = signToken ({id: 1}, "1h")
console.log(token)



//Listening on Port
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`BarkBark Rest API listening on port ${port}`);
  
});

