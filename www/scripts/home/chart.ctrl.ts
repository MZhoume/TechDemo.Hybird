/// <reference path="../_reference.ts" />

module app.home {
	interface IChartCtrl {
		title: string;
	}

	class ChartCtrl implements IChartCtrl {
		title: string;
		
		HasControl: boolean = false;

		constructor() {
			this.title = 'Chart';
		}
	}

	angular.module('app')
		.controller('home.ChartCtrl', ChartCtrl);
}