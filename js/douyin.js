var g_douyin = {
    init: function() {
        var self = this;
        g_menu.registerMenu({
            name: 'user_item',
            selector: '__',
            dataKey: 'data-uid',
            html: g_menu.buildItems([{
                action: 'user_update',
                class: 'text-success',
                text: '更新',
                icon: 'refresh'
            }, {
                action: 'user_makeReaded',
                class: 'text-success',
                text: '全部已读',
                icon: 'tag'
            }, {
                action: 'user_delete',
                class: 'text-danger',
                text: '删除',
                icon: 'trash'
            }]),
            onShow: key => {

            }
        });


        registerAction('user_follow', dom => {
            dom = $(dom);
            let par = dom.parents('[data-uid]');
            let uid = par.data('uid');
            let d = {
                user: {
                    icon: par.find('img').attr('src'),
                    name: par.find('b').text(),
                }
            }
            if (dom.hasClass('am-btn-danger')) {
                self.add(uid, d);
                dom.text('取消关注').removeClass('am-btn-danger');
            } else {
                self.remove(uid);
                dom.text('关注').addClass('am-btn-danger');
            }
        })


        registerAction('user_public_remove', dom => {
            showModal({
                title: `确定清除服务器内的账号吗?`,
                msg: '移除账号',
            }).then(() => {
                dom = $(dom);
                let par = dom.parents('[data-uid]');
                let uid = par.data('uid');

                let r = {
                    type: 'remove',
                    list: {}
                }
                r.list[uid] = {}

                $.ajax({
                        url: g_api + 'douyin.php',
                        type: 'POST',
                        dataType: 'json',
                        data: { data: JSON.stringify(r) },
                    })
                    .done(function(data) {
                        par.remove();
                        toast('移除成功', 'success');
                    })
                    .fail(function() {
                        toast('移除失败', 'danger');
                    })
            })
        })

        registerAction('account_load_list', dom => {
            $('#user_list').html('<h4 class="mt-10 text-center">加载中...</h4>')
            if (dom.value == 'public') {
                $.getJSON(g_api + 'douyin.php', function(json, textStatus) {
                    if (textStatus == 'success') self.user_list(json, true);
                });
            } else {
                self.user_list(self.list);
            }
        });

        registerAction('user_menu', dom => {
            g_menu.showMenu('user_item', $(dom).parents('[data-uid]'))
        });

        registerAction('account_resetViewed', () => {
            showModal({
                title: `确定清除所有已看的吗?`,
                msg: '清除已看',
            }).then(() => {
                for (let k in self.list) {
                    let d = self.list[k];
                    d.list = {};
                    d.lastUpdateTime = 0;
                    d.lastVideo = 0;
                }
                self.save()
                self.account_checkNew();
            })
        })

        registerAction(['user_update', 'user_homepage', 'user_makeReaded', 'user_delete'], (dom, action) => {
            let uid = g_menu.key;
            switch (action[0]) {
                case 'user_homepage':
                    ipc_send('url', `https://www.douyin.com/user/` + uid)
                    break;
                case 'user_update':
                    self.account_checkNew(uid);
                    break;

                case 'user_makeReaded':
                    self.list[uid].list = {};
                    self.save();
                    break;

                case 'user_delete':
                    let d = self.list[uid];
                    showModal({
                            title: `确定删除用户 : ${d.user.name} 吗?`,
                            msg: '删除用户',
                        })
                        .then(() => {
                            self.remove(uid);
                        })
                    break;
            }
            g_menu.hideMenu('user_item');
        })



        registerAction(['user_updateAll', 'user_add', 'user_uploadAll'], (dom, action) => {
            $('#user_actions').modal('close');
            switch (action[0]) {
                case 'user_uploadAll':
                    let r = { type: 'add', list: {} };
                    for (let [id, d] of Object.entries(self.list)) {
                        r.list[id] = {
                            user: d.user,
                        }
                    }
                    $.ajax({
                            url: g_api + 'douyin.php',
                            type: 'POST',
                            dataType: 'json',
                            data: { data: JSON.stringify(r) },
                        })
                        .done(function(data) {
                            toast('上传成功', 'success');
                        })
                        .fail(function() {
                            toast('上传失败', 'danger');
                        })
                    break;
                case 'user_updateAll':
                    self.account_checkNew();
                    break;

                case 'user_add':
                    $('#user-actions').modal('close');
                    showModal({
                        type: 'prompt',
                        title: '添加检测账号',
                        textarea: true,
                    }).then(url => {
                        self.douyin_parseUser(url, d => {
                            self.add(d.sec_uid, {
                                desc: d.desc,
                                user: { // 用户信息
                                    icon: d.icon,
                                    name: d.name,
                                }
                            });
                            toast('添加成功', 'success');
                        })
                    })
                    break;
            }
        });
        this.list = local_readJson('douyin', {
            // 'MS4wLjABAAAA0wudxop_wywKVRpwEMRZNqURMX-twXQK3LyBULMESYU': {
            //     lastUpdateTime: 0, // 最后检测更新时间
            //     lastVideo: 0, // 最后发布的视频ID
            //     list: {}, // 未看列表
            //     group: '', // 分组
            //     desc: '这是介绍',
            //     user: { // 用户信息
            //         icon: 'https://p3-pc.douyinpic.com/origin/aweme-avatar/tos-cn-avt-0015_f137ea789a756260b24eb2742d023f48.jpeg',
            //         name: 'test',
            //     }
            // }
        });
        this.update();
    },

    user_list: function(list, public = false) {
        let exists = Object.keys(this.list);
        let h = '';
        for (let [id, d] of Object.entries(list)) {
            let e = exists.includes(id);
            h += `
              <li data-uid="${id}">
                 <img class="am-circle mx-auto mr-2" title="${d.user.name}" src="${d.user.icon}" width="40" height="40"/>
                    <b>${d.user.name}</b>

                <div class="float-end">
                    ${public ? `<i class="am-header-icon am-icon-close mr-2" data-action="user_public_remove"></i>` : ''}
                    <button class="am-btn  ${e ? '' : 'am-btn-danger'}" data-action="user_follow">${e ? '取消关注' : '关注'}</button>
                </div>
               </li>
            `
        }

        $('#user_list').html(`<ul class="am-list am-list-static am-list-border">${h}</ul>`);
    },

    add: function(key, vals) {
        this.set(key, Object.assign({
            lastUpdateTime: 0, // 最后检测更新时间
            lastVideo: 0, // 最后发布的视频ID
            list: {}, // 未看列表
            group: '', // 分组
            desc: ''

        }, vals));
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
        domSelector({ uid: key }, '.user_recent').remove();
        this.save();
    },

    save: function(save = true, update = true) {
        save && local_saveJson('douyin', this.list);
        update && this.update();
    },

    video_get: function(uid, vid) {
        return this.list[uid].list[vid];
    },

    update: function(ids) {
        if (!ids) ids = Object.keys(this.list);
        if (!Array.isArray(ids)) ids = [ids];
        for (let id of ids) {
            let d = this.list[id];
            if (!d) return;
            let r = '';
            let i = 0;
            for (let [vid, item] of Object.entries(d.list)) {
                if (!item.last) {
                    r += `
                    <li data-vid="${vid}" class="video_item" data-index=${i++}>
                      <img title="${item.desc}" class="am-thumbnail mx-auto" src="${item.cover}" data-action="video_play"  />
                      <div class="d-flex justify-content-around">
                        <a class="like"><i class="am-header-icon am-icon-heart-o mr-2"></i>${numToStr(item.like)}</a>
                        <a class="comment"><i class="am-header-icon am-icon-commenting-o mr-2"></i>${numToStr(item.comment)}</a>
                        <a class="share"><i class="am-header-icon am-icon-share mr-2"></i>${numToStr(item.share)}</a>
                      </div>
                    </li>
                  `
                }
            }
            let target = domSelector({ uid: id }, '.user_recent');
            if (i > 0) {
                let h = `
                 <div class="user_recent am-u-sm-12 " data-uid="${id}">
                     <img class="am-circle mx-auto mr-2" title="${d.user.name}" src="${d.user.icon}" width="40" height="40"/>
                    <b>${d.user.name}</b>
                    <span class="am-badge am-badge-danger me-2">${i}</span>

                    <button class="am-btn float-end" data-action="user_menu"><span class="am-icon-caret-down"></span></button>
                    <div id="video_list" class="mt-10">
                        <ul class="am-avg-sm-2 am-avg-md-4 am-avg-lg-6 am-thumbnails">
                            ${r}
                        </ul>
                    </div>
                  </div>
                `;
                if (!target.length) {
                    $('#update_main').append(h);
                } else {
                    target.replaceWith(h);
                }
            } else {
                target.remove();
            }
        }
    },

    data_resetDate: function() {
        for (let id in this.list) {
            let d = this.list[id];
            d.list = {};
            d.lastVideo = 0;
        }
        toast('成功重置', 'success')
        this.save();
    },

    // ui
    show: function() {

    },

    account_checkNew: function(ids) {
        if (ids === undefined) ids = Object.keys(this.list);
        if (!Array.isArray(ids)) ids = [ids];
        let i = 0;
        for (let id of ids) {
            let d = this.get(id);
            if (!d) continue;

            this.douyin_fetchVideos(id, data => {
                if (!data.aweme_list.length) return;
                for (let item of data.aweme_list) {
                    let vid = item.aweme_id;
                    // todo 更新播放地址

                    let obj;
                    if (Number(vid) > Number(d.lastVideo)) { // 没看过
                        // 没有发布时间数据，但id是递增的
                    } else
                    if (d.list[vid]) { // 更新数据
                        if (d.list[vid].last) { // 已经看过，直接删除
                            delete d.list[vid];
                            continue;
                        }
                    } else {
                        // 不是最新的且没看过 -> 直接跳过
                        continue;
                    }
                    d.list[vid] = {
                        comment: item.statistics.comment_count,
                        like: item.statistics.digg_count,
                        share: item.statistics.share_count,
                        desc: item.desc,
                        vid: item.video.vid,
                        duration: item.video.duration,
                        cover: item.video.cover.url_list[0],
                        dynamic_cover: item.video.dynamic_cover.url_list[0],
                        video: item.video.play_addr.url_list[2], // 第3,4链接不会过期
                        // video: 'http://127.0.0.1:8002/api/video?id=' + id,
                    }
                }

                d.lastVideo = data.aweme_list[0].aweme_id; // 最新ID
                d.lastUpdateTime = new Date().getTime();
                $.AMUI.progress.set(++i / ids.length);
                if (i == ids.length) {
                    this.save();
                    $.AMUI.progress.done();
                }
                this.update(id)
            });
        }
    },


    // api
    // https://www.52pojie.cn/thread-1266439-1-1.html
    douyin_fetchID: function(id, callback) {
        fetch(getURL('https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=' + id)).then(d => {
            d.json().then(function(data) {
                callback(data);
            })
        })
    },

    // 用户所有视频
    douyin_fetchVideos: function(id, callback) {
        fetch(getURL(`https://www.iesdouyin.com/web/api/v2/aweme/post/?sec_uid=${id}&count=10&max_cursor=0&aid=1128&_signature=HunHKQABfpAtN81GL5ujHx7pvd` + id)).then(d => {
            d.json().then(function(data) {
                callback(data);
            })
        })
    },

    douyin_fetchUser: function(id, callback) {
        fetch(getURL('https://www.iesdouyin.com/web/api/v2/user/info/?sec_uid=' + id)).then(d => {
            d.json().then(function(data) {
                var user = data.user_info;
                callback({
                    sec_uid: user.sec_uid,
                    icon: user.avatar_thumb.url_list[0],
                    videos: user.aweme_count,
                    followers: user.follower_count,
                    following: user.following_count,
                    name: user.nickname,
                    desc: user.signature,
                    like: user.total_favorited,
                })
            })
        })
    },
    douyin_parseUser: function(url, callback) {
        var err = () => toast('解析失败,请检查链接是否正确', 'danger');
        var check = url => {
            var id = cutString(url + '?', '/user/', '?');
            if (id == '') return err();
            g_douyin.douyin_fetchUser(id, callback);
        }

        if (url.indexOf('v.douyin.com') == -1) {
            check(url);
        } else {
            const fun = d => {
                if (d.status == 200 && d.redirected) {
                    check(d.url);
                } else {
                    err();
                }
            }
            if (typeof($autojs) != 'undefined') {
                $autojs.invoke('http', {
                    opts: {
                        url: url
                    },
                    type: 'redirect'
                }).then(d => fun(d)).catch(err => alert(err.toString()));
            } else {
                fetch(getURL(url)).then(d => fun(d))
            }
        }
    },
    douyin_parseUrl: function(url, callback) {
        // "https://www.douyin.com/video/6869223088110849293?previous_page=app_code_link"
        var err = () => toast('解析失败,请检查链接是否正确', 'danger');
        if (url.indexOf('v.douyin.com') == -1) {
            var id = cutString(url + '?', 'douyin.com/video/', '?');
            if (id == '') {
                return err();
            }
            g_douyin.douyin_fetchID(id, callback);
        } else {
            fetch(getURL(url)).then(d => {
                if (d.status == 200 && d.redirected) {
                    g_douyin.douyin_parseUrl(d.url, callback);
                } else {
                    err();
                }
            })
        }
    },


}

g_douyin.init();