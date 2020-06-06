const express = require(`express`);
const mariadb = require(`mariadb`);
const fs = require(`fs`);
const http = require(`http`);
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
        let rows = await connection.query(`SELECT * FROM assets WHERE ID LIKE ${ID}`);
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

app.get(`/error/404`, function (_req, res) {
    res.render(`404`);
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

app.get(`/assetmgt/*`, (req, res) => {
    let ID = req.originalUrl.split(`/`)[2];
    if (typeof getasset(ID) != `undefined`) {
        res.render(`asset`, { ID: ID, contents: "stuff" });
    } else {
        app.redirect(`/error/404`);
    };
});

app.get(`*`, (_req, res) => {
    res.redirect(`/error/404`);
});

http.createServer(app).listen(port);
