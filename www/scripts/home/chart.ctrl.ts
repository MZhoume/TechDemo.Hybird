/// <reference path="../_reference.ts" />

module app.home {
	interface IChartCtrl {
	}

	class ChartCtrl implements IChartCtrl {
		constructor() {
		}
	}

	angular.module('app')
		.controller('home.ChartCtrl', ChartCtrl);
}