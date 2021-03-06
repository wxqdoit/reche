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
            chunkPath: '',//分片上传接口
            timeout: 1000 * 60 * 60,//请求超时时间 默认1小时
            chunkThreadNumber: 5,//分片上传时，开启的线程数，
            chunkFirstResParamKey: {},//分配上传时第一片上传完成返回的数据中需要回传的参数key
            lang: 'zh-cn',//语言 默认中文
            async: true,
            headers: {},
            fdKey: {},
        }
    }

    optionInit(option) {
        for (const item in this.defaultOption) {
            if (this.defaultOption.hasOwnProperty(item) && !option.hasOwnProperty(item)) {
                option[item] = this.defaultOption[item];
            }
        }
        let chunkFirstResParamKey = {
            uploadIdKey: 'uploadId',
            fileNameKey: 'fileName'
        };
        if (option.chunkFirstResParamKey) {
            for (const item in chunkFirstResParamKey) {
                option.chunkFirstResParamKey[item] = option.chunkFirstResParamKey[item] ? option.chunkFirstResParamKey[item] : chunkFirstResParamKey[item]
            }
        } else {
            option.chunkFirstResParamKey = chunkFirstResParamKey
        }

        return option
    }

}