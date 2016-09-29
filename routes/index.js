var express = require('express');
var router = express.Router();
const multer = require('multer');
var path = require('path');
var guid = require('guid');
global.appRoot = path.resolve(__dirname);
//mongo
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

mongoose.connect('mongodb://localhost/carservice');
// console.log("mc: ", mongoose.connection);
var car = new Schema({
  id: ObjectId,
  make: { type: String,  index: true},
  model: { type: String, index: true },
  year: { type: Number},
  km: { type: Number},
  dealername: {type: String, index: true},
  stockno: {type: Number, index: true},
  image: {type: String}
});

var carM = mongoose.model("CarModel", car);

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    console.log("file", file);
    cb(null, file.originalname)
  }
})

router.post("/upload", multer({storage: storage}).array("uploads[]", 12), function(req, res) {
// router.post("/upload", multer({dest: "./uploads/", filename}).array("uploads[]", 12), function(req, res) {
  console.log(appRoot);
  var newRoot = appRoot.split('\\');
  var newPath = "";

  for(let i = 0; i < newRoot.length -1; i++){
    newPath+=newRoot[i]+"\\";

  }

  var fileObj = req.files[0];

  fileObj.filepath = newPath+"uploads"
  console.log("fileObj", fileObj)
    res.send(fileObj);
});

router.post("/uploadb", multer({storage: storage}).array("uploads[]", 12), function(req, res) {
// router.post("/upload", multer({dest: "./uploads/", filename}).array("uploads[]", 12), function(req, res) {
  // console.log(appRoot);
  // var newRoot = appRoot.split('\\');
  // var newPath = "";

  // for(let i = 0; i < newRoot.length -1; i++){
  //   newPath+=newRoot[i]+"\\";

  // }

  // var fileObj = req.files[0];

  // fileObj.filepath = newPath+"uploads"
  console.log("fileObj", req.files)
    res.send(fileObj);
});

// var instance = new carM();
// instance.make = "Toyota";
// instance.model = "Tazz";
// instance.year = 2005;
// instance.km = 160000;
// instance.dealername = "Imperial";

// instance.save(function(err){
//   console.log("Done Saving. Err: ", err);
// });

// carM.find({make: "Toyota"}, function (err, docs) {
//   for(let i = 0; i < docs.length; i++){
//     console.log("Doc: ", docs[i]);    
//   }
//   // docs.forEach(function(doc){
//   //   console.log("Doc: ", doc);
//   // })
// });
//

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/carlist', function(req, res, next) {
  console.log("hit");
  carM.find({}, function (err, docs) {
    console.log("inside find: ", docs.length);   
    // res.setHeader() 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.status(200).end(JSON.stringify(docs));
  });
});

router.post('/addcar', function(req, res, next){
  var instance = new carM();
  console.log("req.body: ", req.body);
  if(req.body){
    instance.make = req.body.make;
    instance.model = req.body.model;
    instance.year = req.body.year;
    instance.km = req.body.km;
    instance.dealername = req.body.dealername;
    instance.stockno = req.body.stockno;
    instance.image = req.body.image;
  }

  instance.save(function(err, data){
    console.log("data: ", data);
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      res.status(200).end(JSON.stringify(data));
  });
});

router.get('/image/:id', function(req, res, next){
    var newRoot = appRoot.split('\\');
  var newPath = "";

  for(let i = 0; i < newRoot.length - 1; i++){
    newPath+=newRoot[i]+"\\";

  }
  res.sendFile(newPath+"uploads\\"+req.params.id);
});

router.get('/search/', function(req, res, next){
  console.log("req...:", req.query.searchterm);
  var paresedInt = parseInt(req.query.searchterm);
  let query = {};
  console.log("paresedInt: ", paresedInt);
  if(isNaN(paresedInt)){
    var re = new RegExp(req.query.searchterm,"gi");
    console.log("re: ", re);
    query = {'$or': [
      {make: re},
      {model: re},
      {dealername: re}
    ]};
  }
  else{
    query = {stockno: paresedInt};
  }

  carM.find(query, function(err, docs){
      console.log("asdas: ", err);
      console.log("Stuff: ", JSON.stringify(docs));

      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      res.status(200).end(JSON.stringify(docs));
      // res.end(JSON.stringify(docs));
  });
})

module.exports = router;
