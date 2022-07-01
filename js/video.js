const g_video = {
    video_get: function(vid) {
        return this.data[vid]
    },
    init: function() {
        const self = this;

        registerAction('video_copyLink', () => {
            ipc_send('copy', 'https://www.douyin.com/video/' + g_cache.preview.vid)
            hideModal();
        });

        registerAction('video_download', () => {
            ipc_send('download', {
                url: g_cache.preview.video.video,
                path: 'sdcard/download/' + '[' + g_cache.preview.vid + ']' + g_cache.preview.video.desc + '.mp4',
            })
            hideModal();
        });

        registerAction('video_play', dom => {
            dom = $(dom)

            let h = ``;
            let par = dom.parents('.video_item');
            let vid = par.data('vid');
            let uid = dom.parents('[data-uid]').data('uid');


            for (let item of par.parents().find('.video_item')) {
                let vid = item.dataset.vid;
                let d = g_douyin.video_get(uid, vid);
                if (d) {
                    // onclick="if(this.paused){this.play()}else{this.pause()}"
                    h += `
                    <li data-vid="${vid}" data-uid="${uid}" class="slider_video_item h-full position-relative">
                        <span>${d.desc}</span>
                        <video onmousewheel="g_video.event_wheel(event)"  class="w-full h-full" data-src="${d.video || ''}" poster="${d.dynamic_cover}" autoplay loop>
                    </li>`;
                }

            }

            $('#detail_content').html(`
                <div id="slider_videos" class="am-slider am-slider-default am-slider-carousel" style="height: calc(100vh - 70px);">
                <ul class="am-slides h-full">
                   ${h}
                </ul>
            </div>
            `);

            const startPlay = div => {
                for (let v of $('video')) v.pause();

                let video = div.find('video')[0];
                let vid = div.data('vid');
                let uid = div.data('uid');

                let d = g_douyin.video_get(uid, vid);
                g_cache.preview = {
                    vid: vid,
                    video: d
                }

                d.last = new Date().getTime();
                g_douyin.save(true, false);

                domSelector('coll_list').html(g_coll.get_folder(vid));

                video.src = video.dataset.src;
                video.play();
                video.onloadedmetadata = function(e) {
                    this.controls = true;
                }
                video.oncanplay = function(e) {
                    this.play();
                }
            }

            let start = parseInt(par.data('index'));
            $('#slider_videos').flexslider({
                slideshow: false,
                video: true,
                direction: "vertical",
                directionNav: false,
                startAt: start == 0 ? 1 : start - 1,
                // pauseOnAction: false, // 用户操作时停止自动播放
                slideshowSpeed: 0,
                start: function(slider) {
                    // startPlay(slider.find('.am-active-slide video')[0]);
                },
                before: function(slider) {
                    for (let video of $('video')) {
                        if (!video.paused) video.pause();
                    }
                },
                after: function(slider) {
                    startPlay(slider.find('.am-active-slide'));
                }
            });
            setTimeout(() => $('#slider_videos').flexslider(start), 100);
            g_ui.showTabs({
                title: g_coll.getHTML()
            });
        })
    },

    event_wheel: function(e) {
        let now = new Date().getTime();
         let i;
         console.log(e);
        if(now >= g_cache.lastWheel){
            if (e.wheelDelta) { //判断浏览器IE，谷歌滑轮事件
                i = e.wheelDelta;
            } else if (e.detail) { //Firefox滑轮事件
                i = e.detail
            } else if(e.detailY){
                i = e.detailY;
            }
            console.log(i);
            $('#slider_videos').flexslider(i > 0 ? 'prev' : 'next') 
            g_cache.lastWheel = now + 500;
        }
    },



}
g_video.init();