// 设置动画
const {ccclass, property} = cc._decorator;

@ccclass
export default class SpriteFrameAni extends cc.Component {

    @property(cc.SpriteAtlas)
    bigImg: cc.SpriteAtlas = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {}

    // 执行动画
    playAni(nameStr, count, dt, isLoop) {
        this.stopAni();
        this.node.getComponent(cc.Sprite).spriteFrame = this.bigImg.getSpriteFrame(nameStr + 0);
        let array = [];
        // 创建数组，往数组中批量添加动画事件
        for (let i = 0; i < count; i++) {
            // 创建动画延迟时间
            array.push(cc.delayTime(dt));
            array.push(cc.callFunc(() => {
                this.node.getComponent(cc.Sprite).spriteFrame = this.bigImg.getSpriteFrame(nameStr + i);
            }))
        }

        // 判断是否循环执行动画
        if (isLoop) {
            this.node.runAction(cc.repeatForever(cc.sequence(array)));
        } else {
            this.node.runAction(cc.sequence(array));
        }
    }

    // 停止动画
    stopAni() {
        this.node.stopAllActions();
    }

    start () {

    }

    // update (dt) {}
}
