const express = require('express');
const path = require('path');
const mongoose= require('mongoose')
const User = require('./models/User')
const bodyParser = require('body-parser')
const Transaction = require('./models/Transaction')
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();
// Use cookie-parser middleware
app.use(cookieParser());

// Use express-session middleware
app.use(session({
    secret: 'your-secret-key', // Change this to a strong and secure secret
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 60 * 60 * 1000, // Session timeout in milliseconds (1 hour in this example)
        secure: false, // Set to true if using HTTPS
        httpOnly: true,
    }
}));

// app.get('/set-cookie', (req, res) => {
//     req.session.cookieExample = 'Hello, this is a cookie in the session!';
//     res.send('Cookie set successfully!');
// });
// app.get('/read-cookie', (req, res) => {
//     const cookieExample = req.session.cookieExample || 'Cookie not found';
//     res.send(cookieExample);
// });


mongoose.connect('mongodb://localhost:27017/my-express-app', {
 useNewUrlParser: true,
 useUnifiedTopology: true,
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const PORT = 8080;

var router = express.Router();

router.get('/',(req,res)=>{
  res.redirect('home')
})
router.get('/login', function (req, res) {
  if(req.session.CurrentUser){
    return res.redirect('/home')
  }
  res.render('login');
});

router.get('/register',(req,res)=>{
  res.render('register',{msg: "User Not Found"})
})
router.post('/register',async (req,res)=>{
  //console.log(req.body)
  const {phoneNum,Amount,name} = req.body
  const newUser= new User({phoneNumber: phoneNum,availableAmount: Amount,name: name})
  await newUser.save().then(
    (user)=>{
      //console.log(user)
      req.session.CurrentUser = user.phoneNumber 
      return res.redirect('/home')
    }
  ).catch(err =>{
     return res.send("User Already exist<a href='/home'>Home</a>")
  })
})

router.post('/login',async (req,res) =>{
  const {phoneNum,Amount} = req.body
  //console.log(req.body)
  //console.log(phoneNum)
  const user= await User.findOne({phoneNumber: phoneNum})
  //console.log(user)
  if(!user){
    return res.redirect('initial')
  }
  req.session.CurrentUser= user.phoneNumber
  res.redirect('/home')
})


router.get('/home',async(req,res)=>{
  let CurrentUser = req.session.CurrentUser
  if(!CurrentUser){
    return res.send('<h3>Please Login <a href=\'/login\'>Here</a></h3><h3>CLick here to register <a href=\'register\'>Register</a>')
  }
  const user= await User.findOne({phoneNumber: CurrentUser})
  res.render('Home',{user})
})

router.get('/trans',async(req,res)=>{
  const user=req.session.CurrentUser
  if(user){
    const transactions= await Transaction.find( { $or: [ { sender: user},{reciever: user} ] } )
    //console.log(transactions)
    return res.render('transactions',{data:transactions})
  }
  res.redirect('/login')
})

router.get('/transfer',async(req,res)=>{
  res.render('transfer')
})

router.post('/transfer',async (req,res) =>{
  let senderp = req.session.CurrentUser
  const {recieverp,amount} = req.body
  const sender= await User.findOne({phoneNumber: senderp})
  const reciever = await User.findOne({phoneNumber: recieverp})
  if(!sender || !reciever || amount === 0 ){
    return res.render('result',{result: 0})
  }else if(sender.availabelAmount < amount){
    return res.render('result',{result: 1})
  }
   const cashback = getCashBack(amount)
   console.log(sender.availableAmount,cashback,amount)
   sender.availableAmount = sender.availableAmount - amount + cashback
   reciever.availableAmount+= +amount
   console.log("Money Sent")
   await sender.save()
   await reciever.save()
   const transaction = new Transaction ({sender: senderp,reciever: recieverp,amount: amount,date: getString()})
   await transaction.save()
   res.render('result',{result: 2,data :{cashback: cashback,availableAmount: sender.availableAmount}})
})

function getCashBack(amount){
  let cashbackPercentage = 0;
    if(amount%500) return 0;
    if (amount < 1000) {
        cashbackPercentage = 5;
    } else if (amount > 1000) {
        cashbackPercentage = 2;
    }
    return (cashbackPercentage / 100) * amount;
}
app.get('/logout',(req,res)=>{
   req.session.CurrentUser=""
   res.redirect("/home")
})

const getString=()=>{
  const currentDate = new Date()
   const currentDayOfMonth = currentDate.getDate();
   const currentMonth = currentDate.getMonth();
   const currentYear = currentDate.getFullYear();
   let hours = currentDate.getHours();
   let minutes = currentDate.getMinutes();
   let seconds = currentDate.getSeconds();
   return currentDayOfMonth + "-" + (currentMonth + 1) + "-" + currentYear + " "+hours + ":" + minutes + ":" + seconds
}

app.use('/', router);
app.use('*', (req,res)=>{
  redirect('/')
})
app.listen(PORT, function () {
  console.log('Listening on port ' + PORT);
});
