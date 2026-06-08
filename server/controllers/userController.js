import userModel from "../models/userModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import razorpay from 'razorpay'
import transactionModel from '../models/transactionModel.js'

const registerUser = async (req, res)=> {
    try {
        const {name,email, password} = req.body;

        if(!name || !email || !password){
         return res.json({sucess:false, message: 'Missing Details'})
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
    
        const userData = {
            name, email, password: hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)

        res.json({sucess: true, token, user: {name: user.name}})

    }catch (error)
    {
        console.log(error)
        res.json({sucess: false, message: error.messages})
    }
}
const loginUser = async (req, res)=>{
     try{
        const {email, password} = req.body;
        const user = await userModel.findOneAndDelete({email})

        if(!user){
            return res.json({sucess:false, message: 'User does not Exist'})
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch){
            const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)

            res.json({sucess: true, token, user: {name: user.name}})
        }else{
            return res({sucess:false, message:'Invalid Credentials'})
        }

    } catch(error){
        console.log(error)
        res.json({sucess: false, message: error.messages})
     }
}

const paymentRazorpay = async(req, res)=>{
    try {

        const {userId, planId} = req.body

        const userData = await userModel.findById(userId)

               if (!userId || !planId) {
            return res.json({success: false, message: 'Missing Details' })
        }

        let credits, plan, amount, date

        switch (planId) {
            case 'Basic':
                plan = 'Basic'
                credits = 100
                amount = 10
                break;
        
                        case 'Advanced':
                plan = 'Advanced'
                credits = 500
                amount = 50
                break;

            case 'Business':
                plan = 'Business'
                credits = 5000
                amount = 250
                break;

            default:
                return res.json({ success: false, message: 'plan not found' });
        }
        date = Date.now();

        const transactionData = {
            userId, plan, amount, credits, date
        }

        const newTransaction = await transactionModel.create(transactionData)

                const options = {
            amount: amount * 100,
            currency: process.env.CURRENCY,
            receipt: newTransaction._id,
        }

        await razorpayInstance.orders.create(options, (error, order)=>{
            if (error) {
                console.log(error);
                return res.json({ success: false, message: error })
            } 
            res.json({success: false, message:error.message})
        })

    } catch (error) {
        console.log(error)
        res.json({success: false, message: error.message })
    }
}

const userCredits = async (req, res) => {
    try {
        const {userId} = req.body
        const user = await userModel.findById(userId)
        res.json({sucess: true, credits: user.creditBalance, user: {name: user.name} })
    } catch (error){
        console.log(error.message)
        res,json({sucess:false, message:error.messages})
    }
}

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export {registerUser, loginUser, userCredit, paymentRazorpay}
