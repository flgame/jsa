declare module JSA {
    class JSAAnimation extends egret.MovieClip {
        constructor(pack:any);
    }
    class JSAContainer extends egret.DisplayObjectContainer {
        addAnimation(animation:JSAAnimation, sync?:boolean):JSAAnimation;
        removeAnimation(animation:JSAAnimation, dataOnly:boolean):JSAAnimation;
        removeAnimations(dataOnly:boolean):void;
    }
}