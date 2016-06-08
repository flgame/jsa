/* global devel: true, console: true */
(function () {
    'use strict';
    if (typeof JSA.JSAAnimation !== 'undefined') {
        return;
    }
    var root = this;
    
    JSA.textureHandler = function(data) {
        var texture = data.texture;
        if(!texture) {
            texture = data.texture = {
                "frameData": {"res": data.pack.path, "x": data.offset[0], "y": data.offset[1]},
                "textureData": {"x": data.textureOffset[0], "y": data.textureOffset[1], "w": data.textureOffset[2], "h": data.textureOffset[3]}
            };
            
        }
        return texture;
    };
    
    /**
     * base on egret: http://www.egret.com
     */
    JSA.JSAAnimation = function (pack) {
        var i, item, texture, frames = [], mcData = {}, textureData = {};
        var movieClipData = new egret.MovieClipData();
        this.timeInfo = new JSA.FPS.TimeInfo(0, 0, 0);
        if (pack && pack.items) {
            for (i = 0; i < pack.items.length; i += 1) {
                item = pack.items[i];
                if (item.data && item.type == JSA.JSAType.FILE) {
                    if(JSA.isTexture(item.data.type)) {
                        texture = item.data.loadImage();
                        frames.push(texture["frameData"]);
                        textureData[item.path] = texture["textureData"];
                    } else {
                        //doesn't support
                    }
                }
            }
            if (pack.info && pack.info.fps) {
                this.timeInfo.interval = 1000 / pack.info.fps;
            }
            
            movieClipData.spriteSheet = pack.jsa.zip;
            movieClipData.textureData = textureData;
            mcData["frames"] = frames;
            movieClipData.mcData = mcData;
        }
        
        egret.MovieClip.call(this, movieClipData);
    };
    // constructor
    JSA.JSAAnimation.prototype = Object.create( egret.MovieClip.prototype );
    JSA.JSAAnimation.prototype.constructor = JSA.JSAAnimation;
    JSA.JSAAnimation.prototype.advanceTime = function (timeStamp) {
        var self = this;
        self.timeInfo.time = timeStamp;
        var count = 1;
        if(self.timeInfo.interval && self.timeInfo.preTime) {
            count = self.timeInfo.getIntervalCount();
        }
        if (count == 0) {
            return false;
        }
        while (count >= 1) {
            count--;
            self.$nextFrameNum++;
            if (self.$nextFrameNum > self.$totalFrames || (self.$frameLabelStart>0 && self.$nextFrameNum>self.$frameLabelEnd)) {
                if (self.playTimes == -1) {
                    self.$eventPool.push(egret.Event.LOOP_COMPLETE);
                    self.$nextFrameNum = 1;
                }
                else {
                    self.playTimes--;
                    if (self.playTimes > 0) {
                        self.$eventPool.push(egret.Event.LOOP_COMPLETE);
                        self.$nextFrameNum = 1;
                    }
                    else {
                        self.$nextFrameNum = self.$totalFrames;
                        self.$eventPool.push(egret.Event.COMPLETE);
                        self.stop();
                        break;
                    }
                }
            }
            if(self.$currentFrameNum == self.$frameLabelEnd){
                self.$nextFrameNum = self.$frameLabelStart;
            }
            self.advanceFrame();
        }
        self.constructFrame();
        self.handlePendingEvent();
        self.timeInfo.preTime = self.timeInfo.time;
        
        return false;
    };
    
    JSA.JSAContainer = function() {
        egret.DisplayObjectContainer.call(this);
        
        this.animations = [];
    };
    // constructor
    JSA.JSAContainer.prototype = Object.create( egret.DisplayObjectContainer.prototype );
    JSA.JSAContainer.prototype.constructor = JSA.JSAContainer;
    JSA.JSAContainer.prototype.addAnimation = function (animation, sync) {
        var i = this.animations.indexOf(animation);
        if (i < 0) {
            if (sync && this.animations.length > 0) {
                animation.gotoAndPlay(this.animations[0].currentFrame, -1);
            } else {
                animation.gotoAndPlay(0, -1);
            }
            this.addChild(animation);
            this.animations.push(animation);
        }
        return animation;
    };
    JSA.JSAContainer.prototype.removeAnimation = function (animation, dataOnly) {
        var i = this.animations.indexOf(animation);
        if (i >= 0) {
            animation.stop();
            if (!dataOnly) this.removeChild(animation);
            this.animations.splice(i, 1);
        }
        return animation;
    };
    JSA.JSAContainer.prototype.removeAnimations = function (dataOnly) {
        var animations = this.animations;
        var i = animations.length - 1;
        for (i; i >= 0; i -= 1) {
            this.removeAnimation(animations[i], dataOnly);
        }
    };
    JSA.JSAContainer.prototype.removeChildren = function () {
        this.removeAnimations(true)
        egret.DisplayObjectContainer.prototype.removeChildren.call(this);
    };
}).call(this);