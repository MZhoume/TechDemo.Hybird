/// <reference path="../_reference.ts" />

module app.introduction {
	interface IIntroductionCtrl {
		introduction: string;
	}

	class IntroductionCtrl implements IIntroductionCtrl {
		introduction: string = 'Please open settings pane for connecting to the server.';

		static $inject = ['DataSvc'];
		constructor(private _dataSvc: app.service.IDataSvc) {
			_dataSvc.onIntroductionReceived = i=> this.introduction = i;
		}
	}

	angular.module('app')
		.controller('IntroductionCtrl', IntroductionCtrl);
}