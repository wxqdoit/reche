/**
 *   我们一起逃离
     From proving to ourselves we're not afraid
     为了证明自己并不懦弱
     And now
     而现在
     These silver screens,these scripted dreams
     这些闪亮的银幕，和潦草的梦想
     And now
     而现在
     We're suddenly
     如此突然地
     Fates latest casualties
     我们都败给了命运。
                            -----《Reprieve》2020.04.14
 */
export default class Queue {
    constructor(reche) {
        this.reche = reche;
        this.fileStoppedId = [];
        this.queue = {
            fileChunkOnWaiting: [],//等待上传的队列
            fileChunkOnProgress: [],//正在上传的队列
            fileChunkOnCompleted: [],//上传成功的队列
            fileChunkOnError: [],//上传失败的队列
            fileChunkStopped: [],//暂停中的文件
        }
    }

    /**
     * 将文件(块)从各个队列中移除
     * @param fileId
     */
    deleteChunkOfQueue(fileId) {
        for (let item in this.queue) {
            let tempObj = [];
            for (let i = 0; i < this.queue[item].length; i++) {
                if (this.queue[item][i].fileId !== fileId) {
                    tempObj.push(Object.assign({},this.queue[item][i]))
                }
            }
            this.queue[item] = tempObj
        }
    }

    /**
     * 将某个状态的文件队列中的某个文件的块前移
     * @param queueName
     * @param fileId
     */
    preposition(queueName,fileId) {
        let tempArr = [];
        let otherThisArr = [];
        for(let i= 0;i<this.queue[queueName].length;i++){
            let aObj = Object.assign({},this.queue[queueName][i]);
            if(this.queue[queueName][i].fileId === fileId){
                tempArr.push(aObj)
            }else{
                otherThisArr.push(aObj)
            }
        }
        this.queue[queueName] = tempArr.concat(otherThisArr);
    }
    /**
     * 重置任务队列
     */
    resetChunkQueue() {
        this.queue = {
            fileChunkOnWaiting: [],
            fileChunkOnProgress: [],
            fileChunkOnCompleted: [],
            fileChunkOnError: [],
            fileChunkStopped: [],
        }
    }

    /**
     * 队列中移除指定fileId任务，fileId不传即删除所有任务
     * @param fileId
     */
    removeFileChunk(fileId = null) {
        if (fileId) {
            this.deleteChunkOfQueue(fileId)
        } else {
            this.resetChunkQueue()
        }
        //停止所有xhr任务
        this.reche.abortAndRemoveXhr(fileId)
    }

    /**
     * 添加文件到文件列表和文件上传队列
     * @param fileSliced
     * @returns {Queue}
     */
    appendFileChunkQueue(fileSliced) {
        if (fileSliced.file && !fileSliced.fileChunk.length) {
            this.queue.fileChunkOnWaiting.push({
                fileId: fileSliced.fileId,
                index: -1,//这是一整个文件
                fileChunkSize: fileSliced.fileSize,
                chunk: fileSliced.file,
                data: fileSliced.data
            })
        } else {
            this.queue.fileChunkOnWaiting = this.queue.fileChunkOnWaiting.concat(fileSliced.fileChunk)
        }
    }

    /**
     * 队列任务分发
     * 将一个个文件（块）从等待队列转入上传队列
     * @returns {boolean|*}
     */
    dispatch() {
        //判断是否有暂停的任务
        let index = 0;
        let kIndex = -1;
        if (this.fileStoppedId.length) {
            for (let k = 0; k < this.queue.fileChunkOnWaiting.length; k++) {
                let tag = true;
                for (let i = 0; i < this.fileStoppedId.length; i++) {
                    if (this.fileStoppedId[i] === this.queue.fileChunkOnWaiting[k].fileId) {
                        tag = !tag;
                        break
                    }
                }
                if (tag) {
                    index = k;
                    break
                }
                kIndex = k
            }
        }
        if (kIndex === this.queue.fileChunkOnWaiting.length - 1) {
            return false
        } else {
            if (this.queue.fileChunkOnWaiting.length) {
                let fChunk = this.queue.fileChunkOnWaiting.splice(index, 1)[0];
                this.queue.fileChunkOnProgress.push(fChunk);
                return fChunk
            } else {
                console.warn('no fileChunk in fileChunkOnWaiting')
            }
        }
    }

    /**
     * 将文件（块）从上传中移入已完成
     * @param chunk
     * @returns {*}
     */
    formProgressToCompleted(chunk) {
        for (let i = 0; i < this.queue.fileChunkOnProgress.length; i++) {
            if (chunk.fileId === this.queue.fileChunkOnProgress[i].fileId &&
                chunk.index === this.queue.fileChunkOnProgress[i].index) {
                const fChunk = this.queue.fileChunkOnProgress.splice(i, 1)[0];
                this.queue.fileChunkOnCompleted.push(fChunk);
                return fChunk
            }
        }
    }


    forProgressToError(fileId){

    }

    formWaitingToStopped(fileId) {

    }

    formStoppedToWaiting(fileId) {

    }

    /**
     * 是否完成某个文件的任务
     * @param fileId
     * @returns {boolean}
     */
    isComplete(fileId) {
        let tag = 0;
        for (let i = 0; i < this.queue.fileChunkOnCompleted.length; i++) {
            if (this.queue.fileChunkOnCompleted[i].fileId === fileId) {
                tag += 1
            }
        }
        return tag === this.reche.fileMap[fileId].fileChunk.length;
    }

    /**
     * 是否完成了当前选择的所有文件的任务
     * @returns {boolean}
     */
    isCompleteAll() {
        let statusAllComplete = true;
        for(let item in this.reche.fileMap){
            if(this.reche.fileMap[item].status !== this.reche.fileStatus.onCompleted){
                statusAllComplete = false;
                break
            }
        }
        return this.queue.fileChunkOnWaiting.length === 0 &&
            this.queue.fileChunkStopped.length === 0 &&
            this.queue.fileChunkOnProgress.length === 0 &&
            this.queue.fileChunkOnError.length === 0 &&
            this.reche.xhrList.length === 0 && statusAllComplete;
    }
}