declare var requestAnimFrame:Function;
declare module JSA {}
declare module JSA.FPS {
    class TimeInfo {
        constructor(frame:number, time:number, interval:number);
        frame: number;
        time: number;
        pretime: number;
        interval: number;
        
        getIntervalCount(interval:number):number;
        sync(timeInfo:TimeInfo):void;
    }
    class HandlerInfo {
        constructor(handler:Function, interval:number);
        
        handler:Function;
        preframe:number;
        timeInfo:TimeInfo;
    }
}

declare module JSA.FPS {
    var prefps:number;
    var fps:number;
    var requestId:number;
    var timeInfo:TimeInfo;
    var handlers:HandlerInfo[];
    
    function on(fps:number):void;
    function off():void;
    function frameHandler(time:number):boolean;
    function add(handler:Function, interval:number):HandlerInfo;
    function remove(handler:Function):HandlerInfo;
    function get(handler:Function):HandlerInfo;
    
}