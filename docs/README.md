---
sidebar: auto
---

# 指南
# Reche
文件分片断点上传

## 安装

直接引用
```
<script src="./reche.js"></script>
```

使用 npm 安装
```
npm install reche --save
```

## 快速开始

在html中引入
```html
<link href="https://cdn.bootcss.com/twitter-bootstrap/4.4.1/css/bootstrap.min.css">
<script src="https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js"></script>
<script src="https://cdn.bootcss.com/twitter-bootstrap/4.4.1/js/bootstrap.min.js"></script>
<script src="./reche.js"></script>

<div>
    <div class="col">
         <input type="file" class="custom-file-input" multiple id="file">
         <label class="custom-file-label" for="file">选择文件</label>
    </div>
    <div class="col">
        <button type="button" id="upload" class="btn btn-primary">点击上传</button>
    </div>
</div>
```
在js中调用
```js
let reche = new Reche({
    chunkPath: 'http://192.168.1.7:8082/v1/user/file/uploadChunkFile',
    path: 'http://192.168.1.7:8082/v1/user/file/upload',
});

$("#upload").click(function(){
    let fileInput = document.querySelector("#file");
    reche.reche({
        files: fileInput.files,
    })
})
```



## 配置项
### option
| 名称                 | 默认值                               | 描述                                                                 |
| -------------------- | ------------------------------------| --------------------------------------------------------------------|
| chunkUse             | [Boolean] true                      | 是否开启分片上传 默认不开启                                            |
| chunkSize            | [Number] 5 << 20 （5M）             | 分片大小 默认5M                                                       |
| chunkUseSize         | [Number] 10 << 20  （10M）          | 使用分片上传时文件最小大小 默认10M                                      |
| path                 | [String] ''                         | 普通文件上传接口                                                      |
| chunkPath            | [String] ''                         | 分片上传接口                                                          |
| timeout              | [Number] 1000 * 60 *60              | 请求超时时间 默认1小时                                                 |
| chunkThreadNumber    | [Number] 5                          | 分片上传时，开启的线程数                                               |
| lang                 | [String] 'zh-cn'                    | 语言                                                                 |
| async                | [Boolean] true                      | 是否开启异步                                                          |
| headers              | [Object] {}[#headers](#headers)     | 设置请求头                                                            |
| fdKey                | [Object] [#fdKey](#fdKey)           | 设置分片上传字段的自定义key                                             |

### headers
- 设置用自定义的请求头
- 默认为空对象

### fdKey
```js
fdKey = {
    fileKey: 'file',
    chunkKey:'chunk',
    chunksKey:'chunks',
    indexKey:'index',
    fileNameKey:'fileName',
}
```

## 文件状态
```js
reche.fileStatus = {
    onWaiting: 0,//等待中
    onProgress: 1,//上传中
    onCompleted: 2,//已完成
    onStopped: 3,//已暂停
    onError: 4,//上传失败
    onCanceled: 5//已取消
}
```

## API
- `reche.reche(option:Object)`：上传文件主入口
```js
option = {
    files: File, //从表单中获取的原生文件
    data: {} //自定义的其他上传参数
}
```
- `reche.stop(fileId:String)`
    - 停止某个上传任务
    - __fileStatus__ 为 __0__ 或 __1__ 时可用
 
- `reche.resume(fileId:String)`
    - 继续某个上传任务
    - __fileStatus__ 为 __3__ 时可用

- `reche.remove(fileId:String)`
    - 删除某个上传任务
    - __fileStatus__ 为 __2__ 、__4__ 或 __5__ 时可用

- `reche.cancel(fileId:String)`
    - 取消某个上传任务
    - __fileStatus__ 为 __0__ 、 __1__ 或 __3__ 时可用

- `reche.restart(fileId:String)`
    - 重新开始某个上传任务
    - __fileStatus__ 为 __4__ 或 __5__ 时可用

- `reche.on(name:String, callback:Function)`

    [#事件监听](#事件监听) 

## 事件监听
可监听的事件列表，所有回调只有一个参数 `event:Object`
```js
recheEvents = [
    "fileStop",//文件上传暂停
    "fileResume",//文件继续上传
    "fileCancel",//文件取消上传
    "fileRestart",//文件重新上传
    "fileRemove",//文件移除
    "fileRemoveAll",//文件全部移除 【不可用】
    "fileAppend",//文件添加到任务列表
    "fileCompleteAll",//本次选择的文件上传任务全部完成
    "fileProgress",//文件上传进度改变
    "fileStatusChange"//文件状态改变
]
```

- `reche.on('fileStop',callBack)`：当调用`stop()`方法成功时触发
    - event.fileId
    - event.event
    
- `reche.on('fileResume',callBack)`：当调用`resume()`方法成功时触发
    - event.fileId
    - event.event

- `reche.on('fileCancel',callBack)`：当调用`cancel()`方法成功时触发
    - event.fileId
    - event.event
    
- `reche.on('fileRestart',callBack)`：当调用`restart()`方法成功时触发
    - event.fileId
    - event.event
    
- `reche.on('fileRemove',callBack)`：当调用`remove()`方法成功时触发
    - event.fileId
    - event.event

- `reche.on('fileAppend',callBack)`：当调用`reche()`方法成功时触发
    - event.fileId
    - event.event
    - event.fileMap

- `reche.on('fileCompleteAll',callBack)`：所有文件传完成功时触发
    - event.response
    - event.event
    
- `reche.on('fileProgress',callBack)`：由xhr原生进度事件触发
    - event.fileId
    - event.event
    - event.progress

- `reche.on('fileStatusChange',callBack)`
    - event.fileId
    - event.event
    - event.status
                                     





