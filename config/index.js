require("dotenv").config()

const {DB,PORT,APP_SECRET} = process.env

module.exports={
    DB,PORT,APP_SECRET
}