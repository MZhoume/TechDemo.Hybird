/// <reference path="../_reference.ts" />
var app;
(function (app) {
    var service;
    (function (service) {
        var SocketSvc = (function () {
            function SocketSvc(_dataSvc) {
                this._dataSvc = _dataSvc;
            }
            SocketSvc.prototype.StartListening = function (ipAddr, portNum, callback, errCallback) {
                var _this = this;
                console.log('Connectiong to: ' + ipAddr + ':' + portNum);
                this._isListening = true;
                try {
                    this._socket = new WebSocket("ws://" + ipAddr + ':' + portNum);
                    this._socket.onmessage = function (msg) {
                        _this._dataSvc.onMsgReceived(msg);
                        callback(msg);
                        _this._socket.send(JSON.stringify({ isStopIntended: false }));
                    };
                    this._socket.onerror = function (e) {
                        errCallback('An error occured from the WebSocket...');
                    };
                    setTimeout(function () {
                        _this._socket.send(JSON.stringify({ isStopIntended: false }));
                    }, 300);
                }
                catch (err) {
                    errCallback(err);
                }
            };
            SocketSvc.prototype.StopListening = function () {
                console.log('Disconnecting...');
                this._isListening = false;
                this._socket.send(JSON.stringify({ isStopIntended: true }));
                this._socket.close();
                this._socket.onmessage = null;
                this._socket.onerror = null;
            };
            SocketSvc.prototype.SendStr = function (str) {
                this._socket.send(str);
            };
            SocketSvc.$inject = ['DataSvc'];
            return SocketSvc;
        })();
        angular.module('app').service('SocketSvc', SocketSvc);
    })(service = app.service || (app.service = {}));
})(app || (app = {}));

/// <reference path="../_reference.ts" />
var app;
(function (app) {
    var service;
    (function (service) {
        var DataSvc = (function () {
            function DataSvc(_templateCache) {
                this._templateCache = _templateCache;
                this.data = [];
                this.onDataReceived = function () {
                };
                this.onIntroductionReceived = function () {
                };
                this.onDirectiveReceived = function () {
                };
                //_templateCache.put('control.html', '');
            }
            DataSvc.prototype.onMsgReceived = function (msg) {
                var payload = JSON.parse(msg.data);
                if (payload.directive) {
                    this.onIntroductionReceived.call(this, payload.introduction);
                    this.onDirectiveReceived.call(this, payload.directive);
                }
                else {
                    for (var i = 0; i < payload.length; i++) {
                        var e = payload[i];
                        if (!this.data[i]) {
                            this.data[i] = [];
                        }
                        this.data[i].push(e);
                    }
                    this.onDataReceived(payload);
                }
            };
            DataSvc.$inject = ['$templateCache'];
            return DataSvc;
        })();
        angular.module('app').service('DataSvc', DataSvc);
    })(service = app.service || (app.service = {}));
})(app || (app = {}));

/// <reference path="../_reference.ts" />

/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="./service/socketSvc.ts" />
/// <reference path="./service/dataSvc.ts" />
/// <reference path="./interfaces/interface.ts" /> 

/// <reference path="../_reference.ts" />
var app;
(function (app) {
    var home;
    (function (home) {
        var ChartCtrl = (function () {
            function ChartCtrl() {
            }
            return ChartCtrl;
        })();
        angular.module('app').controller('home.ChartCtrl', ChartCtrl);
    })(home = app.home || (app.home = {}));
})(app || (app = {}));

/// <reference path="../_reference.ts" />
var app;
(function (app) {
    var home;
    (function (home) {
        var MonitorCtrl = (function () {
            function MonitorCtrl(_dataSvc, _scope) {
                var _this = this;
                this._dataSvc = _dataSvc;
                this._scope = _scope;
                this._scope.data = [];
                _dataSvc.onDataReceived = function (d) {
                    for (var i = 0; i < d.length; i++) {
                        var element = d[i];
                        _this._scope.data[i] = element;
                    }
                    _this._scope.$apply();
                };
                var dat = _dataSvc.data[_dataSvc.data.length - 1];
                if (dat != undefined) {
                    dat.forEach(function (e) {
                        _this._scope.data.push(e);
                    }, this);
                }
            }
            MonitorCtrl.$inject = ['DataSvc', '$scope'];
            return MonitorCtrl;
        })();
        angular.module('app').controller('home.MonitorCtrl', MonitorCtrl);
    })(home = app.home || (app.home = {}));
})(app || (app = {}));

/// <reference path="../_reference.ts" />
var app;
(function (app) {
    var introduction;
    (function (introduction) {
        var IntroductionCtrl = (function () {
            function IntroductionCtrl(_dataSvc) {
                var _this = this;
                this._dataSvc = _dataSvc;
                this.introduction = 'Please open settings pane for connecting to the server.';
                _dataSvc.onIntroductionReceived = function (i) { return _this.introduction = i; };
            }
            IntroductionCtrl.$inject = ['DataSvc'];
            return IntroductionCtrl;
        })();
        angular.module('app').controller('IntroductionCtrl', IntroductionCtrl);
    })(introduction = app.introduction || (app.introduction = {}));
})(app || (app = {}));

/// <reference path="../_reference.ts" />
var app;
(function (app) {
    var settings;
    (function (settings) {
        var SettingsCtrl = (function () {
            function SettingsCtrl(_scope, _socketSvc, _ionicPopup, _ionicModel, _ionicLoading) {
                this._scope = _scope;
                this._socketSvc = _socketSvc;
                this._ionicPopup = _ionicPopup;
                this._ionicModel = _ionicModel;
                this._ionicLoading = _ionicLoading;
                this.msgs = [];
                this.btnString = 'Start';
                this._isListening = false;
                _ionicModel.fromTemplateUrl('../../settings/settings.html', {
                    scope: _scope,
                    animation: 'slide-in-up'
                }).then(function (m) {
                    _scope.model = m;
                });
                _scope.showModal = function () {
                    _scope.model.show();
                };
                _scope.hideModal = function () {
                    _scope.model.hide();
                };
            }
            SettingsCtrl.prototype.startCommand = function () {
                var _this = this;
                if (!this._isListening) {
                    this.msgs = [];
                    this.msgs.push('Start Listening...');
                    this._isListening = true;
                    this.btnString = 'Stop';
                    this._ionicLoading.show({
                        template: 'Retrieving data...<br />Please wait...'
                    });
                    this._socketSvc.StartListening(this.ipAddress, this.portNum, function (msg) {
                        _this.msgs.push("Data received at " + msg.timeStamp);
                        if (!_this._gotDirective) {
                            _this._ionicLoading.hide();
                            _this._gotDirective = true;
                        }
                    }, function (err) {
                        _this._ionicLoading.hide();
                        _this.msgs.push(err);
                        _this._ionicPopup.show({
                            title: 'Error!',
                            template: 'An error occured while connecting to server...',
                            buttons: [{ text: 'OK' }]
                        });
                        _this._isListening = false;
                        _this.btnString = 'Start';
                    });
                }
                else {
                    this.msgs.push('Stop Listening...');
                    this._socketSvc.StopListening();
                    this._isListening = false;
                    this.btnString = 'Start';
                }
            };
            SettingsCtrl.$inject = ['$scope', 'SocketSvc', '$ionicPopup', '$ionicModal', '$ionicLoading'];
            return SettingsCtrl;
        })();
        angular.module('app').controller('SettingsCtrl', SettingsCtrl);
    })(settings = app.settings || (app.settings = {}));
})(app || (app = {}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlcnZpY2Uvc29ja2V0U3ZjLnRzIiwic2VydmljZS9kYXRhU3ZjLnRzIiwiaW50ZXJmYWNlcy9pbnRlcmZhY2UudHMiLCJfcmVmZXJlbmNlLnRzIiwiaG9tZS9jaGFydC5jdHJsLnRzIiwiaG9tZS9tb25pdG9yLmN0cmwudHMiLCJpbnRyb2R1Y3Rpb24vaW50cm9kdWN0aW9uLmN0cmwudHMiLCJzZXR0aW5ncy9zZXR0aW5ncy5jdHJsLnRzIl0sIm5hbWVzIjpbImFwcCIsImFwcC5zZXJ2aWNlIiwiYXBwLnNlcnZpY2UuU29ja2V0U3ZjIiwiYXBwLnNlcnZpY2UuU29ja2V0U3ZjLmNvbnN0cnVjdG9yIiwiYXBwLnNlcnZpY2UuU29ja2V0U3ZjLlN0YXJ0TGlzdGVuaW5nIiwiYXBwLnNlcnZpY2UuU29ja2V0U3ZjLlN0b3BMaXN0ZW5pbmciLCJhcHAuc2VydmljZS5Tb2NrZXRTdmMuU2VuZFN0ciIsImFwcC5zZXJ2aWNlLkRhdGFTdmMiLCJhcHAuc2VydmljZS5EYXRhU3ZjLmNvbnN0cnVjdG9yIiwiYXBwLnNlcnZpY2UuRGF0YVN2Yy5vbk1zZ1JlY2VpdmVkIiwiYXBwLmhvbWUiLCJhcHAuaG9tZS5DaGFydEN0cmwiLCJhcHAuaG9tZS5DaGFydEN0cmwuY29uc3RydWN0b3IiLCJhcHAuaG9tZS5Nb25pdG9yQ3RybCIsImFwcC5ob21lLk1vbml0b3JDdHJsLmNvbnN0cnVjdG9yIiwiYXBwLmludHJvZHVjdGlvbiIsImFwcC5pbnRyb2R1Y3Rpb24uSW50cm9kdWN0aW9uQ3RybCIsImFwcC5pbnRyb2R1Y3Rpb24uSW50cm9kdWN0aW9uQ3RybC5jb25zdHJ1Y3RvciIsImFwcC5zZXR0aW5ncyIsImFwcC5zZXR0aW5ncy5TZXR0aW5nc0N0cmwiLCJhcHAuc2V0dGluZ3MuU2V0dGluZ3NDdHJsLmNvbnN0cnVjdG9yIiwiYXBwLnNldHRpbmdzLlNldHRpbmdzQ3RybC5zdGFydENvbW1hbmQiXSwibWFwcGluZ3MiOiJBQUFBLHlDQUF5QztBQUV6QyxJQUFPLEdBQUcs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O29CQUNQQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBO29CQUNwQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsYUFBYUEsRUFBRUEsQ0FBQ0E7b0JBRWhDQSxJQUFJQSxDQUFDQSxZQUFZQSxHQUFHQSxLQUFLQSxDQUFDQTtvQkFDMUJBLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLE9BQU9BLENBQUNBO2dCQUMxQkEsQ0FBQ0E7WUFDRkEsQ0FBQ0E7WUEzRE1GLG9CQUFPQSxHQUFHQSxDQUFDQSxRQUFRQSxFQUFFQSxXQUFXQSxFQUFFQSxhQUFhQSxFQUFFQSxhQUFhQSxFQUFFQSxlQUFlQSxDQUFDQSxDQUFDQTtZQTREekZBLG1CQUFDQTtRQUFEQSxDQXJFQUQsQUFxRUNDLElBQUFEO1FBRURBLE9BQU9BLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLENBQ25CQSxVQUFVQSxDQUFDQSxjQUFjQSxFQUFFQSxZQUFZQSxDQUFDQSxDQUFDQTtJQUM1Q0EsQ0FBQ0EsRUExRlVsQixRQUFRQSxHQUFSQSxZQUFRQSxLQUFSQSxZQUFRQSxRQTBGbEJBO0FBQURBLENBQUNBLEVBMUZNLEdBQUcsS0FBSCxHQUFHLFFBMEZUIiwiZmlsZSI6ImFwcC5hbGwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vX3JlZmVyZW5jZS50c1wiIC8+XHJcblxyXG5tb2R1bGUgYXBwLnNlcnZpY2Uge1xyXG5cdGV4cG9ydCBpbnRlcmZhY2UgSVNvY2tldFN2YyB7XHJcblx0XHRTdGFydExpc3RlbmluZyhcclxuXHRcdFx0aXBBZGRyOiBzdHJpbmcsXHJcblx0XHRcdHBvcnROdW06IG51bWJlcixcclxuXHRcdFx0Y2FsbGJhY2s6IChtc2c6IE1lc3NhZ2VFdmVudCkgPT4gdm9pZCxcclxuXHRcdFx0ZXJyQ2FsbGJhY2s6IChlcnI6IHN0cmluZykgPT4gdm9pZFxyXG5cdFx0XHQpOiB2b2lkO1xyXG5cclxuXHRcdFN0b3BMaXN0ZW5pbmcoKTogdm9pZDtcclxuXHRcdFNlbmRTdHIoc3RyOiBzdHJpbmcpOiB2b2lkO1xyXG5cdH1cclxuXHJcblx0Y2xhc3MgU29ja2V0U3ZjIGltcGxlbWVudHMgSVNvY2tldFN2YyB7XHJcblx0XHRwcml2YXRlIF9pc0xpc3RlbmluZzogYm9vbGVhbjtcclxuXHRcdHByaXZhdGUgX3NvY2tldDogV2ViU29ja2V0O1xyXG5cclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gWydEYXRhU3ZjJ107XHJcblx0XHRjb25zdHJ1Y3Rvcihwcml2YXRlIF9kYXRhU3ZjOiBhcHAuc2VydmljZS5JRGF0YVN2Yykge1xyXG5cdFx0fVxyXG5cclxuXHRcdFN0YXJ0TGlzdGVuaW5nKGlwQWRkcjogc3RyaW5nLCBwb3J0TnVtOiBudW1iZXIsIGNhbGxiYWNrOiAobXNnOiBNZXNzYWdlRXZlbnQpID0+IHZvaWQsXHJcblx0XHRcdGVyckNhbGxiYWNrOiAoZXJyOiBzdHJpbmcpID0+IHZvaWQpOiB2b2lkIHtcclxuXHRcdFx0Y29uc29sZS5sb2coJ0Nvbm5lY3Rpb25nIHRvOiAnICsgaXBBZGRyICsgJzonICsgcG9ydE51bSk7XHJcblx0XHRcdHRoaXMuX2lzTGlzdGVuaW5nID0gdHJ1ZTtcclxuXHJcblx0XHRcdHRyeSB7XHJcblx0XHRcdFx0dGhpcy5fc29ja2V0ID0gbmV3IFdlYlNvY2tldChcIndzOi8vXCIgKyBpcEFkZHIgKyAnOicgKyBwb3J0TnVtKTtcclxuXHRcdFx0XHR0aGlzLl9zb2NrZXQub25tZXNzYWdlID0gKG1zZykgPT4ge1xyXG5cdFx0XHRcdFx0dGhpcy5fZGF0YVN2Yy5vbk1zZ1JlY2VpdmVkKG1zZyk7XHJcblx0XHRcdFx0XHRjYWxsYmFjayhtc2cpO1xyXG5cclxuXHRcdFx0XHRcdHRoaXMuX3NvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KDxhcHAuaW50ZXJmYWNlcy5JU29ja2V0Q2xpZW50PnsgaXNTdG9wSW50ZW5kZWQ6IGZhbHNlIH0pKTtcclxuXHRcdFx0XHR9O1xyXG5cdFx0XHRcdHRoaXMuX3NvY2tldC5vbmVycm9yID0gZSA9PiB7XHJcblx0XHRcdFx0XHRlcnJDYWxsYmFjaygnQW4gZXJyb3Igb2NjdXJlZCBmcm9tIHRoZSBXZWJTb2NrZXQuLi4nKTtcclxuXHRcdFx0XHR9O1xyXG5cclxuXHRcdFx0XHRzZXRUaW1lb3V0KCgpID0+IHtcclxuXHRcdFx0XHRcdHRoaXMuX3NvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KDxhcHAuaW50ZXJmYWNlcy5JU29ja2V0Q2xpZW50PnsgaXNTdG9wSW50ZW5kZWQ6IGZhbHNlIH0pKTtcclxuXHRcdFx0XHR9LCAzMDApO1xyXG5cdFx0XHR9IGNhdGNoIChlcnIpIHtcclxuXHRcdFx0XHRlcnJDYWxsYmFjayhlcnIpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0U3RvcExpc3RlbmluZygpOiB2b2lkIHtcclxuXHRcdFx0Y29uc29sZS5sb2coJ0Rpc2Nvbm5lY3RpbmcuLi4nKTtcclxuXHRcdFx0dGhpcy5faXNMaXN0ZW5pbmcgPSBmYWxzZTtcclxuXHJcblx0XHRcdHRoaXMuX3NvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KDxhcHAuaW50ZXJmYWNlcy5JU29ja2V0Q2xpZW50PnsgaXNTdG9wSW50ZW5kZWQ6IHRydWUsIH0pKTtcclxuXHJcblx0XHRcdHRoaXMuX3NvY2tldC5jbG9zZSgpO1xyXG5cdFx0XHR0aGlzLl9zb2NrZXQub25tZXNzYWdlID0gbnVsbDtcclxuXHRcdFx0dGhpcy5fc29ja2V0Lm9uZXJyb3IgPSBudWxsO1xyXG5cdFx0fVxyXG5cclxuXHRcdFNlbmRTdHIoc3RyOiBzdHJpbmcpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5fc29ja2V0LnNlbmQoc3RyKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXIubW9kdWxlKCdhcHAnKVxyXG5cdFx0LnNlcnZpY2UoJ1NvY2tldFN2YycsIFNvY2tldFN2Yyk7XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vX3JlZmVyZW5jZS50c1wiIC8+XHJcblxyXG5tb2R1bGUgYXBwLnNlcnZpY2Uge1xyXG5cdGV4cG9ydCBpbnRlcmZhY2UgSURhdGFTdmMge1xyXG5cdFx0ZGF0YTogYXBwLmludGVyZmFjZXMuSURhdGFNb2RlbFtdW107XHJcblxyXG5cdFx0b25Nc2dSZWNlaXZlZChtc2c6IE1lc3NhZ2VFdmVudCk6IHZvaWQ7XHJcblxyXG5cdFx0b25EYXRhUmVjZWl2ZWQ6IChkYXRhOiBhcHAuaW50ZXJmYWNlcy5JRGF0YU1vZGVsW10pID0+IHZvaWQ7XHJcblx0XHRvbkludHJvZHVjdGlvblJlY2VpdmVkOiAoaW50cm86IHN0cmluZykgPT4gdm9pZDtcclxuXHRcdG9uRGlyZWN0aXZlUmVjZWl2ZWQ6IChkaXI6IHN0cmluZykgPT4gdm9pZDtcclxuXHR9XHJcblxyXG5cdGNsYXNzIERhdGFTdmMgaW1wbGVtZW50cyBhcHAuc2VydmljZS5JRGF0YVN2YyB7XHJcblx0XHRkYXRhOiBhcHAuaW50ZXJmYWNlcy5JRGF0YU1vZGVsW11bXSA9IFtdO1xyXG5cclxuXHRcdHByaXZhdGUgX2hhc0luaXRlZDogYm9vbGVhbjtcclxuXHJcblx0XHRzdGF0aWMgJGluamVjdCA9IFsnJHRlbXBsYXRlQ2FjaGUnXTtcclxuXHRcdGNvbnN0cnVjdG9yKHByaXZhdGUgX3RlbXBsYXRlQ2FjaGU6IGFuZ3VsYXIuSVRlbXBsYXRlQ2FjaGVTZXJ2aWNlKSB7XHJcblx0XHRcdC8vX3RlbXBsYXRlQ2FjaGUucHV0KCdjb250cm9sLmh0bWwnLCAnJyk7XHJcblx0XHR9XHJcblxyXG5cdFx0b25Nc2dSZWNlaXZlZChtc2c6IE1lc3NhZ2VFdmVudCk6IHZvaWQge1xyXG5cdFx0XHR2YXIgcGF5bG9hZCA9IEpTT04ucGFyc2UobXNnLmRhdGEpO1xyXG5cclxuXHRcdFx0aWYgKHBheWxvYWQuZGlyZWN0aXZlKSB7XHJcblx0XHRcdFx0dGhpcy5vbkludHJvZHVjdGlvblJlY2VpdmVkLmNhbGwodGhpcywgcGF5bG9hZC5pbnRyb2R1Y3Rpb24pO1xyXG5cdFx0XHRcdHRoaXMub25EaXJlY3RpdmVSZWNlaXZlZC5jYWxsKHRoaXMsIHBheWxvYWQuZGlyZWN0aXZlKTtcclxuXHRcdFx0XHQvL3RoaXMuX3RlbXBsYXRlQ2FjaGUucHV0KCdjb250cm9sLmh0bWwnLCBwYXlsb2FkLmRpcmVjdGl2ZSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwYXlsb2FkLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHR2YXIgZSA9IHBheWxvYWRbaV07XHJcblx0XHRcdFx0XHRpZiAoIXRoaXMuZGF0YVtpXSkge1xyXG5cdFx0XHRcdFx0XHR0aGlzLmRhdGFbaV0gPSBbXTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHRcdHRoaXMuZGF0YVtpXS5wdXNoKGUpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHR0aGlzLm9uRGF0YVJlY2VpdmVkKHBheWxvYWQpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0b25EYXRhUmVjZWl2ZWQ6IChkYXRhOiBhcHAuaW50ZXJmYWNlcy5JRGF0YU1vZGVsW10pID0+IHZvaWQgPSAoKSA9PiB7IH1cclxuXHRcdG9uSW50cm9kdWN0aW9uUmVjZWl2ZWQ6IChpbnRybzogc3RyaW5nKSA9PiB2b2lkID0gKCkgPT4geyB9XHJcblx0XHRvbkRpcmVjdGl2ZVJlY2VpdmVkOiAoZGlyOiBzdHJpbmcpID0+IHZvaWQgPSAoKSA9PiB7IH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXIubW9kdWxlKCdhcHAnKVxyXG5cdFx0LnNlcnZpY2UoJ0RhdGFTdmMnLCBEYXRhU3ZjKTtcclxuLy9cdFxyXG4vL1x0RGF0YVN2Yy5wcm90b3R5cGUub25EaXJlY3RpdmVSZWNlaXZlZCA9IGZ1bmN0aW9uKGQ6IHN0cmluZyk6IHZvaWQge1xyXG4vL1x0XHRhbmd1bGFyLm1vZHVsZSgnYXBwJykuZGlyZWN0aXZlKCdjb250cm9sJywgZnVuY3Rpb24oKSB7XHJcbi8vXHRcdFx0cmV0dXJuIHtcclxuLy9cdFx0XHRcdHJlc3RyaWN0OiAnRScsXHJcbi8vXHRcdFx0XHR0ZW1wbGF0ZTogZCxcclxuLy9cdFx0XHRcdHJlcGxhY2U6IHRydWUsXHJcbi8vXHRcdFx0XHRzY29wZToge1xyXG4vL1x0XHRcdFx0XHRjb250ZW50OiAnPSdcclxuLy9cdFx0XHRcdH1cclxuLy9cdFx0XHR9XHJcbi8vXHRcdH0pO1xyXG4vL1x0fTtcclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9fcmVmZXJlbmNlLnRzXCIgLz5cclxuXHJcbm1vZHVsZSBhcHAuaW50ZXJmYWNlcyB7XHJcblx0ZXhwb3J0IGludGVyZmFjZSBJTW9uaXRvclNjb3BlIGV4dGVuZHMgYW5ndWxhci5JU2NvcGUge1xyXG5cdFx0Ly8gdGhpcyBpcyB0aGUgd2hvbGUgZGF0YSwgeW91IGRvbid0IHdhbm5hIHVzZSB0aGlzXHJcblx0XHRkYXRhOiBhcHAuaW50ZXJmYWNlcy5JRGF0YU1vZGVsW107XHJcblx0XHRcclxuXHRcdC8vIFRoaXMgaXMgd2hhdCBnaXZlcyB5b3UgdG8gY3JlYXRlIGRpc3BsYXlcclxuXHRcdGQ/OiBhcHAuaW50ZXJmYWNlcy5JRGF0YU1vZGVsO1xyXG5cdH1cclxuXHRcclxuXHRleHBvcnQgaW50ZXJmYWNlIElTb2NrZXRDbGllbnQge1xyXG5cdFx0aXNTdG9wSW50ZW5kZWQ6IGJvb2xlYW47XHJcblx0fVxyXG5cclxuXHRleHBvcnQgaW50ZXJmYWNlIElTb2NrZXRDdHJsIHtcclxuXHRcdGludHJvZHVjdGlvbjogc3RyaW5nO1xyXG5cdFx0ZGlyZWN0aXZlOiBzdHJpbmc7XHJcblx0fVxyXG5cclxuXHRleHBvcnQgaW50ZXJmYWNlIElEYXRhTW9kZWwge1xyXG5cdFx0cm93aWQ6IG51bWJlcjtcclxuXHRcdFNlcnZlcklEOiBudW1iZXI7XHJcblx0XHRcclxuXHRcdE5hbWVzOiBzdHJpbmdbXTtcclxuXHRcdFZhbHVlczogbnVtYmVyW107XHJcblx0fVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvdHNkLmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9zZXJ2aWNlL3NvY2tldFN2Yy50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3NlcnZpY2UvZGF0YVN2Yy50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2ludGVyZmFjZXMvaW50ZXJmYWNlLnRzXCIgLz4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vX3JlZmVyZW5jZS50c1wiIC8+XHJcblxyXG5tb2R1bGUgYXBwLmhvbWUge1xyXG5cdGludGVyZmFjZSBJQ2hhcnRDdHJsIHtcclxuXHR9XHJcblxyXG5cdGNsYXNzIENoYXJ0Q3RybCBpbXBsZW1lbnRzIElDaGFydEN0cmwge1xyXG5cdFx0Y29uc3RydWN0b3IoKSB7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyLm1vZHVsZSgnYXBwJylcclxuXHRcdC5jb250cm9sbGVyKCdob21lLkNoYXJ0Q3RybCcsIENoYXJ0Q3RybCk7XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vX3JlZmVyZW5jZS50c1wiIC8+XHJcblxyXG5tb2R1bGUgYXBwLmhvbWUge1xyXG5cdGNsYXNzIE1vbml0b3JDdHJsIHtcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gWydEYXRhU3ZjJywgJyRzY29wZSddO1xyXG5cdFx0Y29uc3RydWN0b3IocHJpdmF0ZSBfZGF0YVN2YzogYXBwLnNlcnZpY2UuSURhdGFTdmMsXHJcblx0XHRcdHByaXZhdGUgX3Njb3BlOiBhcHAuaW50ZXJmYWNlcy5JTW9uaXRvclNjb3BlKSB7XHJcblx0XHRcdHRoaXMuX3Njb3BlLmRhdGEgPSBbXTtcclxuXHJcblx0XHRcdF9kYXRhU3ZjLm9uRGF0YVJlY2VpdmVkID0gZCA9PiB7XHJcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0XHR2YXIgZWxlbWVudCA9IGRbaV07XHJcblx0XHRcdFx0XHR0aGlzLl9zY29wZS5kYXRhW2ldID0gZWxlbWVudDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0dGhpcy5fc2NvcGUuJGFwcGx5KCk7XHJcblx0XHRcdH07XHJcblxyXG5cdFx0XHR2YXIgZGF0ID0gX2RhdGFTdmMuZGF0YVtfZGF0YVN2Yy5kYXRhLmxlbmd0aCAtIDFdO1xyXG5cdFx0XHRpZiAoZGF0ICE9IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdGRhdC5mb3JFYWNoKGUgPT4ge1xyXG5cdFx0XHRcdFx0dGhpcy5fc2NvcGUuZGF0YS5wdXNoKGUpO1xyXG5cdFx0XHRcdH0sIHRoaXMpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyLm1vZHVsZSgnYXBwJylcclxuXHRcdC5jb250cm9sbGVyKCdob21lLk1vbml0b3JDdHJsJywgTW9uaXRvckN0cmwpO1xyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL19yZWZlcmVuY2UudHNcIiAvPlxyXG5cclxubW9kdWxlIGFwcC5pbnRyb2R1Y3Rpb24ge1xyXG5cdGludGVyZmFjZSBJSW50cm9kdWN0aW9uQ3RybCB7XHJcblx0XHRpbnRyb2R1Y3Rpb246IHN0cmluZztcclxuXHR9XHJcblxyXG5cdGNsYXNzIEludHJvZHVjdGlvbkN0cmwgaW1wbGVtZW50cyBJSW50cm9kdWN0aW9uQ3RybCB7XHJcblx0XHRpbnRyb2R1Y3Rpb246IHN0cmluZyA9ICdQbGVhc2Ugb3BlbiBzZXR0aW5ncyBwYW5lIGZvciBjb25uZWN0aW5nIHRvIHRoZSBzZXJ2ZXIuJztcclxuXHJcblx0XHRzdGF0aWMgJGluamVjdCA9IFsnRGF0YVN2YyddO1xyXG5cdFx0Y29uc3RydWN0b3IocHJpdmF0ZSBfZGF0YVN2YzogYXBwLnNlcnZpY2UuSURhdGFTdmMpIHtcclxuXHRcdFx0X2RhdGFTdmMub25JbnRyb2R1Y3Rpb25SZWNlaXZlZCA9IGk9PiB0aGlzLmludHJvZHVjdGlvbiA9IGk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyLm1vZHVsZSgnYXBwJylcclxuXHRcdC5jb250cm9sbGVyKCdJbnRyb2R1Y3Rpb25DdHJsJywgSW50cm9kdWN0aW9uQ3RybCk7XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vX3JlZmVyZW5jZS50c1wiIC8+XHJcblxyXG5tb2R1bGUgYXBwLnNldHRpbmdzIHtcclxuXHRpbnRlcmZhY2UgSU1vZGVsU2NvcGUgZXh0ZW5kcyBhbmd1bGFyLklTY29wZSB7XHJcblx0XHRtb2RlbDogSW9uaWMuSU1vZGFsO1xyXG5cclxuXHRcdHNob3dNb2RhbCgpOiB2b2lkO1xyXG5cdFx0aGlkZU1vZGFsKCk6IHZvaWQ7XHJcblx0fVxyXG5cclxuXHRpbnRlcmZhY2UgSVNldHRpbmdzQ3RybCB7XHJcblx0XHRpcEFkZHJlc3M6IHN0cmluZztcclxuXHRcdHBvcnROdW06IG51bWJlcjtcclxuXHRcdG1zZ3M6IHN0cmluZ1tdO1xyXG5cdFx0YnRuU3RyaW5nOiBzdHJpbmc7XHJcblxyXG5cdFx0c3RhcnRDb21tYW5kKCk6IHZvaWQ7XHJcblx0fVxyXG5cclxuXHRjbGFzcyBTZXR0aW5nc0N0cmwgaW1wbGVtZW50cyBJU2V0dGluZ3NDdHJsIHtcclxuXHRcdGlwQWRkcmVzczogc3RyaW5nO1xyXG5cdFx0cG9ydE51bTogbnVtYmVyO1xyXG5cdFx0bXNnczogc3RyaW5nW10gPSBbXTtcclxuXHRcdGJ0blN0cmluZzogc3RyaW5nID0gJ1N0YXJ0JztcclxuXHRcdHByaXZhdGUgX2dvdERpcmVjdGl2ZTogYm9vbGVhbjtcclxuXHJcblx0XHRwcml2YXRlIF9pc0xpc3RlbmluZzogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gWyckc2NvcGUnLCAnU29ja2V0U3ZjJywgJyRpb25pY1BvcHVwJywgJyRpb25pY01vZGFsJywgJyRpb25pY0xvYWRpbmcnXTtcclxuXHRcdGNvbnN0cnVjdG9yKHByaXZhdGUgX3Njb3BlOiBJTW9kZWxTY29wZSxcclxuXHRcdFx0cHJpdmF0ZSBfc29ja2V0U3ZjOiBhcHAuc2VydmljZS5JU29ja2V0U3ZjLFxyXG5cdFx0XHRwcml2YXRlIF9pb25pY1BvcHVwOiBJb25pYy5JUG9wdXAsXHJcblx0XHRcdHByaXZhdGUgX2lvbmljTW9kZWw6IElvbmljLklNb2RhbCxcclxuXHRcdFx0cHJpdmF0ZSBfaW9uaWNMb2FkaW5nOiBJb25pYy5JTG9hZGluZykge1xyXG5cdFx0XHRfaW9uaWNNb2RlbC5mcm9tVGVtcGxhdGVVcmwoJy4uLy4uL3NldHRpbmdzL3NldHRpbmdzLmh0bWwnLCB7XHJcblx0XHRcdFx0c2NvcGU6IF9zY29wZSxcclxuXHRcdFx0XHRhbmltYXRpb246ICdzbGlkZS1pbi11cCdcclxuXHRcdFx0fSkudGhlbihtID0+IHtcclxuXHRcdFx0XHRfc2NvcGUubW9kZWwgPSBtO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdF9zY29wZS5zaG93TW9kYWwgPSAoKSA9PiB7XHJcblx0XHRcdFx0X3Njb3BlLm1vZGVsLnNob3coKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0X3Njb3BlLmhpZGVNb2RhbCA9ICgpID0+IHtcclxuXHRcdFx0XHRfc2NvcGUubW9kZWwuaGlkZSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0c3RhcnRDb21tYW5kKCk6IHZvaWQge1xyXG5cdFx0XHRpZiAoIXRoaXMuX2lzTGlzdGVuaW5nKSB7XHJcblx0XHRcdFx0dGhpcy5tc2dzID0gW107XHJcblx0XHRcdFx0dGhpcy5tc2dzLnB1c2goJ1N0YXJ0IExpc3RlbmluZy4uLicpO1xyXG5cdFx0XHRcdHRoaXMuX2lzTGlzdGVuaW5nID0gdHJ1ZTtcclxuXHRcdFx0XHR0aGlzLmJ0blN0cmluZyA9ICdTdG9wJztcclxuXHJcblx0XHRcdFx0dGhpcy5faW9uaWNMb2FkaW5nLnNob3coe1xyXG5cdFx0XHRcdFx0dGVtcGxhdGU6ICdSZXRyaWV2aW5nIGRhdGEuLi48YnIgLz5QbGVhc2Ugd2FpdC4uLidcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHRcdHRoaXMuX3NvY2tldFN2Yy5TdGFydExpc3RlbmluZyh0aGlzLmlwQWRkcmVzcywgdGhpcy5wb3J0TnVtLFxyXG5cdFx0XHRcdFx0KG1zZykgPT4ge1xyXG5cdFx0XHRcdFx0XHR0aGlzLm1zZ3MucHVzaChcIkRhdGEgcmVjZWl2ZWQgYXQgXCIgKyBtc2cudGltZVN0YW1wKTtcclxuXHJcblx0XHRcdFx0XHRcdGlmICghdGhpcy5fZ290RGlyZWN0aXZlKSB7XHJcblx0XHRcdFx0XHRcdFx0dGhpcy5faW9uaWNMb2FkaW5nLmhpZGUoKTtcclxuXHRcdFx0XHRcdFx0XHR0aGlzLl9nb3REaXJlY3RpdmUgPSB0cnVlO1xyXG5cdFx0XHRcdFx0XHR9XHJcblx0XHRcdFx0XHR9LFxyXG5cdFx0XHRcdFx0KGVycikgPT4ge1xyXG5cdFx0XHRcdFx0XHR0aGlzLl9pb25pY0xvYWRpbmcuaGlkZSgpO1xyXG5cdFx0XHRcdFx0XHR0aGlzLm1zZ3MucHVzaChlcnIpO1xyXG5cdFx0XHRcdFx0XHR0aGlzLl9pb25pY1BvcHVwLnNob3coe1xyXG5cdFx0XHRcdFx0XHRcdHRpdGxlOiAnRXJyb3IhJyxcclxuXHRcdFx0XHRcdFx0XHR0ZW1wbGF0ZTogJ0FuIGVycm9yIG9jY3VyZWQgd2hpbGUgY29ubmVjdGluZyB0byBzZXJ2ZXIuLi4nLFxyXG5cdFx0XHRcdFx0XHRcdGJ1dHRvbnM6IFt7IHRleHQ6ICdPSycgfV1cclxuXHRcdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRcdHRoaXMuX2lzTGlzdGVuaW5nID0gZmFsc2U7XHJcblx0XHRcdFx0XHRcdHRoaXMuYnRuU3RyaW5nID0gJ1N0YXJ0JztcclxuXHRcdFx0XHRcdH0pO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHRoaXMubXNncy5wdXNoKCdTdG9wIExpc3RlbmluZy4uLicpO1xyXG5cdFx0XHRcdHRoaXMuX3NvY2tldFN2Yy5TdG9wTGlzdGVuaW5nKCk7XHJcblxyXG5cdFx0XHRcdHRoaXMuX2lzTGlzdGVuaW5nID0gZmFsc2U7XHJcblx0XHRcdFx0dGhpcy5idG5TdHJpbmcgPSAnU3RhcnQnO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyLm1vZHVsZSgnYXBwJylcclxuXHRcdC5jb250cm9sbGVyKCdTZXR0aW5nc0N0cmwnLCBTZXR0aW5nc0N0cmwpO1xyXG59Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9