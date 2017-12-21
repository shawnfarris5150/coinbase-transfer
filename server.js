const   express = require('express'),
        doTransfer = require('./doTransfer').doTransfer;


const   app = express(),
        port = 8080;

app.use(function (req, res, next) {
    console.log(req.body); // populated!
    next();
});

app.get('/doTransfer', function(req, res) {
    try {
        doTransfer(function(log) {
            res.send(log);
        });
    } catch(e) {
        res.status(503).send(e);
    }
});


var server = app.listen(port, function () {

    var host = server.address().address;
    var port = server.address().port;
  
    console.log("Server listening at http://%s:%s", host, port);
  
});