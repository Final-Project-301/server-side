'use strict';

// Application dependencies
const express = require('express');
const cors = require('cors');
const pg = require('pg');
const superagent = require('superagent');
const bodyParser = require('body-parser');

// Application Setup
const app = express();
const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// Application Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

//Make sure the below only runs once otherwise table will have duplicated data!!

//Hit the Play API directly, then insert into the SQL DB
let url = 'https://data.seattle.gov/resource/mnai-wmyz.json';
superagent.get(url)
  .then(data => {
    data.body.forEach(object => {
      client.query(`INSERT INTO play (name, address, latitude, longitude, website) VALUES ($1, $2, $3, $4, $5)`, [object.common_name, object.address, object.latitude, object.longitude, object.website]),
      err => console.error(err);
    });
  });

//Hit the Dogs API directly, then insert into the SQL DB
let url2 = 'https://data.seattle.gov/resource/ybmn-w2mc.json';
superagent.get(url2)
  .then(data => {
    console.log(data.body);
    data.body.forEach(object => {
      client.query(`INSERT INTO dogs (name, address, latitude, longitude, website) VALUES ($1, $2, $3, $4, $5)`, [object.name, object.address, object.latitude, object.longitude, object.website]),
      err => console.error(err);
    });
  });

//Hit the Water API directly, then insert into the SQL DB
let url3 = 'https://data.seattle.gov/resource/ebpc-weez.json';
superagent.get(url3)
  .then(data => {
    data.body.forEach(object => {
      client.query(`INSERT INTO water (name, address, latitude, longitude, website) VALUES ($1, $2, $3, $4, $5)`, [object.common_name, object.address, object.latitude, object.longitude, object.website.url]),
      err => console.error(err);
    });
  });

app.get('/activities/play', (req, res) => {
  client.query(`SELECT name, address, latitude, longitude, website FROM play;`)
    .then(results => res.send(results.rows))
    .catch(console.err);
});

app.get('/activities/dogs', (req, res) => {
  client.query(`SELECT name, address, latitude, longitude, website FROM dogs;`)
    .then(results => res.send(results.rows))
    .catch(console.err);
});

app.get('/activities/water', (req, res) => {
  client.query(`SELECT name, address, latitude, longitude, website FROM water;`)
    .then(results => res.send(results.rows))
    .catch(console.err);
});


app.get('*', (req, res) => res.redirect(CLIENT_URL));
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));