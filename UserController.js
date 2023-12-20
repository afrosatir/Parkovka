const jwt = require('jsonwebtoken');
const serverKeys = require('./ServerKeys');

class UserController {
    blockAuthenticatedUser(req, res, next) {
        const token = req.cookies.token;

        if (!token) {
            next()
        }

        try {
            return res.redirect('/profile');
        } catch (error) {
            next()
        }
    }
    isAuthenticatedUser(req, res, next) {
        const token = req.cookies.token;

        if (!token) {
            return res.render('auth', { error: false });
        }
    
        try {
            const decodedToken = jwt.verify(token, serverKeys.secret);
            req.user = decodedToken;
            next();
        } catch (error) {
            return res.render('auth', { error: false });
        }
    }
    isAdminUser(req, res, next) {
        const token = req.cookies.token;

        try {
            const decodedToken = jwt.verify(token, serverKeys.secret);
            if(decodedToken.role === 'admin') next();
            else return res.send({'Текущая роль:': decodedToken.role, 'Требуемая роль:': 'admin', 'Статус': 'Доступ заблокирован'});
        } catch (error) {
            return res.render('auth', { error: false });
        }
    }
}

module.exports = new UserController()