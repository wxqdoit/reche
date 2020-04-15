import Util from './Util';
import Xhr from './Xhr';
import Event from './Event';
import I18n from './I18n';
import Option from './Option';
import Queue from './Queue';
import FileSlice from './FileSlice';

/**
 *   啊

 今天都是好日子

 千金的光阴不能等

 明天又是好日子

 赶上了盛世咱享太平

 今天是个好日子

 心想的事儿都能成
 */

class Reche {
    constructor(option) {
        this.fileMap = {};
        this.util = new Util(this);
        this.option = new Option().optionInit(option);
        this.event = new Event();
        this.i18n = new I18n(this.option.lang);
        this.queue = new Queue(this);
        this.fileSlice = new FileSlice(this);
        this.fileStatus = {
            onWaiting: 0,//等待中
            onProgress: 1,//上传中
            onCompleted: 2,//已完成
            onStopped: 3,//已暂停
            onError: 4,//上传失败
            onCanceled: 5//已取消
        };
        this.xhrList = []
    }

    /**
     * 文件解析上传主入口
     * @param option
     * @returns {{}|*}
     */
    reche(option) {
        let files = option.files;
        let data = this.util.isObject(option.data) ? option.data : null;
        if (files.length) {
            for (let i = 0; i < files.length; i++) {
                let fileSliced = this.fileSlice.fileSlice(files[i], data);
                this.fileMap[fileSliced.fileId] = fileSliced;
                this.queue.appendFileChunkQueue(fileSliced);
                this.event.trigger('fileAppend', {
                    event: 'event:::fileAppend',
                    file: files,
                    fileMap: this.fileMap
                });
                this.event.trigger('fileStatusChange', {
                    event: 'event:::fileStatusChange',
                    fileId: fileSliced.fileId,
                    status: this.fileStatus.onWaiting,
                });
            }
            this.exeXhr();
        }
    }

    exeXhr() {
        if (this.xhrList.length === 0 && this.queue.queue.fileChunkOnWaiting.length) {
            let fc = this.queue.dispatch();
            if(fc){
                let xhr = new Xhr(this);
                this.xhrList.push(xhr);
                xhr.sendXhr(fc)
            }
        }
    }

    abortAndRemoveXhr(fileId = null) {
        if(fileId){
            for (let i = 0; i < this.xhrList.length; i++) {
                if (fileId === this.xhrList[i].fileOrChunk.fileId) {
                    this.xhrList[i].abortXhr();
                    this.xhrList.splice(i, 1);
                    return
                }
            }
        }else {
            for (let i = 0; i < this.xhrList.length; i++) {
                this.xhrList[i].abortXhr();
                this.xhrList = []
            }
        }
    }


    /**
     * 删除所有上传任务
     * todo 暂时不启用
     * @returns {{fileMap: ({}|*)}}
     */
    // removeAll() {
    //     this.fileMap = {};
    //     this.queue.removeFileChunk();
    //     this.abortAndRemoveXhr();
    //     this.event.trigger('fileRemoveAll', {
    //         event: 'event:::fileRemoveAll',
    //         fileMap: this.fileMap
    //     });
    // }

    /**
     * 删除某个上传任务
     * @param fileId
     * @returns {{fileMap: ({}|*), fileId: *}}
     */
    remove(fileId) {
        if (this.fileMap[fileId]) {
            if(this.fileMap[fileId].status === this.fileStatus.onCanceled ||
                this.fileMap[fileId].status === this.fileStatus.onCompleted ||
                this.fileMap[fileId].status === this.fileStatus.onError){
                delete this.fileMap[fileId];
                this.queue.removeFileChunk(fileId);
                this.abortAndRemoveXhr(fileId);
                this.event.trigger('fileRemove', {
                    event: 'event:::fileRemove',
                    fileId: fileId,
                });
            }
        }
    }

    stop(fileId){
        if(this.fileMap[fileId]){
            if(this.fileMap[fileId].file){
                this.event.trigger('fileStop', {
                    event: 'event:::fileStop',
                    fileId: fileId,
                    canStop:false,
                    message:this.i18n.i18n('cannotStopByProgress')
                });
            }else {
                if(this.fileMap[fileId].status === this.fileStatus.onWaiting || this.fileMap[fileId].status === this.fileStatus.onProgress){
                    this.queue.fileStoppedId.push(fileId);
                    this.fileMap[fileId].status = this.fileStatus.onStopped;
                    this.event.trigger('fileStop', {
                        event: 'event:::fileStop',
                        fileId: fileId,
                    });
                    this.event.trigger('fileStatusChange', {
                        event: 'event:::fileStatusChange',
                        fileId: fileId,
                        status: this.fileStatus.onStopped,
                    });
                }else{
                    this.event.trigger('fileStop', {
                        event: 'event:::fileStop',
                        fileId: fileId,
                        canStop:false,
                        message:this.i18n.i18n('cannotStop')
                    });
                }
            }
        }
    }

    changeFileStatus(fileId = null,excludeFileId = null,formStatus,toStatus){
        if(fileId){
            if(this.fileMap[fileId].status !== toStatus){
                this.fileMap[fileId].status = toStatus;
                this.event.trigger('fileStatusChange', {
                    event: 'event:::fileStatusChange',
                    fileId: fileId,
                    status: toStatus,
                });
            }
        }else {
            for(let item in this.fileMap){
                if (item !== excludeFileId && this.fileMap[item].status === formStatus){
                    this.fileMap[item].status = toStatus;
                    this.event.trigger('fileStatusChange', {
                        event: 'event:::fileStatusChange',
                        fileId: fileId,
                        status: toStatus,
                    });
                }
            }
        }
    }

    removeFileIdFormStoppedId(fileId){
        for(let i = 0;i<this.queue.fileStoppedId.length;i++){
            if(fileId === this.queue.fileStoppedId[i]){
                this.queue.fileStoppedId.splice(i,1);
                break
            }
        }
    }
    resume(fileId){
        if(this.fileMap[fileId] && this.fileMap[fileId].status === this.fileStatus.onStopped){
            console.log(this.queue.queue.fileChunkOnProgress);
            if(this.queue.queue.fileChunkOnProgress.length === 0){
                this.changeFileStatus(null,fileId,this.fileStatus.onProgress,this.fileStatus.onWaiting);
                this.removeFileIdFormStoppedId(fileId);
                this.abortAndRemoveXhr(fileId);
                this.queue.preposition('fileChunkOnWaiting',fileId);
                this.event.trigger('fileResume', {
                    event: 'event:::fileResume',
                    fileId: fileId,
                });
                this.exeXhr()
            }

        }
    }
    restart(fileId){
        if(this.fileMap[fileId] ){
            if(this.fileMap[fileId].status === this.fileStatus.onCanceled ||
                this.fileMap[fileId].status === this.fileStatus.onError){
                /**
                 * 1、改变文件状态为等待状态
                 * 2、将文件块添加到等待队列
                 */
                this.changeFileStatus(fileId,null,null,this.fileStatus.onWaiting);
                this.queue.appendFileChunkQueue(this.fileMap[fileId]);


                this.event.trigger('fileRestart', {
                    event: 'event:::fileRestart',
                    fileId: fileId,
                });

                this.exeXhr();
            }
        }
    }
    cancel(fileId){
        if(this.fileMap[fileId]){
            if(this.fileMap[fileId].status === this.fileStatus.onWaiting ||
                this.fileMap[fileId].status === this.fileStatus.onStopped ||
                this.fileMap[fileId].status === this.fileStatus.onProgress){
                this.removeFileIdFormStoppedId(fileId);
                this.changeFileStatus(fileId,null,null,this.fileStatus.onCanceled);
                this.abortAndRemoveXhr(fileId);
                this.queue.removeFileChunk(fileId);
                this.event.trigger('fileCancel', {
                    event: 'event:::fileCancel',
                    fileId: fileId,
                });
                this.fileMap[fileId].progress = 0;
                this.event.trigger('fileProgress', {
                    event: 'event:::fileProgress',
                    fileId: fileId,
                    progress: 0,
                });
            }
        }
    }

    on(name, callback) {
        this.event.on(name, callback);
        return this
    }

}

Object.defineProperty(Reche, 'version', {
    enumerable: true,
    get: function () {
        // replaced by browserify-versionify transform
        return '__VERSION__';
    }
});
export default Reche

