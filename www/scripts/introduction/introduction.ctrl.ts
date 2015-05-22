/// <reference path="../_reference.ts" />

module app.introduction{
	interface IIntroductionCtrl {
		title: string;
	}
	
	class IntroductionCtrl implements IIntroductionCtrl{
		title: string;
		
		constructor() {
			this.title = 'Introduction';
		}
	}
	
	angular.module('app')
		.controller('IntroductionCtrl', IntroductionCtrl);
}