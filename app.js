//jshint esversion:6
require('dotenv').config() // for reaching environment variables
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
// const encryption = require('mongoose-encryption');
// const md5 = require('md5');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();

app.use(express.static("puclic"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

mongoose.connect("mongodb://127.0.0.1:27017/auth");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: String
})

// You can activate below codes for encyript password via mongoose-encryption package
// const secret = process.env.SECRET;
// userSchema.plugin(encryption, {secret: secret, encryptedFields: ["password"]});

const User = mongoose.model("User", userSchema);

app.get('/', (req, res) => {
    res.render("home.ejs");
});

app.get("/login", (req, res) => {
    res.render("login.ejs");
});

app.get("/register", (req, res) => {
    res.render("register.ejs");
});

app.post("/register", async (req, res) => {
    bcrypt.hash(req.body.password, saltRounds, function(err, hash){
        if (err) {
            console.log(err);
        }
        else {
            const newUser = new User({
                email: req.body.username,
                password: hash
            });

            newUser.save()
                .then(function (models) {
                    console.log(models);
                    res.render("secrets.ejs");
                })
                .catch(function (err) {
                    console.log(err);
                });
        }
    }) 



})

app.post("/login", async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;

    await User.findOne({email: email})
        .then((model) => {
            console.log(model);

            bcrypt.compare(password, model.password, function (err,result) {
                if(err) {
                    console.log(err + " ------> authentication failed")
                }
                else {
                    if(result === true) {
                        res.render("secrets.ejs");
                    } else {
                        console.log("authentication failed");
                    }
                }
            })
        })
        .catch((err) => {
            console.error(err);
        });
})

app.listen(3000, (req, res) => {
    console.log("listening on port 3000");
});