const express = require("express")
const { connect } = require("mongoose")
const cors = require("cors")
require("dotenv").config()

const {PORT,DB}=require("./config")

const userRoutes =  require("./routes/user.routes")
const adminRoutes =  require("./routes/admin.routes")
const propertRoutes = require("./routes/properties.routes")
const salesRoutes = require("./routes/sales.routes")
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

// Routes
app.use("/api/v1/user",userRoutes)
app.use("/api/v1/admin",adminRoutes)
app.use("/api/v1/properties",propertRoutes)
app.use("/api/v1/sales",salesRoutes)
/**
 * 
 * @param {*} params 
 * @descriptipon  this function connects the app to mongoDB
 * @author Emmanuel Lucky
 */

function connectDB() {
    try {
        connect(DB)
        .then(()=>{
            console.log("database connected successfully")
        })
    } catch (error) {
        console.log("error connecting to database")
    }
    
}
connectDB()


app.get("/",(req,res)=>{
    return res.send("<h4>REALTORS API GET DOCUMENTATION FOR MORE</h4>")
})

app.use((req, res, next) => {
    res.status(404).json({
        message: 'Ohh you are lost, read the API documentation to find your way back :)'
    })
})

app.listen(PORT,()=>{
    console.log(`serever started on port ${PORT}`)
})