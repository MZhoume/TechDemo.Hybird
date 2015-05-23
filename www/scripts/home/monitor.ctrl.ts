/// <reference path="../_reference.ts" />

module app.home {
	class MonitorCtrl implements app.interfaces.IMonitorCtrl {
		Data: app.interfaces.IDataModel[];

		static $inject = ['DataSvc'];
		constructor(private _dataSvc: app.service.IDataSvc) {
			this.Data = [{
				rowid: 0,
				ServerID: 1,
				Names: ['aaa', 'bbb', 'ccc'],
				Values: [2, 3, 4]
			}];
		}
	}

	angular.module('app')
		.controller('home.MonitorCtrl', MonitorCtrl);
}