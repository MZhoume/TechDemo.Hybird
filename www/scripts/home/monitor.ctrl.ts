/// <reference path="../_reference.ts" />

module app.home {
	interface IMonitorCtrl {
		title: string;
	}

	class MonitorCtrl implements IMonitorCtrl {
		title: string;

		constructor() {
			this.title = "Monitor";
		}
	}

	angular.module('app')
		.controller('home.MonitorCtrl', MonitorCtrl);
}