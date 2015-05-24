/// <reference path="../_reference.ts" />

module app.home {
	class MonitorCtrl {
		static $inject = ['DataSvc', '$scope'];
		constructor(private _dataSvc: app.service.IDataSvc,
			private _scope: app.interfaces.IMonitorScope) {
			this._scope.data = [];

			_dataSvc.onDataReceived = d => {
				for (var i = 0; i < d.length; i++) {
					var element = d[i];
					this._scope.data[i] = element;
				}
				this._scope.$apply();
			};

			var dat = _dataSvc.data[_dataSvc.data.length - 1];
			if (dat != undefined) {
				dat.forEach(e => {
					this._scope.data.push(e);
				}, this);
			}
		}
	}

	angular.module('app')
		.controller('home.MonitorCtrl', MonitorCtrl);
}