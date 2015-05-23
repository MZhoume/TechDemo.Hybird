/// <reference path="../_reference.ts" />

module app.settings {
	interface IModelScope extends angular.IScope {
		model: Ionic.IModal;

		showModal(): void;
		hideModal(): void;
	}

	interface ISettingsCtrl {
		ipAddress: string;
		portNum: number;
		msgs: string[];
		btnString: string;

		startCommand(): void;
	}

	class SettingsCtrl implements ISettingsCtrl {
		ipAddress: string;
		portNum: number;
		msgs: string[] = [];
		btnString: string = 'Start';

		private _isListening: boolean = false;

		static $inject = ['$scope', 'SocketSvc', '$ionicPopup', '$ionicModal'];
		constructor(private _scope: IModelScope,
			private _socketSvc: app.service.ISocketSvc,
			private _ionicPopup: Ionic.IPopup,
			private _ionicModel: Ionic.IModal) {
			_ionicModel.fromTemplateUrl('../../settings/settings.html', {
				scope: _scope,
				animation: 'slide-in-up'
			}).then(m => {
				_scope.model = m;
			});

			_scope.showModal = () => {
				_scope.model.show();
			}

			_scope.hideModal = () => {
				_scope.model.hide();
			}
		}

		startCommand(): void {
			if (!this._isListening) {
				this.msgs = [];
				this.msgs.push('Start Listening...');
				this._isListening = true;
				this.btnString = 'Stop';

				this._socketSvc.StartListening(this.ipAddress, this.portNum,
					(msg) => {
						this.msgs.push("Data received at " + msg.timeStamp);
					},
					(err) => {
						this.msgs.push(err);
						this._ionicPopup.show({
							title: 'Error!',
							template: 'An error occured while connecting to server...',
							buttons: [{ text: 'OK' }]
						});
						this._isListening = false;
						this.btnString = 'Start';
					});
			} else {
				this.msgs.push('Stop Listening...');
				this._socketSvc.StopListening();

				this._isListening = false;
				this.btnString = 'Start';
			}
		}
	}

	angular.module('app')
		.controller('SettingsCtrl', SettingsCtrl);
}