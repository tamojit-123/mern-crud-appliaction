const express = require('express');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const empModel = require('../modules/employee');
const uploadModel = require('../modules/upload');

const router = express.Router();
const employee = empModel.find({});
const imageData = uploadModel.find({});

router.use(express.static(__dirname + "./public/"));

if (typeof localStorage === "undefined" || localStorage === null) {
    const LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}

const Storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: Storage
}).single('file');


/* GET home page. */
router.post('/upload/', upload, function (req, res, next) {
    const imageFile = req.file.filename;
    const success = req.file.filename + " uploaded successfully";

    const imageDetails = new uploadModel({
        imagename: imageFile
    });
    imageDetails.save(function (err, doc) {
        if (err) throw err;

        imageData.exec(function (err, data) {
            if (err) throw err;
            res.render('upload-file', {title: 'Upload File', records: data, success: success});
        });

    });

});


function checkLogin(req, res, next) {
    const myToken = localStorage.getItem('myToken');
    try {
        jwt.verify(myToken, 'loginToken');
    } catch (err) {
        res.send("you need login to access this page");
    }
    next();
}

router.get('/upload', checkLogin, function (req, res, next) {
    imageData.exec(function (err, data) {
        if (err) throw err;
        res.render('upload-file', {title: 'Upload File', records: data, success: ''});
    });
});

router.get('/', checkLogin, function (req, res, next) {
    employee.exec(function (err, data) {
        if (err) throw err;
        res.render('index', {title: 'User Information', records: data, success: ''});
    });

});
router.get('/login', function (req, res, next) {

    const token = jwt.sign({foo: 'bar'}, 'loginToken');
    localStorage.setItem('myToken', token);
    res.send("Login Successfully");
});

router.get('/logout', function (req, res, next) {

    localStorage.removeItem('myToken');
    res.send("Logout Successfully");

});


router.post('/', upload, function (req, res, next) {
    const empDetails = new empModel({
        name: req.body.uname,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
        image: req.file.filename,
    });

    empDetails.save(function (err, req1) {
        if (err) throw err;
        employee.exec(function (err, data) {
            if (err) throw err;
            res.render('index', {title: 'User Information', records: data, success: 'Information Inserted Successfully'});
        });
    })


});

router.post('/search/', function (req, res, next) {

    let flterParameter;
    const flrtName = req.body.fltrname;
    const flrtEmail = req.body.fltremail;
    const fltremptype = req.body.fltremptype;

    if (flrtName != '' && flrtEmail != '' && fltremptype != '') {

        flterParameter = {
            $and: [{name: flrtName},
                {$and: [{email: flrtEmail}, {etype: fltremptype}]}
            ]
        };
    } else if (flrtName != '' && flrtEmail == '' && fltremptype != '') {
        flterParameter = {
            $and: [{name: flrtName}, {etype: fltremptype}]
        };
    } else if (flrtName == '' && flrtEmail != '' && fltremptype != '') {

        flterParameter = {
            $and: [{email: flrtEmail}, {etype: fltremptype}]
        };
    } else if (flrtName == '' && flrtEmail == '' && fltremptype != '') {

        flterParameter = {
            etype: fltremptype
        };
    } else {
        flterParameter = {};
    }
    const employeeFilter = empModel.find(flterParameter);
    employeeFilter.exec(function (err, data) {
        if (err) throw err;
        res.render('index', {title: 'User Information', records: data});
    });


});

router.get('/delete/:id', function (req, res, next) {
    const id = req.params.id;
    const del = empModel.findByIdAndDelete(id);

    del.exec(function (err) {
        if (err) throw err;
        employee.exec(function (err, data) {
            if (err) throw err;
            res.render('index', {title: 'User Information', records: data, success: 'Information Deleted Successfully'});
        });
    });

});

router.get('/edit/:id', function (req, res, next) {
    const id = req.params.id;
    const edit = empModel.findById(id);
    edit.exec(function (err, data) {
        if (err) throw err;
        res.render('edit', {title: 'Edit User Information', records: data});
    });

});

router.post('/update/', upload, function (req, res, next) {

    let dataRecords;
    if (req.file) {

        dataRecords = {
            name: req.body.uname,
            email: req.body.email,
            phone: req.body.phone,
            password: req.body.password,
            image: req.file.filename,
        };
    } else {

        dataRecords = {
            name: req.body.uname,
            email: req.body.email,
            phone: req.body.phone,
            password: req.body.password,
        };
    }


    const update = empModel.findByIdAndUpdate(req.body.id, dataRecords);
    update.exec(function (err, data) {
        if (err) throw err;
        employee.exec(function (err, data) {
            if (err) throw err;
            res.redirect("/");
        });
    });

});


router.get('/autocomplete/', function (req, res, next) {

    const regex = new RegExp(req.query["term"], 'i');

    const employeeFilter = empModel.find({name: regex}, {'name': 1}).sort({"updated_at": -1}).sort({"created_at": -1}).limit(20);
    employeeFilter.exec(function (err, data) {


        const result = [];
        if (!err) {
            if (data && data.length && data.length > 0) {
                data.forEach(user => {
                    let obj = {
                        id: user._id,
                        label: user.name
                    };
                    result.push(obj);
                });

            }

            res.jsonp(result);
        }

    });

});


module.exports = router;
