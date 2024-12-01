const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const {Cashfree} = require("cashfree-pg");

require('dotenv').config();
 
const app = express();
app.use(cors());
app.use(cors({
    origin: "https://payment.vrnfoods.com", // Replace with your frontend URL
    methods: ["GET", "POST"]
}));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

Cashfree.XClientId = process.env.CLIENT_ID;
Cashfree.XClientSecret = process.env.CLIENT_SECRET;
Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;


app.get('/', (req, res)=>{
    res.send('hello World')
})

app.get('/createorder', async(req, res)=>{

    try{
        var request = {
            "order_amount": "10",
            "order_currency": "INR",
            "order_id":  await getOrderId(),
            "customer_details": {
                "customer_id": "shruthi07",
                "customer_name": "ShruthiBS",
                "customer_email": "shruthi@gmail.com",
                "customer_phone": "9999949999"
            },
            "order_note": ""
        }

        const response = await Cashfree.PGCreateOrder("2023-08-01", request);
        res.json(response.data);
    }catch(error){
        console.error("Error creating order:", error.message || error);
        res.status(500).json({ message: "Failed to create order", error: error.message || error });
    }

})

app.post('/verify', (req,res)=>{
    console.log('entered the verify')
    try{
        let {
            orderId
        } = req.body;
        
        if (!orderId) {
            return res.status(400).json({ message: "orderId is required" });
        }

        Cashfree.PGOrderFetchPayments("2023-08-01", orderId)
        .then((response) => {
            res.json(response.data);
        })
        .catch((error) => {
            console.error("Verification error:", error.message || error);
            res.status(500).json({ message: "Failed to verify payment", error: error.message || error });
        });

    }catch(error){
        console.error("Verification route error:", error.message || error);
        res.status(500).json({ message: "Internal server error", error: error.message || error });
    }

})


function getOrderId(){
    return `order_${crypto.randomBytes(6).toString('hex')}`;
}


app.listen( 8000, ()=>{
    console.log('listening to the port 8000')
})