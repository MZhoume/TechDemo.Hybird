/// <reference path="../_reference.ts" />

module app.interfaces {
	export interface IMonitorCtrl {
		Data: IDataModel[];
	}

	export interface ISocketCtrl {
		Introduction: string;
		DataCtrl: string;
		Directive: string;
	}

	export interface IDataModel {
		rowid: number;
		ServerID: number;
		
		Names: string[];
		Values: number[];
	}
}