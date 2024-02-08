const {Schema, model} = require("mongoose")


const salesRecordSchema = new Schema({
    sales:{
        type:Schema.Types.ObjectId,
        ref:"properties"
    },
    user:{
        type:Schema.Types.ObjectId,
        ref:"users"
    },
    commissionPaid:{
        type:Boolean
    },
    date:{
        type:Date,
    },
    deposit:{
        type:Number
    },
},{timestamps:true})


module.exports=model("salesRecord",salesRecordSchema)