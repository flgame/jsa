//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-2015, Egret Technology Inc.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

class Main extends egret.DisplayObjectContainer {

    /**
     * 加载进度界面
     * Process interface loading
     */
    private loadingView:LoadingUI;

    public constructor() {
        super();
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }

    private onAddToStage(event:egret.Event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        var fps:number = this.stage.frameRate;
        JSA.FPS.on(fps);
        egret.startTick(JSA.FPS.frameHandler, this);
        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
    }

    private info:egret.Sprite;
    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    private onConfigComplete(event:RES.ResourceEvent):void {
        this.stage.removeChild(this.loadingView);
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        //RES.loadGroup("preload");

        this.container = new egret.DisplayObjectContainer();
        this.addChild(this.container);

        var stageW:number = this.stage.stageWidth;
        var stageH:number = this.stage.stageHeight;
        var colorLabel:egret.TextField = new egret.TextField();
        colorLabel.textColor = 0x0;
        colorLabel.textAlign = "center";
        colorLabel.text = "Hello Egret";
        colorLabel.size = 20;
        colorLabel.x = stageW - colorLabel.width >> 1;
        colorLabel.y = (stageH - colorLabel.height >> 1) + 50;
        this.addChild(colorLabel);

        this.info = new egret.Sprite();
        this.info.graphics.beginFill(0x0, 0.6);
        this.info.graphics.drawRect(0, 0, 140, 100);
        this.info.graphics.endFill();
        this.info.x = stageW - 140;
        this.addChild(this.info);

        var textfield:egret.TextField = new egret.TextField();
        this.info.addChild(textfield);
        textfield.textColor = 0xFF0000;
        textfield.width = 140;
        textfield.textAlign = egret.HorizontalAlign.CENTER;
        textfield.x = 0;
        textfield.y = 10;
        this.textfield = textfield;

        var subT:egret.TextField = new egret.TextField();
        this.info.addChild(subT);
        subT.textColor = 0xFF0000;
        subT.width = 60;
        subT.textAlign = egret.HorizontalAlign.CENTER;
        subT.x = 4;
        subT.y = 40;
        subT.touchEnabled = true;
        subT.text = "-_-"
        subT.addEventListener(egret.TouchEvent.TOUCH_TAP, this.subHandler, this);

        var addT:egret.TextField = new egret.TextField();
        this.info.addChild(addT);
        addT.textColor = 0xFF0000;
        addT.width = 60;
        addT.textAlign = egret.HorizontalAlign.CENTER;
        addT.x = 76;
        addT.y = 40;
        addT.touchEnabled = true;
        addT.text = "+_+";
        addT.addEventListener(egret.TouchEvent.TOUCH_TAP, this.addHandler, this);

        this.stage.addEventListener(egret.TouchEvent.TOUCH_TAP, this.tapHandler, this);

        RES.loadGroup("role");
        RES.loadGroup("weapon");
    }

    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    private onResourceLoadComplete(event:RES.ResourceEvent):void {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            this.createGameScene();
        } else if(event.groupName == "role") {
            this.createRole();
        } else if(event.groupName == "weapon") {
            this.createWeapon();
        }
    }

    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onResourceLoadError(event:RES.ResourceEvent):void {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    }

    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    private onResourceProgress(event:RES.ResourceEvent):void {
        if (event.groupName == "preload" || event.groupName == "role") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    }

    private container:egret.DisplayObjectContainer;
    private jsaContainers:JSA.JSAContainer[] = [];
    private subHandler(e:egret.TouchEvent):void {
        if(this.jsaContainers.length > 0) {
            this.container.removeChild(this.jsaContainers.pop());
            this.textfield.text = String(this.jsaContainers.length);
        }
    }
    private addHandler(e:egret.TouchEvent):void {
        var stageW:number = this.stage.stageWidth;
        var stageH:number = this.stage.stageHeight;
        var jsaContainer:JSA.JSAContainer = new JSA.JSAContainer();
        jsaContainer.x = Math.random() * stageW - 512 / 2;
        jsaContainer.y = Math.random() * stageH - 512 / 2;
        this.updateActions(jsaContainer);
        this.jsaContainers.push(jsaContainer);
        this.container.addChild(jsaContainer);
        this.textfield.text = String(this.jsaContainers.length);
    }
    //private jsaContainer:JSA.JSAContainer;
    //private action:string;
    private jsas:Object = {};
    private tapHandler(e?:egret.TouchEvent):void {
        if(e && e.target != this.stage) return;
        var n:number = this.jsaContainers.length;
        while(n > 0) {
            n--;
            this.updateActions(this.jsaContainers[n]);
        }
    }
    private updateActions(jsaContainer:JSA.JSAContainer):void {
        var jsa:JSA.JSA;
        for(var name in this.jsas) {
            jsa = this.jsas[name];
            break;
        }
        if(jsa) {
            var pack:JSA.JSAPack = jsa.pack;
            var i:number = Math.round(Math.random() * (pack.items.length - 1));
            pack = pack.items[i];
            i = Math.round(Math.random() * (pack.items.length - 1));
            pack = pack.items[i];
            this.updateAction(pack.path, jsaContainer);
        }
    }
    private updateAction(act:string, jsaContainer:JSA.JSAContainer, force?:boolean):void {
        if(!act) act = "run/45";
        //if(this.action == act && !force) return;
        //this.action = act;
        //this.textfield.text = this.action;
        jsaContainer.removeChildren();
        for(var name in this.jsas) {
            var jsa:JSA.JSA = this.jsas[name];
            var jsaAnimation:JSA.JSAAnimation = new JSA.JSAAnimation(jsa.getPackItem(act));
            jsaContainer.addAnimation(jsaAnimation, true);
        }
    }
    private createRole():void {
        var jsa:JSA.JSA = new JSA.JSA(RES.getRes("roleJson"), new egret.SpriteSheet(RES.getRes("rolePng")));
        this.jsas["role"] = jsa;
        this.tapHandler();
    }
    private createWeapon():void {
        var jsa:JSA.JSA = new JSA.JSA(RES.getRes("weaponJson"), new egret.SpriteSheet(RES.getRes("weaponPng")));
        this.jsas["weapon"] = jsa;
        this.tapHandler();
    }

    private textfield:egret.TextField;

    /**
     * 创建游戏场景
     * Create a game scene
     */
    private createGameScene():void {
        var sky:egret.Bitmap = this.createBitmapByName("bgImage");
        this.addChild(sky);
        var stageW:number = this.stage.stageWidth;
        var stageH:number = this.stage.stageHeight;
        sky.width = stageW;
        sky.height = stageH;

        var topMask:egret.Shape = new egret.Shape();
        topMask.graphics.beginFill(0x000000, 0.5);
        topMask.graphics.drawRect(0, 0, stageW, stageH);
        topMask.graphics.endFill();
        topMask.width = stageW;
        topMask.height = stageH;
        this.addChild(topMask);

        var icon:egret.Bitmap = this.createBitmapByName("egretIcon");
        this.addChild(icon);
        icon.scaleX = 0.55;
        icon.scaleY = 0.55;
        icon.anchorOffsetX = icon.width / 2;
        icon.anchorOffsetY = icon.height / 2;
        icon.x = stageW / 2;
        icon.y = stageH / 2 - 60;

        var colorLabel:egret.TextField = new egret.TextField();
        colorLabel.textColor = 0xffffff;
        colorLabel.textAlign = "center";
        colorLabel.text = "Hello Egret";
        colorLabel.size = 20;
        colorLabel.x = stageW - colorLabel.width >> 1;
        colorLabel.y = (stageH - colorLabel.height >> 1) + 50;
        this.addChild(colorLabel);

        var textfield:egret.TextField = new egret.TextField();
        this.addChild(textfield);
        textfield.alpha = 0;
        textfield.width = stageW;
        textfield.textAlign = egret.HorizontalAlign.CENTER;
        textfield.x = 0;
        textfield.y = stageH / 2 + 100;
        this.textfield = textfield;

        //根据name关键字，异步获取一个json配置文件，name属性请参考resources/resource.json配置文件的内容。
        // Get asynchronously a json configuration file according to name keyword. As for the property of name please refer to the configuration file of resources/resource.json.
        RES.getResAsync("description", this.startAnimation, this)
    }

    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    private createBitmapByName(name:string):egret.Bitmap {
        var result:egret.Bitmap = new egret.Bitmap();
        var texture:egret.Texture = RES.getRes(name);
        result.texture = texture;
        return result;
    }

    /**
     * 描述文件加载成功，开始播放动画
     * Description file loading is successful, start to play the animation
     */
    private startAnimation(result:Array<any>):void {
        var self:any = this;

        var parser:egret.HtmlTextParser = new egret.HtmlTextParser();
        var textflowArr:Array<Array<egret.ITextElement>> = [];
        for (var i:number = 0; i < result.length; i++) {
            textflowArr.push(parser.parser(result[i]));
        }

        var textfield:egret.TextField = self.textfield;
        var count:number = -1;
        var change:Function = function () {
            count++;
            if (count >= textflowArr.length) {
                count = 0;
            }
            var lineArr = textflowArr[count];

            self.changeDescription(textfield, lineArr);

            var tw = egret.Tween.get(textfield);
            tw.to({"alpha": 1}, 200);
            tw.wait(2000);
            tw.to({"alpha": 0}, 200);
            tw.call(change, self);
        };

        change();
    }

    /**
     * 切换描述内容
     * Switch to described content
     */
    private changeDescription(textfield:egret.TextField, textFlow:Array<egret.ITextElement>):void {
        textfield.textFlow = textFlow;
    }
}


