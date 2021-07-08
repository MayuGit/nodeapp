let express = require('express');
let path = require('path');
let fs = require('fs');
let MongoClient = require('mongodb').MongoClient;
let bodyParser = require('body-parser');
let app = express();

//logging
const  morgan = require('morgan');
//const  accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'});
const  accessLogStream = fs.createWriteStream('/tmp/demologs/access.log', {flags: 'a'});
app.use(morgan('combined', {stream: accessLogStream}));

const winston = require('winston')
const consoleTransport = new winston.transports.Console()
const myWinstonOptions = {
    //transports: [consoleTransport]
	transports:[
		new winston.transports.Console({
           // level: 'warn'
        }),
        new winston.transports.File({
           // level: 'error',
            // Create the log directory if it does not exist
            filename: '/tmp/example.log'
        })
	],

	format: winston.format.combine(
        winston.format.label({
            label: 'Label'
        }),
        winston.format.timestamp({
           format: 'MMM-DD-YYYY HH:mm:ss'
       }),
        winston.format.printf(info => `${[info.timestamp]}: ${info.level}: ${info.label}: ${info.message}`),
    )
}
const logger = new winston.createLogger(myWinstonOptions)

//logging init ends

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    logger.info(req.url)
    res.sendFile(path.join(__dirname, "index.html"));
  });

app.get('/profile-picture', function (req, res) {
  let img = fs.readFileSync(path.join(__dirname, "images/profile-1.jpg"));
  res.writeHead(200, {'Content-Type': 'image/jpg' });
  logger.info("Fetching image")
  res.end(img, 'binary');
});

// use when starting application locally
let mongoUrlLocal = "mongodb://admin:password@192.168.50.5:27017";

// use when starting application as docker container
//let mongoUrlLocal = "mongodb://admin:password@mongodb";

// pass these options to mongo client connect request to avoid DeprecationWarning for current Server Discovery and Monitoring engine
let mongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true };

// "user-account" in demo with docker. "my-db" in demo with docker-compose
let databaseName = "my-db";

app.post('/update-profile', function (req, res) {
  logger.info("profile updated")
  let userObj = req.body;

  MongoClient.connect(mongoUrlLocal, mongoClientOptions, function (err, client) {
    if (err) throw err;

    let db = client.db(databaseName);
    userObj['userid'] = 1;

    let myquery = { userid: 1 };
    let newvalues = { $set: userObj };

    db.collection("users").updateOne(myquery, newvalues, {upsert: true}, function(err, res) {
      if (err) throw err;
      client.close();
    });

  });
  // Send response
  res.send(userObj);
});

app.get('/get-profile', function (req, res) {
  let response = {};
  // Connect to the db
  MongoClient.connect(mongoUrlLocal, mongoClientOptions, function (err, client) {
    if (err) throw err;

    let db = client.db(databaseName);

    let myquery = { userid: 1 };

    db.collection("users").findOne(myquery, function (err, result) {
      if (err) throw err;
      response = result;
      client.close();

      // Send response
      res.send(response ? response : {});
    });
  });
});

app.listen(3000, function () {
  console.log("app listening on port 3000!");
});
