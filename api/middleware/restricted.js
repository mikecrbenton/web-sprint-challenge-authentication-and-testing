const jwt = require("jsonwebtoken")

async function restrict(req,res,next) {
   /*====================================================================================
      ------IMPLEMENT-----
      1- On valid token in the Authorization header, call next.

      2- On missing token in the Authorization header,
         the response body should include a string exactly as follows: "token required".

      3- On invalid or expired token in the Authorization header,
         the response body should include a string exactly as follows: "token invalid".
   =====================================================================================*/
   console.log(req)
      try{
         const token = req.headers.authorization
          // CHECK NOT EMPTY
          if(!token) {
            return res.status(401).json({ message: "token required"})
         }
         // VERIFY TOKEN
         jwt.verify(token, process.env.JWT_SECRET, (err,decoded)=>{
            if(err){
               return res.status(401).json({ message:"token invalid"})
            }
            req.token = decoded
            next()
         })

      }catch(err){
         next(err)
      }
}

module.exports = {restrict}