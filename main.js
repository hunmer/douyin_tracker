const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')
const files = require('./file.js')
app.commandLine.appendSwitch("disable-http-cache");

var win;
Menu.setApplicationMenu(null)

function createWindow() {
    win = new BrowserWindow({
        width: 390,
        height: 844,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })
    win.loadFile('index.html')
    win.webContents.openDevTools()
    win.webContents.session.on('will-download', (event, item, webContents) => {
         send('toast', [`下载中...`, 'alert-info']);

        //event.preventDefault();
        let date = new Date();
        var dir = `${__dirname}\\download\\${date.getFullYear()}_${(Number(date.getMonth()) + 1)}_${date.getDate()}\\`;
        if (!files.isDir(dir)) files.mkdir(dir);

        // let prevReceivedBytes = 0;
        // var downloadItem = {};
        var file = '(' + new Date().getTime() + ')' + item.getFilename();
        item.setSavePath(dir + file);
        item.on('updated', (event, state) => {
            if (state === 'interrupted') {} else if (state === 'progressing') {
                if (item.isPaused()) {} else {
                    // const receivedBytes = item.getReceivedBytes()
                    // // 计算每秒下载的速度
                    // downloadItem.speed = receivedBytes - prevReceivedBytes
                    // prevReceivedBytes = receivedBytes;

                    let progress = parseInt(item.getReceivedBytes() / item.getTotalBytes() * 100);
                    if (process.platform == 'darwin') {
                        win.setProgressBar(progress)
                    }
                }
            }
        })
        item.once('done', (event, state) => {
            //console.log(event);
            var fileName = event.sender.getFilename();
            if (state === 'completed') {
                send('downloaded', {file: event.sender.getSavePath(), name: fileName});
            } else {
                send('toast', [`下载失败 <b><a href="javascript: void(0);">${fileName}</a></b>`, 'alert-danger']);
            }
        })
    });
}


ipcMain.on("method", async function(event, data) {
    var d = data.msg;
    switch (data.type) {
        case 'ondragstart':
            var list = [];
            for (var file of d.files) {
                file = files.getPath(file);
                if (files.exists(file)) {
                    list.push(file);
                }
            }
            var icon = files.getPath(d.icon);
            win.webContents.startDrag({
                files: list,
                icon: __dirname + '/dist/files.ico',
            });
            break;
        case 'devtool':
            win.webContents.toggleDevTools()
            break;
        case 'min':
            win.minimize();
            break;
        case 'max':
            win.isMaximized() ? win.restore() : win.maximize();
            break;
        case 'close':
            win.close();
            break;
    }
});

function send(type, params) {
    switch (type) {
        case 'toast':
            params = {
                text: params[0],
                class: params[1],
            }
            break;
    }
    win.webContents.send(type, params);
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', function() {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit()
})