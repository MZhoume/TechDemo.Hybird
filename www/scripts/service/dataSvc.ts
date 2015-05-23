/// <reference path="../_reference.ts" />

module app.service {
	export interface IDataSvc {
		data: app.interfaces.IDataModel[][];

		onMsgReceived(msg: MessageEvent): void;

		onDataReceived: (data: app.interfaces.IDataModel[]) => void;
	}

	class DataSvc implements app.service.IDataSvc {
		data: app.interfaces.IDataModel[][];

		private _hasInited: boolean;

		static $inject = ['$templateCache'];
		constructor(private _templateCache: angular.ITemplateCacheService) {
			_templateCache.put('intro.html', 'Please open settings pane for connecting to the server.');
		}

		onMsgReceived(msg: MessageEvent): void {
			if (!this._hasInited) {
				this._hasInited = true;

				var payload = <app.interfaces.ISocketCtrl>JSON.parse(msg.data);
				this._templateCache.put('intro.html', payload.introduction);
				this._templateCache.put('control.html', payload.directive);
			} else {
				var data = <app.interfaces.IDataModel[]>JSON.parse(msg.data);

				for (var i = 0; i < data.length; i++) {
					var e = data[i];
					this.data[i].push(e);
				}
				this.onDataReceived(data);
			}
		}

		onDataReceived: (data: app.interfaces.IDataModel[]) => void = () => { }
	}

	angular.module('app')
		.service('DataSvc', DataSvc);
}