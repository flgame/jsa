/* global devel: true, console: true */
(function () {
    'use strict';
    if (typeof JSA.JSAAnimation !== 'undefined') {
        return;
    }
    var root = this;
    
    JSA.textureHandler = function(data) {
        if(!data.texture) {
            var jsa = data.pack.jsa;
            data.texture = new PIXI.Texture(jsa.zip);
            data.texture.frame = new PIXI.Rectangle(data.textureOffset[0], data.textureOffset[1], data.textureOffset[2], data.textureOffset[3]);
        }
        return data.texture;
    };
    /**
     * base on pixijs: http://www.pixijs.com
     */
    JSA.JSAAnimation = function (pack) {
        var i, item, texture, textures = [];
        
        this.timeInfo = new JSA.FPS.TimeInfo(0, 0, 0);
        if (pack && pack.items) {
            for (i = 0; i < pack.items.length; i += 1) {
                item = pack.items[i];
                if (item.data && item.type == JSA.JSAType.FILE) {
                    if(JSA.isTexture(item.data.type)) {
                        texture = item.data.loadImage();
                    } else {
                        texture = new PIXI.BaseTexture(item.data.loadImage());
                        texture = new PIXI.Texture(texture);
                    }
                    if (item.data.offset) {
                        //a bug wait to be fixed, set the trim will cause the texture doesn't display
                        //texture.trim = new PIXI.Rectangle(item.data.offset[0], item.data.offset[1], item.data.offset[2], item.data.offset[3]);
                    }
                    textures.push(texture);
                }
            }
            if (pack.info && pack.info.fps) {
                this.timeInfo.interval = 1000 / pack.info.fps;
            }
        }
        
        if (textures.length == 0) {
            texture = new PIXI.BaseTexture(new Image());
            texture = new PIXI.Texture(texture);
            textures.push(texture);
        }
        PIXI.extras.MovieClip.call(this, textures);
    };
    // constructor
    JSA.JSAAnimation.prototype = Object.create( PIXI.extras.MovieClip.prototype );
    JSA.JSAAnimation.prototype.constructor = JSA.JSAAnimation;
    JSA.JSAAnimation.prototype.updateTransform = function () {
        var self = this;
        if (self.playing) {
            self.timeInfo.time = JSA.FPS.timeInfo.time;
            var count = 1;
            if(self.timeInfo.interval && self.timeInfo.preTime) {
                count = self.timeInfo.getIntervalCount();
            }
            if (count == 0) {
                PIXI.extras.MovieClip.prototype.updateTransform.call(self);
                return;
            }
            var n = count;
            while (n >= 1) {
                n--;
                if (self._currentTime >= self._textures.length) {
                    if (self.onComplete) {
                        self.onComplete();
                    }
                    if(!self.loop) {
                        self.gotoAndStop(self._textures.length - 1);
                        break;
                    } else {
                        self._currentTime = 0;
                    }
                }
            }
            if (self._currentTime < 0) {
                self._currentTime = 0;
            } else if(self._currentTime >= self._textures.length) {
                self._currentTime = 0;
            }
            self._texture = self._textures[self.currentFrame];
            self._currentTime += count;
        }
        
        self.timeInfo.preTime = self.timeInfo.time;
        PIXI.extras.MovieClip.prototype.updateTransform.call(self);
    };
    JSA.JSAAnimation.prototype.update = function (deltaTime) {
        //do nothing
    };
    
    JSA.JSAContainer = function() {
        PIXI.Container.call(this);
        
        this.animations = [];
    };
    // constructor
    JSA.JSAContainer.prototype = Object.create( PIXI.Container.prototype );
    JSA.JSAContainer.prototype.constructor = JSA.JSAContainer;
    JSA.JSAContainer.prototype.addAnimation = function (animation, sync) {
        var i = this.animations.indexOf(animation);
        if (i < 0) {
            if (sync && this.animations.length > 0) {
                animation.gotoAndPlay(this.animations[0].currentFrame);
            } else {
                animation.gotoAndPlay(0);
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
    JSA.JSAContainer.prototype.removeChildren = function (beginI, endI) {
        var i, removed = PIXI.Container.prototype.removeChildren.call(this, beginI, endI);
        for (i = 0; i < removed.length; i += 1) {
            this.removeAnimation(removed[i], true);
        }
        return removed;
    };
}).call(this);