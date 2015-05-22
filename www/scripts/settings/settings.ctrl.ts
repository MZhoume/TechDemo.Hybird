/// <reference path="../_reference.ts" />

module app.settings {
	interface ISettingsCtrl {
		ipAddress: string;
		portNum: number;
		msgs: string[];
		btnString: string;

		startCommand: () => void;
	}

	class SettingsCtrl implements ISettingsCtrl {
		ipAddress: string;
		portNum: number;
		msgs: string[];
		btnString: string = 'Start';

		private isListening: boolean;

		constructor() {
			this.msgs = [];
		}

		startCommand(): void {
			if (!this.isListening) {
				this.msgs = [];
				this.msgs.push('Start Listening...');

				this.isListening = true;
				this.btnString = 'Stop';
			} else {
				this.msgs.push('Stop Listening...');

				this.isListening = false;
				this.btnString = 'Start';
			}
		}
	}

	angular.module('app')
		.controller('SettingsCtrl', SettingsCtrl);
}