
const go_back = () => {
     if(!$('#detail').hasClass('hide')){
        g_ui.showTabs(true)
        return;
    }
    if(hideModal()) return;

    return true;
}

$autojs.on('go-back', () => {
    console.log('go-back');
    if(go_back()) return;
    $autojs.invoke('finish');
});


$autojs.on('download', d => {
    console.log('download', d);
});

// 返回键/返回手势时
// $autojs.handle('', () => {
// });

