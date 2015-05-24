/// <reference path="../_reference.ts" />

module app.interfaces {
	export interface IMonitorScope extends angular.IScope {
		data: app.interfaces.IDataModel[];
	}
	
	export interface ISocketClient {
		isStopIntended: boolean;
	}

	export interface ISocketCtrl {
		introduction: string;
		directive: string;
	}

	export interface IDataModel {
		rowid: number;
		serverID: number;
		
		names: string[];
		values: number[];
	}
}