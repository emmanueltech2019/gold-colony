const Property = require("../models/properties.model")
const Sales = require("../models/sales.model")
const SalesRecord = require("../models/record.model")
const mongoose =  require("mongoose")

module.exports.createNewSales=(req,res)=>{
    let {user,deposit,buyerDetails,commissionPaid,status,date, duration} =req.body

    Property.findOne({_id:req.body.property})
    .then((property)=>{
        let totalCost = property.price
        let outstanding =  totalCost
        outstanding -= deposit
        let newSales = new Sales({
            property:req.body.property,
            user,
            deposit,
            buyerDetails,
            commissionPaid,
            status,
            totalCost,
            outstanding,
            duration,
            date,
        })
        newSales.save()
        .then((result) => {
            result.paid+=deposit
            result.save()
            .then((result) => {
                let newSalesRecord = new SalesRecord({date,deposit,commissionPaid, sales:result._id,user})
                newSalesRecord.save()
                .then(()=>{
                    return res.status(200).json({
                        message:"sales added successfully"
                    })
                })
            })
        }).catch((err) => {
            console.log(err)
            return res.status(400).json({
                message:"an error occured"
            })
        });
    })
}

module.exports.getSales=(req,res)=>{
    Sales.find({})
    .populate(["user", "property"])
    .then((result) => {
        return res.status(200).json({
            sales:result
        })
    }).catch((err) => {
        console.log(err)
        return res.status(400).json({
            message:"an error occured"
        })
    });
}

module.exports.getMySales=(req,res)=>{
    Sales.find({user:req.user.id})
    .populate(["user", "property"])
    .then((result) => {
        return res.status(200).json({
            mysales:result
        })
    }).catch((err) => {
        return res.status(400).json({
            message:"an error occured"
        })
    });
}
module.exports.getMySalesById=(req,res)=>{
    Sales.find({_id:req.params.id})
    .populate(["user", "property"])
    .then((result) => {
        User.findOne({_id:result.user._id})
        .populate("upline")
        .then((upline)=>{
            return res.status(200).json({
                mysales:result,
                upline
            })
        })
    }).catch((err) => {
        return res.status(400).json({
            message:"an error occured"
        })
    });
}
module.exports.getMySalesRecord=(req,res)=>{
    Sales.find({user:req.user.id})
    .populate(["user", "property"])
    .then((result) => {
        let paidCommisin  = result.filter((item)=>{
            return item.commissionPaid==true
        })
        let unPaidCommisin  = result.filter((item)=>{
            return item.commissionPaid!=true
        })
        return res.status(200).json({
            paidCommisin:paidCommisin.length,
            unPaidCommisin:unPaidCommisin.length,
            totalSale:result.length
        })
    }).catch((err) => {
        console.log(err)
        return res.status(400).json({
            message:"an error occured"
        })
    });
}

module.exports.editSales= async (req,res)=>{
    try {
        const salesRecord = await Sales.findById(req.params.id);
        
        salesRecord.buyerDetails = req.body.buyerDetails || salesRecord.buyerDetails;
    
        await salesRecord.save();
    
        return res.status(200).json({
            message:"sales edited successfully"
        })
      } catch (error) {
        res.status(500).send('Error updating sales record');
      }
}

module.exports.makePayment=(req,res)=>{
    let {deposit,commissionPaid,date, status} =req.body
    Sales.findOne({_id:req.params.id})
    .then((sale)=>{
        console.log(sale)
        if(deposit > sale.outstanding){
            return res.status(400).json({
                message:"amount cannot be higher than outstanding debt"
            })
        }else{  
            sale.outstanding -= deposit
            sale.status=status
            sale.paid+=deposit
            sale.save()
            .then(()=>{
                let newSalesRecord = new SalesRecord({date,deposit,commissionPaid, sales:sale._id,user:sale.user})
                newSalesRecord.save()
                .then(()=>{
                    return res.status(200).json({
                        message:"payment made successfully successfully"
                    })
                })
            })
        }
    })
    .catch((error)=>{
        console.log(error)
        return res.status(400).json({
            message:"an error occured"
        })
    })
}

module.exports.viewSales=(req,res)=>{
    Sales.findOne({_id:req.params.id})
    .populate(["user", "property"])
    .then((result) => {
        SalesRecord.find({sales:result._id})
        .then((record)=>{
            return res.status(200).json({
                sales:result,
                record
            })
        })
    }).catch((err) => {
        return res.send(err)
    });
}

module.exports.updatePaymentHistory=async (req,res, next)=>{
    try {
        const sales = await SalesRecord.findOneAndUpdate({ _id: req.params.id },{commissionPaid:req.body.commissionPaid},{new:true});
        return res.status(200).json(sales);
        
      } catch (err) {
        next(err);
      }
}

module.exports.getPaymentHistory=async(req,res)=>{
    SalesRecord.findOne({ _id: req.params.id })
    .then((sales)=>{
        return res.status(200).json({sales});
    })
    .catch((err)=>{
        return res.status(400).json({err})
    })
}