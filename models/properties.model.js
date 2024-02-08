const {Schema, model} =  require("mongoose")

const propertiesSchema = new Schema({
    name:{
        type:String
    },
    image:{
        type:String
    },
    description:{
        type:String
    },
    type:{
        type:String
    },
    location:{
        type:String
    },
    details:{
        type:Object
    },
    moreDetails:{
        type:Array
    },
    price:{
        type:Number,
    },
    intialDeposit:{
        type:Number
    },
    title:{
        type:String
    },
    deleted:{
        type: Boolean,
        default:false
    }
    
})



module.exports=model("properties",propertiesSchema)
