const {ccclass, property} = cc._decorator;

@ccclass
export default class Start extends cc.Component {

    @property([cc.Button])
    heroBtns = [];

    // 播放音效
    playSound(name: string, isLoop: boolean) {
        cc.loader.loadRes(name, cc.AudioClip, function(err, clip) {
            if (err) return
            cc.audioEngine.playEffect(clip, isLoop);
        });
    }

    // 选择英雄按钮点击
    selectHeroBtnClick(event, customEventData) {
        this.playSound("sound/select", false);
        let tag = parseInt(customEventData);
        // 更新选择按钮状态
        for(let i = 0;i < this.heroBtns.length; i++) {
            let btn:cc.Button = this.heroBtns[i];
            if (i != tag) {
                btn.interactable = true;
            } else {
                btn.interactable = false;
                // 保存当前选择英雄
                cc.sys.localStorage.setItem("heroType", tag);
            }
        }
    }

    // 开始按钮点击
    startBtnClick() {
        this.playSound("sound/click", false);
        // 跳转下个页面
        cc.director.preloadScene("play", function() {
            cc.director.loadScene("play");
        });
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // 设置当前选择的英雄
        let tag = parseInt(cc.sys.localStorage.getItem("heroType") || 0);
        for (let i = 0; i < this.heroBtns.length; i++) {
            let btn:cc.Button = this.heroBtns[i];
            if (i != tag) {
                btn.interactable = true;
            } else {
                // 当前选择的英雄不能再响应事件
                btn.interactable = false;
            }
            
        }
    }

    start () {

    }

    // update (dt) {}
}
