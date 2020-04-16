export default class Event {
    constructor (){
        this.event = {};
        this.xhrEvent = [
            'onloadstart',
            'onprogress',
            'onabort',
            'ontimeout',
            'onerror',
            'onload',
            'onloadend',
            'onreadystatechange'
        ];
        this.recheEvents = [
            "fileStop",
            "fileResume",
            "fileCancel",
            "fileRestart",
            "fileRemove",
            "fileRemoveAll",
            "fileAppend",
            "fileCompleteAll",
            "fileProgress",
            "fileStatusChange",
            "fileError"
        ]
    }
    on(name,callback){
        if (this.detectEventType(name) && typeof callback === 'function') {
            if (!this.event[name]) {
                this.event[name] = [];
            }
            this.event[name].push(callback);
        }
    }

    /**
     * 事件触发器
     * @param name 事件名
     * @param info 信息？？？ 传入回调的，具体是作甚的还需要往下看
     */
    trigger(name, info) {
        if (this.event[name] && this.event[name].length) {
            for (let i = 0; i < this.event[name].length; i++) {
                this.event[name][i](info);
            }
        }
    }
    detectEventType(name) {
        if (this.recheEvents.indexOf(name) !== -1) {
            return 'recheEvents';
        } else if (this.xhrEvent.indexOf(name) !== -1) {
            return 'xhrEvent';
        }
        console.error(`Unknown event name: ${name}`);
        return null;
    }
}