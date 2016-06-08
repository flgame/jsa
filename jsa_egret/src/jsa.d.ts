declare module JSA {
    interface Event {
        type: string;
    }
    class EventTarget {
        addEventListener(type:string, listener:Function):void;
        on(type:string, listener:Function):void;
        dispatchEvent(event:Event):void;
        emit(event:Event):void;
        removeEventListener(type:string, listener:Function):void;
        off(type:string, listener:Function):void;
    }
}
declare module JSA {
    class JSA {
        constructor(jsaObj?:any, zip?:any, textureHandler?:Function);
        pack:JSA.JSAPack;
        zip:any;
        textureHandler:Function;
        
        getPackItem(path:string): JSA.JSAPack;
        getPackItemData(path:string, handler:Function): JSA.JSAData;
    }
    class JSADataType {
        static NORMAL_PNG: number;
        static NORMAL_JPG: number;
        static GRAY_SCALE_JPG: number;
        static ALPHA_PNG: number;
        static INVERSE_ALPHA_PNG: number;
        static GRAY_SCALE_PNG: number;
        static NORMAL_PNG8: number;
        static TEXTURE_PNG: number;
        static TEXTURE_PNG8: number;
        static TEXTURE_JPG: number;
    }
    class JSAInfo {
        type: number;
        fps: number;
        bbox: number[];
    }
    class JSAData extends EventTarget {
        type: number;
        src: string;
        mask: string;
        offset: number[];
        textureOffset: number[];
        
        texture: any;
        pack: JSAPack;
        img: any;
        
        loadImage():any;
    }
    class JSAPack {
        name: string;
        path: string;
        type: number;
        info: JSAInfo;
        items: JSAPack[];
        data: JSAData;
        
        jsa: JSA.JSA;
        fileNum: number;
        itemNum: number;
        
        getData(): JSAData;
    }
}

declare module JSA {
    var textureHandler: Function;
    function isTexture(type:number):boolean;
    function fromJson(jsaObj:any, jsa:JSA.JSA):JSA.JSAPack;
}