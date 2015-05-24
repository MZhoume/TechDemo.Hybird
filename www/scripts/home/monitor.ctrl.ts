/// <reference path="../_reference.ts" />

module app.home {
	interface IMonitorCtrl {
		drawChart(id: number): void;
	}

	class MonitorCtrl implements IMonitorCtrl {
		static $inject = ['DataSvc', '$scope', '$state'];
		constructor(private _dataSvc: app.service.IDataSvc,
			private _scope: app.interfaces.IMonitorScope,
			private _state: angular.ui.IStateService) {
			this._scope.data = [];

			_dataSvc.onDataReceived = d => {
				for (var i = 0; i < d.length; i++) {
					var element = d[i];
					this._scope.data[i] = element;
				}
				this._scope.$apply();
			};

			var count = _dataSvc.data.length;
			if (count > 0) {
				for (var i = 0; i < count; i++) {
					var element = _dataSvc.data[i][_dataSvc.data[i].length - 1];
					_scope.data.push(element);
				}
			}
		}

		drawChart(id: number): void {
			this._state.go('home.chart', { "id": id });
		}
	}

	angular.module('app')
		.controller('home.MonitorCtrl', MonitorCtrl);
}