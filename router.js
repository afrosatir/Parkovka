const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');

const router = express.Router();
const serverKeys = require('./ServerKeys');

const UserController = require('./UserController');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const Database = require('nedb');
const db = new Database({ filename: 'users', autoload: true });
const dbHistory = new Database({ filename: 'dbhistory', autoload: true });

const DEFAULT_ROLE = 'user';

//get-запросы
router.get('/', (req, res) => {
    res.render('welcome');
})
router.get('/profile', UserController.isAuthenticatedUser, (req, res) => {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, serverKeys.secret);
    res.render('profile', { user: decoded });
})
router.get('/booking/new', UserController.isAuthenticatedUser, (req, res) => {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, serverKeys.secret);
    res.render('booking-new', { user: decoded });
})
router.get('/booking/get-history', UserController.isAuthenticatedUser, async (req, res) => {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, serverKeys.secret);

    dbHistory.find({ user: decoded.userId }).sort({ timestamp: 1 }).exec((err, docs) => {
        res.send(docs);
    })
})
router.get('/admin', UserController.isAdminUser, (req, res) => {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, serverKeys.secret);
    res.render('admin', { user: decoded });
})
router.get('/pay', UserController.isAuthenticatedUser, async (req, res) => {
    const bookingData = req.session.bookingData;
    const token = req.cookies.token;
    const decoded = jwt.verify(token, serverKeys.secret);
    const user = decoded.userId;

    dbHistory.insert({
        user: user,
        bookingData: bookingData,
        status: 0,
        timestamp: new Date()
    }, (err, newRecord) => {
        const bookingDataWithID = {
            ...bookingData,
            _id: newRecord._id
        };
        req.session.bookingData = bookingDataWithID;
        res.render('pay');
    });
});

router.get('/pay/success', (req, res) => {
    const bookingData = req.session.bookingData;

    dbHistory.update({ _id: bookingData._id }, { $set: { status: 1 } }, {}, (err, numReplaced) => {
        if (err) {
            console.error('Ошибка обновления статуса:', err);
        } else if (numReplaced > 0) {
            console.log('Статус платежа успешно обновлен');
        } else {
            console.log('Не найдено записей для обновления');
        }
    })
    res.redirect('/profile');
})
router.get('/pay/reject', (req, res) => {
    const bookingData = req.session.bookingData;

    dbHistory.update({ _id: bookingData._id }, { $set: { status: 2 } }, {}, (err, numReplaced) => {
        if (err) {
            console.error('Ошибка обновления статуса:', err);
        } else if (numReplaced > 0) {
            console.log('Статус платежа успешно обновлен');
        } else {
            console.log('Не найдено записей для обновления');
        }
    })
    res.redirect('/profile');
})
router.get('/login', UserController.blockAuthenticatedUser, (req, res) => {
    res.render('auth', { error: false });
})
router.get('/register', UserController.blockAuthenticatedUser, (req, res) => {
    res.render('auth_register');
})
router.get('/logout', (req, res) => {
    const cookies = Object.keys(req.cookies);

    cookies.forEach(cookie => {
        res.clearCookie(cookie);
    });

    res.redirect('../login');
})

//post-запросы
router.post('/auth', async (req, res) => {
    let { login, password } = req.body;
    db.find({ "login": login }, async (err, docs) => {
        if (!docs[0]) res.json({ success: 0 });
        else {
            const passwordMatch = await bcrypt.compare(password, docs[0].password);
            if (!passwordMatch) res.json({ success: 0 });
            else {
                const token = jwt.sign({ userId: docs[0]._id, firstName: docs[0].firstName, lastName: docs[0].lastName, role: docs[0].role, login: docs[0].login }, serverKeys.secret, { expiresIn: '24h' });
                res.cookie('token', token, { maxAge: 86400000 });
                res.json({success: 1})
            }
        }
    })
})
router.post('/auth/register', async (req, res) => {
    let { firstName, lastName, login, password } = req.body;
    
    if (!firstName || !lastName || !login || !password) {
        return res.send( {status: 412, message: 'Все поля формы должны быть заполнены'} );
    }
    if (login.length < 3 || password.length < 3) {
        return res.send( {status: 412, message: 'Длинна логина или пароля должна быть больше 3'} )
    }
    bcrypt.hash(password, saltRounds, (error, hash) => {
        db.insert({
            firstName: firstName,
            lastName: lastName,
            login: login,
            password: hash,
            role: DEFAULT_ROLE,
        })
    });
    const token = jwt.sign({ firstName: firstName, lastName: lastName, role: DEFAULT_ROLE, login: login }, serverKeys.secret, { expiresIn: '24h' });
    res.cookie('token', token, { maxAge: 86400000 });
    res.redirect('../profile');

})
router.post('/profile', (req, res) => {
    const bookingData = req.body;
    req.session.bookingData = bookingData;
    res.redirect('/pay');
})

//Разработка
router.get('/debug/user-info', (req, res) => {
    const token = req.cookies.token;
    const decodedToken = jwt.verify(token, serverKeys.secret);
    res.send(decodedToken);
})
router.get('/debug/history', (req, res) => {
    dbHistory.find({}, async (err, docs) => {
        res.send(docs);
    })
})

module.exports = router;