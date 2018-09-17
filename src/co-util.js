/**
 * Created by zhanglei on 2018/5/29.
 */

(function (name, context, definition) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = definition();
    }
    else if (typeof define === 'function' && define.amd) {
        define(definition);
    }
    else {
        context[name] = definition();
    }
})('util', this, function () {
    'use strict';
    var version = '1.0.75';

    //----------ls　开始　------------------------------
    var ls = (function () {
        var storageType = 'localStorage', prefix = 'creatoo.', webStorage;
        var deriveQualifiedKey = function (key) {
            return prefix + key;
        };
        //是否支持
        var isSupported = (function () {
            try {
                var supported = (storageType in window && window[storageType] !== null);
                var key = deriveQualifiedKey('__' + Math.round(Math.random() * 1e7));
                if (supported) {
                    webStorage = window[storageType];
                    webStorage.setItem(key, '');
                    webStorage.removeItem(key);
                }
                return supported;
            } catch (e) {
                //storageType = 'cookie';
                //$rootScope.$broadcast('LocalStorageModule.notification.error', e.message);
                return false;
            }
        }());

        var setLS = function (key, value) {
            if (!isSupported) return;
            if (!value) {
                value = null;
            } else if (typeof value != "string") {
                value = JSON.stringify(value);
            }
            //value = encodeUrl(value);
            if (webStorage) {
                webStorage.setItem(deriveQualifiedKey(key), value);
            }
        };

        var getLS = function (key) {
            if (!isSupported) return null;
            var item = webStorage ? webStorage.getItem(deriveQualifiedKey(key)) : null;
            //item = decodeUrl(item);
            if (!item || item === 'null') {
                return null;
            }

            if (item.charAt(0) === "{" || item.charAt(0) === "[" || isStringNumber(item)) {
                return JSON.parse(item);
            }
            return item;
        };

        var removeLS = function (key) {
            if (!isSupported && !webStorage) return;
            webStorage.removeItem(deriveQualifiedKey(key));
        };

        var clearLS = function () {
            if (!isSupported && !webStorage) return;
            for (var key in webStorage) {
                if (key.indexOf(prefix) === 0) {
                    removeLS(key.substr(prefix.length));
                }
            }
        };

        return {
            get: getLS,
            set: setLS,
            remove: removeLS,
            clear: clearLS
        };
    })();
    //----------ls　开始　------------------------------


    //----------cookie　开始　------------------------------
    var cookie = (function () {
        var path = "/";

        function setCookie(c_name, value, expiredays) {
            var exdate = new Date();
            exdate.setDate(exdate.getDate() + expiredays);
            if (!value) {
                value = null;
            } else if (typeof value != "string") {
                value = JSON.stringify(value);
            }

            //value = encodeUrl(value);
            document.cookie = c_name + "=" + value + ((expiredays === null) ? "" : ";path=" + path + ";expires=" + exdate.toGMTString());
        }

        function getCookie(name) {
            var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
            if ((arr = document.cookie.match(reg)) !== null) {
                var value = arr[2]
                //value=decodeUrl(value);
                if (!value) return null;
                if (value.charAt(0) === "{" || value.charAt(0) === "[" || isStringNumber(value)) {
                    return JSON.parse(value);
                }
                return value;
            }
            else
                return null;
        }

        function delCookie(name) {
            var exp = new Date();
            exp.setTime(exp.getTime() - 1);
            var cval = getCookie(name);
            if (cval !== null)
                document.cookie = name + "={};path=" + path + ";expires=" + exp.toGMTString();
        }

        return {
            get: getCookie,
            set: setCookie,
            remove: delCookie
        };
    })();
    //----------cookie　结束　------------------------------

    var go = function (url) {
        if (!url) return window.location.href = window.location.href;
        url = trim(url);
        if (/^http[s]*:\/\/.*?$/i.test(url)) return window.location.href = url;
        let pat = new RegExp('^/' + creatoo.sp + '/web(/.*?)$', 'i');
        let m=pat.exec(url);
        if(!m||m.length<2) {
            window.location.href = creatoo.domain + url;
        } else {
            window.location.href = creatoo.domain + m[1];
        }
    }

    var goLogin = function (url) {
        url = url || window.location.href;
        go('/login.html?f=' + url);
    }

    var dialog=function(title, body, cb) {
        let content = `
        <div class="tishiContent">
            <div class="wenzi">` + body + `</div>
        </div>
    `;
        layer.open({
            type: 1,
            title: [title],
            area: ['430px', 'auto'],
            shade: 0.1,
            shadeClose: true,
            btn: ['确定'],
            btnAlign: 'c',
            resize: false,
            skin: 'layui-layer-tishi',
            content: content,
            success: function (layero, index) {
                //console.log('弹窗生成成功');
            },
            yes: function (index, layero) {
                //console.log('点击了第一个按钮');
                layer.close(index);
                if (cb) cb();
            },
            btn2: function (index, layero) {
                //console.log('点击了第二个按钮');
                layer.close(index);
            }

        });
    }

    //----------地图距离　开始　------------------------------
    var DEF_PI = 3.14159265359; // PI
    var DEF_2PI = 6.28318530712; // 2*PI
    var DEF_PI180 = 0.01745329252; // PI/180.0
    var DEF_R = 6370693.5; // radius of earth
    //适用于近距离
    var getShortDistance = function (x1, y1, x2, y2) {
        var ew1, ns1, ew2, ns2;
        var dx, dy, dew;
        var distance;
        // 角度转换为弧度
        ew1 = x1 * DEF_PI180;
        ns1 = y1 * DEF_PI180;
        ew2 = x2 * DEF_PI180;
        ns2 = y2 * DEF_PI180;
        // 经度差
        dew = ew1 - ew2;
        // 若跨东经和西经180 度，进行调整
        if (dew > DEF_PI)
            dew = DEF_2PI - dew;
        else if (dew < -DEF_PI)
            dew = DEF_2PI + dew;
        dx = DEF_R * Math.cos(ns1) * dew; // 东西方向长度(在纬度圈上的投影长度)
        dy = DEF_R * (ns1 - ns2); // 南北方向长度(在经度圈上的投影长度)
        // 勾股定理求斜边长
        distance = Math.sqrt(dx * dx + dy * dy);
        return distance;
    };
    //适用于远距离
    var getLongDistance = function (x1, y1, x2, y2) {
        var ew1, ns1, ew2, ns2;
        var distance;
        // 角度转换为弧度
        ew1 = x1 * DEF_PI180;
        ns1 = y1 * DEF_PI180;
        ew2 = x2 * DEF_PI180;
        ns2 = y2 * DEF_PI180;
        // 求大圆劣弧与球心所夹的角(弧度)
        distance = Math.sin(ns1) * Math.sin(ns2) + Math.cos(ns1) * Math.cos(ns2) * Math.cos(ew1 - ew2);
        // 调整到[-1..1]范围内，避免溢出
        if (distance > 1.0)
            distance = 1.0;
        else if (distance < -1.0)
            distance = -1.0;
        // 求大圆劣弧长度
        distance = DEF_R * Math.acos(distance);
        return distance;
    };
    //----------地图距离　结束　------------------------------


    //相关操作------------------array----------------------------
    //_.chunk(['a', 'b', 'c', 'd'], 2);
    // => [['a', 'b'], ['c', 'd']]
    var chunk = function (array, num) {
        return _.chunk(array, num);
    }


//深度拷贝，数组内部对象重新建立
    var clone = function (objects) {
        return _.cloneDeep(objects);
    }

//删除数组，num为个数，默认为1
//array=[1,2,3,4,5]
//num=1 return [2,3,4,5]
//num=3 return [4,5]
    var drop = function (array, num) {
        return _.drop(array, num);
    }

//删除数组，从右边开始删除
    var dropRight = function (array, num) {
        return _.dropRight(array, num);
    }

    /**
     * 合并数组
     * @param {Array} array The array to concatenate.
     * @param {...*} [values] The values to concatenate.
     * @returns {Array} Returns the new concatenated array.
     */
    var concat = function () {
        var objs = arguments;
        return _.concat.apply(_.concat, objs);
    }

    /**
     * 把数组变平
     * @param {Array} array The array to concatenate.
     * @return {Array} Returns the new flatten array.
     *  [1, [2, [3, [4]], 5]]=> [1, 2, [3, [4]], 5]
     */
    var flatten = function (arr) {
        return _.flatten(arr);
    }

    /**
     * 遍历集合运算成功数组
     * @param  {array} objects [{a:1},{a:2}]
     * @param  {string|function} key 可以是迭代函数 a
     * @return [1,2]
     */
    var map = function (objects, key) {
        return _.map(objects, key);
    }

    /**
     * 去重
     * [{n:1},{n:2},{n:1}] => [{n:1},{n:2}]
     * [1,2,2,3] => [1,2,3]
     * @param  {array} arr [number|object]
     * @return  {array}
     */
    var uniq = function (arr) {
        if (!arr) return [];
        if (!Array.isArray(arr) || arr.length == 0) return [];
        if (_.isPlainObject(arr[0])) return _.uniqWith(arr, _.isEqual);
        return _.uniq(arr);
    }

//返回数组中位置如[1,2,3]找2，return 1;
    var indexOf = function (arr, value) {
        return _.indexOf(arr, value);
    }

//查找对象数组的位置,return int
    var findIndex = function (objects, obj) {
        return _.findIndex(objects, obj);
    }

//[{ 'n': 1 }, { 'n': 2 }]; find {n:2}
//{ 'n': 2 }
//找到一条就返回
    var findOne = function (objects, obj) {
        return _.find(objects, obj);
    }
//[{ 'n': 1 }, { 'n': 2 }]; find {n:2}|[{n:1},{n:2}]
//[{n:1},{n:2}]
//遍历所有行
    var find = function (objects, cons) {
        if (!Array.isArray(objects)) return [];
        if (!cons || !_.isObject(cons)) return objects;

        if (_.isPlainObject(cons)) {
            return _.filter(objects, cons);
        }
        var arr = [];
        cons = _.uniqWith(cons, _.isEqual);
        cons.forEach(function (c) {
            var _arr = _.filter(objects, c);
            arr = arr.concat(_arr);
        })
        return arr;
    }


    /**
     * 最大值
     * max([4, 2, 8, 6])=>8
     * max([{a:1},{a:2}],'a')=>{a:2}
     * @param  {array} arr [number|object]
     * @param  {string|function} key? 允许为空
     * @return  {number|object}
     */
    var max = function (arr, key) {
        return _.maxBy(arr, key);
    }

    /**
     * 最小值
     * min([4, 2, 8, 6])=>2
     * min([{a:1},{a:2}],'a')=>{a:1}
     * @param  {array} arr [number|object]
     * @param  {string|function} key? 允许为空
     * @return  {number|object}
     */
    var min = function (arr, key) {
        return _.minBy(arr, key);
    }

    /**
     * 根据key进行排序，支持纯数组和集合
     * @param  {array} arr [number,number]|[object,object]
     * @param  {string|array} keys?  允许为空可以是'a'|['a',b]
     */
    var sort = function (arr, keys) {
        return _.sortBy(arr, keys);
    }

    /**
     * 把集体转化成以key为主键的对象,kv键值对
     * [{id:"key1",b:2},{id:"key2",b:3}]=>{"key1":{id:"key1",b:2},"key2":{id:"key2",b:3}}
     * @param  {array} arr
     * @param  {string|function} key 也可以转入fn
     */
    var kv = function (arr, key) {
        return _.keyBy(arr, key);
    }
    //--------------------------------number--------------------------------------------------

    //整数，判断数据类型
    //value='11' retutn false
    //value=11 return true
    var isInt = function (value) {
        //console.log(isNumber(111));
        return _.isInteger(value);
    }
//是否是数字
//value='11' return false
//value=11 return true
    var isNumber = function (value) {
        return _.isNumber(value);
    }

//随机
    var random = function (start, end) {
        return _.random(start, end)
    }
//四舍5入
//     _.round(4.006);
//  => 4
//
//     _.round(4.006, 2);
//  => 4.01
//
//     _.round(4060, -2);
//  => 4100
    var round = function (number, precision) {
        return _.round(number, precision);
    }

//转化类型----------------------------------------------
    var toInt = function (value) {
        if (!value) return 0;
        var val = _.toInteger(value);
        if (_.isNaN(val)) return 0;
        return val;
    }

    var toNumber = function (value) {
        if (!value) return 0;
        var val = _.toNumber(value);
        if (_.isNaN(val)) return 0;
        return val;
    }

//格式化货币，转字符串
    var formatMoney = function (obj) {
        obj = toNumber(obj);
        return obj.toFixed(2).toString();
    }

    //-----------------------------------String-------------------------------------------------

    var isString = function (str) {
        if (str === undefined || str === null) return false;
        return typeof str === 'string';
    };

//去除两边的空格
    var trim = function (str) {
        return _.trim(str);
    }


//不带端口，return 127.0.0.1
    var formatIp = function (ip) {
        if (!ip) return '';
        var arr = /([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/.exec(ip);
        if (!arr || arr.length === 0) return '';
        return arr[1];
    }

//格式化----------------------------------------------
    var format = function (f) {
        var formatRegExp = /%[s]/g; //加入g会循环执行
        if (typeof f !== 'string') throw new Error('util.format(f),the f data type must be string.');
        var i = 1;
        var args = [];
        [].push.apply(args, arguments);
        var len = args.length;
        var str = String(f).replace(formatRegExp, function (x) {
            if (i >= len) return x;
            return String(args[i++]);
        });
        return str;
    };

    var querystring = function (obj) {
        var arr = []
        for (var key in obj) {
            var value = obj[key] || '';
            if (typeof value == 'object') value = JSON.stringify(value)
            value = encodeUrl(value);
            arr.push(format('%s=%s', key, value));
        }
        return arr.join('&');
    }

    var qs = function (name) {
        var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
        var r = window.location.search.substr(1).match(reg);
        if (r != null) {
            return decodeUrl(r[2]);
        }
        return null;
    }

    var decodeUrl = function (value) {
        try {
            return decodeURIComponent(value);
        } catch (e) {
            return "";
        }
    }

    var encodeUrl = function (value) {
        return encodeURIComponent(value);
    }

    //-------------------------------object------------------------------------------

    /**
     * 两个对象或者数组是否相等
     * @param  {object|number|string} value
     * @param  {object|number|string} other
     * @return {boolean}
     */
    var is = function (value, other) {
        return _.isEqual(value, other);
    }

    /**
     * 是否object对象，包含数组
     * @param  {*} value the value to check
     * @return {boolean}
     */
    var isObject = function (value) {
        return _.isObject(value)
    }
    /**
     * 是否Json对象 ,不包含Array
     * @param  {*} value
     * @return {boolean}
     */
    var isPlainObject = function (value) {
        return _.isPlainObject(value);
    }

    /**
     * string是否可以转成json
     * @param  {string} str 必须是字符串
     * @return {boolean}
     */
    var isJson = function (str) {
        if (!str) return false;
        if (typeof str != 'string') throw new Error('this str is not string type!');
        var strictJSONReg = /^[\x20\x09\x0a\x0d]*(\[|\{)/;
        if (!strictJSONReg.test(str)) return false;
        return true;
    }
    /**
     * 是否为空对象
     * @param  {object} obj
     * @return {boolean} {}=true,{a:1}=false
     */
    var isNullObj = function (obj) {
        if (!obj) return true;
        if (!isPlainObject(obj)) throw new Error('this obj is not PlainObject');
        if (Object.keys(obj).length == 0) return true;
        return false;
    }

    /**
     * 扩展对象，不创建新对象
     * 扩展到第一个对象，会改变第一个参数
     * @param  {object} obj 合并到第一个参数上
     * @param  {...object} obj
     */
    var extend = function () {
        var objs = arguments;
        return _.assignIn.apply(_.assignIn, objs);
    }
    /**
     * 合并对象，不改变参数
     * @param  {object} obj
     * @param  {...object} obj
     * @return {object} 返回合并后的对象
     */
    var merge = function () {
        var objs = [];
        [].push.apply(objs, arguments);
        //console.log('objs', objs);
        var o = {};
        objs.unshift(o);
        return extend.apply(extend, objs);
    }
    /**
     * 对象字段排序，仅对对象进行排序,所有子属性进行排序
     * 不支持数字key
     * @param  {object} obj
     * @return {object} 排序后的对象
     */
    var sortObj = function (obj) {
        if (!obj || Array.isArray(obj) || typeof obj !== 'object') {
            return obj;
        }
        var o = {};
        var arr = _.sortBy(_.keys(obj));
        _.forEach(arr, function (value) {
            o[value] = sortObj(obj[value]);
        });
        return o;
    }

    /**
     * 把空对象转成null
     * @param  {object} obj
     * @return {object} 不存在key的返回为null
     */
    var formatObj = function (obj) {
        if (isNullObj(obj)) return null;
        return obj;
    }
    //------------------------Date--------------------------------------------

//toDate
    var toDate = function (value) {
        if (!value) return null;
        var dt = new Date(value);
        if (dt == 'Invalid Date') {
            return null;
        }
        return dt;
    }
//mongo objectid toDate
    var getTimeByObjectId = function (objectId) {
        if (!objectId) return 0;
        var str = '';
        if (typeof objectId === 'object') {
            str = objectId.toString();
        } else {
            str = objectId;
        }
        if (str.length !== 24) return 0;
        var dt = toDate(parseInt(str.substring(0, 8), 16) * 1000);
        if (!dt) return 0;
        return dt.getTime();
    }

//是否日期
    var isDate = function (value) {
        if (!value) return false;
        var dt = new Date(value);
        return dt != 'Invalid Date';
    }
//format YYYY-MM-DD HH:mm:ss
    var formatDate = function (date, format) {
        date = date || new Date();
        date = toDate(date);
        if (!date) return 'Invalid Date';
        format = format || 'YYYY-MM-DD';
        return moment(date).format(format);
    }
//获取距离1970-1-1的ms(以天为单位)
    var dayTime = function (date, inc) {
        if (!date) date = new Date();
        date = formatDate(date, 'YYYY-MM-DD 00:00:00');
        date = toDate(date);
        if (!date) return 0;
        if (!inc) date.getTime();
        return addDay(date, inc)
    }

//增加/减少天数，默认下一天，不保留止hh:mm:ss=00:00:00
    var setDay = function (date, inc) {
        console.log('co-util warning: the setDay() was deprecated. use the dayTime() instead.');
        return dayTime(date, inc);
    }
//添加日期
    var addDate = function (date, type, inc) {
        return moment(date).add(inc, type).valueOf();
    }

    var addSecond = function (date, inc) {
        return addDate(date, 'seconds', inc);
    }
    var addMinute = function (date, inc) {
        return addDate(date, 'minutes', inc);
    }

    var addHour = function (date, inc) {
        return addDate(date, 'hours', inc);
    }
//只添加天数
    var addDay = function (date, inc) {
        return addDate(date, 'days', inc);
    }

    var picCenter = function (jq, el_imgs, opts) {
        // var b = {
        //     "boxWidth": 0,
        //     "boxHeight": 0,
        //     "path": "src"
        // };
        var d = opts;
        el_imgs.each(function (index, el) {
            if (d.boxWidth && d.boxHeight) {
                var g = jq(el);
                var f = d.boxWidth / d.boxHeight;
                var e = new Image();
                e.onload = function () {
                    var i = e.width;
                    var h = e.height;
                    if (i / h >= f) {
                        var l = (d.boxHeight * i) / h;
                        var k = (l - d.boxWidth) / 2 * (-1);
                        g.css({
                            "width": "auto",
                            "height": "100%",
                            "position": "absolute",
                            "top": "0",
                            "left": k
                        });
                    } else {
                        var j = (d.boxWidth * h) / i;
                        var m = (j - d.boxHeight) / 2 * (-1);
                        g.css({
                            "width": "100%",
                            "height": "auto",
                            "position": "absolute",
                            "top": m,
                            "left": "0"
                        });
                    }
                };
                e.src = g.attr(d.path);
            }
        })
    }

    //-------web config配置　结束-----------------------------------------------------------------
    return {
        VERSION: version,
        mapShortDistance: getShortDistance,//短距离适用
        mapLongDistance: getLongDistance,//长距离适用
        ls: ls,
        cookie: cookie,
        go: go,
        goLogin: goLogin,
        dialog:dialog,
        //------------------array
        chunk: chunk,
        drop: drop,
        clone: clone,
        dropRight: dropRight,
        concat: concat,
        flatten: flatten,
        map: map,
        uniq: uniq,
        indexOf: indexOf,
        findIndex: findIndex,
        findOne: findOne,
        find: find,
        max: max,
        min: min,
        sort: sort,
        kv: kv,
        //---------------------number
        isInt: isInt,
        isNumber: isNumber,
        random: random,
        round: round,
        toInt: toInt,
        toNumber: toNumber,
        formatMoney: formatMoney,
        //---------------------string
        isString: isString,
        trim: trim,
        formatIp: formatIp,
        format: format,
        querystring: querystring,
        qs: qs,
        decodeUrl: decodeUrl,
        encodeUrl: encodeUrl,
        //----------------------object
        is: is,
        isObject: isObject,
        isPlainObject: isPlainObject,
        isJson: isJson,
        isNullObj: isNullObj,
        extend: extend,
        merge: merge,
        sortObj: sortObj,
        formatObj: formatObj,
        //---------------------------formatDate
        toDate: toDate,
        getTimeByObjectId: getTimeByObjectId,
        isDate: isDate,
        formatDate: formatDate,
        dayTime: dayTime,
        setDay: setDay,
        addDate: addDate,
        addSecond: addSecond,
        addMinute: addMinute,
        addHour: addHour,
        addDay: addDay,

        picCenter: picCenter,
    };

});


