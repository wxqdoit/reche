export default class Xhr {
    constructor(reche) {
        this.reche = reche;
        this.xhr = this.initXhr();
        this.progress = 0;
        this.fileOrChunk = null
    }

    /**
     * 初始化一个XHR，但是不发送 ，不执行send方法
     * @returns {XMLHttpRequest|null}
     */
    initXhr() {
        let xhr = null;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest()
        } else if (window.ActiveXObject) {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        } else {
            console.warn(this.reche.i18n.i18n('unSupportXhr'));
            return xhr
        }
        if (this.reche.option.async) {
            xhr.timeout = this.reche.option.timeout;
            xhr.upload.ontimeout = (e) => {
                this.xhrError(this.fileOrChunk.fileId,xhr);
            };
        }
        xhr.upload.onprogress = (e) => {
            let progress = 0;
            if (e.lengthComputable) {
                this.progress = e.loaded / e.total;
                if (this.fileOrChunk.index === -1) {
                    progress = e.loaded / e.total
                } else {
                    let totalUpSize = 0;
                    //获取整个文件上传进度
                    for (let i = 0; i < this.reche.xhrList.length; i++) {
                        totalUpSize += (this.reche.xhrList[i].fileOrChunk.fileChunkSize * this.progress)
                    }
                    for (let n = 0; n < this.reche.queue.queue.fileChunkOnCompleted.length; n++) {
                        if (this.fileOrChunk.fileId === this.reche.queue.queue.fileChunkOnCompleted[n].fileId) {
                            totalUpSize += this.reche.queue.queue.fileChunkOnCompleted[n].fileChunkSize
                        }
                    }
                    progress = totalUpSize / this.reche.fileMap[this.fileOrChunk.fileId].fileSize
                }
            }

            this.reche.fileMap[this.fileOrChunk.fileId].progress = progress;
            this.reche.event.trigger('fileProgress', {
                event: 'event:::fileProgress',
                fileId: this.fileOrChunk.fileId,
                progress: progress,
            });
        };
        xhr.upload.onerror = (e) => {
            this.xhrError(this.fileOrChunk.fileId,xhr);
        };
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    let resJson = JSON.parse(xhr.response);
                    if (Number(resJson.status) === 200) {
                        // 这里已经传完了
                        // 1、文件上传队列位置改变
                        let fileOfMap = this.reche.fileMap[this.fileOrChunk.fileId];
                        console.log("当前文件总块数：" + fileOfMap.fileChunk.length + "----已完成完成块数：" + this.fileOrChunk.index);
                        this.reche.queue.formProgressToCompleted(this.fileOrChunk);
                        if (this.fileOrChunk.index === -1) {
                            // 如果是小文件上传
                            this.reche.changeFileStatus(this.fileOrChunk.fileId,null,null,this.reche.fileStatus.onCompleted);
                        } else {
                            // 如果是当前大文件块的第一块 绑定设置回传参数
                            if (this.fileOrChunk.index === 1) {
                                let resParam = {};
                                let cusfrpk = this.reche.option.chunkFirstResParamKey;
                                if (resJson.data) {
                                    for (let item in cusfrpk) {
                                        resParam[cusfrpk[item]] = resJson.data[cusfrpk[item]]
                                    }
                                    this.reche.fileMap[this.fileOrChunk.fileId].resParam = resParam
                                }
                            }
                            //判断整个文件是否上传完
                            if (this.reche.queue.isComplete(this.fileOrChunk.fileId)) {
                                // 文件状态改变
                                this.reche.changeFileStatus(this.fileOrChunk.fileId,null,null,this.reche.fileStatus.onCompleted);
                            }
                        }
                        //本次任务完成 停止并移除Xhr
                        this.reche.abortAndRemoveXhr(this.fileOrChunk.fileId);
                        // 判断是否所有任务完成
                        if (this.reche.queue.isCompleteAll()) {
                            this.reche.event.trigger('fileCompleteAll', {
                                event: 'event:::fileCompleteAll',
                                response: xhr.response
                            });
                        } else {
                            //执行下次任务
                            this.reche.exeXhr()
                        }
                    } else {
                        console.log(resJson)
                        this.xhrError(this.fileOrChunk.fileId,xhr)

                    }
                } else {
                    this.xhrError(this.fileOrChunk.fileId,xhr);
                }
            }
        };
        return xhr
    }

    /**
     * 发送请求
     * @param fileOrChunk
     */
    sendXhr(fileOrChunk) {
        this.fileOrChunk = fileOrChunk;
        if (this.xhr) {
            let fd = this.buildFormData(fileOrChunk);
            if (this.reche.fileMap[fileOrChunk.fileId].status !== this.reche.fileStatus.onProgress) {
                this.reche.changeFileStatus(this.fileOrChunk.fileId,null,null,this.reche.fileStatus.onProgress)
            }
            let path = this.fileOrChunk.index === -1 ? this.reche.option.path : this.reche.option.chunkPath;
            this.xhr.open('POST', path, this.reche.option.async);
            this.setXhrHeader(this.xhr,this.reche.option.headers);
            this.xhr.send(fd)
        }
    }
    xhrError(fileId,xhr){
        this.reche.abortAndRemoveXhr(fileId);
        this.reche.queue.deleteChunkOfQueue(fileId);
        this.reche.changeFileStatus(fileId,null,null,this.reche.fileStatus.onError)
        this.reche.event.trigger('fileError', {
            event: 'event:::fileError',
            fileId: fileId,
            xhr:xhr
        });
    }

    /**
     * 构建formdata数据
     * @param fileOrChunk
     * @returns {FormData}
     */
    buildFormData(fileOrChunk) {
        let formData = new FormData();
        formData.append(this.reche.option.fdKey.fileKey, fileOrChunk.chunk);
        formData.append(this.reche.option.fdKey.chunkKey, fileOrChunk.index);
        formData.append(this.reche.option.fdKey.chunksKey, this.reche.fileMap[fileOrChunk.fileId].fileChunk.length.toString());
        let resParam = this.reche.fileMap[fileOrChunk.fileId].resParam;
        if (!resParam) {
            formData.append(this.reche.option.fdKey.fileNameKey, this.reche.fileMap[fileOrChunk.fileId].fileName);
        }
        if (resParam) {
            for (let item in resParam) {
                formData.append(item, resParam[item])
            }
        }
        if (this.reche.util.isObject(fileOrChunk.data) && fileOrChunk.data.toString() !== '{}') {
            for (let item in fileOrChunk.data) {
                formData.append(item, fileOrChunk.data[item])
            }
        }
        return formData
    }

    /**
     * 终止请求
     * todo 在这里终止请求好像并没有什么卵用，需要继续测试
     */
    abortXhr() {
        if (this.xhr) {
            //this.xhr.abort();
            this.xhr = null;
        }
    }

    /**
     * 设置请求头
     * @param xhr
     * @param headers
     */
    setXhrHeader(xhr, headers) {
        if(this.reche.util.isObject(headers) && headers.toString() !== '{}'){
            for(let item in headers){
                xhr.setRequestHeader(item,headers[item]);
            }
        }
    }
}