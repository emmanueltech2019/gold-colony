const express = require("express")
const { getProperties, viewProperty, createProperty, deleteProperty, editProperty } = require("../controllers/properties")
const { adminMiddleware, userMiddleware, requireSignin, parser } = require("../middlewares")
const router = express.Router()

router.post("/create",requireSignin,adminMiddleware,parser,createProperty )
router.get("/",requireSignin,getProperties)
router.get("/:id",requireSignin,viewProperty)
router.delete("/:id",requireSignin,deleteProperty)
router.patch("/:id",requireSignin,parser,editProperty)

module.exports=router