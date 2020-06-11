// 工具类
export default class Utils {
    //更换纹理
    static setImgTexture(str: string,  node: cc.Node | cc.Sprite){
        cc.loader.loadRes(str, cc.SpriteFrame, function (err, spriteFrame) {
            if (err) {
                cc.error(err.message || err);
                return;
            }
            node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        }.bind(this));
    }

    //播放音效
    static playSound(name: string, isLoop: boolean){
        cc.loader.loadRes(name, cc.AudioClip, function (err, clip) {
            if(err){
                return;
            }
            var audioID = cc.audioEngine.playEffect(clip, isLoop);
        });
    }
}