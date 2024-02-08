const Property =  require("../models/properties.model")

module.exports.createProperty=(req,res)=>{
    let {location,name,description,type,moreDetails,intialDeposit,details,price,title} =  req.body
    let image = req.file.path
    let newProperty = new Property({
        location,name,description,type,image,price,details,intialDeposit,moreDetails,title
    })
    newProperty.save()
    .then(()=>{
        return res.status(200).json({
            message:"property created successfully"
        })
    })
    .catch(()=>{
        return res.status(400).json({
            message:"an error occured"
        })
    })

}

module.exports.editProperty=(req,res)=>{
    // let {location,name,description,type,moreDetails,intialDeposit,details,price,title} =  req.body
    Property.findOne({_id:req.params.id})
    .then((property)=>{
        let objectToUpdate={
            ...req.body,
            image: req.file !== (undefined || "" || []) ?req.file.path:property.image
        }
        console.log("objectToUpdate",objectToUpdate)
        Property.findOneAndUpdate({_id:req.params.id},{...objectToUpdate},(err,resp)=>{
            console.log(err,resp)
            return res.status(200).json({
                message:"property edited successfully"
            })
        })
    })
    .catch((error)=>{
        console.log(error)
        return res.status(400).json({
            message:"an error occured",
            // error:
        })
    })

}
module.exports.getProperties=(req,res)=>{
    Property.find({deleted:false})
    .then((result) => {
        return res.status(200).json({
            properties:result
        })
    }).catch((err) => {
        return res.send(err)
    });
}

module.exports.viewProperty=(req,res)=>{
    Property.findOne({_id:req.params.id})
    .then((result) => {
        return res.status(200).json({
            property:result
        })
    }).catch((err) => {
        return res.send(err)
    });
}

module.exports.deleteProperty=(req,res)=>{
    Property.findOneAndUpdate({_id:req.params.id},{deleted:true},(err,response)=>{
        console.log(err,response)
        if(err){
            return res.status(400).json({
                message:"Property not deleted successfully"
            })
        }if(response){
            return res.status(200).json({
                message:"Property deleted successfully"
            })
        }
    })
}