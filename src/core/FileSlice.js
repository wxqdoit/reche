export default class FileSlice {
    constructor(reche) {
        this.reche = reche;
    }
    /**
     * 文件分片处理逻辑
     * @param file 原生file
     * @param data 其他參數
     * @returns {{fileName: *, file: null, fileSize: *, fileChunk: Array, percent: number, fileId: *}}
     */
    fileSlice(file,data) {
        let fileId = this.reche.util.randomString(8);
        let fileSliced = {
            fileId: fileId,
            fileName: file.name,
            fileSize: file.size,
            file: null,
            data:data,
            resParam:null,
            status: this.reche.fileStatus.onWaiting,
            percent: 0,
            fileChunk: []
        };
        if(this.reche.option.chunkUse && file.size >= this.reche.option.chunkUseSize){
            let index = 0; //切片索引
            let start = 0; //切片开始位置
            let end = 0; //切片结束位置
            let chunkSize = this.reche.option.chunkSize;// 配置中读取切块大小
            let totalSlices = Math.ceil(file.size / chunkSize); // 计算文件切片总数（向上取整）
            while (index < totalSlices) {
                //分片
                let chunkObj = {
                    fileChunkSize: 0,
                    fileId: fileId,
                    index: 0,
                    chunk: null
                };
                start = index * chunkSize;
                end = start + chunkSize;
                //切割文件
                let chunk = file.slice(start, end);
                index++;
                chunkObj.chunk = chunk;
                chunkObj.index = index;
                chunkObj.fileChunkSize = chunk.size;
                fileSliced.fileChunk.push(chunkObj)
            }
        }else{
            //普通
            fileSliced.file = file
        }
        return fileSliced
    }
}