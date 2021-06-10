const express = require(`express`);
const mariadb = require(`mariadb`);
const fs = require(`fs`);
const http = require(`http`);
const crypto = require(`crypto`);
const bodyParser = require(`body-parser`);
const session = require(`express-session`);
const cookieParser = require(`cookie-parser`);
const passwords = require(`/home/savamaxheron/intranet/passwords.json`)
const app = express();
const port = 3000;

const pool = mariadb.createPool({
    host: `localhost`,
    user: `admin`,
    password: passwords.database,
    connectionLimit: 5,
    database: `intranet`
});

async function getasset(ID) {
    try {
        let connection = await pool.getConnection();
        let rows = await connection.query(`SELECT * FROM assets WHERE ID = ? LIMIT 1`, [ID]);
        connection.end();
        return rows[0];
    } catch (error) {
        fs.appendFile(`./logs/error.log`, `${error}\n`, (error) => {
            if (error) {
                return console.error(error);
            };
        });
        return console.error(error);
    };
};

async function getassets() {
    try {
        let connection = await pool.getConnection();
        let rows = await connection.query(`SELECT * FROM assets ORDER BY LENGTH(ID), ID`);
        connection.end();
        return rows;
    } catch (error) {
        fs.appendFile(`./logs/error.log`, `${error}\n`, (error) => {
            if (error) {
                return console.error(error);
            };
        });
        return console.error(error);
    };
};

async function getuser(username, password) {
    try {
        let connection = await pool.getConnection();
        let rows = await connection.query(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password]);
        connection.end();
        return rows[0];
    } catch (error) {
        fs.appendFile(`./logs/error.log`, `${error}\n`, (error) => {
            if (error) {
                return console.error(error);
            };
        });
        return console.error(error);
    };
};

async function setSessionID(username, sessionID) {
    try {
        let connection = await pool.getConnection();
        await connection.query(`UPDATE users SET sessionID = ? WHERE username = ?`, [sessionID, username]);
        return connection.end();
    } catch (error) {
        fs.appendFile(`./logs/error.log`, `${error}\n`, (error) => {
            if (error) {
                return console.error(error);
            };
        });
        return console.error(error);
    };
};

async function getSessionID(sessionID) {
    try {
        let connection = await pool.getConnection();
        let rows = await connection.query(`SELECT * FROM users WHERE SessionID = ?`, [sessionID]);
        connection.end();
        return rows[0];
    } catch (error) {
        fs.appendFile(`./logs/error.log`, `${error}\n`, (error) => {
            if (error) {
                console.error(error);
            };
        });
        console.error(error);
    };
};

async function updateasset(ID, Title, Contents, Location, Size, Notes) {
    try {
        let connection = await pool.getConnection();
        await connection.query(`UPDATE assets SET Title = ?, Contents = ?, Location = ?, Size = ?, Notes = ? WHERE ID = ?`, [Title, Contents, Location, Size, Notes, ID]);
        return connection.end();
    } catch (error) {
        fs.appendFile(`./logs/error.log`, `${error}\n`, (error) => {
            if (error) {
                return console.error(error);
            };
        });
        return console.error(error);
    };
};

async function addasset(Title, Contents, Location, Size, Notes) {
    try {
        let connection = await pool.getConnection();
        await connection.query(`INSERT INTO assets (Title, Contents, Location, Size, Notes) VALUES ("${Title}", "${Contents}", "${Location}", "${Size}", "${Notes}")`);
        return connection.end();
    } catch (error) {
        fs.appendFile(`./logs/error.log`, `${error}\n`, (error) => {
            if (error) {
                return console.error(error);
            };
        });
        return console.error(error);
    };
};

app.set(`views`, `./views`);
app.set(`view engine`, `pug`);
app.set('trust proxy', 1)
app.use(express.static(__dirname + `public`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: passwords.sessionsecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));

app.get(`/`, async function (req, res) {
    let cookieSessionID = req.cookies.sessionID;
    if (typeof cookieSessionID != `undefined`) {
        let result = await getSessionID(cookieSessionID);
        if (typeof result != `undefined`) {
            let result = await getassets();
            if (typeof result != `undefined`) {
                res.render(`assets`, { assets: result });
            } else {
                res.redirect(`/error/500`);
            };
        } else {
            res.cookie(`redirect`, req.originalUrl, { secure: true });
            return res.redirect(`/login`);
        };
    } else {
        res.cookie(`redirect`, req.originalUrl, { secure: true });
        return res.redirect(`/login`);
    };
});

app.get(`/assetmgt`, async function (req, res) {
    let cookieSessionID = req.cookies.sessionID;
    if (typeof cookieSessionID != `undefined`) {
        let result = await getSessionID(cookieSessionID);
        if (typeof result != `undefined`) {
            res.render(`assetmgt`);
        } else {
            res.cookie(`redirect`, req.originalUrl, { secure: true });
            return res.redirect(`/login`);
        };
    } else {
        res.cookie(`redirect`, req.originalUrl, { secure: true });
        return res.redirect(`/login`);
    };
});

/*app.get(`/assetmgt/assets`, async function (req, res) {
    let cookieSessionID = req.cookies.sessionID;
    if (typeof cookieSessionID != `undefined`) {
        let result = await getSessionID(cookieSessionID);
        if (typeof result != `undefined`) {
            let result = await getassets();
            if (typeof result != `undefined`) {
                res.render(`assets`, { assets: result });
            } else {
                res.redirect(`/error/404`);
            };
        } else {
            res.cookie(`redirect`, req.originalUrl, { secure: true });
            return res.redirect(`/login`);
        };
    } else {
        res.cookie(`redirect`, req.originalUrl, { secure: true });
        return res.redirect(`/login`);
    };
});*/

/*app.get(`/assetmgt/locations`, (_req, res) => {
    res.render(`locations`);
});*/

/*app.get(`/assetmgt/asseteditor`, (_req, res) => {
    res.render(`asseteditor`);
});*/

/*app.get(`/assetmgt/locationeditor`, (_req, res) => {
    res.render(`locationeditor`);
});*/

app.get(`/error/401`, (_req, res) => {
    res.render(`401`);
});

app.get(`/error/404`, (_req, res) => {
    res.render(`404`);
});

app.get(`/error/500`, (_req, res) => {
    res.render(`500`);
});


app.get(`/login`, async function (req, res) {
    let cookieSessionID = req.cookies.sessionID;
    if (typeof cookieSessionID != `undefined`) {
        let result = await getSessionID(cookieSessionID);
        if (typeof result != `undefined`) {
            return res.redirect(`/`);
        } else {
            return res.render(`login`);
        };
    } else {
        return res.render(`login`);
    };
});

app.get(`/logout`, (_req, res) => {
    res.clearCookie(`sessionID`);
    res.redirect(`/`);
});

app.get(`/public/js/bootstrap.bundle.min.js`, (_req, res) => {
    res.sendFile(`./public/js/bootstrap.bundle.min.js`, { root: __dirname });
});

app.get(`/public/js/bootstrap.bundle.min.js.map`, (_req, res) => {
    res.sendFile(`./public/js/bootstrap.bundle.min.js.map`, { root: __dirname });
});

app.get(`/public/js/jquery.min.js`, (_req, res) => {
    res.sendFile(`./public/js/jquery.min.js`, { root: __dirname });
});

app.get(`/public/js/jquery.min.js.map`, (_req, res) => {
    res.sendFile(`./public/js/jquery.min.js.map`, { root: __dirname });
});

app.get(`/public/css/bootstrap.min.css`, (_req, res) => {
    res.sendFile(`./public/css/bootstrap.min.css`, { root: __dirname });
});

app.get(`/public/css/bootstrap.min.css.map`, (_req, res) => {
    res.sendFile(`./public/css/bootstrap.min.css.map`, { root: __dirname });
});

/*app.get(`/public/css/error.css`, (_req, res) => {
    res.sendFile(`./public/css/error.css`, { root: __dirname });
});*/

app.get(`/public/css/main.css`, (_req, res) => {
    res.sendFile(`./public/css/main.css`, { root: __dirname });
});

app.get(`/favicon.ico`, (_req, res) => {
    res.sendFile(`./public/resources/favicon.ico`, { root: __dirname });
});

app.post(`/assetmgt/asseteditor/*`, async function (req, res) {
    let cookieSessionID = req.cookies.sessionID;
    if (typeof cookieSessionID != `undefined`) {
        let result = await getSessionID(cookieSessionID);
        if (typeof result != `undefined`) {
            let ID = req.originalUrl.split(`/`)[3];
            let result = await getasset(ID);
            if (typeof result != `undefined`) {
                let updatedrecord = { Title: req.body.Title, Contents: req.body.Contents, Location: req.body.Location, Size: req.body.Size, Notes: req.body.Notes };
                Object.keys(updatedrecord).forEach(key => {
                    if (!updatedrecord[key]) {
                        let jsonkey = new String(key);
                        updatedrecord[key] = result[jsonkey];
                    };
                });
                await updateasset(ID, updatedrecord.Title, updatedrecord.Contents, updatedrecord.Location, updatedrecord.Size, updatedrecord.Notes);
                return res.redirect(`/`);
            } else {
                return res.redirect(`/error/404`);
            };
        } else {
            res.cookie(`redirect`, req.originalUrl, { secure: true });
            return res.redirect(`/login`);
        };
    } else {
        res.cookie(`redirect`, req.originalUrl, { secure: true });
        return res.redirect(`/login`);
    };
});

app.get(`/assetmgt/asseteditor`, (_req, res) => {
    res.redirect(`/error/404`);
});

app.get(`/assetmgt/asseteditor/*`, async function (req, res) {
    let cookieSessionID = req.cookies.sessionID;
    if (typeof cookieSessionID != `undefined`) {
        let result = await getSessionID(cookieSessionID);
        if (typeof result != `undefined`) {
            let ID = req.originalUrl.split(`/`)[3];
            let result = await getasset(ID);
            if (typeof result != `undefined`) {
                return res.render(`asseteditor`, { asset: result });
            } else {
                return res.redirect(`/error/404`);
            };
        } else {
            res.cookie(`redirect`, req.originalUrl, { secure: true });
            return res.redirect(`/login`);
        };
    } else {
        res.cookie(`redirect`, req.originalUrl, { secure: true });
        return res.redirect(`/login`);
    };
});

app.get(`/assetmgt/addasset`, async function (req, res) {
    let cookieSessionID = req.cookies.sessionID;
    if (typeof cookieSessionID != `undefined`) {
        let result = await getSessionID(cookieSessionID);
        if (typeof result != `undefined`) {
            res.render(`addasset`)
        } else {
            res.cookie(`redirect`, req.originalUrl, { secure: true });
            return res.redirect(`/login`);
        };
    } else {
        res.cookie(`redirect`, req.originalUrl, { secure: true });
        return res.redirect(`/login`);
    };
});

app.post(`/assetmgt/addasset`, async function (req, res) {
    let cookieSessionID = req.cookies.sessionID;
    if (typeof cookieSessionID != `undefined`) {
        let result = await getSessionID(cookieSessionID);
        if (typeof result != `undefined`) {
            await addasset(req.body.ID, req.body.Title, req.body.Contents, req.body.Location, req.body.Size, req.body.Notes);
            return res.redirect(`/`);
        } else {
            res.cookie(`redirect`, req.originalUrl, { secure: true });
            return res.redirect(`/login`);
        };
    } else {
        res.cookie(`redirect`, req.originalUrl, { secure: true });
        return res.redirect(`/login`);
    };
});

app.get(`/assetmgt/*`, async function (req, res) {
    let cookieSessionID = req.cookies.sessionID;
    if (typeof cookieSessionID != `undefined`) {
        let result = await getSessionID(cookieSessionID);
        if (typeof result != `undefined`) {
            let ID = req.originalUrl.split(`/`)[2];
            let result = await getasset(ID);
            if (typeof result != `undefined`) {
                res.render(`asset`, { asset: result });
            } else {
                res.redirect(`/error/404`);
            };
        } else {
            res.cookie(`redirect`, req.originalUrl, { secure: true });
            return res.redirect(`/login`);
        };
    } else {
        res.cookie(`redirect`, req.originalUrl, { secure: true });
        return res.redirect(`/login`);
    };
});

app.post(`/login`, async function (req, res) {
    let username = (req.body.username).toLowerCase();
    let password = req.body.password;
    crypto.pbkdf2(password, passwords.salt, 100000, 64, `sha512`, async function (error, derivedKey) {
        if (error) {
            fs.appendFile(`./logs/error.log`, `${error}\n`, (error) => {
                if (error) {
                    return console.error(error);
                };
            });
            return console.error(error);
        } else {
            let hashedPassword = derivedKey.toString(`hex`);
            let result = await getuser(username, hashedPassword);
            if (typeof result != `undefined`) {
                let sessionID = crypto.randomBytes(64).toString(`hex`);
                res.cookie(`sessionID`, sessionID, { expires: new Date(Date.now() + 1800000), secure: true });
                setSessionID(username, sessionID);
                let redirect = req.cookies.redirect;
                if (typeof redirect != `undefined`) {
                    res.clearCookie(`redirect`);
                    res.redirect(redirect);
                } else {
                    res.redirect(`/`);
                };
            } else {
                return res.redirect(`/error/401`);
            };
        };
    });
});

app.get(`*`, (_req, res) => {
    res.redirect(`/error/404`);
});

http.createServer(app).listen(port);
