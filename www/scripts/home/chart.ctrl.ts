/// <reference path="../_reference.ts" />

module app.home {
	interface IChartScope extends angular.IScope {
		labels: string[];
		series: string[];
		data: number[][];
	}
	
	interface IChartCtrl{
		id: number;
	}

	class ChartCtrl implements IChartCtrl {
		private count: number;

		id: number;

		static $inject = ['$stateParams', 'DataSvc', '$state', '$scope'];
		constructor(private _stateParams: angular.ui.IStateParamsService,
			private _dataSvc: app.service.IDataSvc,
			private _state: angular.ui.IStateService,
			private _scope: IChartScope) {
			this.id = parseInt(_stateParams['id']);
			this.count = 1;

			if (_dataSvc.data.length == 0) {
				return;
			}

			var dats = _dataSvc.data[this.id];
			var model = dats[0];

			_scope.series = model.Names;
			_scope.labels = [];
			_scope.data = [];

			for (var i = 0; i < dats.length; i++) {
				_scope.labels.push(this.count.toString());
				this.count++;

				for (var j = 0; j < model.Names.length; j++) {
					_scope.data[j] = _scope.data[j] || <number[]>[];

					var v = dats[i].Values[j];
					_scope.data[j].push(v);
				}
			}

			_dataSvc.onDataReceived = d => {
				var ele = d[this.id];
				for (var i = 0; i < ele.Values.length; i++) {
					var v = ele.Values[i];
					this._scope.data[i].push(v);
				}
				
				this._scope.labels.push(this.count.toString());
				this.count++;
				
				this._scope.$apply();
			};
		}
	}

	angular.module('app')
		.controller('home.ChartCtrl', ChartCtrl);
}