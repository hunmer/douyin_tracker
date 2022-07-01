var g_coll = {
    list: {},
    init: function() {
        const self = this;
        g_menu.registerMenu({
            name: 'coll_item',
            selector: '.coll_item',
            dataKey: 'data-vid',
            html: g_menu.buildItems([{
                action: 'coll_item_finish',
                class: 'text-success',
                text: '已完成',
                icon: 'check-circle-o'
            }, {
                action: 'coll_item_delete',
                class: 'text-danger',
                text: '删除',
                icon: 'trash'
            }]),
            onShow: key => {

            }
        });

        registerAction('toggleClass', (dom, action) => {
            dom = $(dom).addClass(action[1]);
            dom.siblings().removeClass(action[1]);
        });


        const coll_saveTo = n => {
            self.set(g_cache.preview.vid, Object.assign(g_cache.preview.video, {
                folder: n
            }))
            toast('保存成功', 'success');
            domSelector('coll_list').html(n);

        }

        registerAction('coll_list', (dom, action) => {
            let ret = {};
            for (let [id, item] of Object.entries(this.list)) {
                let name = item.folder || '默认';
                if (!ret[name]) ret[name] = [];
                ret[name].push(id);
            }

            //  
            var h = '';
            for (let name in ret) {
                h += `
		        <li data-action="toggleClass,bg-primary" class="${ g_cache.preview && name == g_cache.preview.video.folder ? 'am-active' : ''}">
				    <span class="am-badge am-badge-success">
				    ${ret[name].length}</span>
				    <b>${name}</b>
				</li>
				 `
            }

            showModal({
                title: '选择专辑',
                msg: `<ul class="am-list am-list-static am-list-border">${h}</ul>`,
                btns: btns => {
                    btns[0] = {
                        text: '新建',
                        props: `data-action="coll_new"`
                    }
                    btns[1].text = '保存';
                }
            }).then(() => {
            	name = $('.am-modal-dialog .bg-primary b').html();
            	if(action[1]){
            		// 显示目录视频
            		self.coll_load(name);
            		return;
            	}
            	// 保存视频目录属性
                coll_saveTo(name);
            })

        });

        registerAction(['coll_item_finish', 'coll_item_delete'], (dom, action) => {
            switch (action[0]) {
                case 'coll_item_finish':
                    break;

                case 'coll_item_delete':
                    self.remove(g_menu.key);
                    break;
            }
            g_menu.hideMenu('coll_item');
        })

        this.list = local_readJson('coll', {
            id1: {
                folder: '育儿',
                cover: 'res/1.png',
                video: 'res/1.mp4',
                desc: 'test',
                like: 300,
            },
            id2: {
                folder: '育儿',
                cover: 'res/2.png',
                video: 'res/2.mp4',
                desc: 'test',
                like: 300,
            }
        });


        registerAction('coll_new', () => {
            showModal({
                type: 'prompt',
                title: '新建专辑',
            }).then((s) => {
                if (!isEmpty(s)) {
                    coll_saveTo(s);
                }
            })
        })
        const coll_playIndex = (offset, vid) => {
            if (!vid) vid = g_cache.preview.vid;
            let keys = this.keys;
            let index = keys.indexOf(vid) + offset;
            self.coll_play(keys[index]);
            domSelector('coll_video_prev').toggleClass('am-disabled', index <= 0);
            domSelector('coll_video_next').toggleClass('am-disabled', index >= keys.length - 1);
        }

        registerAction('coll_video_prev', () => {
            coll_playIndex(-1);
        });

        registerAction('coll_video_next', () => {
            coll_playIndex(1);
        });

        registerAction('coll_play', dom => {
            coll_playIndex(0, dom.dataset.vid);
        });

        $('[data-tab-panel-coll]').html(`
			${this.getHTML('coll_list,select')}
			<hr data-am-widget="divider"class="am-divider am-divider-default" />
			  <div class="am-g" id="coll_main"></div>


		`)
    },

    coll_save: function(key, val) {
        this.set()
    },
    coll_play: function(vid) {
        if (vid == undefined) return;
        let d = this.get(vid);
        g_cache.preview = {
            vid: vid,
            video: d
        }
        $('#detail_content').html(`
            	<video style="height: calc(100vh - 100px);" onclick="if(this.paused){this.play()}else{this.pause()}" class="w-full" src="${d.video || ''}" poster="${d.cover}" autoplay loop>
        		</video>
        		<div class="text-center d-block">
	        		<button data-action="coll_video_prev" type="button" class="am-btn am-btn-primary"><i class="am-header-icon am-icon-arrow-left"></i></button>
	        		<button data-action="coll_video_next" type="button" class="am-btn am-btn-primary"><i class="am-header-icon am-icon-arrow-right"></i></button>
	        	</div>
	        </div>
	      `);

        g_ui.showTabs({
            title: g_coll.getHTML('coll_list,select', d.folder)
        });
    },

    coll_load: function(name) {
        domSelector('coll_list,select').html(name);
        let h = ``;
        let ids = [];
        for (let [vid, item] of Object.entries(this.list)) {
            if (item.folder == name) {
                ids.push(vid)
                h += `
		            <li data-vid="${vid}" class="coll_item position-relative" data-action="coll_play">
		              <img style="max-height: 145px;width: 100%;" title="${item.desc}" class="am-thumbnail lazyload" src="${item.cover}"  />
		              <a class="text-ligth position-absolute" style="left: 20px;bottom:20px;"><i class="am-header-icon am-icon-heart mr-2"></i>${item.like}</a>
		            </li>
		          `
            }
        }
        this.keys = ids;
        $('#coll_main').html(h ? `<ul class="am-avg-sm-3 am-thumbnails">${h}</ul>` : '<h4 class="text-center">空空的...</h4>')
            .find('.lazyload').lazyload();
    },

    get_folder: function(key){
    	let d = this.get(key);
    	return d && d.folder ? d.folder : '选择专辑';
    },

    set: function(key, vals) {
        this.list[key] = vals;
        this.save();
    },

    get: function(key) {
        return this.list[key];
    },

    remove: function(key) {
        delete this.list[key];
        domSelector({ vid: key }).remove();
        this.save();
    },

    save: function(save = true) {
        save && local_saveJson('coll', this.list);
        this.update();
    },

    getHTML: function(action = 'coll_list', folder = '') {
        return `<span data-action="${action}" class=" am-text-lg am-badge am-badge-success">${folder || '选择专辑'}</span>`;
    },

    update: function() {
        return;
        for (let select of $('.select_coll')) {
            console.log($(select).next());
            $(select).next().remove(); // 移除生成的dropdown
            $(select).replaceWith(this.getHTML(select.dataset.change));
        }
        $('.select_coll[data-am-selected]').selected();
    }
}
g_coll.init();