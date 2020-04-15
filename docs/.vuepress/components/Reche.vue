<template>
    <div class="reche">
        <div class="container-fluid">
            <div class="container">
                <div class="form-row">
                    <div class="col">
                        <input type="file" class="custom-file-input" multiple id="file">
                        <label class="custom-file-label" for="file">选择文件</label>
                    </div>
                    <div class="col">
                        <button type="button" @click="upload" class="btn btn-primary">点击上传</button>
                    </div>
                </div>
            </div>

            <div class="container">
                <table class="table" v-if="JSON.stringify(fileMap) !== '{}'">
                    <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">文件名</th>
                        <th scope="col">文件大小</th>
                        <th scope="col">状态</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(item,index) in fileMap">
                        <th scope="row">{{item.fileId}}</th>
                        <td>{{item.fileName}}</td>
                        <td>{{item.fileSize}}</td>
                        <td>
                            <span v-if = 'item.status == 0'>{{item.percent}}%-等待中</span>
                            <span v-if = 'item.status == 1'>{{item.percent}}%-上传中</span>
                            <span v-if = 'item.status == 2'>{{item.percent}}%-上传成功</span>
                            <span v-if = 'item.status == 3'>{{item.percent}}%-已暂停</span>
                            <span v-if = 'item.status == 4'>{{item.percent}}%-上传失败</span>
                            <span v-if = 'item.status == 5'>{{item.percent}}%-已取消</span>
                        </td>
                        <td >
                            <button type="button" class="btn btn-secondary btn-sm" @click='stop(item.fileId)' v-if="item.status == 1">暂停</button>
                            <button type="button" class="btn btn-secondary btn-sm" @click='cancel(item.fileId)' v-if="item.status == 0 || item.status == 1  || item.status == 3">取消</button>
                            <button type="button" class="btn btn-secondary btn-sm" @click='resume(item.fileId)' v-if="item.status == 3">继续</button>
                            <button type="button" class="btn btn-secondary btn-sm" @click='remove(item.fileId)' v-if="item.status == 2 || item.status == 5">删除</button>
                            <button type="button" class="btn btn-secondary btn-sm" @click='restart(item.fileId)' v-if = 'item.status == 5'>重新上传</button>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        data(){
            return{
                fr: null,
                fileMap: {}
            }
        },
        mounted: function () {
            this.fr = new Reche({
                // chunkInitPath: 'http:/localhost:8088/file/upload/multiple',
                // chunkPath: 'http://localhost:8088/file/upload/multiple',
                // path: 'http://localhost:8088/file/upload/multiple',
                chunkPath: 'http://192.168.1.7:8082/v1/user/file/uploadChunkFile',
                path: 'http://192.168.1.7:8082/v1/user/file/upload',
                fdKey: {
                    fileKey: 'file',
                    chunkKey: 'chunk',
                    chunksKey: 'chunks',
                    indexKey: 'index',
                    fileName: "fileName",
                },
                chunkSize: 5 << 20,//分片大小 默认5M
                chunkUseSize: 10 << 20,//使用分片上传时文件最小大小 默认10M
                chunkFirstResParamKey: {
                    fileName: "fileName",
                    uploadId: "uploadId",
                },
                headers: {
                    token: '7a965504-1ec8-4e7b-8b00-0caf3a6dd9fd'
                },
                chunkThreadNumber: 5,//分片上传时，开启的线程数，
                chunkUse: true,//是否开启分片上传 默认开启
                async: true
            }).on('fileAppend', (e) => {
                console.log(e.event);
                this.fileMap = Object.assign({}, this.fileMap, e.fileMap)
            }).on('fileRemove', (e) => {
                console.log(e.event);
                Vue.delete(this.fileMap, e.fileId);
            }).on('fileCompleteAll', (e) => {
                console.log(e.event);
            }).on('fileProgress', (e) => {
                console.log(e.event);
                let file = this.fileMap[e.fileId];
                file.percent = (e.progress * 100).toFixed(2);
                this.$set(this.fileMap, e.fileId, file)
            }).on('fileStatusChange', (e) => {
                console.log(e.event);
                let file = this.fileMap[e.fileId];
                file.status = e.status;
                this.$set(this.fileMap, e.fileId, file)
            }).on('fileStop', (e) => {
                console.log(e)
            }).on('fileResume', (e) => {
                console.log(e)
            }).on('fileRestart', (e) => {
                console.log(e)
            });
        },
        methods: {
            stop(fileId) {
                this.fr.stop(fileId)
            },
            remove(fileId) {
                this.fr.remove(fileId)
            },
            cancel(fileId) {
                this.fr.cancel(fileId)
            },
            resume(fileId) {
                this.fr.resume(fileId)
            },
            restart(fileId) {
                this.fr.restart(fileId)
            },
            upload() {
                let fileInput = document.querySelector("#file");
                this.fr.reche({
                    files: fileInput.files,
                    data: {}
                })

            }
        },
        beforeDestroy: function () {

        }
    }
</script>
<style>
</style>