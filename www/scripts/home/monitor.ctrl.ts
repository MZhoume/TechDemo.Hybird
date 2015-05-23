/// <reference path="../_reference.ts" />

module app.home {
	class MonitorCtrl implements app.interfaces.IMonitorCtrl {
		data: app.interfaces.IDataModel[] = [{
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

		static $inject = ['DataSvc'];
		constructor(private _dataSvc: app.service.IDataSvc) {
		}
	}

	angular.module('app')
		.controller('home.MonitorCtrl', MonitorCtrl);
}