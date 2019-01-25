
const _=require('lodash');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const express = require('express');
const app = express();


mongoose.connect('mongodb://localhost/users',{ useNewUrlParser: true }).
then(()=>console.log('Connected to MongoDB'));


app.use(express.json());
app.use(cors());

function auth(req,res,next){
    const token = req.header('x-auth-token');
    if(!token) res.status(401).send('Access denied.No token provided.');
    try{
        const decoded = jwt.verify(token,'jwtPrivateKey');
        req.user = decoded;
        res.send(req.user);
        next();
    }
    catch{
        res.status(400).send('Invalid token');
    }
}

app.get('/categories', async(req,res)=>{
     let result = [];
    const category = await Categories.find();
    category.forEach((value)=> result.push(value.name));
    res.send(result);
});

app.get('/products', async(req,res)=>{
    let result = [];
   const product = await Product.find({},{_id:0,__v:0});

   res.send(product);
});




app.post('/api/users', async(req,res)=>{
    let user = new User({
        name: req.body.name,
        email:req.body.email,
        password:req.body.password
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    
    await user.save();
    const token = jwt.sign({_id:user._id},'jwtPrivateKey');
    res.send(user);
});

app.post('/api/products', async (req,res)=>{
    
    let product = new Product({
        title: req.body.title,
        price: req.body.price,
        category: req.body.category,
        imageUrl : req.body.imageUrl
    });
     await product.save();
     res.send(product);
});


app.post('/shoppingCarts', async (req,res)=>{
    
    let shoppingDetails = new ShoppingCart({
        dateCreated : req.body.dateCreated
    });
     await shoppingDetails.save();
     res.send(shoppingDetails);
});




app.post('/api/auth', async(req,res)=>{

    let user  = await User.findOne({email:req.body.email});
        if(!user) return res.status(400).send('Invalid email or password');
       const validPassword = await bcrypt.compare(req.body.password,user.password);
       if(!validPassword) return res.status(400).send('Invalid email or password');
       const token = jwt.sign({_id:user._id,name:user.name,email:user.email},'jwtPrivateKey');
       const result = {
           success:token,
           name:user.name,
           email:user.email,
           id:user._id
       }
       res.send(result);
});

app.post('/api/categories', async(req,res)=>{
    let category = new Categories({
        name: req.body.name
    });
    await category.save();
    res.send(category);
});



const userSchema = new mongoose.Schema({
        name:String,
        email:String,
        password:String
});

const User = mongoose.model('User',userSchema);


const shoppingCartSchema = new mongoose.Schema({
    dateCreated: Date
});

const ShoppingCart = mongoose.model('ShoppingCart',shoppingCartSchema);

const categorySchema = new mongoose.Schema({
    name:String
});

const Categories = mongoose.model('Categories',categorySchema);



const productSchema = new mongoose.Schema({
    title:String,
    price:Number,
    category:String,
    imageUrl : String
});

const Product = mongoose.model('Product',productSchema);


app.listen(3500, () => {
    console.log('running');
});


