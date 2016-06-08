/* global devel: true, console: true */
(function () {
    'use strict';
    if (typeof JSA.FPS !== 'undefined') {
        return;
    }
    
    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

    // requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

    // MIT license

    /**
     * A polyfill for requestAnimationFrame
     *
     * @method requestAnimationFrame
     */
    /**
     * A polyfill for cancelAnimationFrame
     *
     * @method cancelAnimationFrame
     */
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };

    window.requestAnimFrame = window.requestAnimationFrame;

    var root = this,
        FPS = function () {
        };
    
    FPS.HandlerInfo = function (handler, interval) {
        this.handler = handler; //回调handler(this.timeInfo)
        this.preframe = 0; //上一次调用帧
        this.timeInfo = new FPS.TimeInfo(0, 0, interval);
    };
    FPS.TimeInfo = function (frame, time, interval) {
        this.frame = frame; //当前帧
        this.time = time; //当前时间
        this.preTime = 0; //上一次调用时间
        this.interval = interval ? interval : 1; //时间间隔或帧间隔
    };
    FPS.TimeInfo.prototype.getIntervalCount = function (interval) {
        if (!interval) interval = this.interval;
        
        return ((this.time - this.preTime) / interval) | 0;
    };
    FPS.TimeInfo.prototype.sync = function (timeInfo) {
        if (timeInfo) {
            this.frame = timeInfo.frame;
            this.time = timeInfo.time;
            this.preTime = timeInfo.preTime;
            this.interval = timeInfo.interval;
        }
    };
    
    FPS.prefps = 30;
    FPS.fps = 30;
    FPS.requestId = 0;
    FPS.timeInfo = new FPS.TimeInfo(0, 0, 1000 / 30);
    FPS.on = function (fps) {
        if (fps) FPS.fps = fps;
        
        if(FPS.requestId) return;
        FPS.requestId = requestAnimationFrame(FPS.frameHandler);
    };
    FPS.off = function () {
        if(!FPS.requestId) return;
        cancelAnimationFrame(FPS.requestId);
    };
    FPS.frameHandler = function (time) {
        var i, hInfo;
        
        FPS.requestId = requestAnimationFrame(FPS.frameHandler);
        if (FPS.fps != FPS.prefps) {
            FPS.prefps = FPS.fps;
            FPS.timeInfo.interval = 1000 / FPS.fps;
        }
        FPS.timeInfo.time = time;
        if (FPS.timeInfo.frame != 0) {
            if (FPS.timeInfo.getIntervalCount() < 1) {
                //没到帧时间
                return;
            }
        }
        
        for (i = 0; i < FPS.handlers.length; i += 1) {
            hInfo = FPS.handlers[i];
            hInfo.timeInfo.time = time;
            if (hInfo.preframe == 0 || FPS.timeInfo.frame - hInfo.preframe >= hInfo.timeInfo.interval) {
                hInfo.handler.call(hInfo, hInfo.timeInfo);
                hInfo.timeInfo.frame += 1;
                hInfo.timeInfo.preTime = time;
                hInfo.preframe = FPS.timeInfo.frame;
            }
        }
        
        FPS.timeInfo.preTime = time;
        FPS.timeInfo.frame += 1;
    };
    FPS.add = function (handler, interval) {
        var hInfo = FPS.get(handler);
        if (null == hInfo) {
            hInfo = new FPS.HandlerInfo(handler, interval);
            FPS.handlers.push(hInfo);
        } else if (interval) {
            hInfo.timeInfo.interval = interval;
        }
        return hInfo;
    };
    FPS.remove = function (handler) {
        var i, hInfo = FPS.get(handler);
        if (hInfo) {
            i = FPS.handlers.indexOf(hInfo);
            FPS.handlers.splice(i, 1);
        }
        return hInfo;
    };
    FPS.handlers = [];
    FPS.get = function (handler) {
        var i, hInfo;
        for (i = FPS.handlers.length - 1; i >= 0; i -= 1) {
            hInfo = handlers[i];
            if (hInfo && hInfo.handler == handler) {
                return hInfo;
            }
        }
        return null;
    };
    
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = JSA.FPS;
        }
        exports.JSA.FPS = FPS;
    } else {
        root.JSA.FPS = FPS;
    }
}).call(this);