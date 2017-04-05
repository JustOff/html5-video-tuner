let EXPORTED_SYMBOLS = ["Prefs"];

let Cc = Components.classes, Ci = Components.interfaces, Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");

let Prefs = function(extName, Utils) {
	this.defaultPrefs = {
		blacklistedDomains: "{}",
		toolbarButtonPlaceId: "addon-bar",
		toolbarButtonNextItemId: "",
		audioEl: true,
		nohtml5: false,
		no60fps: false
	};

	this.currentPrefs = {};

	this.prefsBranch = Services.prefs.getBranch("extensions." + extName + ".");
	this.defaultBranch = Services.prefs.getDefaultBranch("extensions." + extName + ".");
	this.syncBranch = Services.prefs.getDefaultBranch("services.sync.prefs.sync.extensions." + extName + ".");

	this.init = function() {
		for (let prefName in this.defaultPrefs) {
			let prefValue = this.defaultPrefs[prefName];

			switch (typeof prefValue) {
				case "string": {
					this.defaultBranch.setCharPref(prefName, prefValue);
					this.currentPrefs[prefName] = this.prefsBranch.getCharPref(prefName);
				} break;
				case "number": {
					this.defaultBranch.setIntPref(prefName, prefValue);
					this.currentPrefs[prefName] = this.prefsBranch.getIntPref(prefName);
				} break;
				case "boolean": {
					this.defaultBranch.setBoolPref(prefName, prefValue);
					this.currentPrefs[prefName] = this.prefsBranch.getBoolPref(prefName);
				} break;
			}

			this.syncBranch.setBoolPref(prefName, true);
		}
	};

	this.save = function() {
		for (let prefName in this.currentPrefs) {
			let prefValue = this.currentPrefs[prefName];

			switch (typeof prefValue) {
				case "string": {
					this.prefsBranch.setCharPref(prefName, prefValue);
				} break;
				case "number": {
					this.prefsBranch.setIntPref(prefName, prefValue);
				} break;
				case "boolean": {
					this.prefsBranch.setBoolPref(prefName, prefValue);
				} break;
			}
		}   
	};

	this.getValue = function(prefName) {
		return this.currentPrefs[prefName];
	};

	this.setValue = function(prefName, prefValue) {
		this.currentPrefs[prefName] = prefValue;
	};
};
