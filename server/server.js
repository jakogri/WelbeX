const EXPRESS = require('express');
const PATH = require('path');
const PORT = process.env.PORT || 5000;
const { Client } = require('pg');
const APP = EXPRESS();
const ServerLib = require('./serverLib');
APP.use(EXPRESS.json());

require('dotenv').config({path : PATH.resolve(process.cwd(), '.env')});

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '6235401Va',
    port: 5432,
});
client.connect(err => {
    if (err) {
      console.error('connection error', err.stack)
    } else {
      console.log('connected succesfully to server')
    }
  })

APP.post('/api/list', (req, res) => {
    let condition_str = '';
    if (req.query.value == '') condition_str = '';
    else {
          if (req.query.name == 'obj_name')
              condition_str = 'where obj_name';
          if (req.query.name == 'count')
              condition_str = 'where count';
          if (req.query.name == 'distance')
              condition_str = 'where distance';
          if (req.query.operation == '=')
              condition_str = condition_str + ' = ';
          if (req.query.operation == '>')
              condition_str = condition_str + ' > ';
          if (req.query.operation == '<')
              condition_str = condition_str + ' < ';
          if (req.query.operation == 'like')
              condition_str = condition_str + ' like ' + '\'' + '%' + req.query.value + '%' + '\'';
          else if ((req.query.name == 'count') || (req.query.name == 'distance'))
              condition_str = condition_str + req.query.value;
          else if (req.query.name == 'obj_name') 
              condition_str = condition_str + '\'' + req.query.value + '\'';
    };
    console.log("Поле"  + req.query.name );
    console.log("Условия " + condition_str);
    client.query('SELECT * FROM  test_table ' + condition_str, (err, result) => {
        if (err) {
            console.log(err);
            res.send("Sampling error");
        } else {
           res.send(result);
        }
    });
    
});

APP.use(EXPRESS.static(PATH.join(__dirname, '../build')));

require('dotenv').config({path : PATH.resolve(process.cwd(), '.env')});


APP.use(function onError(err, req, res, next) {
    /**
     * The error id is attached to `res.sentry` to be returned
     * and optionally displayed to the user for support.
     */
    res.statusCode = 500;
    res.end(res.sentry + "\n");
});

APP.listen(PORT);
console.log('App is listening on port ' + PORT);

