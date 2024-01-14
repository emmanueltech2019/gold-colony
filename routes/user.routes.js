const express = require("express")
const {register,login, profile, refferalData, updateBankDetails, updateSocailDetails, updateSocialDetails, updatePersonalDetails, getProfileById, uploadProfilePicture, getUplineDetails, verify, forgotPassword} = require("../controllers/user")
const { requireSignin, parser } = require("../middlewares")
const routes = express.Router()

routes.post("/register",register)
routes.post("/login",login)
routes.get("/upline/:refphone",getUplineDetails)
routes.post("/forgot/password",forgotPassword)
routes.post("/password/new",verify)
routes.get("/profile",requireSignin,profile)
routes.get("/refferalData",requireSignin,refferalData)
routes.patch("/profile/update/bank",requireSignin,updateBankDetails)
routes.patch("/profile/update/socials",requireSignin,updateSocialDetails)
routes.patch("/profile/update/personal",requireSignin,parser,updatePersonalDetails)
routes.get("/profile/byID/:id",getProfileById)
routes.patch("/profile/image",requireSignin,parser,uploadProfilePicture)

module.exports=routes