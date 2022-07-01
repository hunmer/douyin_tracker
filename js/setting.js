const g_setting = {
    init: function() {

        _config['debug'] = val => {
            if (val) {
                loadRes([{ url: 'js/eruda.js', type: 'js' }], () => {
                    eruda.init();
                });
            } else
            if (typeof(eruda) != 'undefined') eruda.destroy();
        }

       

        const applyConfig = function(type, key) {
            let d = {};
            d[type] = 'config,' + key;
            let val = getConfig(key);
            let dom = domSelector(d);

            if(typeof(val) == 'boolean'){
               dom.prop('checked', val);
           }else{
                // radio 多个
                dom.filter((i, d) => d.value == val).prop('checked', true);
           }
            onSetConfig(key, val)
            return applyConfig;
        }

        applyConfig('change', 'debug')

        registerAction('config', (dom, action) => {
            switch (dom.nodeName.toLowerCase() + '-' + dom.type) {
                case 'input-checkbox':
                    setConfig(action[1], dom.checked);
                    break;

                case 'input-radio':
                    setConfig(action[1], dom.value);
                    break;
            }
        });

        registerAction('store_reset', () => {
            showModal({
                title: `确定清除所有数据吗?`,
                msg: '清除数据',
            }).then(() => {
                local_clearAll();
                location.reload();
            })
        })
    },

}

g_setting.init();