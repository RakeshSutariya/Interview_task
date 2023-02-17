const express = require('express');
const bosyParser = require('body-parser');
const ejs = require('ejs');
const path = require('path');
const mongo = require('./config/mongo');
const upload = require('express-fileupload');
const config = require('./config/config');
const routes = require('./config/routes');

let app = express();

app.use(upload());
app.use(bosyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000}));
app.use(bosyParser.json({limit: '50mb'}));

app.use(function(req, res, next){
    console.log(`*******NODE URL ****** ${req.url} ::::REQUEST :::::: ${JSON.stringify(req.body)}`);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});

app.use('/', routes);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use('/public', express.static(path.join(__dirname, 'public')))


if(!module.parent){
    app.listen(config.port, function(){
        console.log(`App is Run on Port :: ${config.port}`);
    });
}

module.exports = app;
