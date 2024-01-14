const express = require("express")
const { editSales, getMySales, getSales, createNewSales,viewSales, getMySalesRecord, getMySalesById,makePayment, updatePaymentHistory, getPaymentHistory } = require("../controllers/sales")
const { adminMiddleware, requireSignin, parser } = require("../middlewares")
const router = express.Router()

router.post("/create",
requireSignin,
adminMiddleware,
createNewSales )
router.get("/",requireSignin,getSales)
router.get("/mysales",requireSignin,getMySales)
router.get("/single/:id",requireSignin,getMySalesById)
router.get("/mysales/stats",requireSignin,getMySalesRecord)
router.get("/single/view/:id",requireSignin,viewSales)
router.patch("/:id",requireSignin,editSales)
router.patch("/pay/:id",requireSignin,
adminMiddleware,makePayment)
router.patch("/updatePaymentHistory/:id", requireSignin, updatePaymentHistory)
router.get("/getPaymentHistory/:id", requireSignin, getPaymentHistory)
module.exports=router