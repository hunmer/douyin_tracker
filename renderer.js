var flag = window && window.process && window.process.versions && window.process.versions['electron'];
if (flag) {
    const { app, ipcRenderer, clipboard, shell } = require('electron');
    // require('./server.js');
    window._api = {
        method: function(data) {
            console.log(data);
            var d = data.msg;
            switch (data.type) {
                case 'url':
                    shell.openExternal(d);
                    break;
                case 'copy':
                    clipboard.writeText(d)
                    break;
                case 'openFolder':
                    shell.showItemInFolder(d)
                    break;
                default:
                    ipcRenderer.send('method', data);
            }
        }
    }
}