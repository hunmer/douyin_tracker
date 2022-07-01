var flag = window && window.process && window.process.versions && window.process.versions['electron'];
if(flag){
    const { ipcRenderer } = require('electron')
    // require('./server.js');
    ipcRenderer.on('main-message-reply', (event, arg) => {
    });

    window._api = {
        method: function(data) {
            console.log(data);
            var d = data.msg;
            switch (data.type) {
              
            }
        }
    }
}

