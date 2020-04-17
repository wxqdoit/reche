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

vue、react
```js
import Reche from 'reche';
let r = new Reche(Object);
r.reche(Object);
``` 

## 配置项
### option
| 名称                 | 默认值                               | 描述                                                                 |
| -------------------- | ------------------------------------| --------------------------------------------------------------------|
| chunkUse             | [Boolean] true                      | 是否开启分片上传 默认开启                                              |
| chunkSize            | [Number] 5 << 20 （5M）             | 分片大小 默认5M                                                       |
| chunkUseSize         | [Number] 10 << 20 （10M）           | 使用分片上传时文件最小大小 默认10M                                      |
| path                 | [String] ''                         | 普通文件上传接口                                                      |
| chunkPath            | [String] ''                         | 分片上传接口                                                          |
| timeout              | [Number] 1000 * 60 *60              | 请求超时时间 默认1小时                                                 |
| chunkThreadNumber    | [Number] 5                          | 分片上传时开启的任务数(目前仅实现单任务，暂不可用)                         |
| chunkFirstResParamKey| [Object][#chunkFirstResParamKey](#chunkFirstResParamKey)| 分配上传时第一片上传完成返回的数据中需要回传的参数key                      |
| lang                 | [String] 'zh-cn'                    | 语言                                                                 |
| async                | [Boolean] true                      | 是否开启异步(设置为false将监听不到上传进度)                              |
| headers              | [Object] [#headers](#headers)       | 设置自定义请求头                                                       |
| fdKey                | [Object] [#fdKey](#fdKey)           | 设置分片上传字段的自定义key                                             |

### chunkFirstResParamKey
- 分配上传时第一片上传完成返回的数据中需要回传的参数key
- 默认为：
```js
chunkFirstResParamKey = {
    uploadId: 'uploadId',
    fileName: 'fileName'
};
```

### headers
- 设置用自定义的请求头
- 默认为空对象{}

### fdKey

```js
//默认配置
fdKey = {
    fileKey: 'file',//文件(片)的key
    chunkKey:'chunk',//当前片数索引key
    chunksKey:'chunks',//总片数key
    fileNameKey:'fileName',//文件名的key
    fileChunkSizeKey:"fileChunkSize",//文件块大小key
    totalSizeKey:"totalSize",//文件总大小key
};
//可自定义，如：
fdKey={
    fileKey: 'file_obj',
    chunkKey:'chunk_index',
    chunksKey:'chunks_number',
    fileNameKey:'file_name',
}
```

## fileMap对象

fileMap对象由Reche实例化后返回
```js
let reche = new Reche({});
let fileMap = reche.fileMap;
```

- 文件id为8位随机字符串，不会在上传任务中重复
- file与fileChunk只有一个有值
- netSpeed、status、progress会实时改变
```
fileMap = {
    3o8AlUdO:{
        fileId: "3o8AlUdO" //文件id
        fileName: "a0cb02df35894384b2d12822fdaa6e87.PNG" //文件名
        fileSize: 2527 //文件大小（byte）
        netSpeed: "23.50Kb/秒" //文件上传实时网速
        file: File //文件
        data: Object //上传时的自定义参数
        resParam: null //回传参数
        status: 2 //文件实时状态
        progress: 1 //文件实时上传进度
        fileChunk: Array(0) //文件块
    }
    ...
    ...
    ...
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
    "fileStatusChange",//文件状态改变
    "fileError"//文件上传失败
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
    - event.netSpeed    
    - event.progress

- `reche.on('fileStatusChange',callBack)`
    - event.fileId
    - event.event
    - event.status
    
- `reche.on('fileError',callBack)`：文件上传失败，包括请求失败和服务器返回错误
    - event.fileId
    - event.event
    - event.xhr
