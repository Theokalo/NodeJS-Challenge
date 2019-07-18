var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var assert = require('assert');
var fs = require('fs');
var data = fs.readFileSync('test-results.json');
var words = JSON.parse(data);

var url = 'mongodb://localhost:27017/test';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/get-data', function(req, res, next) {
  var resultArray = [];
  mongo.connect(url, function(err, db) {
    assert.equal(null, err);
    var cursor = db.collection('user-data').find();
    cursor.forEach(function(doc, err) {
      assert.equal(null, err);
      resultArray.push(doc);
    }, function() {
      db.close();
      res.render('index', {items: resultArray});
    });
  });
});



router.post('/insert', function(req, res, next) {
  var item = {
          code: req.body.code,
          name: req.body.name,
          price: Number(req.body.price),
          type: req.body.type,
          date: req.body.date,
          departureStation: req.body.departureStation,
          arrivalStation: req.body.arrivalStation
  };

  mongo.connect(url, function(err, db) {
    assert.equal(null, err);
    db.collection('user-data').insertOne(item, function(err, result) {
      assert.equal(null, err);
      console.log('Item inserted');
      db.close();
    });
  });

  res.redirect('/');
});

router.post('/update', function(req, res, next) {
  var item = {
    code: req.body.code,
    name: req.body.name,
    price: Number(req.body.price),
    type: req.body.type,
    date: req.body.date,
    departureStation: req.body.departureStation,
    arrivalStation: req.body.arrivalStation
  };
  var id = req.body.id;

  mongo.connect(url, function(err, db) {
    assert.equal(null, err);
    db.collection('user-data').updateOne({"_id": objectId(id)}, {$set: item}, function(err, result) {
      assert.equal(null, err);
      console.log('Item updated');
      db.close();
    });
  });
  res.redirect('/get-data');
});

router.post('/delete', function(req, res, next) {
 
  var id = req.body.id;

  mongo.connect(url, function(err, db) {
    assert.equal(null, err);
    db.collection('user-data').deleteOne({"_id": objectId(id)}, function(err, result) {
      assert.equal(null, err);
      console.log('Item deleted');
      db.close();
    });
  });
  res.redirect('/get-data');
});

router.post('/generateJson', function(req, res, next) {
  
  var id = req.body.id;
  console.log(id);
  mongo.connect(url, function(err, db) {
    assert.equal(null, err);
    var cursor = db.collection('user-data').find({"_id": objectId(id)});
    cursor.forEach(function(doc, err) {
      assert.equal(null, err);
      var item = {
        "result": {
          "trips": [
            {
              code: doc.code,
              name: doc.name,
              "details": {
                price: Number(doc.price),
                "roundTrips": [
                  {
                    type: doc.type,
                    date: doc.date,
                    "trains": [
                      {
                        departureStation: doc.departureStation,
                        arrivalStation: doc.arrivalStation
                      }
                    ]
                  }
                ]
              }
            }
          ]
        }
      };
      var data = JSON.stringify(item, null, 2);
      fs.writeFileSync('test-results.json',data , finished);

      function finished(err) {
          console.log('all set.');
      }
    }, function() {
      db.close();
    });
  });
  res.redirect('/get-data');
});

module.exports = router;
