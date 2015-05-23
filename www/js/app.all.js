/// <reference path="../_reference.ts" />
var app;
(function (app) {
    var service;
    (function (service) {
        var SocketSvc = (function () {
            function SocketSvc(_dataSvc, _ionicLoading) {
                this._dataSvc = _dataSvc;
                this._ionicLoading = _ionicLoading;
            }
            SocketSvc.prototype.StartListening = function (ipAddr, portNum, callback, errCallback) {
                var _this = this;
                console.log('Connectiong to: ' + ipAddr + ':' + portNum);
                this._isListening = true;
                this._ionicLoading.show({
                    template: 'Retrieving data...<br />Please wait...'
                });
                try {
                    this._socket = new WebSocket("ws://" + ipAddr + ':' + portNum);
                    this._socket.onmessage = function (msg) {
                        _this._dataSvc.onMsgReceived(msg);
                        callback(msg);
                        if (!_this._gotDirective) {
                            _this._ionicLoading.hide();
                            _this._gotDirective = true;
                        }
                    };
                    this._socket.onerror = function (e) {
                        _this._ionicLoading.hide();
                        errCallback('An error occured from the WebSocket...');
                    };
                }
                catch (err) {
                    this._ionicLoading.hide();
                    errCallback(err);
                }
            };
            SocketSvc.prototype.StopListening = function () {
                console.log('Disconnecting...');
                this._isListening = false;
                this._socket.close();
                this._socket.onmessage = null;
                this._socket.onerror = null;
            };
            SocketSvc.prototype.SendStr = function (str) {
                this._socket.send(str);
            };
            SocketSvc.$inject = ['DataSvc', '$ionicLoading'];
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
                this.onDataReceived = function () {
                };
                _templateCache.put('intro.html', 'Please open settings pane for connecting to the server.');
            }
            DataSvc.prototype.onMsgReceived = function (msg) {
                if (!this._hasInited) {
                    this._hasInited = true;
                    var payload = JSON.parse(msg.data);
                    this._templateCache.put('intro.html', payload.introduction);
                    this._templateCache.put('control.html', payload.directive);
                }
                else {
                    var data = JSON.parse(msg.data);
                    for (var i = 0; i < data.length; i++) {
                        var e = data[i];
                        this.data[i].push(e);
                    }
                    this.onDataReceived(data);
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
                this.HasControl = false;
                this.title = 'Chart';
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
            function MonitorCtrl(_dataSvc) {
                this._dataSvc = _dataSvc;
                this.data = [{
                    rowid: 0,
                    serverID: 1,
                    names: ['aaa', 'bbb', 'ccc'],
                    values: [2, 3, 4]
                }, {
                    rowid: 1,
                    serverID: 2,
                    names: ['a', 'b', 'c'],
                    values: [12, 13, 14]
                }];
            }
            MonitorCtrl.$inject = ['DataSvc'];
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
                this._dataSvc = _dataSvc;
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
            function SettingsCtrl(_scope, _socketSvc, _ionicPopup, _ionicModel) {
                this._scope = _scope;
                this._socketSvc = _socketSvc;
                this._ionicPopup = _ionicPopup;
                this._ionicModel = _ionicModel;
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
                    this._socketSvc.StartListening(this.ipAddress, this.portNum, function (msg) {
                        _this.msgs.push("Data received at " + msg.timeStamp);
                    }, function (err) {
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
            SettingsCtrl.$inject = ['$scope', 'SocketSvc', '$ionicPopup', '$ionicModal'];
            return SettingsCtrl;
        })();
        angular.module('app').controller('SettingsCtrl', SettingsCtrl);
    })(settings = app.settings || (app.settings = {}));
})(app || (app = {}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlcnZpY2Uvc29ja2V0U3ZjLnRzIiwic2VydmljZS9kYXRhU3ZjLnRzIiwiaW50ZXJmYWNlcy9pbnRlcmZhY2UudHMiLCJfcmVmZXJlbmNlLnRzIiwiaG9tZS9jaGFydC5jdHJsLnRzIiwiaG9tZS9tb25pdG9yLmN0cmwudHMiLCJpbnRyb2R1Y3Rpb24vaW50cm9kdWN0aW9uLmN0cmwudHMiLCJzZXR0aW5ncy9zZXR0aW5ncy5jdHJsLnRzIl0sIm5hbWVzIjpbImFwcCIsImFwcC5zZXJ2aWNlIiwiYXBwLnNlcnZpY2UuU29ja2V0U3ZjIiwiYXBwLnNlcnZpY2UuU29ja2V0U3ZjLmNvbnN0cnVjdG9yIiwiYXBwLnNlcnZpY2UuU29ja2V0U3ZjLlN0YXJ0TGlzdGVuaW5nIiwiYXBwLnNlcnZpY2UuU29ja2V0U3ZjLlN0b3BMaXN0ZW5pbmciLCJhcHAuc2VydmljZS5Tb2NrZXRTdmMuU2VuZFN0ciIsImFwcC5zZXJ2aWNlLkRhdGFTdmMiLCJhcHAuc2VydmljZS5EYXRhU3ZjLmNvbnN0cnVjdG9yIiwiYXBwLnNlcnZpY2UuRGF0YVN2Yy5vbk1zZ1JlY2VpdmVkIiwiYXBwLmhvbWUiLCJhcHAuaG9tZS5DaGFydEN0cmwiLCJhcHAuaG9tZS5DaGFydEN0cmwuY29uc3RydWN0b3IiLCJhcHAuaG9tZS5Nb25pdG9yQ3RybCIsImFwcC5ob21lLk1vbml0b3JDdHJsLmNvbnN0cnVjdG9yIiwiYXBwLmludHJvZHVjdGlvbiIsImFwcC5pbnRyb2R1Y3Rpb24uSW50cm9kdWN0aW9uQ3RybCIsImFwcC5pbnRyb2R1Y3Rpb24uSW50cm9kdWN0aW9uQ3RybC5jb25zdHJ1Y3RvciIsImFwcC5zZXR0aW5ncyIsImFwcC5zZXR0aW5ncy5TZXR0aW5nc0N0cmwiLCJhcHAuc2V0dGluZ3MuU2V0dGluZ3NDdHJsLmNvbnN0cnVjdG9yIiwiYXBwLnNldHRpbmdzLlNldHRpbmdzQ3RybC5zdGFydENvbW1hbmQiXSwibWFwcGluZ3MiOiJBQUFBLHlDQUF5QztBQUV6QyxJQUFPLEdBQUcs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Q3BDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxhQUFhQSxFQUFFQSxDQUFDQTtvQkFFaENBLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBLEtBQUtBLENBQUNBO29CQUMxQkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsT0FBT0EsQ0FBQ0E7Z0JBQzFCQSxDQUFDQTtZQUNGQSxDQUFDQTtZQWpETUYsb0JBQU9BLEdBQUdBLENBQUNBLFFBQVFBLEVBQUVBLFdBQVdBLEVBQUVBLGFBQWFBLEVBQUVBLGFBQWFBLENBQUNBLENBQUNBO1lBa0R4RUEsbUJBQUNBO1FBQURBLENBMURBRCxBQTBEQ0MsSUFBQUQ7UUFFREEsT0FBT0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FDbkJBLFVBQVVBLENBQUNBLGNBQWNBLEVBQUVBLFlBQVlBLENBQUNBLENBQUNBO0lBQzVDQSxDQUFDQSxFQS9FVWxCLFFBQVFBLEdBQVJBLFlBQVFBLEtBQVJBLFlBQVFBLFFBK0VsQkE7QUFBREEsQ0FBQ0EsRUEvRU0sR0FBRyxLQUFILEdBQUcsUUErRVQiLCJmaWxlIjoiYXBwLmFsbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9fcmVmZXJlbmNlLnRzXCIgLz5cclxuXHJcbm1vZHVsZSBhcHAuc2VydmljZSB7XHJcblx0ZXhwb3J0IGludGVyZmFjZSBJU29ja2V0U3ZjIHtcclxuXHRcdFN0YXJ0TGlzdGVuaW5nKFxyXG5cdFx0XHRpcEFkZHI6IHN0cmluZyxcclxuXHRcdFx0cG9ydE51bTogbnVtYmVyLFxyXG5cdFx0XHRjYWxsYmFjazogKG1zZzogTWVzc2FnZUV2ZW50KSA9PiB2b2lkLFxyXG5cdFx0XHRlcnJDYWxsYmFjazogKGVycjogc3RyaW5nKSA9PiB2b2lkXHJcblx0XHRcdCk6IHZvaWQ7XHJcblxyXG5cdFx0U3RvcExpc3RlbmluZygpOiB2b2lkO1xyXG5cdFx0U2VuZFN0cihzdHI6IHN0cmluZyk6IHZvaWQ7XHJcblx0fVxyXG5cclxuXHRjbGFzcyBTb2NrZXRTdmMgaW1wbGVtZW50cyBJU29ja2V0U3ZjIHtcclxuXHRcdHByaXZhdGUgX2lzTGlzdGVuaW5nOiBib29sZWFuO1xyXG5cdFx0cHJpdmF0ZSBfc29ja2V0OiBXZWJTb2NrZXQ7XHJcblx0XHRwcml2YXRlIF9nb3REaXJlY3RpdmU6IGJvb2xlYW47XHJcblxyXG5cdFx0c3RhdGljICRpbmplY3QgPSBbJ0RhdGFTdmMnLCAnJGlvbmljTG9hZGluZyddO1xyXG5cdFx0Y29uc3RydWN0b3IocHJpdmF0ZSBfZGF0YVN2YzogYXBwLnNlcnZpY2UuSURhdGFTdmMsXHJcblx0XHRcdHByaXZhdGUgX2lvbmljTG9hZGluZzogSW9uaWMuSUxvYWRpbmcpIHtcclxuXHRcdH1cclxuXHJcblx0XHRTdGFydExpc3RlbmluZyhpcEFkZHI6IHN0cmluZywgcG9ydE51bTogbnVtYmVyLCBjYWxsYmFjazogKG1zZzogTWVzc2FnZUV2ZW50KSA9PiB2b2lkLFxyXG5cdFx0XHRlcnJDYWxsYmFjazogKGVycjogc3RyaW5nKSA9PiB2b2lkKTogdm9pZCB7XHJcblx0XHRcdGNvbnNvbGUubG9nKCdDb25uZWN0aW9uZyB0bzogJyArIGlwQWRkciArICc6JyArIHBvcnROdW0pO1xyXG5cdFx0XHR0aGlzLl9pc0xpc3RlbmluZyA9IHRydWU7XHJcblxyXG5cdFx0XHR0aGlzLl9pb25pY0xvYWRpbmcuc2hvdyh7XHJcblx0XHRcdFx0dGVtcGxhdGU6ICdSZXRyaWV2aW5nIGRhdGEuLi48YnIgLz5QbGVhc2Ugd2FpdC4uLidcclxuXHRcdFx0fSlcclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHR0aGlzLl9zb2NrZXQgPSBuZXcgV2ViU29ja2V0KFwid3M6Ly9cIiArIGlwQWRkciArICc6JyArIHBvcnROdW0pO1xyXG5cdFx0XHRcdHRoaXMuX3NvY2tldC5vbm1lc3NhZ2UgPSAobXNnKSA9PiB7XHJcblx0XHRcdFx0XHR0aGlzLl9kYXRhU3ZjLm9uTXNnUmVjZWl2ZWQobXNnKTtcclxuXHRcdFx0XHRcdGNhbGxiYWNrKG1zZyk7XHJcblxyXG5cdFx0XHRcdFx0aWYgKCF0aGlzLl9nb3REaXJlY3RpdmUpIHtcclxuXHRcdFx0XHRcdFx0dGhpcy5faW9uaWNMb2FkaW5nLmhpZGUoKTtcclxuXHRcdFx0XHRcdFx0dGhpcy5fZ290RGlyZWN0aXZlID0gdHJ1ZTtcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9O1xyXG5cdFx0XHRcdHRoaXMuX3NvY2tldC5vbmVycm9yID0gZSA9PiB7XHJcblx0XHRcdFx0XHR0aGlzLl9pb25pY0xvYWRpbmcuaGlkZSgpO1xyXG5cdFx0XHRcdFx0ZXJyQ2FsbGJhY2soJ0FuIGVycm9yIG9jY3VyZWQgZnJvbSB0aGUgV2ViU29ja2V0Li4uJyk7XHJcblx0XHRcdFx0fTtcclxuXHRcdFx0fSBjYXRjaCAoZXJyKSB7XHJcblx0XHRcdFx0dGhpcy5faW9uaWNMb2FkaW5nLmhpZGUoKTtcclxuXHRcdFx0XHRlcnJDYWxsYmFjayhlcnIpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblxyXG5cdFx0U3RvcExpc3RlbmluZygpOiB2b2lkIHtcclxuXHRcdFx0Y29uc29sZS5sb2coJ0Rpc2Nvbm5lY3RpbmcuLi4nKTtcclxuXHRcdFx0dGhpcy5faXNMaXN0ZW5pbmcgPSBmYWxzZTtcclxuXHJcblx0XHRcdHRoaXMuX3NvY2tldC5jbG9zZSgpO1xyXG5cdFx0XHR0aGlzLl9zb2NrZXQub25tZXNzYWdlID0gbnVsbDtcclxuXHRcdFx0dGhpcy5fc29ja2V0Lm9uZXJyb3IgPSBudWxsO1xyXG5cdFx0fVxyXG5cclxuXHRcdFNlbmRTdHIoc3RyOiBzdHJpbmcpOiB2b2lkIHtcclxuXHRcdFx0dGhpcy5fc29ja2V0LnNlbmQoc3RyKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXIubW9kdWxlKCdhcHAnKVxyXG5cdFx0LnNlcnZpY2UoJ1NvY2tldFN2YycsIFNvY2tldFN2Yyk7XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vX3JlZmVyZW5jZS50c1wiIC8+XHJcblxyXG5tb2R1bGUgYXBwLnNlcnZpY2Uge1xyXG5cdGV4cG9ydCBpbnRlcmZhY2UgSURhdGFTdmMge1xyXG5cdFx0ZGF0YTogYXBwLmludGVyZmFjZXMuSURhdGFNb2RlbFtdW107XHJcblxyXG5cdFx0b25Nc2dSZWNlaXZlZChtc2c6IE1lc3NhZ2VFdmVudCk6IHZvaWQ7XHJcblxyXG5cdFx0b25EYXRhUmVjZWl2ZWQ6IChkYXRhOiBhcHAuaW50ZXJmYWNlcy5JRGF0YU1vZGVsW10pID0+IHZvaWQ7XHJcblx0fVxyXG5cclxuXHRjbGFzcyBEYXRhU3ZjIGltcGxlbWVudHMgYXBwLnNlcnZpY2UuSURhdGFTdmMge1xyXG5cdFx0ZGF0YTogYXBwLmludGVyZmFjZXMuSURhdGFNb2RlbFtdW107XHJcblxyXG5cdFx0cHJpdmF0ZSBfaGFzSW5pdGVkOiBib29sZWFuO1xyXG5cclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gWyckdGVtcGxhdGVDYWNoZSddO1xyXG5cdFx0Y29uc3RydWN0b3IocHJpdmF0ZSBfdGVtcGxhdGVDYWNoZTogYW5ndWxhci5JVGVtcGxhdGVDYWNoZVNlcnZpY2UpIHtcclxuXHRcdFx0X3RlbXBsYXRlQ2FjaGUucHV0KCdpbnRyby5odG1sJywgJ1BsZWFzZSBvcGVuIHNldHRpbmdzIHBhbmUgZm9yIGNvbm5lY3RpbmcgdG8gdGhlIHNlcnZlci4nKTtcclxuXHRcdH1cclxuXHJcblx0XHRvbk1zZ1JlY2VpdmVkKG1zZzogTWVzc2FnZUV2ZW50KTogdm9pZCB7XHJcblx0XHRcdGlmICghdGhpcy5faGFzSW5pdGVkKSB7XHJcblx0XHRcdFx0dGhpcy5faGFzSW5pdGVkID0gdHJ1ZTtcclxuXHJcblx0XHRcdFx0dmFyIHBheWxvYWQgPSA8YXBwLmludGVyZmFjZXMuSVNvY2tldEN0cmw+SlNPTi5wYXJzZShtc2cuZGF0YSk7XHJcblx0XHRcdFx0dGhpcy5fdGVtcGxhdGVDYWNoZS5wdXQoJ2ludHJvLmh0bWwnLCBwYXlsb2FkLmludHJvZHVjdGlvbik7XHJcblx0XHRcdFx0dGhpcy5fdGVtcGxhdGVDYWNoZS5wdXQoJ2NvbnRyb2wuaHRtbCcsIHBheWxvYWQuZGlyZWN0aXZlKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHR2YXIgZGF0YSA9IDxhcHAuaW50ZXJmYWNlcy5JRGF0YU1vZGVsW10+SlNPTi5wYXJzZShtc2cuZGF0YSk7XHJcblxyXG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdFx0dmFyIGUgPSBkYXRhW2ldO1xyXG5cdFx0XHRcdFx0dGhpcy5kYXRhW2ldLnB1c2goZSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHRoaXMub25EYXRhUmVjZWl2ZWQoZGF0YSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0XHRvbkRhdGFSZWNlaXZlZDogKGRhdGE6IGFwcC5pbnRlcmZhY2VzLklEYXRhTW9kZWxbXSkgPT4gdm9pZCA9ICgpID0+IHsgfVxyXG5cdH1cclxuXHJcblx0YW5ndWxhci5tb2R1bGUoJ2FwcCcpXHJcblx0XHQuc2VydmljZSgnRGF0YVN2YycsIERhdGFTdmMpO1xyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL19yZWZlcmVuY2UudHNcIiAvPlxyXG5cclxubW9kdWxlIGFwcC5pbnRlcmZhY2VzIHtcclxuXHRleHBvcnQgaW50ZXJmYWNlIElNb25pdG9yQ3RybCB7XHJcblx0XHRkYXRhOiBJRGF0YU1vZGVsW107XHJcblx0fVxyXG5cclxuXHRleHBvcnQgaW50ZXJmYWNlIElTb2NrZXRDdHJsIHtcclxuXHRcdGludHJvZHVjdGlvbjogc3RyaW5nO1xyXG5cdFx0ZGlyZWN0aXZlOiBzdHJpbmc7XHJcblx0fVxyXG5cclxuXHRleHBvcnQgaW50ZXJmYWNlIElEYXRhTW9kZWwge1xyXG5cdFx0cm93aWQ6IG51bWJlcjtcclxuXHRcdHNlcnZlcklEOiBudW1iZXI7XHJcblx0XHRcclxuXHRcdG5hbWVzOiBzdHJpbmdbXTtcclxuXHRcdHZhbHVlczogbnVtYmVyW107XHJcblx0fVxyXG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvdHNkLmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi9zZXJ2aWNlL3NvY2tldFN2Yy50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3NlcnZpY2UvZGF0YVN2Yy50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL2ludGVyZmFjZXMvaW50ZXJmYWNlLnRzXCIgLz4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vX3JlZmVyZW5jZS50c1wiIC8+XHJcblxyXG5tb2R1bGUgYXBwLmhvbWUge1xyXG5cdGludGVyZmFjZSBJQ2hhcnRDdHJsIHtcclxuXHRcdHRpdGxlOiBzdHJpbmc7XHJcblx0fVxyXG5cclxuXHRjbGFzcyBDaGFydEN0cmwgaW1wbGVtZW50cyBJQ2hhcnRDdHJsIHtcclxuXHRcdHRpdGxlOiBzdHJpbmc7XHJcblx0XHRcclxuXHRcdEhhc0NvbnRyb2w6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcblx0XHRjb25zdHJ1Y3RvcigpIHtcclxuXHRcdFx0dGhpcy50aXRsZSA9ICdDaGFydCc7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRhbmd1bGFyLm1vZHVsZSgnYXBwJylcclxuXHRcdC5jb250cm9sbGVyKCdob21lLkNoYXJ0Q3RybCcsIENoYXJ0Q3RybCk7XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vX3JlZmVyZW5jZS50c1wiIC8+XHJcblxyXG5tb2R1bGUgYXBwLmhvbWUge1xyXG5cdGNsYXNzIE1vbml0b3JDdHJsIGltcGxlbWVudHMgYXBwLmludGVyZmFjZXMuSU1vbml0b3JDdHJsIHtcclxuXHRcdGRhdGE6IGFwcC5pbnRlcmZhY2VzLklEYXRhTW9kZWxbXSA9IFt7XHJcblx0XHRcdHJvd2lkOiAwLFxyXG5cdFx0XHRzZXJ2ZXJJRDogMSxcclxuXHRcdFx0bmFtZXM6IFsnYWFhJywgJ2JiYicsICdjY2MnXSxcclxuXHRcdFx0dmFsdWVzOiBbMiwgMywgNF1cclxuXHRcdH0sIHtcclxuXHRcdFx0XHRyb3dpZDogMSxcclxuXHRcdFx0XHRzZXJ2ZXJJRDogMixcclxuXHRcdFx0XHRuYW1lczogWydhJywgJ2InLCAnYyddLFxyXG5cdFx0XHRcdHZhbHVlczogWzEyLCAxMywgMTRdXHJcblx0XHRcdH1dO1xyXG5cclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gWydEYXRhU3ZjJ107XHJcblx0XHRjb25zdHJ1Y3Rvcihwcml2YXRlIF9kYXRhU3ZjOiBhcHAuc2VydmljZS5JRGF0YVN2Yykge1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0YW5ndWxhci5tb2R1bGUoJ2FwcCcpXHJcblx0XHQuY29udHJvbGxlcignaG9tZS5Nb25pdG9yQ3RybCcsIE1vbml0b3JDdHJsKTtcclxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9fcmVmZXJlbmNlLnRzXCIgLz5cclxuXHJcbm1vZHVsZSBhcHAuaW50cm9kdWN0aW9ue1xyXG5cdGludGVyZmFjZSBJSW50cm9kdWN0aW9uQ3RybCB7XHJcblx0XHRpbnRyb2R1Y3Rpb246IHN0cmluZztcclxuXHR9XHJcblx0XHJcblx0Y2xhc3MgSW50cm9kdWN0aW9uQ3RybCBpbXBsZW1lbnRzIElJbnRyb2R1Y3Rpb25DdHJse1xyXG5cdFx0aW50cm9kdWN0aW9uOiBzdHJpbmc7XHJcblx0XHRcclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gWydEYXRhU3ZjJ107XHJcblx0XHRjb25zdHJ1Y3Rvcihwcml2YXRlIF9kYXRhU3ZjOiBhcHAuc2VydmljZS5JRGF0YVN2Yykge1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRhbmd1bGFyLm1vZHVsZSgnYXBwJylcclxuXHRcdC5jb250cm9sbGVyKCdJbnRyb2R1Y3Rpb25DdHJsJywgSW50cm9kdWN0aW9uQ3RybCk7XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vX3JlZmVyZW5jZS50c1wiIC8+XHJcblxyXG5tb2R1bGUgYXBwLnNldHRpbmdzIHtcclxuXHRpbnRlcmZhY2UgSU1vZGVsU2NvcGUgZXh0ZW5kcyBhbmd1bGFyLklTY29wZSB7XHJcblx0XHRtb2RlbDogSW9uaWMuSU1vZGFsO1xyXG5cclxuXHRcdHNob3dNb2RhbCgpOiB2b2lkO1xyXG5cdFx0aGlkZU1vZGFsKCk6IHZvaWQ7XHJcblx0fVxyXG5cclxuXHRpbnRlcmZhY2UgSVNldHRpbmdzQ3RybCB7XHJcblx0XHRpcEFkZHJlc3M6IHN0cmluZztcclxuXHRcdHBvcnROdW06IG51bWJlcjtcclxuXHRcdG1zZ3M6IHN0cmluZ1tdO1xyXG5cdFx0YnRuU3RyaW5nOiBzdHJpbmc7XHJcblxyXG5cdFx0c3RhcnRDb21tYW5kKCk6IHZvaWQ7XHJcblx0fVxyXG5cclxuXHRjbGFzcyBTZXR0aW5nc0N0cmwgaW1wbGVtZW50cyBJU2V0dGluZ3NDdHJsIHtcclxuXHRcdGlwQWRkcmVzczogc3RyaW5nO1xyXG5cdFx0cG9ydE51bTogbnVtYmVyO1xyXG5cdFx0bXNnczogc3RyaW5nW10gPSBbXTtcclxuXHRcdGJ0blN0cmluZzogc3RyaW5nID0gJ1N0YXJ0JztcclxuXHJcblx0XHRwcml2YXRlIF9pc0xpc3RlbmluZzogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuXHRcdHN0YXRpYyAkaW5qZWN0ID0gWyckc2NvcGUnLCAnU29ja2V0U3ZjJywgJyRpb25pY1BvcHVwJywgJyRpb25pY01vZGFsJ107XHJcblx0XHRjb25zdHJ1Y3Rvcihwcml2YXRlIF9zY29wZTogSU1vZGVsU2NvcGUsXHJcblx0XHRcdHByaXZhdGUgX3NvY2tldFN2YzogYXBwLnNlcnZpY2UuSVNvY2tldFN2YyxcclxuXHRcdFx0cHJpdmF0ZSBfaW9uaWNQb3B1cDogSW9uaWMuSVBvcHVwLFxyXG5cdFx0XHRwcml2YXRlIF9pb25pY01vZGVsOiBJb25pYy5JTW9kYWwpIHtcclxuXHRcdFx0X2lvbmljTW9kZWwuZnJvbVRlbXBsYXRlVXJsKCcuLi8uLi9zZXR0aW5ncy9zZXR0aW5ncy5odG1sJywge1xyXG5cdFx0XHRcdHNjb3BlOiBfc2NvcGUsXHJcblx0XHRcdFx0YW5pbWF0aW9uOiAnc2xpZGUtaW4tdXAnXHJcblx0XHRcdH0pLnRoZW4obSA9PiB7XHJcblx0XHRcdFx0X3Njb3BlLm1vZGVsID0gbTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRfc2NvcGUuc2hvd01vZGFsID0gKCkgPT4ge1xyXG5cdFx0XHRcdF9zY29wZS5tb2RlbC5zaG93KCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdF9zY29wZS5oaWRlTW9kYWwgPSAoKSA9PiB7XHJcblx0XHRcdFx0X3Njb3BlLm1vZGVsLmhpZGUoKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHN0YXJ0Q29tbWFuZCgpOiB2b2lkIHtcclxuXHRcdFx0aWYgKCF0aGlzLl9pc0xpc3RlbmluZykge1xyXG5cdFx0XHRcdHRoaXMubXNncyA9IFtdO1xyXG5cdFx0XHRcdHRoaXMubXNncy5wdXNoKCdTdGFydCBMaXN0ZW5pbmcuLi4nKTtcclxuXHRcdFx0XHR0aGlzLl9pc0xpc3RlbmluZyA9IHRydWU7XHJcblx0XHRcdFx0dGhpcy5idG5TdHJpbmcgPSAnU3RvcCc7XHJcblxyXG5cdFx0XHRcdHRoaXMuX3NvY2tldFN2Yy5TdGFydExpc3RlbmluZyh0aGlzLmlwQWRkcmVzcywgdGhpcy5wb3J0TnVtLFxyXG5cdFx0XHRcdFx0KG1zZykgPT4ge1xyXG5cdFx0XHRcdFx0XHR0aGlzLm1zZ3MucHVzaChcIkRhdGEgcmVjZWl2ZWQgYXQgXCIgKyBtc2cudGltZVN0YW1wKTtcclxuXHRcdFx0XHRcdH0sXHJcblx0XHRcdFx0XHQoZXJyKSA9PiB7XHJcblx0XHRcdFx0XHRcdHRoaXMubXNncy5wdXNoKGVycik7XHJcblx0XHRcdFx0XHRcdHRoaXMuX2lvbmljUG9wdXAuc2hvdyh7XHJcblx0XHRcdFx0XHRcdFx0dGl0bGU6ICdFcnJvciEnLFxyXG5cdFx0XHRcdFx0XHRcdHRlbXBsYXRlOiAnQW4gZXJyb3Igb2NjdXJlZCB3aGlsZSBjb25uZWN0aW5nIHRvIHNlcnZlci4uLicsXHJcblx0XHRcdFx0XHRcdFx0YnV0dG9uczogW3sgdGV4dDogJ09LJyB9XVxyXG5cdFx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHRcdFx0dGhpcy5faXNMaXN0ZW5pbmcgPSBmYWxzZTtcclxuXHRcdFx0XHRcdFx0dGhpcy5idG5TdHJpbmcgPSAnU3RhcnQnO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0dGhpcy5tc2dzLnB1c2goJ1N0b3AgTGlzdGVuaW5nLi4uJyk7XHJcblx0XHRcdFx0dGhpcy5fc29ja2V0U3ZjLlN0b3BMaXN0ZW5pbmcoKTtcclxuXHJcblx0XHRcdFx0dGhpcy5faXNMaXN0ZW5pbmcgPSBmYWxzZTtcclxuXHRcdFx0XHR0aGlzLmJ0blN0cmluZyA9ICdTdGFydCc7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGFuZ3VsYXIubW9kdWxlKCdhcHAnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ1NldHRpbmdzQ3RybCcsIFNldHRpbmdzQ3RybCk7XHJcbn0iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=