const express = require(`express`);
const http = require(`http`);
const app = express();
const port = 3000;

app.set(`views`, `./views`);
app.set(`view engine`, `pug`);
app.use(express.static(__dirname + `public`));

app.get(`/`, (_req, res) => {
    res.render(`index`);
});

app.get(`/assetmgt`, (_req, res) => {
    res.render(`assetmgt`);
});

app.get(`/critsys`, (_req, res) => {
    res.render(`critsys`);
});

app.get(`/error/404`, function (_req, resp) {
    resp.send(`404`);
    //resp.render(`404`);
});

app.get(`/public/js/boostrap.min.js`, (_req, res) => {
    res.sendFile(`./public/js/bootstrap.min.js`, { root: __dirname });
});

app.get(`/public/js/boostrap.min.js.map`, (_req, res) => {
    res.sendFile(`./public/js/bootstrap.min.js.map`, { root: __dirname });
});

app.get(`/public/js/jquery.min.js`, (_req, res) => {
    res.sendFile(`./public/js/jquery.min.js`, { root: __dirname });
});

app.get(`/public/js/jquery.min.js.map`, (_req, res) => {
    res.sendFile(`./public/js/jquery.min.js.map`, { root: __dirname });
});

app.get(`/public/css/bootstrap.min.css`, (_req, resp) => {
    resp.sendFile(`./public/css/bootstrap.min.css`, { root: __dirname });
});

app.get(`/public/css/bootstrap.min.css.map`, (_req, resp) => {
    resp.sendFile(`./public/css/bootstrap.min.css.map`, { root: __dirname });
});

app.get(`*`, (_req, resp) => {
    resp.redirect(`/error/404`);
});

http.createServer(app).listen(port);
