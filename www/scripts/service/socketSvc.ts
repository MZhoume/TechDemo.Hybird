/// <reference path="../_reference.ts" />

module app.service {
	export interface ISocketSvc {
		StartListening(
			ipAddr: string,
			portNum: number,
			callback: (msg: MessageEvent) => void,
			errCallback: (err: string) => void
			): void;

		StopListening(): void;
		SendStr(str: string): void;
	}

	class SocketSvc implements ISocketSvc {
		private _isListening: boolean;
		private _socket: WebSocket;
		private _gotDirective: boolean;

		static $inject = ['DataSvc', '$ionicLoading'];
		constructor(private _dataSvc: app.service.IDataSvc,
			private _ionicLoading: Ionic.ILoading) {
		}

		StartListening(ipAddr: string, portNum: number, callback: (msg: MessageEvent) => void,
			errCallback: (err: string) => void): void {
			console.log('Connectiong to: ' + ipAddr + ':' + portNum);
			this._isListening = true;

			this._ionicLoading.show({
				template: 'Retrieving data...<br />Please wait...'
			})
			try {
				this._socket = new WebSocket("ws://" + ipAddr + ':' + portNum);
				this._socket.onmessage = (msg) => {
					this._dataSvc.onMsgReceived(msg);
					callback(msg);

					if (!this._gotDirective) {
						this._ionicLoading.hide();
						this._gotDirective = true;
					}
				};
				this._socket.onerror = e => {
					this._ionicLoading.hide();
					errCallback('An error occured from the WebSocket...');
				};
			} catch (err) {
				this._ionicLoading.hide();
				errCallback(err);
			}
		}

		StopListening(): void {
			console.log('Disconnecting...');
			this._isListening = false;

			this._socket.close();
			this._socket.onmessage = null;
			this._socket.onerror = null;
		}

		SendStr(str: string): void {
			this._socket.send(str);
		}
	}

	angular.module('app')
		.service('SocketSvc', SocketSvc);
}