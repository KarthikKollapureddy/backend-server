const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const {Cashfree} = require("cashfree-pg");

require('dotenv').config();
 
const app = express();
app.use(cors());
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
            "order_meta": {
                "return_url": "https://test.cashfree.com/pgappsdemos/return.php?order_id=order_123"
            },
            "order_note": ""
        }

        Cashfree.PGCreateOrder("2023-08-01", request).then(response => {
            // console.log(response.data);
            res.json(response.data);

        }).catch(error => {
            console.error(error.response.data.message);
        })

    }catch(err){
        console.log('createOrder err',err)
    }

})

app.post('/verify', (req,res)=>{
    console.log('entered the verify')
    try{
        let {
            orderId
        } = req.body;

        Cashfree.PGOrderFetchPayments("2023-08-01", orderId).then((response) => {
            res.json(response.data);
        }).catch(error => {
            console.error("varifiaction error chashfree",error.response.data.message);
        })

    }catch(error){
        console.log("varification error",error)
    }

})


function getOrderId(){
    const uniqueId = crypto.randomBytes(16).toString('hex');

    const hash = crypto.createHash('sha256');
    hash.update(uniqueId);

    const orderId = hash.digest('hex');

    return orderId.substr(0, 12)
}


app.listen( 8000, ()=>{
    console.log('listening to the port 8000')
})