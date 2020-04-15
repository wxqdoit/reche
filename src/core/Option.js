/**
 * 配置处理
 */
export default class Option {
    constructor() {
        this.defaultOption = {
            chunkUse: true,//是否开启分片上传 默认不开启
            chunkSize: 5 << 20,//分片大小 默认5M
            chunkUseSize: 10 << 20,//使用分片上传时文件最小大小 默认10M
            path: '',//上传接口 如果开启分片上传而没有chunkInitPath和chunkPath时 使用path
            chunkInitPath: '',//分片上传初始化接口 chunkInitPath和chunkPath应该合并
            chunkPath: '',//分片上传接口
            timeout: 1000 * 60 *60,//请求超时时间 默认1小时
            chunkThreadNumber: 5,//分片上传时，开启的线程数，
            lang:'zh-cn',//语言 默认中文
            async:true,
            headers:{},
            fdKey:{},
        }
    }
    optionInit(option){
        for (const item in this.defaultOption) {
            if (this.defaultOption.hasOwnProperty(item) && !option.hasOwnProperty(item)) {
                option[item] = this.defaultOption[item];
            }
        }
        let fdKey = {
            fileKey: 'file',
            chunkKey:'chunk',
            chunksKey:'chunks',
            indexKey:'index',
            fileNameKey:'fileName',
        };
        if(option.fdKey){
            for(const item in fdKey){
                option.fdKey[item] = option.fdKey[item]?option.fdKey[item]:fdKey[item]
            }
        }else {
            option.fdKey = fdKey
        }
        return option
    }

}