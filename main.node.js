"ui";

const ui = require('ui');
const request = require('request');
const path = require('path');
const fs = require('fs');
// require('./server.js');
const { clipboardManager } = require('clip_manager')


function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    }
    if (mkdirsSync(path.dirname(dirname))) {
        fs.mkdirSync(dirname);
        return true;
    }
}

function downloadFile(uri,filename,callback){
    mkdirsSync(path.dirname(filename));
    var stream = fs.createWriteStream(filename);
    request(uri).pipe(stream).on('close', callback); 
}

// downloadFile("https://aweme.snssdk.com/aweme/v1/play/?video_id=v0200fg10000caso1l3c77u1j2tkuj9g&line=0&file_id=e3477a08875b4117b695a17d7f4e74b9&sign=c2855c9ccbde5dd3022e4157447af8ff&is_play_url=1&source=PackSourceEnum_DOUYIN_REFLOW","sdcard/download/[7113861641179090184]所有人眼中的差生最终逆袭成为学霸#家庭教育 #教育 #读书 #孩子教育 .mp4", () => {
//     console.log('下载完成');
// })

class WebActivity extends ui.Activity {
    get initialStatusBar() {
        return { color: '#ffffff', light: true };
    }

    get layoutXml() {
        return `
        <vertical>
            <webview id="web" w="*" h="*"/>
        </vertical>
        `
    }

    onContentViewSet(contentView) {
        this.webview = contentView.findView('web');
        this.initializeWebView(this.webview);
        //logLocation(this.webview.jsBridge);
    }

    initializeWebView(webview) {
        webview.loadUrl(`file://${__dirname}/index.html`);
        // 监听WebView的控制台消息，打印到控制台
        webview.on('console_message', (event, msg) => {
            console.log(`${path.basename(msg.sourceId())}:${msg.lineNumber()}: ${msg.message()}`);
        });
        const jsBridge = webview.jsBridge;

        const fetch = ( opts = {}, type) => {
            if(type == 'redirect'){
                opts.followRedirect = false;
            }
            return new Promise(function(resolve){
                request(opts, function (error, response, data) {
                    if(type == 'redirect'){
                        // 兼容fetch
                        data = {
                            status: 200,
                            redirected: true,
                            url: response.headers.location
                        }
                    }
                    resolve(data)
                });
            });
        }

        jsBridge.handle('http', async (event, args) => {
            return await fetch(args.opts, args.type);
        });

         jsBridge.handle('action', async (event, args) => {
            console.log(args);
            switch(args.type){
                case 'copy':
                    clipboardManager.setClip(args.msg)
                    break;

                case 'download':
                    // if(!args.path) args.path = './download/'+;
                    downloadFile(args.msg.url, args.msg.path, function(){
                        jsBridge.on('download', args);
                    });
                    break;
            }
        });

        

        // 监听Web的finish请求，销毁界面
        jsBridge.handle('finish', () => {
            this.finish();
        });
    }

    // 监听Activity的返回事件
    onBackPressed() {
        // 不调用super.onBackPressed()，避免返回时销毁界面
        // 通知web返回上一级目录
        this.webview.jsBridge.on('go-back');
    }
}
ui.setMainActivity(WebActivity);

// async function logLocation(jsBridge) {
//     const href = await jsBridge.eval("window.location.href");
//     console.log(decodeURI(href));
// }