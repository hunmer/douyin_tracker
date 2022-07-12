var g_ui = {
    init: function() {
        const self = this;

        registerAction('ui_showTabs', dom => {
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