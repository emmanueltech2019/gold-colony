const User = require("../models/user.model")
const { APP_SECRET } = require("../config")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")


// module.exports.register=(req,res)=>{
//     let {fullname,phone,email,password,appsecret} =req.body
//     if(appsecret==APP_SECRET){
//         Admin.findOne({email},(err,user)=>{
//             if(err){
//                 return res.status(500).json({
//                     messsage:"an error occured",
//                     error:err,
//                     status:false
//                 })
//             }
//             if(user){
//                 return res.status(400).json({
//                     message:"Email number already exist",
//                     status:false
//                 })
//             }
//             if(!user){
//                 let hashPassword = bcrypt.hashSync(password,10)
    
//                 let newUser = new Admin({
//                     fullname,email,password:hashPassword,phone,role:"admin"
//                 })
//                 newUser.save((err,user)=>{
//                     if(err) return res.status(400).json({
//                         message:"An error occured",
//                         status:false
//                     })
//                     if(user){
//                         return res.status(201).json({
//                             message:"account created successfully",
//                             status:true,
//                             role:"admin"
//                         })
//                     }
//                 })
//             }
//         })
//     }else{
//         return res.status(400).json({
//             message:"you dont have this access"
//         })
//     }
// }

// module.exports.login=(req,res)=>{
//     let {email,password}=req.body
//     Admin.findOne({email},(err,user)=>{
//         if(err){
//             return res.status(400).json({
//                 message:"an error occured",
//                 status:false
//             })
//         }
//         if (!user) {
//             return res.status(400).json({
//                 message:"incorrect email",
//                 status:false
//             })
//         }
//         if(user){
//             let isPasswordValid = bcrypt.compareSync(password, user.password)
            
//             if (isPasswordValid==true) {
//                 const token = jwt.sign({id:user._id},APP_SECRET)
//                 return res.status(200).json({
//                     token,
//                     message:"Login successfully",
//                     status:true,
//                     role:user.role
//                 })
//             }else{
//                 return res.status(404).json({
//                     message:"Password is not correct",
//                     status:true
//                 })
//             }
//         }
//     })
// }

module.exports.profile=(req,res)=>{
    User.findOne({_id:req.user.id},(err,user)=>{
        if(err){
            return res.status(400).json({
                message:"an error occured"
            })
        }
        if(!user){
            return res.status(404).json({
                message:"Admin does not exist"
            })
        }
        if(user){
            return res.status(200).json({
                user:{
                    fullname:user.fullname,
                    phone:user.phone,
                    email:user.email
                }
            })
        }
    })
}

module.exports.getAllRealtors=(req,res)=>{
    User.find({role:"user"})
    .populate("upline")
    .then((result) => {
        
        return res.status(200).json({
            realtors:result
        })
    }).catch((err) => {
        return res.status(400).json({
            message:"an error occured"
        })
    });
}

module.exports.updatePersonalDetails=(req,res)=>{
    let {fullname,email, phone}  = req.body
    User.findOneAndUpdate({_id:req.user.id},{fullname,email, phone},(err,user)=>{
        if(err){
            return res.status(400).json({
                message:"an error occured"
            })
        }
        if(!user){
            return res.status(404).json({
                message:"admin not found"
            })
        }
        if(user){
            return res.status(200).json({
                message:" details saved successfully",
                status:true
            })
        }
    })
}
module.exports.changePassword=(req,res)=>{
    let {password,newPassword} = req.body
    User.findOne({_id:req.user.id},(err,user)=>{
        if(err){
            return res.status(400).json({
                message:"an error occured"
            })
        }
        if(user){
            let isPasswordValid = bcrypt.compareSync(password, user.password)
            if(isPasswordValid){
                const salt = bcrypt.genSaltSync(10);
                let hashPassword = bcrypt.hashSync(newPassword,salt)
                user.password=hashPassword
                    user.save()
                    .then((result) => {
                        return res.status(200).json({
                            message:"password changed successfully"
                        })
                    }).catch((err) => {
                        return res.status(400).json({
                            message:"an error occured"
                        })
                    });
                
            }else{
                return res.status(400).json({
                    message:"password not correct"
                })
            }
        }
    })
}