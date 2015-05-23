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

		constructor() {
		}

		StartListening(ipAddr: string, portNum: number, callback: (msg: MessageEvent) => void,
			errCallback: (err: string) => void): void {
			console.log('Connectiong to: ' + ipAddr + ':' + portNum);
			this._isListening = true;

			try {
				this._socket = new WebSocket("ws://" + ipAddr + ':' + portNum);
				this._socket.onmessage = callback;
			} catch (err) {
				errCallback(err);
			} finally {
				if (this._socket.readyState != WebSocket.OPEN && this._socket.readyState != WebSocket.CONNECTING) {
					errCallback('An error occured while connecting to server...');
					return;
				}
				this._socket.onerror = e => errCallback('Error -- ' + e.timeStamp.toString());
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