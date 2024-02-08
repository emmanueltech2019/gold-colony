const express = require("express")
const {register,login,profile,getAllRealtors, changePassword, updatePersonalDetails} = require("../controllers/admin")
const { requireSignin, adminMiddleware } = require("../middlewares")
const routes = express.Router()


routes.patch("/change/details",requireSignin,updatePersonalDetails)
routes.post("/change/password",requireSignin,changePassword)
routes.post("/profile",profile)
routes.get("/realtors",getAllRealtors)

module.exports=routes