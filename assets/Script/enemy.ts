// 敌人
const {ccclass, property} = cc._decorator;
import SpriteFrameAni from './SpriteFrameAni';

@ccclass
export default class Enemy extends cc.Component {

    @property(cc.Node)
    columnNode = null;

    @property(cc.Node)
    column: cc.Node = null;

    @property(cc.Node)
    enemyGunImg = null;

    @property(cc.Node)
    enemyBulletImg = null;

    @property(cc.Node)
    enemyHeroImg = null;

    @property(cc.ParticleSystem)
    enemyDieParticle: cc.ParticleSystem = null;

    // LIFE-CYCLE CALLBACKS:
    winSize: cc.Size;
    callBack: () => {};
    hitHeroCallback: () => {};

    onLoad () {
        // 初始化状态
        this.winSize = cc.winSize;
        this.enemyHeroImg.active = false;
        this.enemyGunImg.active = false;
        console.log(this.enemyDieParticle);
    }

    // 敌人运动
    enemyAni() {
        let ani:SpriteFrameAni = this.enemyHeroImg.getComponent("SpriteFrameAni");
        ani.playAni("enemy", 3, 0.1, true);
    }

    // 设置敌人柱子高度
    setColumnHeight() {
        // 随机获取高度
        let y = Math.floor(Math.random() * -250) - 100;
        this.column.setPosition(cc.v2(this.winSize.width/2 + 100, y));
    }

    // 敌人进场动作
    comeOnAni () {
        this.setColumnHeight();
        let w = Math.floor(Math.random() * (this.winSize.width / 4));
        console.log("enemy come");
        this.column.runAction(cc.sequence(cc.moveTo(1.0, cc.v2(w, this.column.position.y)), cc.callFunc(() =>{ 
            this.enemyHeroImg.active = true;
            this.enemyGunImg.active = true;
            this.enemyAni();
        }, this)));
    }

    // 敌人柱子移动
    enemyMove() {
        this.enemyHeroImg.active = false;
        this.enemyGunImg.active = false;

        this.column.runAction(cc.sequence(cc.moveTo(1.0, cc.v2(-this.winSize.width / 2 - 100, this.column.position.y)), cc.callFunc(() => {
            if (this.callBack) this.callBack();
        })));
    }

    //运动完成的回调
    finishCallBack (callBack){
        this.callBack = callBack;
    }

    // 敌人英雄死亡动画
    enemyDie() {
        this.enemyDieParticle.node.active = true;
        this.enemyDieParticle.stopSystem();
        this.enemyDieParticle.resetSystem();

        // 隐藏敌方英雄
        this.enemyGunImg.active = false;
        this.enemyHeroImg.active = false;
    }

    // TODO: ======================== 敌人射击相关 =================================
    // 获取敌方子弹的世界坐标
    enemyBulletWorldPos() {
        let pos = this.column.convertToWorldSpaceAR(cc.v2(this.enemyGunImg.position));
        return pos;
    }

    // 设置炮的角度
    setGunAngle(angle) {
        this.enemyGunImg.angle = angle;
    }

    // 炮运动
    gunAni(len) {
        let bulletPos = this.enemyBulletImg.position;
        this.enemyBulletImg.runAction(cc.sequence(cc.moveTo(0.3, cc.v2(len, 0)), cc.callFunc(() => {
            if(this.hitHeroCallback) {
                this.hitHeroCallback();
            }
            // 还原子弹位置
            this.enemyBulletImg.position = bulletPos;
        })));
    }

    // 运动完成回调
    hitHeroCallBack (callBack) {
        this.hitHeroCallback = callBack;
    }

    start () {

    }

    // update (dt) {}
}
