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

		static $inject = ['DataSvc'];
		constructor(private _dataSvc: app.service.IDataSvc) {
		}

		StartListening(ipAddr: string, portNum: number, callback: (msg: MessageEvent) => void,
			errCallback: (err: string) => void): void {
			console.log('Connectiong to: ' + ipAddr + ':' + portNum);
			this._isListening = true;

			try {
				this._socket = new WebSocket("ws://" + ipAddr + ':' + portNum);
				this._socket.onmessage = (msg) => {
					this._dataSvc.onMsgReceived(msg);
					callback(msg);

					this._socket.send(JSON.stringify(<app.interfaces.ISocketClient>{ isStopIntended: false }));
				};
				this._socket.onerror = e => {
					errCallback('An error occured from the WebSocket...');
				};

				setTimeout(() => {
					this._socket.send(JSON.stringify(<app.interfaces.ISocketClient>{ isStopIntended: false }));
				}, 300);
			} catch (err) {
				errCallback(err);
			}
		}

		StopListening(): void {
			console.log('Disconnecting...');
			this._isListening = false;

			this._socket.send(JSON.stringify(<app.interfaces.ISocketClient>{ isStopIntended: true, }));

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