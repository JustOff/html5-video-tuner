let EXPORTED_SYMBOLS = ["Utils"];

let Cc = Components.classes, Ci = Components.interfaces, Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");

let eTLDService = Cc["@mozilla.org/network/effective-tld-service;1"].getService(Ci.nsIEffectiveTLDService);
let IDNService = Cc["@mozilla.org/network/idn-service;1"].getService(Ci.nsIIDNService);

let Utils = function(extName) {
	this.getHostFromTab = function(tab, window) {
		try {
			return (tab.linkedBrowser.currentURI.scheme == "http" || tab.linkedBrowser.currentURI.scheme == "https") ?
					tab.linkedBrowser.currentURI.host : null;
		} catch(e) {
			return null;
		}
	}

	this.getBaseDomain = function(fullDomain) {
		try {
			return eTLDService.getBaseDomainFromHost(fullDomain);
		} catch(e) {
			return this.UTF8toACE(fullDomain);
		}
	};

	this.ACEtoUTF8 = function(domain) {
		return IDNService.convertACEtoUTF8(domain);
	};

	this.UTF8toACE = function(domain) {
		return IDNService.convertUTF8toACE(domain);
	};

	this.translate = function(key) {
		if (!this.bundle) {
			this.bundle = Cc["@mozilla.org/intl/stringbundle;1"].getService(Ci.nsIStringBundleService)
				.createBundle("chrome://" + extName + "/locale/" + extName + ".properties" + "?" + Math.random());
		}
		return this.bundle.GetStringFromName(key);
	};

	this.toJSON = function(object) {
		return JSON.stringify(object);
	};
	
	this.fromJSON = function(str) {
		if (!str || /^ *$/.test(str))
			return {};
		try {
			return JSON.parse(str);
		} catch (e) {
			str = str.replace(/\(|\)/g, '').replace(/(\w+):/g, '"$1":')
			try {
				return JSON.parse(str);
			} catch (e) {}
			return {};
		}
	};
};
