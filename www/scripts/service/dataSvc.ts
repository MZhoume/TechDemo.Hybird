/// <reference path="../_reference.ts" />

module app.service {
	export interface IDataSvc {
		data: app.interfaces.IDataModel[][];

		onMsgReceived(msg: MessageEvent): void;

		onDataReceived: (data: app.interfaces.IDataModel[]) => void;
		onIntroductionReceived: (intro: string) => void;
		//onDirectiveReceived: (dir: string) => void;
	}

	class DataSvc implements app.service.IDataSvc {
		data: app.interfaces.IDataModel[][] = [];

		private _hasInited: boolean;

		static $inject = ['$templateCache'];
		constructor(private _templateCache: angular.ITemplateCacheService) {
			//_templateCache.put('control.html', '');
		}

		onMsgReceived(msg: MessageEvent): void {
			var payload = JSON.parse(msg.data);

			if (payload.introduction) {
				this.onIntroductionReceived.call(this, payload.introduction);
				//this.onDirectiveReceived.call(this, payload.directive);
				//this._templateCache.put('control.html', payload.directive);
			} else {
				for (var i = 0; i < payload.length; i++) {
					var e = payload[i];
					if (!this.data[i]) {
						this.data[i] = [];
					}
					this.data[i].push(e);
				}
				this.onDataReceived(payload);
			}
		}

		onDataReceived: (data: app.interfaces.IDataModel[]) => void = () => { }
		onIntroductionReceived: (intro: string) => void = () => { }
		//onDirectiveReceived: (dir: string) => void = () => { }
	}

	angular.module('app')
		.service('DataSvc', DataSvc);
//	
//	DataSvc.prototype.onDirectiveReceived = function(d: string): void {
//		angular.module('app').directive('control', function() {
//			return {
//				restrict: 'E',
//				template: d,
//				replace: true,
//				scope: {
//					content: '='
//				}
//			}
//		});
//	};
}