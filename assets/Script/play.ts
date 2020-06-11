const {ccclass, property} = cc._decorator;
import Utils from './utils';
import SpriteFrameAni from './SpriteFrameAni';
import Enemy from './enemy';
import Contact from './contact';


@ccclass
export default class Play extends cc.Component {
    // 布局相关
    // 背景图片
    @property(cc.Node)
    bgImg = null;

    // 太阳图片
    @property(cc.Node)
    sunImg = null;

    // 月亮图片
    @property(cc.Node)
    moonImg = null;

    @property(cc.Node)
    floorParent = null;

    @property(cc.Node)
    farHouseImg0 = null;

    @property(cc.Node)
    farHouseImg1 = null;

    @property(cc.Node)
    nearHouseImg0 = null;

    @property(cc.Node)
    nearHouseImg1 = null;

    @property(cc.Node)
    farFloorImg0 = null;

    @property(cc.Node)
    farFloorImg1 = null;

    @property(cc.Node)
    nearFloorImg0 = null;

    @property(cc.Node)
    nearFloorImg1 = null;

    // 分数记录
    @property(cc.Label)
    scoreText:cc.Label = null;

    // 我方英雄组件
    @property(cc.Node)
    heroNode = null;

    @property(cc.Node)
    shootLineImg = null; // 射击瞄准图片

    @property(cc.Node)
    myBulletImg = null; // 子弹图片

    @property(cc.Node)
    myHeroImg = null; // 英雄图片

    @property(cc.Node)
    myGunImg: cc.Node = null; // 武器图片

    @property(cc.Node)
    shieldImg = null; // 防护罩图片

    @property(cc.ProgressBar)
    bloodBar = null; // 血量

    @property(cc.ParticleSystem)
    heroDieParticle: cc.ParticleSystem = null; // 死亡粒子特效


    @property([cc.Prefab])
    myBulletPrefab = []; // 子弹预制图

    @property(cc.Prefab)
    enemyPrefab = null; // 敌人预制图

    // 结束菜单
    @property(cc.Node)
    endLayer:cc.Node = null;

    @property(cc.Label)
    bestScoreText:cc.Label = null;

    @property(cc.Label)
    allScoreText:cc.Label = null;


    // LIFE-CYCLE CALLBACKS:
    winSize: cc.Size;
    canShooting: boolean;  //是否能射击
    canContact: boolean; //是否检测碰撞
    curScore: number; //当前得分
    heroBloodValue: number; //当前血量值

    randStyle: number; // 随机样式
    heroType: number; // 角色类型

    enemyNode: Enemy; // 敌人节点

    curAngle: number; // 子弹轨道的角度

    gunSchedule: () => void; // 射击角度函数
    isLineUp: boolean;
    bulletNode: cc.Node; // 生成子弹刚体

    bulletFun: () => void;// 子弹监听函数

    onLoad () {
        this.winSize = cc.winSize;
        this.canShooting = true;  //是否能射击
        this.canContact = true;   //是否检测碰撞
        this.curScore = 0;  //当前得分
        this.heroBloodValue = 100;  //当前血量值
        this.isLineUp = true; // 瞄准射线向上移动

        //打开物理系统
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().debugDrawFlags = 0;
            // cc.PhysicsManager.DrawBits.e_jointBit |
            // cc.PhysicsManager.DrawBits.e_shapeBit;
 
        // 重力加速度的配置
        cc.director.getPhysicsManager().gravity = cc.v2(0, -640);

        //随机获取一种类型
        this.randStyle = Math.floor(Math.random() * 100) % 3; 
        cc.sys.localStorage.setItem("gunHeroBgStyle", this.randStyle);

        // 角色类型
        this.heroType = parseInt(cc.sys.localStorage.getItem("heroType")) || 0;

        // 修改辅助线纹理
        Utils.setImgTexture("image/line" + this.heroType, this.shootLineImg);
        
        // 修改大炮纹理
        Utils.setImgTexture("image/gun" + this.heroType, this.myGunImg);
 
        // 游戏背景
        Utils.setImgTexture("background/bgImg" + this.randStyle, this.bgImg);

        // 太阳图片  
        if(this.randStyle == 2){
            this.sunImg.active = false;
            this.moonImg.active = true;
        }
        else{
            this.moonImg.active = false;
            this.sunImg.active = true;
            Utils.setImgTexture("image/sun" + this.randStyle, this.sunImg);
        }
 
        // 远处房子
        Utils.setImgTexture("image/house" + this.randStyle, this.farHouseImg0);
        Utils.setImgTexture("image/house" + this.randStyle, this.farHouseImg1);
 
        // 近处房子
        Utils.setImgTexture("image/houshSmall" + this.randStyle, this.nearHouseImg0);
        Utils.setImgTexture("image/houshSmall" + this.randStyle, this.nearHouseImg1);
 
        // 远处地面
        Utils.setImgTexture("image/floor" + this.randStyle, this.farFloorImg0);
        Utils.setImgTexture("image/floor" + this.randStyle, this.farFloorImg1);
 
        // 近处地面
        Utils.setImgTexture("image/gameFloor" + this.randStyle, this.nearFloorImg0);
        Utils.setImgTexture("image/gameFloor" + this.randStyle, this.nearFloorImg1);
        this.nearFloorImg0.zIndex = 5;
        this.nearFloorImg1.zIndex = 5;
 
        // 得分
        this.scoreText.string = "0";

        // 云动画
        this.yunAnimation();

        // TODO: ====================== 英雄相关 ===================================
        // 英雄身上的护盾动画
        let ani: SpriteFrameAni = this.shieldImg.getComponent("SpriteFrameAni")
        ani.playAni("shield", 4, 0.1, true);

        // 英雄动画
        this.myHeroAni(false);

        // TODO: ===================== 敌人相关 ====================================
        // 创建敌人
        this.createEnemy();

        // TODO: ===================== 添加动作监听 ================================
        this.node.on(cc.Node.EventType.TOUCH_START, this.onEventStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onEventMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onEventEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onEventCancel, this);
        

    }

    // TODO: =========================== 创建相关 =========================================
    // 创建敌人
    createEnemy() {
        let node: cc.Node = cc.instantiate(this.enemyPrefab);
        node.setPosition(cc.v2(0, -110));
        node.parent = this.floorParent;
        this.enemyNode = node.getComponent("enemy");
        this.enemyNode.comeOnAni();
        // 敌人更新完回调
        this.enemyNode.finishCallBack(() => {
            // 可检测碰撞
            this.canContact = true;
            // 设置为可发炮
            this.canShooting = true;
            node.removeFromParent();
            node = null;
            // 重新创建敌人
            this.createEnemy();
        })
        // 敌人射击完回调
        this.enemyNode.hitHeroCallBack(() => {
            this.heroBloodValue = this.heroBloodValue - 25;
            if (this.heroBloodValue <= 0) {
                Utils.playSound("sound/heroDie", false);
                this.heroBloodValue = 0;
                this.myHeroDie();
                // 游戏结束
                this.gameOver();
                
            } else {
                Utils.playSound("sound/enemyDie", false);
                this.setBloodValue();
                // 还原炮的角度
                this.myGunImg.angle = 0;

                // 设置允许开炮
                this.canShooting = true;
                this.canContact = true;
            }
        });
    }

    setBloodValue() {
        // 设置盾牌透明度
        let p = this.heroBloodValue / 100;
        this.shieldImg.opacity = Math.floor(p * 255);
        // 设置血量进度
        this.bloodBar.progress = p;
    }

    // 游戏结束
    gameOver() {
        this.node.runAction(cc.sequence(cc.delayTime(1.0), cc.callFunc(() => {
            // 显示结束界面
            this.endLayer.active = true;
            // 显示最高得分
            let bestScore = parseInt(cc.sys.localStorage.getItem("gunBestScore")) || 0;
            if (this.curScore > bestScore) {
                this.bestScoreText.string = this.curScore + "";
                cc.sys.localStorage.setItem("gunBestScore", this.curScore);
            } else {
                this.bestScoreText.string = bestScore + "";
            }
            // 显示当前分数
            this.allScoreText.string = this.curScore + "";

        })))
    }

    // TODO: =========================== 动画相关 =========================================

    // 云动画
    yunAnimation() {
        let curWidth = -this.winSize.width/2;
        // 在地图范围内生成云
        while(curWidth < this.winSize.width/2) {
            // 随机一个类型
            let t = Math.floor(Math.random() * 100) % 3; // 3种类型的云
            // 随机一个高度值
            let h = Math.random() * (this.winSize.height * 1 / 6) + this.winSize.height * 1 / 4;
            curWidth = curWidth + Math.random() * 150 + 150;

            let yunNode = new cc.Node();
            let yunSp = yunNode.addComponent(cc.Sprite);
            // 添加到背景图层中
            yunNode.parent = this.floorParent;
            yunNode.setPosition(cc.v2(curWidth, h));
            Utils.setImgTexture("image/yun" + this.randStyle + "_" + t, yunSp);
            // 给云添加动作
            yunNode.runAction(cc.repeatForever(cc.sequence(cc.moveBy(1.0, cc.v2(-20, 0)), cc.callFunc(() => {
                if (yunNode.position.x < - this.winSize.width / 2 - 100) {
                    // 云超出范围，重定位到开头
                    yunNode.setPosition(cc.v2(this.winSize.width/2 + 100, yunNode.position.y));
                }
            }))));

        }
    }

    // 我方英雄运动
    myHeroAni(isRun: boolean) {
        let ani: SpriteFrameAni;
        ani = this.myHeroImg.getComponent("SpriteFrameAni");
        if (isRun) {
            ani.playAni("heroRun" + this.heroType + "_", 5, 0.06, true);
        } else {
            ani.playAni("heroWait" + this.heroType + "_", 3, 0.1, true);
        }
    }

    myHeroScaleAni() {
        this.heroNode.runAction(cc.sequence(cc.scaleTo(1.0, 1.1), cc.scaleTo(1.0, 1.0)));
    }

    // 我方英雄死亡动画
    myHeroDie() {
        this.heroDieParticle.node.active = true;
        this.heroDieParticle.stopSystem();
        this.heroDieParticle.resetSystem();
        // 隐藏我方英雄
        this.heroNode.active = false;
    }

    // 背景运动
    gameByAni() {
        // 远处房子
        let fw = this.farHouseImg0.width;
        this.farHouseImg0.runAction(cc.sequence(cc.moveBy(2.0, cc.v2(-200, 0)), cc.delayTime(0.1), cc.callFunc(() =>{
            if(this.farHouseImg0.position.x <= -fw - this.winSize.width / 2){
                this.farHouseImg0.position = cc.v2(this.farHouseImg1.position.x + fw, this.farHouseImg0.position.y);
            }
            this.myHeroAni(false);
        })));
        this.farHouseImg1.runAction(cc.sequence(cc.moveBy(2.0, cc.v2(-200, 0)), cc.delayTime(0.1), cc.callFunc(() =>{
            if(this.farHouseImg1.position.x <= -fw - this.winSize.width / 2){
                this.farHouseImg1.position = cc.v2(this.farHouseImg0.position.x + fw, this.farHouseImg1.position.y);
            }
        })));

        //近处房子
        let nw = this.nearHouseImg0.width;
        this.nearHouseImg0.runAction(cc.sequence(cc.moveBy(2.0, cc.v2(-300, 0)), cc.delayTime(0.1), cc.callFunc(() =>{
            if(this.nearHouseImg0.position.x <= -nw - this.winSize.width / 2){
                this.nearHouseImg0.position = cc.v2(this.nearHouseImg1.position.x + nw, this.nearHouseImg0.position.y);
            }
        })));
        this.nearHouseImg1.runAction(cc.sequence(cc.moveBy(2.0, cc.v2(-300, 0)), cc.delayTime(0.1), cc.callFunc(() =>{
            if(this.nearHouseImg1.position.x <= -nw - this.winSize.width / 2){
                this.nearHouseImg1.position = cc.v2(this.nearHouseImg0.position.x + nw, this.nearHouseImg1.position.y);
            }
        })));

        //远处地面
        let ffw = this.farFloorImg0.width;
        this.farFloorImg0.runAction(cc.sequence(cc.moveBy(2.0, cc.v2(-400, 0)), cc.delayTime(0.1), cc.callFunc(() =>{
            if(this.farFloorImg0.position.x <= -ffw - this.winSize.width / 2){
                this.farFloorImg0.position = cc.v2(this.farFloorImg1.position.x + ffw, this.farFloorImg0.position.y);
            }
        })));
        this.farFloorImg1.runAction(cc.sequence(cc.moveBy(2.0, cc.v2(-400, 0)), cc.delayTime(0.1), cc.callFunc(() =>{
            if(this.farFloorImg1.position.x <= -ffw - this.winSize.width / 2){
                this.farFloorImg1.position = cc.v2(this.farFloorImg0.position.x + ffw, this.farFloorImg1.position.y);
            }
        })));

        //近处地面
        let nfw = this.nearFloorImg0.width;
        for(let i = 0; i < 100; i++){
            this.nearFloorImg0.runAction(cc.sequence(cc.delayTime(0.02 * i), cc.callFunc(() =>{
                if(i % 9 == 0){
                    Utils.playSound("sound/walk", false);
                }
                let pX1 = this.nearFloorImg0.position.x - 4;
                this.nearFloorImg0.position =  cc.v2(pX1, this.nearFloorImg0.position.y);

                let pX2 = this.nearFloorImg1.position.x - 4;
                this.nearFloorImg1.position = cc.v2(pX2, this.nearFloorImg1.position.y);

                if(pX1 <= -nfw - this.winSize.width / 2){
                    this.nearFloorImg0.position = cc.v2(this.nearFloorImg1.position.x + nfw, this.nearFloorImg0.position.y);
                }
                if(pX2 <= -nfw - this.winSize.width / 2){
                    this.nearFloorImg1.position = cc.v2(this.nearFloorImg0.position.x + nfw, this.nearFloorImg1.position.y);
                }
            })));
        }

    }


    start () {

    }

    // update (dt) {}

    // TODO: ===================== 添加动作监听 ================================

    // 开始触摸屏幕
    onEventStart() {
        if (!this.canShooting) return;
        // 更新射击角度
        this.updateGunAngle();
    }

    
    // 更新射击角度
    updateGunAngle() {
        this.shootLineImg.active = true;
        this.curAngle = 0;
        this.gunSchedule = function() {
            if (this.isLineUp) {
                this.curAngle += 1;
                if (this.curAngle >= 90) this.isLineUp = false;
            } else {
                this.curAngle -= 1;
                if (this.curAngle <= 0) this.isLineUp = true;
            }
            this.myGunImg.angle = this.curAngle;
        }
        this.schedule(this.gunSchedule, 0.03);
    }
    // 停止更新炮管
    stopGunAngle() {
        this.unschedule(this.gunSchedule);
        this.shootLineImg.active = false;
    }

    // 移动
    onEventMove() {}

    // 触摸结束
    onEventEnd(event) {
        if (!this.canShooting) return;
        // 播放音效
        Utils.playSound("sound/heroBullet", false);
        this.canShooting = false;
        this.stopGunAngle();
        this.setBulletBody();

        let x = 5000;
        //2号子弹体积较大，需要更大的力
        if(this.heroType == 1) {
            x = 7000;
        }
        // 通过角速度计算力度
        // 角度换取弧度，通过弧度算出 y的大小
        let y = x * Math.tan(Math.abs(this.curAngle) * (Math.PI/180))
        // 给子弹设置冲量
        this.bulletNode.getComponent(cc.RigidBody).applyForceToCenter(cc.v2(x, y), false);

        let curPos = this.bulletNode.position;
        let lastPos = curPos;
        // 更新子弹角度变化
        this.bulletFun = function() {
            curPos = this.bulletNode.position;
            // 计算角度
            let lenX = curPos.x - lastPos.x;
            let lenY = 0;
            let r = 0;
            if (curPos.y < lastPos.y) {
                // 向上运动
                lenY = curPos.y - lastPos.y;
                // 弧度转角度
                r = Math.atan2(lenY, lenX) * 180 / Math.PI;
            } else {
                // 向下运动
                lenY = lastPos.y = curPos.y;
                r = -1 * Math.atan2(lenY, lenX) * 180 / Math.PI;
            }
            lastPos = curPos;
            this.bulletNode.angle = r;
        }
        this.schedule(this.bulletFun, 0.1);
    }

    // 给自己子弹绑定刚体
    setBulletBody() {
        this.bulletNode = cc.instantiate(this.myBulletPrefab[this.heroType]);
        this.bulletNode.parent = this.myGunImg;
        this.bulletNode.position = this.myBulletImg.position;

        // 设置碰撞回调
        let bulletSp: Contact = this.bulletNode.getComponent("contact");
        bulletSp.contactCallBack((selfCollider, otherCollider) => {
            if (!this.canContact) return

            Utils.playSound("sound/openFire", false);
            this.canContact = false;
            // 停止子弹监听
            this.unschedule(this.bulletFun);

            let bodyGroup0 = selfCollider.node.group;
            let bodyGroup1 = otherCollider.node.group;

            // 子弹打到地面
            if ((bodyGroup0 == 'heroBullet' && bodyGroup1 == 'floor')
            || (bodyGroup0 == 'floor' && bodyGroup1 == 'heroBullet')) {
                this.node.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(() => {
                    this.bulletNode.removeFromParent();
                    this.bulletNode = null;
                    // 轮到敌人开枪
                    this.enemyOpenFire(); 
                })))
            }

            // 子弹打到柱子
            if ((bodyGroup0 == 'heroBullet' && bodyGroup1 == 'column')
            || (bodyGroup0 == 'column' && bodyGroup1 == 'heroBullet')) {
                this.node.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(() => {
                    this.bulletNode.removeFromParent();
                    this.bulletNode = null;
                    // 轮到敌人开枪
                    this.enemyOpenFire(); 
                })))
            }

            // 子弹打到敌人
            if ((bodyGroup0 == 'heroBullet' && bodyGroup1 == 'enemy')
            || (bodyGroup0 == 'enemy' && bodyGroup1 == 'heroBullet')) {
                this.enemyNode.enemyDie();
                this.node.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(() => {
                    this.bulletNode.removeFromParent();
                    this.bulletNode = null;
                    this.updateScore(); // 更新分数
                    this.myHeroAni(true);
                    this.myHeroScaleAni();
                    this.gameByAni(); // 地图移动
                    this.enemyNode.enemyMove();
                })))
            }
        })
    }

    // 敌人开炮
    enemyOpenFire() {
        // 敌方子弹世界坐标
        let enemyBulletPos = this.enemyNode.enemyBulletWorldPos();
        // 我方英雄的世界坐标
        let myHeroPos = this.myHeroImg.parent.convertToWorldSpaceAR(cc.v2(this.myHeroImg.position.x, this.myHeroImg.position.y + 30));

        // 计算夹角
        let lenX = Math.abs(enemyBulletPos.x - myHeroPos.x);
        let lenY = Math.abs(enemyBulletPos.y - myHeroPos.y);
        let angle = Math.atan2(lenY, lenX) * 180 / Math.PI;

        // 设置敌方火炮角度
        this.enemyNode.setGunAngle(angle);

        // 计算炮运行距离
        let len = Math.sqrt(Math.pow(lenX, 2) + Math.pow(lenY, 2));
        this.enemyNode.gunAni(len);
        Utils.playSound("sound/enemyBullet", false);
    }

    // 更新分数
    updateScore() {
        this.curScore += 1;
        this.scoreText.string = this.curScore + "";
        Utils.playSound("sound/addScore", false);
    }

    // 取消
    onEventCancel(event) {
        this.onEventEnd(event);
    }

    // TODO: ================================ 按钮点击事件 ========================
    // 返回菜单
    exitCallBack() {
        Utils.playSound("sound/click", false);
        cc.director.preloadScene("start", function() {
            cc.director.loadScene("start");
        })
    }

    // 重新开始回调
    refreshCallback() {
        Utils.playSound("sound/click", false);
        cc.director.preloadScene("play", function() {
            cc.director.loadScene("play");
        })
    }
}
