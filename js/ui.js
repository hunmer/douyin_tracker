var g_ui = {
    init: function() {
        const self = this;

        registerAction('ui_showTabs', dom => {
            // 返回时重载列表（如果有的已经换了分组）
            let coll = domSelector('coll_list,select').text();
            if(coll != '默认专辑') g_coll.coll_load(coll);
            self.showTabs({
                target: 'tabs'
            });
        });

        registerAction('actions_users', () => {

        });

        // self.showTabs(false);
    },
    showTabs: function(opts) {
        for(let id of ['tabs', 'detail']){
            let show = id == opts.target;
            let target = $('#'+id);

            target.toggleClass('hide', !show);
            if(show && opts.title){
                target.find('#title-link').html(opts.title)
            }
        }
        if(opts.target == 'tabs'){
             $('#detail_content').html('');
        }
    },
}

g_ui.init();