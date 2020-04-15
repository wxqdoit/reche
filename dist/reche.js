(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Reche = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(_dereq_,module,exports){
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;
},{}],2:[function(_dereq_,module,exports){
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

module.exports = _createClass;
},{}],3:[function(_dereq_,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
},{}],4:[function(_dereq_,module,exports){
function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

module.exports = _typeof;
},{}],5:[function(_dereq_,module,exports){
"use strict";

var _interopRequireDefault = _dereq_("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(_dereq_("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(_dereq_("@babel/runtime/helpers/createClass"));

var Event = /*#__PURE__*/function () {
  function Event() {
    (0, _classCallCheck2["default"])(this, Event);
    this.event = {};
    this.xhrEvent = ['onloadstart', 'onprogress', 'onabort', 'ontimeout', 'onerror', 'onload', 'onloadend', 'onreadystatechange'];
    this.recheEvents = ["fileStop", "fileResume", "fileCancel", "fileRestart", "fileRemove", "fileRemoveAll", "fileAppend", "fileCompleteAll", "fileProgress", "fileStatusChange"];
  }

  (0, _createClass2["default"])(Event, [{
    key: "on",
    value: function on(name, callback) {
      if (this.detectEventType(name) && typeof callback === 'function') {
        if (!this.event[name]) {
          this.event[name] = [];
        }

        this.event[name].push(callback);
      }
    }
    /**
     * 事件触发器
     * @param name 事件名
     * @param info 信息？？？ 传入回调的，具体是作甚的还需要往下看
     */

  }, {
    key: "trigger",
    value: function trigger(name, info) {
      if (this.event[name] && this.event[name].length) {
        for (var i = 0; i < this.event[name].length; i++) {
          this.event[name][i](info);
        }
      }
    }
  }, {
    key: "detectEventType",
    value: function detectEventType(name) {
      if (this.recheEvents.indexOf(name) !== -1) {
        return 'recheEvents';
      } else if (this.xhrEvent.indexOf(name) !== -1) {
        return 'xhrEvent';
      }

      console.error("Unknown event name: ".concat(name));
      return null;
    }
  }]);
  return Event;
}();

exports["default"] = Event;

},{"@babel/runtime/helpers/classCallCheck":1,"@babel/runtime/helpers/createClass":2,"@babel/runtime/helpers/interopRequireDefault":3}],6:[function(_dereq_,module,exports){
"use strict";

var _interopRequireDefault = _dereq_("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(_dereq_("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(_dereq_("@babel/runtime/helpers/createClass"));

var FileSlice = /*#__PURE__*/function () {
  function FileSlice(reche) {
    (0, _classCallCheck2["default"])(this, FileSlice);
    this.reche = reche;
  }
  /**
   * 文件分片处理逻辑
   * @param file 原生file
   * @param data 其他參數
   * @returns {{fileName: *, file: null, fileSize: *, fileChunk: Array, percent: number, fileId: *}}
   */


  (0, _createClass2["default"])(FileSlice, [{
    key: "fileSlice",
    value: function fileSlice(file, data) {
      var fileId = this.reche.util.randomString(8);
      var fileSliced = {
        fileId: fileId,
        fileName: file.name,
        fileSize: file.size,
        file: null,
        data: data,
        resParam: null,
        status: this.reche.fileStatus.onWaiting,
        percent: 0,
        fileChunk: []
      };

      if (file.size <= this.reche.option.chunkUseSize) {
        //普通
        fileSliced.file = file;
      } else {
        var index = 0; //切片索引

        var start = 0; //切片开始位置

        var end = 0; //切片结束位置

        var chunkSize = this.reche.option.chunkSize; // 配置中读取切块大小

        var totalSlices = Math.ceil(file.size / chunkSize); // 计算文件切片总数（向上取整）

        while (index < totalSlices) {
          //分片
          var chunkObj = {
            fileChunkSize: 0,
            fileId: fileId,
            index: 0,
            chunk: null
          };
          start = index * chunkSize;
          end = start + chunkSize; //切割文件

          var chunk = file.slice(start, end);
          index++;
          chunkObj.chunk = chunk;
          chunkObj.index = index;
          chunkObj.fileChunkSize = chunk.size;
          fileSliced.fileChunk.push(chunkObj);
        }
      }

      return fileSliced;
    }
  }]);
  return FileSlice;
}();

exports["default"] = FileSlice;

},{"@babel/runtime/helpers/classCallCheck":1,"@babel/runtime/helpers/createClass":2,"@babel/runtime/helpers/interopRequireDefault":3}],7:[function(_dereq_,module,exports){
"use strict";

var _interopRequireDefault = _dereq_("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(_dereq_("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(_dereq_("@babel/runtime/helpers/createClass"));

var I18n = /*#__PURE__*/function () {
  function I18n(lang) {
    (0, _classCallCheck2["default"])(this, I18n);
    this.lang = lang;
    this.txt = {
      'zh-cn': {
        unSupportXhr: '您的浏览器不支持XHR请求',
        cannotStopByProgress: '正在创建文件不能暂停',
        cannotStopByUploaded: '文件已上传完成不能暂停',
        cannotStop: '当前文件状态不能暂停'
      }
    };
  }

  (0, _createClass2["default"])(I18n, [{
    key: "i18n",
    value: function i18n(name) {
      if (this.txt[this.lang] && this.txt[this.lang][name]) {
        return this.txt[this.lang][name];
      } else {
        return name;
      }
    }
  }]);
  return I18n;
}();

exports["default"] = I18n;

},{"@babel/runtime/helpers/classCallCheck":1,"@babel/runtime/helpers/createClass":2,"@babel/runtime/helpers/interopRequireDefault":3}],8:[function(_dereq_,module,exports){
"use strict";

var _interopRequireDefault = _dereq_("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(_dereq_("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(_dereq_("@babel/runtime/helpers/createClass"));

/**
 * 配置处理
 */
var Option = /*#__PURE__*/function () {
  function Option() {
    (0, _classCallCheck2["default"])(this, Option);
    this.defaultOption = {
      chunkUse: true,
      //是否开启分片上传 默认不开启
      chunkSize: 5 << 20,
      //分片大小 默认5M
      chunkUseSize: 10 << 20,
      //使用分片上传时文件最小大小 默认10M
      path: '',
      //上传接口 如果开启分片上传而没有chunkInitPath和chunkPath时 使用path
      chunkInitPath: '',
      //分片上传初始化接口 chunkInitPath和chunkPath应该合并
      chunkPath: '',
      //分片上传接口
      timeout: 1000 * 60 * 60,
      //请求超时时间 默认1小时
      chunkThreadNumber: 5,
      //分片上传时，开启的线程数，
      lang: 'zh-cn',
      //语言 默认中文
      async: true,
      headers: {},
      fdKey: {}
    };
  }

  (0, _createClass2["default"])(Option, [{
    key: "optionInit",
    value: function optionInit(option) {
      for (var item in this.defaultOption) {
        if (this.defaultOption.hasOwnProperty(item) && !option.hasOwnProperty(item)) {
          option[item] = this.defaultOption[item];
        }
      }

      var fdKey = {
        fileKey: 'file',
        chunkKey: 'chunk',
        chunksKey: 'chunks',
        indexKey: 'index',
        fileNameKey: 'fileName'
      };

      if (option.fdKey) {
        for (var _item in fdKey) {
          option.fdKey[_item] = option.fdKey[_item] ? option.fdKey[_item] : fdKey[_item];
        }
      } else {
        option.fdKey = fdKey;
      }

      return option;
    }
  }]);
  return Option;
}();

exports["default"] = Option;

},{"@babel/runtime/helpers/classCallCheck":1,"@babel/runtime/helpers/createClass":2,"@babel/runtime/helpers/interopRequireDefault":3}],9:[function(_dereq_,module,exports){
"use strict";

var _interopRequireDefault = _dereq_("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(_dereq_("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(_dereq_("@babel/runtime/helpers/createClass"));

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
var Queue = /*#__PURE__*/function () {
  function Queue(reche) {
    (0, _classCallCheck2["default"])(this, Queue);
    this.reche = reche;
    this.fileStoppedId = [];
    this.queue = {
      fileChunkOnWaiting: [],
      //等待上传的队列
      fileChunkOnProgress: [],
      //正在上传的队列
      fileChunkOnCompleted: [],
      //上传成功的队列
      fileChunkOnError: [],
      //上传失败的队列
      fileChunkStopped: [] //暂停中的文件

    };
  }
  /**
   * 将文件(块)从各个队列中移除
   * @param fileId
   */


  (0, _createClass2["default"])(Queue, [{
    key: "deleteChunkOfQueue",
    value: function deleteChunkOfQueue(fileId) {
      for (var item in this.queue) {
        var tempObj = [];

        for (var i = 0; i < this.queue[item].length; i++) {
          if (this.queue[item][i].fileId !== fileId) {
            tempObj.push(Object.assign({}, this.queue[item][i]));
          }
        }

        this.queue[item] = tempObj;
      }
    }
    /**
     * 将某个状态的文件队列中的某个文件的块前移
     * @param queueName
     * @param fileId
     */

  }, {
    key: "preposition",
    value: function preposition(queueName, fileId) {
      var tempArr = [];
      var otherThisArr = [];

      for (var i = 0; i < this.queue[queueName].length; i++) {
        var aObj = Object.assign({}, this.queue[queueName][i]);

        if (this.queue[queueName][i].fileId === fileId) {
          tempArr.push(aObj);
        } else {
          otherThisArr.push(aObj);
        }
      }

      this.queue[queueName] = tempArr.concat(otherThisArr);
    }
    /**
     * 重置任务队列
     */

  }, {
    key: "resetChunkQueue",
    value: function resetChunkQueue() {
      this.queue = {
        fileChunkOnWaiting: [],
        fileChunkOnProgress: [],
        fileChunkOnCompleted: [],
        fileChunkOnError: [],
        fileChunkStopped: []
      };
    }
    /**
     * 队列中移除指定fileId任务，fileId不传即删除所有任务
     * @param fileId
     */

  }, {
    key: "removeFileChunk",
    value: function removeFileChunk() {
      var fileId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      if (fileId) {
        this.deleteChunkOfQueue(fileId);
      } else {
        this.resetChunkQueue();
      } //停止所有xhr任务


      this.reche.abortAndRemoveXhr(fileId);
    }
    /**
     * 添加文件到文件列表和文件上传队列
     * @param fileSliced
     * @returns {Queue}
     */

  }, {
    key: "appendFileChunkQueue",
    value: function appendFileChunkQueue(fileSliced) {
      if (fileSliced.file && !fileSliced.fileChunk.length) {
        this.queue.fileChunkOnWaiting.push({
          fileId: fileSliced.fileId,
          index: -1,
          //这是一整个文件
          fileChunkSize: fileSliced.fileSize,
          chunk: fileSliced.file,
          data: fileSliced.data
        });
      } else {
        this.queue.fileChunkOnWaiting = this.queue.fileChunkOnWaiting.concat(fileSliced.fileChunk);
      }
    }
    /**
     * 队列任务分发
     * 将一个个文件（块）从等待队列转入上传队列
     * @returns {boolean|*}
     */

  }, {
    key: "dispatch",
    value: function dispatch() {
      //判断是否有暂停的任务
      var index = 0;
      var kIndex = -1;

      if (this.fileStoppedId.length) {
        for (var k = 0; k < this.queue.fileChunkOnWaiting.length; k++) {
          var tag = true;

          for (var i = 0; i < this.fileStoppedId.length; i++) {
            if (this.fileStoppedId[i] === this.queue.fileChunkOnWaiting[k].fileId) {
              tag = !tag;
              break;
            }
          }

          if (tag) {
            index = k;
            break;
          }

          kIndex = k;
        }
      }

      if (kIndex === this.queue.fileChunkOnWaiting.length - 1) {
        return false;
      } else {
        if (this.queue.fileChunkOnWaiting.length) {
          var fChunk = this.queue.fileChunkOnWaiting.splice(index, 1)[0];
          this.queue.fileChunkOnProgress.push(fChunk);
          return fChunk;
        } else {
          console.warn('no fileChunk in fileChunkOnWaiting');
        }
      }
    }
    /**
     * 将文件（块）从上传中移入已完成
     * @param chunk
     * @returns {*}
     */

  }, {
    key: "formProgressToCompleted",
    value: function formProgressToCompleted(chunk) {
      for (var i = 0; i < this.queue.fileChunkOnProgress.length; i++) {
        if (chunk.fileId === this.queue.fileChunkOnProgress[i].fileId && chunk.index === this.queue.fileChunkOnProgress[i].index) {
          var fChunk = this.queue.fileChunkOnProgress.splice(i, 1)[0];
          this.queue.fileChunkOnCompleted.push(fChunk);
          return fChunk;
        }
      }
    }
  }, {
    key: "forProgressToError",
    value: function forProgressToError(fileId) {}
  }, {
    key: "formWaitingToStopped",
    value: function formWaitingToStopped(fileId) {}
  }, {
    key: "formStoppedToWaiting",
    value: function formStoppedToWaiting(fileId) {}
    /**
     * 是否完成某个文件的任务
     * @param fileId
     * @returns {boolean}
     */

  }, {
    key: "isComplete",
    value: function isComplete(fileId) {
      var tag = 0;

      for (var i = 0; i < this.queue.fileChunkOnCompleted.length; i++) {
        if (this.queue.fileChunkOnCompleted[i].fileId === fileId) {
          tag += 1;
        }
      }

      return tag === this.reche.fileMap[fileId].fileChunk.length;
    }
    /**
     * 是否完成了当前选择的所有文件的任务
     * @returns {boolean}
     */

  }, {
    key: "isCompleteAll",
    value: function isCompleteAll() {
      var statusAllComplete = true;

      for (var item in this.reche.fileMap) {
        if (this.reche.fileMap[item].status !== this.reche.fileStatus.onCompleted) {
          statusAllComplete = false;
          break;
        }
      }

      return this.queue.fileChunkOnWaiting.length === 0 && this.queue.fileChunkStopped.length === 0 && this.queue.fileChunkOnProgress.length === 0 && this.queue.fileChunkOnError.length === 0 && this.reche.xhrList.length === 0 && statusAllComplete;
    }
  }]);
  return Queue;
}();

exports["default"] = Queue;

},{"@babel/runtime/helpers/classCallCheck":1,"@babel/runtime/helpers/createClass":2,"@babel/runtime/helpers/interopRequireDefault":3}],10:[function(_dereq_,module,exports){
"use strict";

var _interopRequireDefault = _dereq_("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(_dereq_("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(_dereq_("@babel/runtime/helpers/createClass"));

var _Util = _interopRequireDefault(_dereq_("./Util"));

var _Xhr = _interopRequireDefault(_dereq_("./Xhr"));

var _Event = _interopRequireDefault(_dereq_("./Event"));

var _I18n = _interopRequireDefault(_dereq_("./I18n"));

var _Option = _interopRequireDefault(_dereq_("./Option"));

var _Queue = _interopRequireDefault(_dereq_("./Queue"));

var _FileSlice = _interopRequireDefault(_dereq_("./FileSlice"));

/**
 *   啊

 今天都是好日子

 千金的光阴不能等

 明天又是好日子

 赶上了盛世咱享太平

 今天是个好日子

 心想的事儿都能成
 */
var Reche = /*#__PURE__*/function () {
  function Reche(option) {
    (0, _classCallCheck2["default"])(this, Reche);
    this.fileMap = {};
    this.util = new _Util["default"](this);
    this.option = new _Option["default"]().optionInit(option);
    this.event = new _Event["default"]();
    this.i18n = new _I18n["default"](this.option.lang);
    this.queue = new _Queue["default"](this);
    this.fileSlice = new _FileSlice["default"](this);
    this.fileStatus = {
      onWaiting: 0,
      //等待中
      onProgress: 1,
      //上传中
      onCompleted: 2,
      //已完成
      onStopped: 3,
      //已暂停
      onError: 4,
      //上传失败
      onCanceled: 5 //已取消

    };
    this.xhrList = [];
  }
  /**
   * 文件解析上传主入口
   * @param option
   * @returns {{}|*}
   */


  (0, _createClass2["default"])(Reche, [{
    key: "reche",
    value: function reche(option) {
      var files = option.files;
      var data = this.util.isObject(option.data) ? option.data : null;

      if (files.length) {
        for (var i = 0; i < files.length; i++) {
          var fileSliced = this.fileSlice.fileSlice(files[i], data);
          this.fileMap[fileSliced.fileId] = fileSliced;
          this.queue.appendFileChunkQueue(fileSliced);
          this.event.trigger('fileAppend', {
            event: 'event:::fileAppend',
            file: files,
            fileMap: this.fileMap
          });
          this.event.trigger('fileStatusChange', {
            event: 'event:::fileStatusChange',
            fileId: fileSliced.fileId,
            status: this.fileStatus.onWaiting
          });
        }

        this.exeXhr();
      }
    }
  }, {
    key: "exeXhr",
    value: function exeXhr() {
      if (this.xhrList.length === 0 && this.queue.queue.fileChunkOnWaiting.length) {
        var fc = this.queue.dispatch();

        if (fc) {
          var xhr = new _Xhr["default"](this);
          this.xhrList.push(xhr);
          xhr.sendXhr(fc);
        }
      }
    }
  }, {
    key: "abortAndRemoveXhr",
    value: function abortAndRemoveXhr() {
      var fileId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      if (fileId) {
        for (var i = 0; i < this.xhrList.length; i++) {
          if (fileId === this.xhrList[i].fileOrChunk.fileId) {
            this.xhrList[i].abortXhr();
            this.xhrList.splice(i, 1);
            return;
          }
        }
      } else {
        for (var _i = 0; _i < this.xhrList.length; _i++) {
          this.xhrList[_i].abortXhr();

          this.xhrList = [];
        }
      }
    }
    /**
     * 删除所有上传任务
     * todo 暂时不启用
     * @returns {{fileMap: ({}|*)}}
     */
    // removeAll() {
    //     this.fileMap = {};
    //     this.queue.removeFileChunk();
    //     this.abortAndRemoveXhr();
    //     this.event.trigger('fileRemoveAll', {
    //         event: 'event:::fileRemoveAll',
    //         fileMap: this.fileMap
    //     });
    // }

    /**
     * 删除某个上传任务
     * @param fileId
     * @returns {{fileMap: ({}|*), fileId: *}}
     */

  }, {
    key: "remove",
    value: function remove(fileId) {
      if (this.fileMap[fileId]) {
        if (this.fileMap[fileId].status === this.fileStatus.onCanceled || this.fileMap[fileId].status === this.fileStatus.onCompleted) {
          delete this.fileMap[fileId];
          this.queue.removeFileChunk(fileId);
          this.abortAndRemoveXhr(fileId);
          this.event.trigger('fileRemove', {
            event: 'event:::fileRemove',
            fileId: fileId
          });
        }
      }
    }
  }, {
    key: "stop",
    value: function stop(fileId) {
      if (this.fileMap[fileId]) {
        if (this.fileMap[fileId].file) {
          this.event.trigger('fileStop', {
            event: 'event:::fileStop',
            fileId: fileId,
            canStop: false,
            message: this.i18n.i18n('cannotStopByProgress')
          });
        } else {
          if (this.fileMap[fileId].status === this.fileStatus.onWaiting || this.fileMap[fileId].status === this.fileStatus.onProgress) {
            this.queue.fileStoppedId.push(fileId);
            this.fileMap[fileId].status = this.fileStatus.onStopped;
            this.event.trigger('fileStop', {
              event: 'event:::fileStop',
              fileId: fileId
            });
            this.event.trigger('fileStatusChange', {
              event: 'event:::fileStatusChange',
              fileId: fileId,
              status: this.fileStatus.onStopped
            });
          } else {
            this.event.trigger('fileStop', {
              event: 'event:::fileStop',
              fileId: fileId,
              canStop: false,
              message: this.i18n.i18n('cannotStop')
            });
          }
        }
      }
    }
  }, {
    key: "changeFileStatus",
    value: function changeFileStatus() {
      var fileId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var excludeFileId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var formStatus = arguments.length > 2 ? arguments[2] : undefined;
      var toStatus = arguments.length > 3 ? arguments[3] : undefined;

      if (fileId) {
        if (this.fileMap[fileId].status !== toStatus) {
          this.fileMap[fileId].status = toStatus;
          this.event.trigger('fileStatusChange', {
            event: 'event:::fileStatusChange',
            fileId: fileId,
            status: toStatus
          });
        }
      } else {
        for (var item in this.fileMap) {
          if (item !== excludeFileId && this.fileMap[item].status === formStatus) {
            this.fileMap[item].status = toStatus;
            this.event.trigger('fileStatusChange', {
              event: 'event:::fileStatusChange',
              fileId: fileId,
              status: toStatus
            });
          }
        }
      }
    }
  }, {
    key: "removeFileIdFormStoppedId",
    value: function removeFileIdFormStoppedId(fileId) {
      for (var i = 0; i < this.queue.fileStoppedId.length; i++) {
        if (fileId === this.queue.fileStoppedId[i]) {
          this.queue.fileStoppedId.splice(i, 1);
          break;
        }
      }
    }
  }, {
    key: "resume",
    value: function resume(fileId) {
      if (this.fileMap[fileId] && this.fileMap[fileId].status === this.fileStatus.onStopped) {
        console.log(this.queue.queue.fileChunkOnProgress);

        if (this.queue.queue.fileChunkOnProgress.length === 0) {
          this.changeFileStatus(null, fileId, this.fileStatus.onProgress, this.fileStatus.onWaiting);
          this.removeFileIdFormStoppedId(fileId);
          this.abortAndRemoveXhr(fileId);
          this.queue.preposition('fileChunkOnWaiting', fileId);
          this.event.trigger('fileResume', {
            event: 'event:::fileResume',
            fileId: fileId
          });
          this.exeXhr();
        }
      }
    }
  }, {
    key: "restart",
    value: function restart(fileId) {
      if (this.fileMap[fileId]) {
        if (this.fileMap[fileId].status === this.fileStatus.onCanceled || this.fileMap[fileId].status === this.fileStatus.onError) {
          /**
           * 1、改变文件状态为等待状态
           * 2、将文件块添加到等待队列
           */
          this.changeFileStatus(fileId, null, null, this.fileStatus.onWaiting);
          this.queue.appendFileChunkQueue(this.fileMap[fileId]);
          this.event.trigger('fileRestart', {
            event: 'event:::fileRestart',
            fileId: fileId
          });
          this.exeXhr();
        }
      }
    }
  }, {
    key: "cancel",
    value: function cancel(fileId) {
      if (this.fileMap[fileId]) {
        if (this.fileMap[fileId].status === this.fileStatus.onWaiting || this.fileMap[fileId].status === this.fileStatus.onStopped || this.fileMap[fileId].status === this.fileStatus.onProgress) {
          this.removeFileIdFormStoppedId(fileId);
          this.changeFileStatus(fileId, null, null, this.fileStatus.onCanceled);
          this.abortAndRemoveXhr(fileId);
          this.queue.removeFileChunk(fileId);
          this.event.trigger('fileCancel', {
            event: 'event:::fileCancel',
            fileId: fileId
          });
          this.fileMap[fileId].progress = 0;
          this.event.trigger('fileProgress', {
            event: 'event:::fileProgress',
            fileId: fileId,
            progress: 0
          });
        }
      }
    }
  }, {
    key: "on",
    value: function on(name, callback) {
      this.event.on(name, callback);
      return this;
    }
  }]);
  return Reche;
}();

Object.defineProperty(Reche, 'version', {
  enumerable: true,
  get: function get() {
    // replaced by browserify-versionify transform
    return '0.0.1';
  }
});
var _default = Reche;
exports["default"] = _default;

},{"./Event":5,"./FileSlice":6,"./I18n":7,"./Option":8,"./Queue":9,"./Util":11,"./Xhr":12,"@babel/runtime/helpers/classCallCheck":1,"@babel/runtime/helpers/createClass":2,"@babel/runtime/helpers/interopRequireDefault":3}],11:[function(_dereq_,module,exports){
"use strict";

var _interopRequireDefault = _dereq_("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _typeof2 = _interopRequireDefault(_dereq_("@babel/runtime/helpers/typeof"));

var _classCallCheck2 = _interopRequireDefault(_dereq_("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(_dereq_("@babel/runtime/helpers/createClass"));

var Util = /*#__PURE__*/function () {
  function Util(reche) {
    (0, _classCallCheck2["default"])(this, Util);
    this.reche = reche;
    this.fileStatus = {
      onWaiting: 0,
      //等待中
      onProgress: 1,
      //上传中
      onStopped: 2,
      //已暂停
      onCompleted: 3,
      //已完成
      onError: 4,
      //上传失败
      onCanceled: 5 //已取消

    };
  }

  (0, _createClass2["default"])(Util, [{
    key: "isNull",
    value: function isNull(val) {
      return val === null;
    }
  }, {
    key: "isNullString",
    value: function isNullString(val) {
      return val === "";
    }
  }, {
    key: "isObject",
    value: function isObject(val) {
      if (val !== null && (0, _typeof2["default"])(val) === "object") {
        return val.constructor === Object;
      }

      return false;
    }
  }, {
    key: "isUndefined",
    value: function isUndefined(val) {
      return val === undefined;
    }
  }, {
    key: "isNumber",
    value: function isNumber(val) {
      return typeof val === 'number';
    }
  }, {
    key: "isString",
    value: function isString(val) {
      return typeof val === 'string';
    }
  }, {
    key: "isBoolean",
    value: function isBoolean(val) {
      return val === true || val === false;
    }
  }, {
    key: "isTrue",
    value: function isTrue(val) {
      return val === true;
    }
  }, {
    key: "randomString",
    value: function randomString(len) {
      var str = "";
      var range = len;
      var arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

      for (var i = 0; i < range; i++) {
        var pos = Math.round(Math.random() * (arr.length - 1));
        str += arr[pos];
      }

      if (this.reche.fileMap[str]) {
        this.randomString(len);
      } else {
        return str;
      }
    }
  }, {
    key: "isFalse",
    value: function isFalse(val) {
      return val === false;
    }
  }, {
    key: "isArray",
    value: function isArray(val) {
      return val instanceof Array;
    }
  }]);
  return Util;
}();

exports["default"] = Util;

},{"@babel/runtime/helpers/classCallCheck":1,"@babel/runtime/helpers/createClass":2,"@babel/runtime/helpers/interopRequireDefault":3,"@babel/runtime/helpers/typeof":4}],12:[function(_dereq_,module,exports){
"use strict";

var _interopRequireDefault = _dereq_("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(_dereq_("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(_dereq_("@babel/runtime/helpers/createClass"));

var Xhr = /*#__PURE__*/function () {
  function Xhr(reche) {
    (0, _classCallCheck2["default"])(this, Xhr);
    this.reche = reche;
    this.xhr = this.initXhr();
    this.progress = 0;
    this.fileOrChunk = null;
  }
  /**
   * 初始化一个XHR，但是不发送 ，不执行send方法
   * @returns {XMLHttpRequest|null}
   */


  (0, _createClass2["default"])(Xhr, [{
    key: "initXhr",
    value: function initXhr() {
      var _this = this;

      var xhr = null;

      if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
      } else if (window.ActiveXObject) {
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
      } else {
        console.warn(this.reche.i18n.i18n('unSupportXhr'));
        return xhr;
      }

      if (this.reche.option.async) {
        xhr.timeout = this.reche.option.timeout;

        xhr.upload.ontimeout = function (e) {
          console.log('ontimeout::', e);
        };
      }

      xhr.upload.onprogress = function (e) {
        var progress = 0;

        if (e.lengthComputable) {
          _this.progress = e.loaded / e.total;

          if (_this.fileOrChunk.index === -1) {
            progress = e.loaded / e.total;
          } else {
            var totalUpSize = 0; //获取整个文件上传进度

            for (var i = 0; i < _this.reche.xhrList.length; i++) {
              totalUpSize += _this.reche.xhrList[i].fileOrChunk.fileChunkSize * _this.progress;
            }

            for (var n = 0; n < _this.reche.queue.queue.fileChunkOnCompleted.length; n++) {
              if (_this.fileOrChunk.fileId === _this.reche.queue.queue.fileChunkOnCompleted[n].fileId) {
                totalUpSize += _this.reche.queue.queue.fileChunkOnCompleted[n].fileChunkSize;
              }
            }

            progress = totalUpSize / _this.reche.fileMap[_this.fileOrChunk.fileId].fileSize;
          }
        }

        _this.reche.fileMap[_this.fileOrChunk.fileId].progress = progress;

        _this.reche.event.trigger('fileProgress', {
          event: 'event:::fileProgress',
          fileId: _this.fileOrChunk.fileId,
          progress: progress
        });
      };

      xhr.upload.onerror = function (e) {
        console.log('onerror::', e);
      };

      xhr.upload.onabort = function (e) {
        console.log('onabort::', e);
      };

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            var resJson = JSON.parse(xhr.response);

            if (Number(resJson.status) === 200) {
              // 这里已经传完了
              // 1、文件上传队列位置改变
              var fileOfMap = _this.reche.fileMap[_this.fileOrChunk.fileId];
              console.log("当前文件总块数：" + fileOfMap.fileChunk.length + "----已完成完成块数：" + _this.fileOrChunk.index);

              _this.reche.queue.formProgressToCompleted(_this.fileOrChunk);

              if (_this.fileOrChunk.index === -1) {
                // 如果是小文件上传
                _this.reche.changeFileStatus(_this.fileOrChunk.fileId, null, null, _this.reche.fileStatus.onCompleted);
              } else {
                // 如果是当前大文件块的第一块 绑定设置回传参数
                if (_this.fileOrChunk.index === 1) {
                  var resParam = {};
                  var cusfrpk = _this.reche.option.chunkFirstResParamKey;

                  if (resJson.data) {
                    for (var item in cusfrpk) {
                      resParam[cusfrpk[item]] = resJson.data[cusfrpk[item]];
                    }

                    _this.reche.fileMap[_this.fileOrChunk.fileId].resParam = resParam;
                  }
                } //判断整个文件是否上传完


                if (_this.reche.queue.isComplete(_this.fileOrChunk.fileId)) {
                  // 文件状态改变
                  _this.reche.changeFileStatus(_this.fileOrChunk.fileId, null, null, _this.reche.fileStatus.onCompleted);
                }
              } //本次任务完成 停止并移除Xhr


              _this.reche.abortAndRemoveXhr(_this.fileOrChunk.fileId); // 判断是否所有任务完成


              if (_this.reche.queue.isCompleteAll()) {
                _this.reche.event.trigger('fileCompleteAll', {
                  event: 'event:::fileCompleteAll',
                  response: xhr.response
                });
              } else {
                //执行下次任务
                _this.reche.exeXhr();
              }
            } else {// todo 请求成功但是上传失败
            }
          } else {// todo 请求失败
            }
        }
      };

      return xhr;
    }
    /**
     * 发送请求
     * @param fileOrChunk
     */

  }, {
    key: "sendXhr",
    value: function sendXhr(fileOrChunk) {
      this.fileOrChunk = fileOrChunk;

      if (this.xhr) {
        var fd = this.buildFormData(fileOrChunk);

        if (this.reche.fileMap[fileOrChunk.fileId].status !== this.reche.fileStatus.onProgress) {
          this.reche.changeFileStatus(this.fileOrChunk.fileId, null, null, this.reche.fileStatus.onProgress);
        }

        var path = this.fileOrChunk.index === -1 ? this.reche.option.path : this.reche.option.chunkPath;
        this.xhr.open('POST', path, this.reche.option.async);
        this.setXhrHeader(this.xhr, this.reche.option.headers);
        this.xhr.send(fd);
      }
    }
    /**
     * 构建formdata数据
     * @param fileOrChunk
     * @returns {FormData}
     */

  }, {
    key: "buildFormData",
    value: function buildFormData(fileOrChunk) {
      var formData = new FormData();
      formData.append(this.reche.option.fdKey.fileKey, fileOrChunk.chunk);
      formData.append(this.reche.option.fdKey.chunkKey, fileOrChunk.index);
      formData.append(this.reche.option.fdKey.chunksKey, this.reche.fileMap[fileOrChunk.fileId].fileChunk.length.toString());
      var resParam = this.reche.fileMap[fileOrChunk.fileId].resParam;

      if (!resParam) {
        formData.append(this.reche.option.fdKey.fileNameKey, this.reche.fileMap[fileOrChunk.fileId].fileName);
      }

      if (resParam) {
        for (var item in resParam) {
          formData.append(item, resParam[item]);
        }
      }

      if (this.reche.util.isObject(fileOrChunk.data) && fileOrChunk.data.toString() !== '{}') {
        for (var _item in fileOrChunk.data) {
          formData.append(_item, fileOrChunk.data[_item]);
        }
      }

      return formData;
    }
    /**
     * 终止请求
     * todo 在这里终止请求好像并没有什么卵用，需要继续测试
     */

  }, {
    key: "abortXhr",
    value: function abortXhr() {
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

  }, {
    key: "setXhrHeader",
    value: function setXhrHeader(xhr, headers) {
      if (this.reche.util.isObject(headers) && headers.toString() !== '{}') {
        for (var item in headers) {
          xhr.setRequestHeader(item, headers[item]);
        }
      }
    }
  }]);
  return Xhr;
}();

exports["default"] = Xhr;

},{"@babel/runtime/helpers/classCallCheck":1,"@babel/runtime/helpers/createClass":2,"@babel/runtime/helpers/interopRequireDefault":3}],13:[function(_dereq_,module,exports){
"use strict";

module.exports = _dereq_('./core/Reche')["default"];

},{"./core/Reche":10}]},{},[13])(13)
});

//# sourceMappingURL=reche.js.map
