
// 碰撞监听脚本
const {ccclass, property} = cc._decorator;

@ccclass
export default class Contact extends cc.Component {

    callBack: (selfCollider: cc.Collider, otherCollider: cc.Collider) => void;

    onBeginContact(contact, selfCollider: cc.Collider, otherCollider: cc.Collider) {
        if (selfCollider.tag == 0 && otherCollider.tag == 0) {
            this.contactFunction(selfCollider, otherCollider);
        }
    }

    onEndContact(contact, selfCollider: cc.Collider, otherCollider: cc.Collider) {
        // 结束碰撞
    }

    onPreSolve(contact, selfCollider, otherCollider){
        //cc.log("onPreSolve...");//碰撞持续,接触时被调用
    }

　　onPostSolve (contact, selfCollider, otherCollider){
        //cc.log("onPostSolve...");//碰撞接触更新完后调用,可以获得冲量信息
    }

    //碰撞监听
    contactFunction (selfCollider, otherCollider){
        if(this.callBack){
            this.callBack(selfCollider, otherCollider);
        }
    }
    
    // 设置碰撞回调
    contactCallBack (callBack: (selfCollider: cc.Collider, otherCollider: cc.Collider) => void){
        this.callBack = callBack;
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
