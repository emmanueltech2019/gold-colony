const User = require("../models/user.model")
const Sales = require("../models/sales.model")
const nodemailer =require("nodemailer")
const { APP_SECRET } = require("../config")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const  securePin = require("secure-pin")
const smtpTransport =require("nodemailer-smtp-transport")

module.exports.register=(req,res)=>{
    let {fullname,email,phone,password,refphone} =req.body

    User.findOne({email},(err,user)=>{
        User.findOne({phone},(err,user2)=>{
            if(err){
                console.log(err)
                return res.status(500).json({
                    messsage:"an error occured",
                    error:err,
                    status:false
                })
            }
            if(user2){
                return res.status(400).json({
                    message:"Phone number already exist",
                    status:false
                })
            }else{
                if(err){
                    console.log(err)
                    return res.status(500).json({
                        messsage:"an error occured",
                        error:err,
                        status:false
                    })
                }
                if(user){
                    return res.status(400).json({
                        message:"Email number already exist",
                        status:false
                    })
                }
                if(!user){
                    let hashPassword = bcrypt.hashSync(password,10)
        
                    let newUser = new User({
                        fullname,email,password:hashPassword,phone,refID:phone
                    })
        
                    User.findOne({refID:refphone},(err,upline)=>{
                        if(err){
                            console.log(err)
                            return res.status(400).json({
                                message:"an unknow error occured"
                            })
                        }
                        if(upline){
                            newUser.upline=upline._id
                            newUser.save((err,user)=>{
                                if(err) {
                                    console.log(err)
                                    return res.status(500).json({
                                    message:"An error occured",
                                    status:false
                                })}
                                if(user){
                                    const token = jwt.sign({id:user._id,email:user.email},APP_SECRET)
                                    return res.status(201).json({
                                        message:"account created successfully",
                                        token,
                                        status:true
                                    })
                                }
                            })
                        }
                        if(!upline){
                            newUser.save((err,user)=>{
                                if(err) {
                                    console.log(err)
                                    return res.status(500).json({
                                    message:"An error occured",
                                    status:false
                                    })
                                }
                                if(user){
                                    
                                    const token = jwt.sign({id:user._id,email:user.email},APP_SECRET)
                                    return res.status(201).json({
                                        message:"account created successfully",
                                        token,
                                        status:true
                                    })
                                }
                            })
                        }
                    })
                }
            }
        })
        
    })
}

module.exports.login=(req,res)=>{
    let {email,password}=req.body
    User.findOne({email},(err,user)=>{
        if(err){
            return res.status(400).json({
                message:"an error occured",
                status:false
            })
        }
        if (!user) {
            return res.status(404).json({
                message:"incorrect email",
                status:false
            })
        }
        if(user){
            let isPasswordValid = bcrypt.compareSync(password, user.password)
            
            if (isPasswordValid==true) {
                const token = jwt.sign({id:user._id,email:user.email,phone:user.phone,role:user.role},APP_SECRET)
                return res.status(200).json({
                    token,
                    message:"Login successfully",
                    status:true,
                    role:user.role
                })
            }else{
                return res.status(400).json({
                    message:"Password is not correct",
                    status:true
                })
            }
        }
    })
}

module.exports.getUplineDetails=(req,res)=>{
    let {refphone} =req.params
    User.findOne({refID:refphone},(err,upline)=>{
        if(err){
            return res.status(400).json({
                message:"an unknow error occured"
            })
        }
        if(upline){
            return res.status(200).json({
                message:`${upline.fullname} invited you`,
                status:true
            })
        }
        if(!upline){
            return res.status(200).json({
                message:"realtor with this id does not exist",
                status:false
            })
        }
    })
}

module.exports.profile=(req,res)=>{
    User.findOne({_id:req.user.id})
    .populate("upline")
    .then((user)=>{
        Sales.find({user:user._id})
        .then((sales)=>{
            let records =[]
            console.log("One",sales)
            sales.map((sle)=>{
                console.log("Two",sle)
                records.push(sle)
            })
            let commissionPaidTrueCount = 0;
            let commissionPaidFalseCount = 0;

            for (let i = 0; i < records.length; i++) {
                if (records[i].commissionPaid === true) {
                    commissionPaidTrueCount++;
                } else {
                    commissionPaidFalseCount++;
                }
            }
            return res.status(200).json({
                user,
                records,
                paid:commissionPaidTrueCount,
                unpaid: commissionPaidFalseCount,
            })
        })
    })
    .catch((err)=>{ 
        return res.status(400).json({
            message:"an error occured"
        })
    })
}

module.exports.refferalData=(req,res)=>{
    //find my self so i can get my downline id
    User.findOne({_id:req.user.id},(err,me)=>{
        // find my upline usinf my upline id
        if(me){
            User.findOne({_id:me.upline},(err,myupline)=>{

                    User.find({upline:req.user.id})
                    .populate("upline")
                    .then((downlines)=>{

                        let firstlv=downlines
                        let secondlvArrray=[]
                        let count =0   
                        if(downlines.length > 0){
                            for (let i = 0; i < downlines.length;i++ ) {
                                const downline = downlines[i];
                                User.findOne({upline:downline._id},(err,secondlv)=>{
                                    let checker =i+1
                                    console.log(checker,downlines.length,secondlv)
                                    if(secondlv!=null){
                                        secondlvArrray.push(secondlv)
                                    }
                                    if(checker==downlines.length){
                                        let data={
                                            upline:myupline,
                                            firstlv,
                                            secondlv:secondlvArrray
                                        }
                                        return res.status(200).json({
                                            data
                                        })
                                    }else{
                                        if(secondlv!=null){
                                            secondlvArrray.push(secondlv)
                                        }else{
                                        }
                                    }
                                })
                                
                            }
                            // downline.map((downrref)=>{
                            //     User.findOne({upline:downrref._id},(err,secondlv)=>{
                            //         console.log(secondlv,err)
                            //         count+=1
                            //         if(count==downline.length){
                            //         if(secondlv!=null){
                            //             secondlvArrray.push(secondlv)
                            //         }else{
                            //                 let data={
                            //                     upline:myupline,
                            //                     firstlv,
                            //                     secondlv:secondlvArrray
                            //                 }
                            //                 res.status(200).json({
                            //                     data
                            //                 })
                            //             }
                            //         }
                            //     })
                            // })
                        }else{
                            let data={
                                upline:myupline,
                                firstlv,
                                secondlv:secondlvArrray}
                            return res.status(200).json({
                                data
                            })
                        }
                        
                    })
            })
        }else{
            return res.status(400).json({
                message:"This user not found"
            })
        }
    })
}

module.exports.refferalDataById=(req,res)=>{
    //find my self so i can get my downline id
    User.findOne({_id:req.body.id},(err,me)=>{
        // find my upline usinf my upline id
        if(me){
            User.findOne({_id:me.upline},(err,myupline)=>{

                    User.find({upline:req.body.id})
                    .populate("upline")
                    .then((downlines)=>{
                        let firstlv=downlines
                        let secondlvArrray=[]
                        let count =0   
                        console.log(downlines.length)
                        if(downlines.length > 0){
                            for (let i = 0; i < downlines.length;i++ ) {
                                const downline = downlines[i];
                                User.findOne({upline:downline._id},(err,secondlv)=>{
                                    let checker =i+1
                                    console.log(checker,downlines.length,secondlv)
                                    if(secondlv!=null){
                                        secondlvArrray.push(secondlv)
                                    }
                                    if(checker==downlines.length){
                                        let data={
                                            upline:myupline,
                                            firstlv,
                                            secondlv:secondlvArrray
                                        }
                                        return res.status(200).json({
                                            data
                                        })
                                    }else{
                                        if(secondlv!=null){
                                            secondlvArrray.push(secondlv)
                                        }else{
                                        }
                                    }
                                })
                                
                            }
                        }else{
                            let data ={
                                upline:myupline,
                                firstlv,
                                secondlv:secondlvArrray
                            }
                            return res.status(200).json({
                                data
                            })
                        }
                        
                    })
            })
        }else{
            return res.status(400).json({
                message:"This user not found"
            })
        }
    })
}

module.exports.updateBankDetails=(req,res)=>{
    let {bankName,bankAccount,bankHolder}  = req.body
    let details={bankName,bankAccount,bankHolder}
    User.findOneAndUpdate({_id:req.user.id},{bankDetails:details},(err,user)=>{
        if(err){
            return res.status(400).json({
                message:"an error occured"
            })
        }
        if(!user){
            return res.status(400).json({
                message:"user not found"
            })
        }
        if(user){
            return res.status(200).json({
                message:"Bank details saved successfuly",
                status:true
            })
        }
    })
}

module.exports.updateSocialDetails=(req,res)=>{
    let {facebookURL,twitterURL,youtubeURL,instagramURL,whatsappURL}  = req.body
    let details={facebookURL,twitterURL,youtubeURL,instagramURL,whatsappURL}
    User.findOneAndUpdate({_id:req.user.id},{socialDetails:details},(err,user)=>{
        if(err){
            return res.status(400).json({
                message:"an error occured"
            })
        }
        if(!user){
            return res.status(404).json({
                message:"user not found"
            })
        }
        if(user){
            return res.status(200).json({
                message:" details saved successfuly",
                status:true
            })
        }
    })
}

// module.exports.updatePersonalDetails=(req,res)=>{
//     let {gender,stateOfOrigin,about,houseAdress,officeAdress,DOB,fullname,email,phone}  = req.body
//     let profile = req.file.path
//     const updatedSection = req.body;
//     // User.findOneAndUpdate({_id:req.user.id},{gender,stateOfOrigin,about,houseAdress,officeAdress,DOB,fullname,email,phone, profile},(err,user)=>{

//     User.findOneAndUpdate({_id:req.user.id},{...updatedSection,},(err,user)=>{
//         if(err){
//             return res.status(400).json({
//                 message:"an error occured"
//             })
//         }
//         if(!user){
//             return res.status(404).json({
//                 message:"user not found"
//             })
//         }
//         if(user){
//             return res.status(200).json({
//                 message:" details saved successfully",
//                 status:true
//             })
//         }
//     })
// }
module.exports.updatePersonalDetails = (req, res) => {
    const { gender, stateOfOrigin, about, houseAdress, officeAdress, DOB, fullname, email, phone } = req.body;
    const updatedSection = {
      gender,
      stateOfOrigin,
      about,
      houseAdress,
      officeAdress,
      DOB,
      fullname,
      email,
      phone,
    };
    if (req.file) {
      // If there is a new profile image in the request, update the 'profile' field in updatedSection
      updatedSection.profile = req.file.path;
    }
  
    User.findOneAndUpdate({ _id: req.user.id }, updatedSection, { new: true }, (err, user) => {
      if (err) {
        return res.status(400).json({
          message: 'An error occurred',
          error: err,
        });
      }
      if (!user) {
        return res.status(404).json({
          message: 'User not found',
        });
      }
      return res.status(200).json({
        message: 'Details saved successfully',
        status: true,
      });
    });
  };

module.exports.getProfileById=(req,res)=>{
    User.findOne({_id:req.params.id})
    .populate("upline")
    .then((user) => {
        console.log(user)
        Sales.find({user:user._id})
        .populate("user")
        .then((sales)=>{
            User.findOne({_id:user.upline},(err,myupline)=>{
                User.find({upline:user._id})
                .populate("upline")
                .then((downlines)=>{
                    let firstlv=downlines
                    let secondlvArrray=[]
                    console.log(firstlv, secondlvArrray)
                    if(downlines.length > 0){
                        for (let i = 0; i < downlines.length;i++ ) {
                            const downline = downlines[i];
                            User.findOne({upline:downline._id},(err,secondlv)=>{
                                let checker =i+1
                                // console.log(checker,downlines.length,secondlv)
                                console.log(secondlv)
                                if(secondlv!=null){
                                    secondlvArrray.push(secondlv)
                                }
                                if(checker==downlines.length){
                                    let data={
                                        user,
                                        sales,
                                        upline:myupline,
                                        firstlv,
                                        secondlv:secondlvArrray
                                    }
                                    return res.status(200).json({
                                        data
                                    })
                                }else{
                                    if(secondlv!=null){
                                        secondlvArrray.push(secondlv)
                                    }else{
                                    }
                                }
                            })
                            
                        }
                    }else{
                        let data = {
                            user,
                            upline:myupline,
                            firstlv,
                            secondlv:secondlvArrray
                        }
                        console.log(data)
                        return res.status(200).json({
                            data
                        })
                    }
                    
                })
        })
            // User.find({upline:user._id})
            // .then((upline)=>{
            //     return res.status(200).json({
            //         user,
            //         sales,
            //         upline
            //     })
            // })
            // .catch(()=>{
            //     return res.status(200).json({
            //         user,
            //         sales,
            //         upline
            //     })
            // })
        })
    }).catch((err) => {
        return res.status(400).json({
            message:"an error occured"
        })
    });
}

module.exports.forgotPassword= async (req, res)=>{
    let accesscode;
    function gene() {
      accesscode = securePin.generatePinSync(4);
      if(accesscode.charAt(0)==='0'){
        gene()
      }
      else{
        return true
      }
    }
    gene()
    let transporter = nodemailer.createTransport(smtpTransport({
      host: "mail.devemmy.com",
      port: 465,
      secureConnection: true,
      debug: true,
      logger: true,
      auth: {
        user: process.env.NODEMAILER_USERNAME,
        pass: process.env.NODEMAILER_PASSWORD,
      },
      connectionTimeout: 5 * 60 * 1000,
      tls: {
        rejectUnauthorized: false,
      },
    }));

    let info = await transporter
      .sendMail({
        from: '"Realtor Portal" <goldcolonytemporaryemail@goldcolony.devemmy.com>', // sender address
        to: req.body.email, // list of receivers
        subject: "Realtors Portal ✔", // Subject line
        text: "Realtors Portal -  reset password", // plain text body
        html: `<h1>Your verification code </h1>:<h2>${accesscode}</h2><br/>`, // html body
      })
      .then((response) => {

        User.findOne({email:req.body.email,},(err,user)=>{
          if(err) res.status(404).json(err)
          if(user){
            user.accesscode=accesscode
            user.save()
            .then(()=>{
                return res.status(200).json({ message: "Sent" });
            })
          }
        })
      })
      .catch((error) => {
        return res.json({
            message: "error occured!",
            message1: error,
          });
  
      });
}

module.exports.verify =(req,res)=>{
    const {code,newPassword} = req.body
    User.findOne({accesscode:code},(err,user)=>{
        if(err){
            return res.status(400).json({
                message:"an error occured"
            })
        }
        if(user){
            if(user.accesscode==code){
                const salt = bcrypt.genSaltSync(10);
                let hashPassword = bcrypt.hashSync(newPassword,salt)
                user.password=hashPassword
                user.accesscode=""
                user.save()
                .then(()=>{
                    return res.status(200).json({
                        message:"password reset successfully"
                    })
                })
            }else{
                return res.status(200).json({
                    message:"incorrect verification code"
                })
            }
        }
    })
}

module.exports.uploadProfilePicture=(req,res)=>{
    User.findOne({_id:req.user.id},(err,user)=>{
        if(err){
            return res.status(400).json({
                message:"an error occured"
            })
        }
        if(user){
            user.profile=req.file.path
            user.save()
            .then(()=>{
                return res.status(200).json({
                    profile:req.file.path,
                    message:"profile uploaded successfully"
                })
            })
            .catch(()=>{
                return res.status(400).json({
                    message:"profile uploaded successfully"
                })
            })
        }
    })
}