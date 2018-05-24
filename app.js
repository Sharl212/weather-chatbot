const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

// app.use('/weatherhook', (req, res) => {
  exports.weatherhook = (req, res) => {
    let city = req.body.queryResult.parameters['weather'];

    let date = '';

    if (req.body.queryResult.parameters['date']) {
      date = req.body.queryResult.parameters['date'];
      console.log('Date ', date);
    }

    fetchWeather(city, date).then((results) => {
      res.json({ 'fulfillmentText': results });
    }).catch(() => {
      res.json({ 'fulfillmentText': "Error fetching the weather." });
    });

    function fetchWeather(city, date) {
      const encodedAddress = encodeURIComponent(city);
      const geocodeUrl = `http://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}`;

      axios.get(geocodeUrl).then(function (response) {
        if (response.data.status === 'ZERO_RESULTS') {
          throw new Error(`Unable to find ${encodedAddress}`);
        } else {
          const lat = response.data.results[0].geometry.location.lat;
          const lng = response.data.results[0].geometry.location.lng;
          const weatherUrl = `https://api.darksky.net/forecast/3eccb06dafc89ff4c795d5231d7bcd79/${lat},${lng}`;
          return axios.get(weatherUrl);
        }
      }).then(function (response) {
        const area = response.data.timezone;
        const temperature = response.data.currently.temperature;
        const apparentTemperature = response.data.currently.apparentTemperature;
        res.send({ temperature, apparentTemperature, area });
        // res.send({});
        console.log(`Temperature is ${temperature}.`);
      }).catch(function (e) {
        if (e.code === 'ENOTFOUND') {
          console.log('Unable to connect to API servers.');
        } else {
          console.log(e.message);
        }
      });
    };
  };
// });

app.listen(process.env.PORT || 3000, () => {
  console.log('server is running');
})
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
