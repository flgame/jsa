/* global devel: true, console: true */
(function () {
    'use strict';
    if (typeof JSA.FPS !== 'undefined') {
        return;
    }

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
    };
    FPS.off = function () {
    };
    FPS.frameHandler = function (time) {
        var i, hInfo;
        
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
        return true;
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