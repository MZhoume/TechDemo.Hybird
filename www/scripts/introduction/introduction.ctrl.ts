/// <reference path="../_reference.ts" />

module app.introduction{
	interface IIntroductionCtrl {
		introduction: string;
	}
	
	class IntroductionCtrl implements IIntroductionCtrl{
		introduction: string;
		
		static $inject = ['DataSvc'];
		constructor(private _dataSvc: app.service.IDataSvc) {
		}
	}
	
	angular.module('app')
		.controller('IntroductionCtrl', IntroductionCtrl);
}