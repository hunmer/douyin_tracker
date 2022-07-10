var flag = window && window.process && window.process.versions && window.process.versions['electron'];
const { app, ipcRenderer, clipboard, shell } = require('electron');
 var request = require('request');
 var fs = require('fs');
 var path = require('path');
 var files = require('../file.js');

if (flag) {
    // require('./server.js');+
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

    ipcRenderer.on('toast', (event, arg) => {
        toast(arg.text, arg.class);
    });

    ipcRenderer.on('downloaded', (event, arg) => {
        showModal({
            title: `下载完成`,
            msg: `
                <div draggable="true" data-file="${arg.file}">
                    <video onclick="if(this.paused){this.play()}else{this.pause()}" src="${arg.file}" class="w-full">
                    <span class="mt-10">把我拖到其他位置</span>
                </div>
            `,
            btns: btns => {
                btns.shift();
                btns[0].text = '定位';
                return btns;
            }
        }).then(() => {
            ipc_send('openFolder', arg.file);
        })
    });

    $(function() {
        $('#setting_btns').append(`<button type="button" data-action="checkUpdate" class="am-btn am-btn-warning mt-10">更新软件</button>`)
         registerAction('checkUpdate', () => {
            checkFileUpdates('https://github.com/hunmer/douyin_tracker/raw/main/')
         })
    });


}

function checkFileUpdates(url, tip = true) {
    if (g_cache.updateing) return;
    var skip = getConfig('disabled_updates', 'css/user.css').split('\n');

    downloadFile({
        url: url + 'listFile.json?t='+new Date().getTime(),
        complete: data => {
            try {
                var i = 0;
                var updated = [];
                var json = JSON.parse(data);
                for (var name in json) {
                    let md5 = json[name];
                    name = name.replace(/\\/g, "/");
                    if (skip.includes(name)) continue;
                    let saveTo =  path.resolve(__dirname, '..') + '/' + name;
                    if (files.exists(saveTo) && md5 == files.getFileMd5(saveTo)) continue;
                    updated.push(name);
                    i++;
                }
                if (tip) {
                    if (!i) return toast('没有更新', 'success');
                    showUpdateFiles(url, updated);
                } else {
                    g_cache.needUpdate = updated;
                    domSelector('aboutMe').find('.badge').toggleClass('hide', i == 0).html('New');
                }
            } catch (e) {
                toast('请求错误', 'danger');
            }

        }
    });
}

function downloadFile(opts) {
    var received_bytes = 0;
    var total_bytes = 0;
    var progress = 0;
    var opt = {
        method: 'GET',
        url: opts.url,
        timeout: 15000,
    }
    var req = request(opt);
    var fileBuff = [];
    req.on('data', function(chunk) {
        received_bytes += chunk.length;
        fileBuff.push(Buffer.from(chunk));
        var newProgress = parseInt(received_bytes / total_bytes * 100);
        if (newProgress != progress) {
            progress = newProgress;
            opts.progress && opts.progress(progress);
        }
    });
    req.on('end', function() {
        var totalBuff = Buffer.concat(fileBuff);
        if (opts.saveTo) {
            fs.writeFile(opts.saveTo, totalBuff, (err) => {
                opts.complete && opts.complete(opts.saveTo)
            });
        } else {
            opts.complete && opts.complete(totalBuff.toString())
        }
    });
    req.on('response', function(data) {
        total_bytes = parseInt(data.headers['content-length']);
    });
    req.on('error', function(e) {
        opts.complete && opts.complete(e);
    });
}


function showUpdateFiles(url, updated) {
    var h = '<ul style="list-style: decimal;">';
    for (var name of updated) h += `<li>${name}</li>`;
    h += '</ul>';
    showModal({
        title: '有 ' + updated.length + ' 个文件可以更新!',
        msg: h,
    }).then(() => {
        updateFiles(url, updated);
    })
}

function updateFiles(url, fileList) {
    var max = fileList.length;
    if (max == 0) return;
    var err = 0;
    var now = -1;
    var done = 0;
    var progress = 0;
    var next = () => {
        if (++now >= max) return;
        var name = fileList[now];
        g_cache.updateing = true;
        let saveTo = path.resolve(__dirname, '..')+'\\' + name;
        downloadFile({
            url: url + name,
            saveTo: saveTo,
            onError: () => ++err,
            complete: saveTo => {
                var newProgress = parseInt(++done / max * 100);
                if (newProgress != progress) {
                    progress = newProgress;
                    if (progress == 100) {
                        delete g_cache.updateing;
                        alert(`成功更新 ${max - err} 个文件!${err ? err + '个文件处理失败!' : ''}请手动重启软件!`);
                    }
                }
                next();
            }
        });
    }
    next();
}



function dragFile(ev, icon) {
    var target = $(ev.currentTarget);
    ev.preventDefault();
    ipc_send('ondragstart', {
        files: [target.attr('data-file')],
        icon: icon || target.attr('data-icon') || '',
    });
}

function checkClipboard() {
    let s = getClipboardText();
    let callback;
    let msg;
    if (s != g_cache.lastClipboard) {
        g_cache.lastClipboard = s;
        // https://www.douyin.com/user/MS4wLjABAAAABrCgQty2EbdlSZm13n9MFaL08Ae9QKJKcdY691wwDXnrvM8jz_qcjNbYlWxFs219
        let user = cutString(s + '?', 'https://www.douyin.com/user/', '?');
        if (user != '') {
            callback = () => g_douyin.link_parse(s)
            msg = '添加观测账号吗?';
        }
    }

    if (callback) {
        showModal({
            title: `检测到链接`,
            msg: msg,
        }).then(() => {
            callback();
        })
    }
}

function getClipboardText() {
    return clipboard ? clipboard.readText() : '';
}