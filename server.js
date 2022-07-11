const request = require('request');
const express = require('express');
const http = require('http');
const app = express();
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, access_token'
    )
    if ('OPTIONS' === req.method) {
        res.send(200)
    } else {
        next()
    }
})

app.use(express.static(__dirname));
app.get('/api/video', function(req, res) {
    let id = req.query.id;
    request('https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=' + id, function(error, response, data) {
        if (response.statusCode == 200) {
            try {
                let json = JSON.parse(data);
                res.redirect(json.item_list[0].video.play_addr.url_list[0]);
            } catch (e) {

            }
        }
    });

});
var server = http.createServer(app);
server.listen(8002, function listening() {
    console.log('server start at port: 8002');
    //console.log('http://127.0.0.1:8002/api/video?id=6869223088110849293');
});