var flag = window && window.process && window.process.versions && window.process.versions['electron'];
if(flag){
    const { ipcRenderer } = require('electron')
    // require('./server.js');
    window._api = {
        method: function(data) {
            console.log(data);
            var d = data.msg;
            switch (data.type) {
              
                default:
                    ipcRenderer.send('method', data);
            }
        }
    }
}

