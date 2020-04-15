<template>
    <div class="reche">
        <div class="container-fluid">
            <div class="container">
                <div class="row">
                    <div id='divHabilitSelectors' class="input-file-container">
                        <input class="input-file" id="fileupload" name="files" type="file" multiple>
                        <label for="fileupload" class="input-file-trigger" id='labelFU'>选择文件</label>
                    </div>
                </div>
            </div>
            <div class="container">
                <div class="table-x">
                    <!-- 列表 -->
                    <table  class="ui-table">
                        <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">文件名</th>
                            <th scope="col">文件大小</th>
                            <th scope="col">状态</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody v-if="JSON.stringify(fileMap) !== '{}'">
                        <tr v-for="(item,index) in fileMap">
                            <th scope="row">{{item.fileId}}</th>
                            <td>{{item.fileName}}</td>
                            <td>{{item.fileSize}}</td>
                            <td>
                                <span v-if='item.status == 0'>{{item.percent}}%-等待中</span>
                                <span v-if='item.status == 1'>{{item.percent}}%-上传中</span>
                                <span v-if='item.status == 2'>{{item.percent}}%-上传成功</span>
                                <span v-if='item.status == 3'>{{item.percent}}%-已暂停</span>
                                <span v-if='item.status == 4'>{{item.percent}}%-上传失败</span>
                                <span v-if='item.status == 5'>{{item.percent}}%-已取消</span>
                            </td>
                            <td>
                                <button type="button" class="btn btn-secondary btn-sm" @click='stop(item.fileId)'
                                        v-if="item.status == 1">暂停
                                </button>
                                <button type="button" class="btn btn-secondary btn-sm" @click='cancel(item.fileId)'
                                        v-if="item.status == 0 || item.status == 1  || item.status == 3">取消
                                </button>
                                <button type="button" class="btn btn-secondary btn-sm" @click='resume(item.fileId)'
                                        v-if="item.status == 3">继续
                                </button>
                                <button type="button" class="btn btn-secondary btn-sm" @click='remove(item.fileId)'
                                        v-if="item.status == 2 || item.status == 5">删除
                                </button>
                                <button type="button" class="btn btn-secondary btn-sm" @click='restart(item.fileId)'
                                        v-if='item.status == 5'>重新上传
                                </button>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>


            </div>
        </div>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                fr: null,
                fileMap: {}
            }
        },
        props: {
            loaded: {
                type: Boolean,
                default: false,
            }
        },
        mounted: function () {
            //window.Reche
            if(window.Reche){
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
            }else {
                console.log(window.Reche)
            }
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
                let fileInput = document.querySelector("#fileupload");
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

    .container-fluid, .container {
        padding-left: 0 !important;
        padding-right: 0 !important;

    }

    .row {
        margin-right: 0 !important;
        margin-left: 0 !important;
    }

    .input-file-container {
        position: relative;
        text-align: center;
    }

    .input-file-trigger {
        display: block;
        padding: 14px 45px;
        background: #8A94BE;
        color: white;
        font-size: 1em;
        transition: all .4s;
        cursor: pointer;
        border-radius: 90px;
    }

    .input-file {
        position: absolute;
        top: 0;
        left: 0;
        width: 225px;
        padding: 14px 0;
        opacity: 0;
        cursor: pointer;
    }

    .input-file:hover + .input-file-trigger,
    .input-file:focus + .input-file-trigger,
    .input-file-trigger:hover,
    .input-file-trigger:focus {
        background: #46bd87;
        text-decoration: none !important;
    }

</style>