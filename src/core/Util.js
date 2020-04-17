export default class Util {
    constructor(reche) {
        this.reche = reche;
        this.fileStatus = {
            onWaiting: 0,//等待中
            onProgress: 1,//上传中
            onStopped: 2,//已暂停
            onCompleted: 3,//已完成
            onError: 4,//上传失败
            onCanceled: 5//已取消
        }
    }

    isNull(val) {
        return val === null;
    }

    isNullString(val) {
        return val === "";
    }

    isObject(val) {
        if (val !== null && typeof val === "object") {
            return val.constructor === Object;
        }
        return false;
    }

    isUndefined(val) {
        return val === undefined;
    }

    isNumber(val) {
        return typeof val === 'number';
    }

    isString(val) {
        return typeof val === 'string';
    }

    isBoolean(val) {
        return val === true || val === false;
    }

    isTrue(val) {
        return val === true;
    }

    randomString(len) {
        let str = "";
        let range = len;
        let arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k',
            'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
            'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F',
            'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
            'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        for (let i = 0; i < range; i++) {
            let pos = Math.round(Math.random() * (arr.length - 1));
            str += arr[pos];
        }
        if (this.reche.fileMap[str]) {
            this.randomString(len)
        } else {
            return str;
        }
    }

    isFalse(val) {
        return val === false;
    }

    isArray(val) {
        return val instanceof Array
    }

    getNetSpeed(size,timeDiff){
        let byteSpeed =size/timeDiff;
        if(byteSpeed<1024){
            return byteSpeed.toFixed(2)+'Byte/'+this.reche.i18n.i18n('netSpeedUnit');
        }else if(byteSpeed<1024*1024) {
            byteSpeed = (byteSpeed/1024).toFixed(2);
            return byteSpeed+'Kb/'+this.reche.i18n.i18n('netSpeedUnit');
        }else {
            byteSpeed = (byteSpeed / 1024 / 1024).toFixed(2);
            return byteSpeed + 'Mb/'+this.reche.i18n.i18n('netSpeedUnit');
        }
    }
}