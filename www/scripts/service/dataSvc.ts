/// <reference path="../_reference.ts" />

module app.service {
	export interface IDataSvc {
		Data: app.interfaces.IDataModel[][];

		onMsgReceived(msg: MessageEvent): void;

		onIntroductionReceived: (introduction: string) => void;		
		onDataReceived: (data: app.interfaces.IDataModel[]) => void;
		onDirectiveReceived: (directive: string) => void;
	}
	
	class DataSvc implements app.service.IDataSvc {
		Data: app.interfaces.IDataModel[][];

		private _hasInited: boolean;

		constructor() {
		}

		onMsgReceived(msg: MessageEvent): void {
			if (!this._hasInited) {
				this._hasInited = true;
				
				var payload = <app.interfaces.ISocketCtrl>JSON.parse(msg.data);
				eval(payload.DataCtrl);
				this.onIntroductionReceived(payload.Introduction);
				this.onDirectiveReceived(payload.Directive);
			} else {
				var data = <app.interfaces.IDataModel[]>JSON.parse(msg.data);
				
				for (var i = 0; i < data.length; i++) {
					var e = data[i];
					this.Data[i].push(e);
				}
				this.onDataReceived(data);
			}
		}

		onIntroductionReceived: (introduction: string) => void = () => { }
		onDataReceived: (data: app.interfaces.IDataModel[]) => void = () => { }
		onDirectiveReceived: (directive: string) => void = () => { }
	}

	angular.module('app')
		.service('DataSvc', DataSvc);
}