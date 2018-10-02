'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')
var dns = require('dns');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);
mongoose.connect(process.env.MONGOLAB_URI,{useMongoClient: true});
app.use(cors());

var urlModel = mongoose.model('URL', mongoose.Schema({ original_url:String,short_url:Number }));
/** this project needs to parse POST bodies **/
// you should mount the body-parser here
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});

});

app.get("/api/shorturl/:shorturl", function (req, res,next) {
  var shorturl = req.params.shorturl;
var urlExist = urlModel.find({ short_url:shorturl}, function (err, docs) {
  if(err)return next(err);
  if(docs.length==0){
     res.json('Not found');
     }else{
       //console.log(docs[0].original_url);
       //res.json(docs);
       res.redirect('https://www.'+docs[0].original_url);
     }
});
});

app.post('/api/shorturl/new',function(req,res,next){
  var url = req.body.url;
    dns.lookup(url, function (err, addresses, family) {
  if(err)return next(err);
      var urlExist = urlModel.find({ original_url:url}, function (err, docs) {
        if(err)return next(err);
        if(docs.length==0){
              urlModel.count({}, function (err, count) {
                if(err) return next(err);
          var newRecord = new urlModel({original_url:url,short_url:count+1});
                newRecord.save(function(err,data){
    if(err)  return next(err);
     res.json(data);
      });
});
        }else{
          res.json(docs);
        }
      });
});
      //newRecord.save(function(err,data){
    //if(err)  return(err);
     //res.json(data);
      //});
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});