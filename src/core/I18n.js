export default class I18n {
    constructor(lang){
        this.lang = lang;
        this.txt = {
            'zh-cn': {
                unSupportXhr:'您的浏览器不支持XHR请求',
                cannotStopByProgress:'正在创建文件不能暂停',
                cannotStopByUploaded:'文件已上传完成不能暂停',
                cannotStop:'当前文件状态不能暂停'
            }
        }
    }

    i18n(name){
        if (this.txt[this.lang] && this.txt[this.lang][name]) {
            return this.txt[this.lang][name];
        } else {
            return name;
        }
    }
}