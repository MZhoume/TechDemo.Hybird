/// <reference path="../_reference.ts" />

module app.interfaces {
	export interface IMonitorScope extends angular.IScope {
		// this is the whole data, you don't wanna use this
		data: app.interfaces.IDataModel[];
		
		// This is what gives you to create display
		d?: app.interfaces.IDataModel;
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
		ServerID: number;
		
		Names: string[];
		Values: number[];
	}
}