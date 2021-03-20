const supertest = require("supertest")
const server = require("./server")
const db = require("../data/dbConfig")


// beforeAll( async ()=> {
//    await db.migrate.rollback()
//    await db.migrate.latest()
// })

// afterAll( async () => {
//    await db.destroy()
// })


describe("server.test.js - endpoint testing" , () => {

   it("/", async() => {
      const res = await supertest(server)
         .get("/")  
         expect(res.body.message).toBe("Welcome to our API")
   })
   // REGISTER========================================================
   it("/auth/register/ - NO USERNAME", async() => {
      const res = await supertest(server)   
         .post("/api/auth/register")
         .send( { username: "", password:"Password" } )
         expect(res.statusCode).toBe(401)
   })

   it("/auth/register/ - NEW USERNAME", async() => {
      const res = await supertest(server)   
         .post("/api/auth/register")
         .send( { username: "adam", password:"Password4" } )
         expect(res.statusCode).toBe(201)
   })

   it("/auth/register/ - USERNAME TAKEN", async() => {
      const res = await supertest(server)   
         .post("/api/auth/register")
         .send( { username: "adam", password:"Password4" } )
         expect(res.statusCode).toBe(409)
   })

   // LOGIN=============================================================

   let token; // variable to assign and use for /api/jokes testing

   it("/auth/login/ - NO MATCH", async() => {
      const res = await supertest(server)   
         .post("/api/auth/login")
         .send( { username: "Bobby Snodgrass", password:"Password4" } )
         expect(res.statusCode).toBe(401)
   })

   it("/auth/login/ - MATCH", async() => {
      const res = await supertest(server)   
         .post("/api/auth/login")
         .send( { username: "adam", password:"Password4" } )
         token = res.body.token
         expect(res.body.message).toBe('welcome adam!')
   })

   // ACCESS JOKES ENDPOINT=============================================
   it("/auth/jokes/ - NO TOKEN", async() => {
      const res = await supertest(server)   
         .get("/api/jokes")
         .set( "authorization" , "" )
         expect(res.statusCode).toBe(401)
   })

   it("/auth/jokes/ - WITH TOKEN", async() => {
      const res = await supertest(server)   
         .get("/api/jokes")
         .set( "authorization", token )
         expect(res.statusCode).toBe(200)
   })

})
