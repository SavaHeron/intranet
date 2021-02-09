const express = require(`express`);
const mariadb = require(`mariadb`);
const fs = require(`fs`);
const http = require(`http`);
const crypto = require(`crypto`);
const app = express();
const port = 3000;

const pool = mariadb.createPool({
    host: `localhost`,
    user: `admin`,
    password: ``,
    connectionLimit: 5,
    database: `intranet`
});

async function getasset(ID) {
    try {
        let connection = await pool.getConnection();
        let rows = await connection.query(`SELECT * FROM assets WHERE ID LIKE "${ID}"`);
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

async function getuser(username, password) {
    try {
        let connection = await pool.getConnection();
        let rows = await connection.query(`SELECT * FROM users WHERE username LIKE "${username}" AND password LIKE "${password}"`);
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

async function setSessionID(username) {
    try {
        let connection = await pool.getConnection();
        let rows = await connection.query(`UPDATE users SET sessionID = "${sessionID}" WHERE username = "${username}"`);
        connection.end();
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
app.use(express.static(__dirname + `public`));

app.get(`/`, (_req, res) => {
    res.render(`index`);
});

app.get(`/assetmgt`, (_req, res) => {
    res.render(`assetmgt`);
});

app.get(`/assetmgt/assets`, (_req, res) => {
    res.render(`assets`);
});

app.get(`/assetmgt/locations`, (_req, res) => {
    res.render(`locations`);
});

app.get(`/assetmgt/asseteditor`, (_req, res) => {
    res.render(`asseteditor`);
});

app.get(`/assetmgt/locationeditor`, (_req, res) => {
    res.render(`locationeditor`);
});

app.get(`/critsys`, (_req, res) => {
    res.render(`critsys`);
});

app.get(`/error/404`, (_req, res) => {
    res.render(`404`);
});

app.get(`/error/401`, (_req, res) => {
    res.render(`401`);
});

app.get(`/login`, (_req, res) => {
    res.render(`login`);
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

app.get(`/public/css/error.css`, (_req, res) => {
    res.sendFile(`./public/css/error.css`, { root: __dirname });
});

app.get(`/public/css/main.css`, (_req, res) => {
    res.sendFile(`./public/css/main.css`, { root: __dirname });
});

app.get(`/favicon.ico`, (_req, res) => {
    res.sendFile(`./public/resources/favicon.ico`, { root: __dirname });
});

app.get(`/assetmgt/*`, async function (req, res) {
    let ID = req.originalUrl.split(`/`)[2];
    let result = await getasset(ID);
    if (typeof result != `undefined`) {
        let contents = result.Contents;
        res.render(`asset`, { ID: ID, contents: contents });
    } else {
        res.redirect(`/error/404`);
    };
});

app.post(`/login`, async function (req, resp) {
    let username = req.body.username;
    let password = req.body.password;
    crypto.pbkdf2(password, `putsalthere`, 100000, 64, `sha512`, async function (error, derivedKey) {
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
            if (result.length == 1) {
                let sessionID = crypto.randomBytes(64).toString(`hex`);
                resp.cookie(`sessionID`, sessionID, { expires: new Date(Date.now() + 1800000) });
                setSessionID(sessionID);
                resp.redirect(`/`);
            } else {
                return resp.redirect(`/401`);
            };
        };
    });
});

app.get(`*`, (_req, res) => {
    res.redirect(`/error/404`);
});

http.createServer(app).listen(port);
