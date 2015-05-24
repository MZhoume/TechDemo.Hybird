/// <reference path="../_reference.ts" />

module app.home {
	interface IChartCtrl {
		id: number;

		labels: string[];
		series: string[];
		data: number[][];
	}

	class ChartCtrl implements IChartCtrl {
		private count: number;

		id: number;

		labels: string[];
		series: string[];
		data: number[][];

		static $inject = ['$stateParams', 'DataSvc', '$state'];
		constructor(private _stateParams: angular.ui.IStateParamsService,
			private _dataSvc: app.service.IDataSvc,
			private _state: angular.ui.IStateService) {
			this.id = parseInt(_stateParams['id']);
			this.count = 1;

			if (_dataSvc.data.length == 0) {
				return;
			}

			var dats = _dataSvc.data[this.id];
			var model = dats[0];

			this.series = model.Names;
			this.labels = [];
			this.data = [];

			for (var i = 0; i < dats.length; i++) {
				this.labels.push(this.count.toString());
				this.count++;

				for (var j = 0; j < model.Names.length; j++) {
					this.data[j] = this.data[j] || <number[]>[];

					var v = dats[i].Values[j];
					this.data[j].push(v);
				}
			}

			_dataSvc.onDataReceived = d => {
				this._state.reload();
			};
		}
	}

	angular.module('app')
		.controller('home.ChartCtrl', ChartCtrl);
}