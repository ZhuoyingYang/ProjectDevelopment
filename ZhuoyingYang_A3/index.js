//<!--Zhuoying Yang(Jocelyn) zyang7724@conestogac.on.ca-->
const express = require('express');
const req = require('express/lib/request');
const path = require('path');
const mongoose = require('mongoose');
var myapp = express();

const { check, validationResult } = require('express-validator');

mongoose.connect('mongodb://localhost:27017', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

myapp.use(express.urlencoded({ extended: true }))

myapp.set('views', path.join(__dirname, 'views'));
myapp.use(express.static(__dirname + '/public'))
myapp.set('view engine', 'ejs');
//-----------------validation------------------
var phoneRegex = /^[0-9]{3}\-?[0-9]{3}\-?[0-9]{4}$/; // 123-123-1234
var positiveNumber = /^[1-9][0-9]*$/;
var provinceindex = new Array();
provinceindex = ["AB", "BC", "MB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT", "NB"];

// show all cards
myApp.get('/allcards', function(req, res) {
    // write some code to fetch all the cards from db and send to the view allcards
    Card.find({}).exec(function(err, cards) {
        console.log(err);
        console.log(cards);
        res.render('allcards', { cards: cards }); // will render views/allcards.ejs
    });
});

function checkRegex(userInput, regex) {
    if (regex.test(userInput))
        return true;
    else
        return false;
}

function customPhoneValidation(value) {
    if (!checkRegex(value, phoneRegex)) {
        throw new Error('Please enter correct format: 123-123-1234 OR 1231231234!');
    }
    return true;
}

function customQuantityValidations(value) {
    if (value == '')
        return true;
    else {
        if (!checkRegex(value, positiveNumber)) {
            return false;
        } else
            return true;
    }
}

function customProvinceValidations(province) {
    let realprovince = false;
    for (let i = 0; i < provinceindex.length; i++) {
        let existprovince = provinceindex[i];
        if (province == existprovince) {
            realprovince = true;
            break;
        }
    }
    if (!realprovince) {
        throw Error('Province is invalid.');
    } else
        return true;
}
//---------------------------------------------------------------

myapp.get('/', function(req, res) {
    res.render('form')
});

myapp.post('/', [
    check('name', 'Name is required!').notEmpty(),
    check('address', 'Address is required!').notEmpty(),
    check('city', 'City is required!').notEmpty(),
    check('email', 'Please enter a valid email address!').isEmail(),
    check('phone').custom(customPhoneValidation),
    check('province').custom(customProvinceValidations),
    check('marioquantity', 'Quantity numbers of Mario Puzzle greater than 0!').custom(customQuantityValidations),
    check('earthquantity', 'Quantity numbers of Earth Puzzle greater than 0!').custom(customQuantityValidations),
    check('fishquantity', 'Quantity numbers of Fish Puzzle greater than 0!').custom(customQuantityValidations)
], function(req, res) {
    const errors = validationResult(req);
    console.log(errors);

    if (!errors.isEmpty()) {
        res.render('form', { errors: errors.array() })
    } else {
        var marioquantity = req.body.marioquantity;
        var earthquantity = req.body.earthquantity;
        var fishquantity = req.body.fishquantity;
        const marioprice = 9.9;
        const earthprice = 18.8;
        const fishprice = 8;

        var taxrate;

        var name = req.body.name;
        var email = req.body.email;
        var phone = req.body.phone;
        var address = req.body.address;
        var city = req.body.city;
        var province = req.body.province;

        var subTotal = marioquantity * marioprice + earthquantity * earthprice + fishquantity * fishprice;

        var provinceNo = provinceindex.indexOf(province)
        switch (provinceNo) {
            case 3:
            case 4:
            case 8:
            case 12:
                taxrate = 0.15;
                break;
            case 7:
                taxrate = 0.13;
                break;
            default:
                taxrate = 0.05;
                break;
        }

        var tax = subTotal * taxrate;
        var total = subTotal + tax;

        var pageData = {
            name: name,
            email: email,
            phone: phone,
            address: address,
            city: city,
            province: province,
            taxrate: taxrate,
            subTotal: subTotal,
            tax: tax,
            total: total
        }
    };
    res.render('form', pageData);
});

myapp.listen(8020);
console.log('everything executed fine...Open http://localhost:8020/');