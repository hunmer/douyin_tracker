const g_ui = {
    init: function() {
        const self = this;
        registerAction('user_showUpdate', dom => {

            let user = dom.dataset.user;
            $('#title-link').html(user);

            self.showTabs(false);
        });

        registerAction('ui_showTabs', dom => {
            self.showTabs(true);
        });

        registerAction('actions_users', () => {

        });

        // self.showTabs(false);
    },
    showTabs: function(show) {
        if(typeof(show) == 'object'){
            let opts = Object.assign({}, show);
            show = false;
            $('#detail').find('#title-link').html(opts.title)

        }
        $('#tabs').toggleClass('hide', !show);
        $('#detail').toggleClass('hide', show);
        show && $('#detail_content').html('')
    },
}

g_ui.init();