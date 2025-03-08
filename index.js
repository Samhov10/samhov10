const express = require('express');
const pasth = require("path");
const bcrypt = require("bcrypt");
const collection = require("./config");


const app = express();
// convert data inspo json format
app.use(express.json());

app.use(express.urlencoded({extended: false}));

// use EJS as the viw engine
app.set('view engine', 'ejs');
// static file
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("login");
});
app.get("/signup", (req, res) =>{
    res.render("signup");
});

//Register User
app.post("/signup", async (req, res) => {

    const data = {
        name: req.body.username,
        password: req.body.password
    }

    //check if the user already exist in the database
    const existingUser = await collection.findOne({name: data.name});
    if(existingUser) {
        res.send("Имя пользователя уже зарегистрирован");
    }else {
        // hash the password using bcrypt
        const saltRounds = 10; // number of salt for bcrypt
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        data.password = hashedPassword; // Replace the hash password with original password

        const userdata = await collection.insertMany(data);
        console.log(userdata);
    }

})

// Login user 

app.post("/login", async (req, res) => {
    try{
        const check =  await collection.findOne({name: req.body.username});
        if(!check) {
            res.send("Пользователь не найден");
        }

        // Compare the hash password from the database with the plain text
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if(isPasswordMatch) {
            res.render("home");
        }else{
            req.send("Не правильный пароль");
        }
    }catch{
        res.send("Не правильный логин или пароль");
    }
});

const port = 5000;
app.listen(port, () => {
    console.log(`Server running in Port: ${port}`);
})

