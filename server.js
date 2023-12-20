const express = require("express");
const session = require('express-session');
const app = express();
const router = require('./router');
const serverKeys = require('./ServerKeys');
const cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('static'));

const PORT = 3000;;
const HOST = 'localhost';

app.use(cookieParser());
app.use(session({ secret: serverKeys.secret, resave: true, saveUninitialized: true }));
app.use('/', router);
app.use(express.urlencoded({ extended: false }));

app.listen(PORT, () => {
    console.log(`[Server] Приложение запущено по адресу http://${HOST}:${PORT}`);
})