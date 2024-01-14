const {Schema, model} = require("mongoose")


const salesSchema = new Schema({
    property:{
        type:Schema.Types.ObjectId,
        ref:"properties"
    },
    user:{
        type:Schema.Types.ObjectId,
        ref:"users"
    },
    buyerDetails:{
        type:Object
    },
    commissionPaid:{
        type:Boolean
    },
    deposit:{
        type:Number
    },
    paid:{
        type:Number,
        default:0
    },
    status:{
        type:String
    },
    totalCost:{
        type: Number,
        required:true
    },
    outstanding:{
        type: Number
    },
    duration:{
        type:String,
        required:[true, "Duration of sales is required"]
    },
    date:{
        type:Date,
    }

},{timestamps:true})


module.exports=model("sales",salesSchema)