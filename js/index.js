$(function() {
    if (location.search == '') location.href = '?t=' + new Date().getTime()
    const checkAction = function(event, action) {
        if (this.classList.contains('disabled')) return;
        doAction(this, this.dataset[action], event);
    }
    $(document)
        .on('click', '[data-action]', function(event) {
            checkAction.call(this, event, 'action');
        })
        .on('dblclick', '[data-dbaction]', function(event) {
            checkAction.call(this, event, 'dbaction');
        })
        .on('change', '[data-change]', function(event) {
            checkAction.call(this, event, 'change');
        })
        .on('input', '[data-input]', function(event) {
            checkAction.call(this, event, 'input');
        })
        .on('contextmenu', '[data-contenx]', function(event) {
            checkAction.call(this, event, 'contenx');
        })
        .on('closed.modal.amui', function(event) {
            // 关闭Modal删除DOM
            if (event.target.classList.contains('am-modal-confirm')) {
                event.target.remove();
            }
        })
        .on('dragstart', '[data-file]', function(e) {
            console.log(e);
            g_cache.draging = true;
            dragFile(e, $(this).find('img').attr('src') || this.dataset.icon);
        })
        .on('dragend', '[data-file]', function(e) {
            g_cache.draging = false;
        })


    getModule('FastClick').attach(document.body);
      $(window).on('popstate', event => {
            if (g_config.sidebar) {
                const sidebarToggle = document.body.querySelector('#sidebarToggle');
                if (sidebarToggle) {
                    if (localStorage.getItem('sb|sidebar-toggle') === 'true') {
                        document.body.classList.toggle('sb-sidenav-toggled');
                    }
                }
            }
        })
        .on('blur', event => {
           
        })
        .on('focus', event => {
            checkClipboard();
        });

    $('.am-tabs-bd').on('scroll', function(event) {
        let top = this.scrollTop;
        domSelector('toTop').toggleClass('hide', top == 0)
        if (top + this.offsetHeight + 50 >= this.scrollHeight) {
            let now = new Date().getTime();
            if (now >= g_cache.nextPage) {
                g_cache.nextPage = now + 1000;
            }
        }
    });
});

function getModule(key) {
    return (typeof(module) != 'undefined' ? module.exports : window)[key];
}

function doAction(dom, action, event) {
    var action = action.split(',');
    if (g_actions[action[0]]) {
        g_actions[action[0]](dom, action, event);
    }
    switch (action[0]) {
        case 'toTop':
            $('.am-tabs-bd').animate({ scrollTop: 0 }, 500);
            break;

          case 'data_export':
            downloadData(JSON.stringify(data_getAll()), 'data_' + (new Date().format('yyyy_MM_dd_hh_mm_ss')) + '.json');
            break;
        case 'data_import':
            $('#upload').click();
            break;
    }
}

function getTabBtn(tab){
    return $('a[href="[data-tab-panel-'+tab+']"]');
}

function toTab(tab){
    getTabBtn(tab).click();
}

function data_getAll(){
    var d = {};
            for (var key of local_getList()) {
                d[key] = localStorage.getItem(key);
            }
    return d;
}