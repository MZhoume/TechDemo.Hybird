/// <reference path="../_reference.ts" />

module app.interfaces {
	export interface IMonitorCtrl {
		data: IDataModel[];
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