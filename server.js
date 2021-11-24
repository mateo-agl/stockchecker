'use strict';
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');
const helmet = require('helmet');
const app = express();

app.use(helmet.contentSecurityPolicy({
  directives: {
    "script-src": ["'self'"],
    "style-src": ["'self'"]
  }
}));

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({ origin: '*' })); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Index page (static HTML)
app.route('/')
  .get(function(req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);

//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

mongoose.connect(process.env.DB)
  .then(() => {
    const listener = app.listen(process.env.PORT || 3000, function() {
      console.log('Your app is listening on port ' + listener.address().port);
      if (process.env.NODE_ENV === 'test') {
        console.log('Running Tests...');
        setTimeout(function() {
          try {
            runner.run();
          } catch (e) {
            console.log('Tests are not valid:');
            console.error(e);
          }
        }, 3500);
      }
    });
  }).catch((e) => console.error(e));

module.exports = app; //for testing
