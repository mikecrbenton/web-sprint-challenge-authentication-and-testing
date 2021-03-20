const express = require('express')
const db = require("../../data/dbConfig")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken") // 3rd party

const router = express.Router()

async function add(newUser) {
	const [id] = await db("users").insert(newUser)
	return findById(id)
}

function findById(id) {
   return db("users")
   .where("id",id)
   .select("id","username","password")
}

function findByUserName(username) {
   return db("users")
      .where("username",username)
      .first("id","username","password")
}

router.post('/register', async (req, res, next) => {
  // res.end('implement register, please!');
  /*======================================================================================
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  =========================================================================================*/
   try{
      // NOT ALL REQUIRED FIELDS
      if( !req.body.username || !req.body.password ) {
         return res.status(401).json({message:"username and password required"})
      }
      // DUPLICATED USERNAME
      const user = await findByUserName(req.body.username)

      if(user) {
         return res.status(409).json({ message: "username taken" })
      }

      const newUser = await add({
			username: req.body.username,
			// hash the password with a time complexity set to the system (.env variable )
			password: await bcrypt.hash(req.body.password, 12),
		})

		res.status(201).json(newUser)

   }catch(err){
      next(err)
   }
});

router.post('/login', async (req, res, next) => {
  //res.end('implement login, please!');
  /*=======================================================================================
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  ==========================================================================================*/
  try{
      // NOT ALL REQUIRED FIELDS
      if( !req.body.username || !req.body.password ) {
         return res.status(401).json({message:"username and password required"})
      }
      // USERNAME NOT FOUND
      const user = await findByUserName(req.body.username)
		
		if (!user) {
			return res.status(401).json({ message: "invalid credentials" })
		}

      // COMPARE PASSWORDS
		const passwordValid = await bcrypt.compare(req.body.password, user.password)

      if (!passwordValid) { 
         return res.status(401).json({ message: "invalid credentials" })
		}

      // jwt.sign( payload, secretOrPrivateKey, [options,callback])
      const token = jwt.sign({ id: user.id, username: user.username}, process.env.JWT_SECRET)

      res.json({
         message: `welcome ${user.username}!`, 
         token: token // TOKEN IS RETURNED IN THE RESPONSE BODY======
		})
     
  }catch(err){
     next(err)
  }
});

module.exports = router;
