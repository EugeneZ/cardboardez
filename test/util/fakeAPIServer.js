const feathers = require('feathers');

function authorizationMiddleware(req, res, next) {
    const authorizationHeader = req.get('Authorization');

    if (authorizationHeader) {
        req.query.token = authorizationHeader.replace('Bearer ', '');
    }
    next();
}

function tokeninfo(req, res, next) {
    if (req.query.access_token === 'googletoken') {
        res.json({ sub: 'testgoogleid' });
    } else {
        res.json({ error_description: 'Invalid Value' });
    }
    next();
}

function googleProfile(req, res, next) {
    if (req.query.token === 'googletoken') {
        res.json({
            "accessToken": "123",
            "displayName": "Test User",
            "emails": [
                {
                    "type": "account",
                    "value": "eugenezar@gmail.com"
                }
            ],
            "id": "testgoogleid",
            "image": {
                "isDefault": false,
                "url": "https://lh6.googleusercontent.com/-uVqdSP_RK7U/AAAAAAAAAAI/AAAAAAAAAng/zEFsrxVCrW4/photo.jpg?sz=50"
            },
            "language": "en",
            "name": {
                "familyName": "User",
                "givenName": "Test"
            },
            "url": "https://plus.google.com/102218594542013439067",
            "verified": false
        })
    } else {
        res.json({
            "error": {
                "errors": [
                    {
                        "domain": "global",
                        "reason": "authError",
                        "message": "Invalid Credentials",
                        "locationType": "header",
                        "location": "Authorization"
                    }
                ],
                "code": 401,
                "message": "Invalid Credentials"
            }
        });
    }
    next();
}

function newServer(){
    return new Promise((resolve, reject) => {
        try {
            const server = feathers()
                .use(authorizationMiddleware)
                .get('/tokeninfo', tokeninfo)
                .get('/profile/google', googleProfile)
                .listen(3001, () => resolve(server))
        } catch (err) {
            reject(err);
        }
    });
}

module.exports.newServer = newServer;