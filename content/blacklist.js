let EXPORTED_SYMBOLS = ["Blacklist"];

let Blacklist = function(Prefs, Utils) {
	this.blackList = {};

	this.init = function() {
		this.loadFromPrefs();
	};

	this.loadFromPrefs = function() {
		this.blackList = {};
		this.blackList = Utils.fromJSON(Prefs.getValue("blacklistedDomains"));
	};

	this.saveToPrefs = function() {
		let blacklistedDomains = Utils.toJSON(this.blackList);
		Prefs.setValue("blacklistedDomains", blacklistedDomains);
		Prefs.save();
	};

	this.addToBlacklist = function(domain, type = 1) {
		this.blackList[domain] = type;
		this.saveToPrefs();
	};

	this.removeFromBlacklist = function(domain) {
		delete this.blackList[domain];
		this.saveToPrefs();
	};

	this.isBlacklisted = function(domain) {
		return this.blackList[domain] || this.checkForWildcard(domain);
	};

	this.checkForWildcard = function(domain) {
		if (typeof domain === "string") {
			while (domain.indexOf(".") != -1) {
				domain = domain.substring(domain.indexOf(".") + 1);
				if (domain.indexOf(".") != -1 && this.blackList[domain]) {
					return this.blackList[domain];
				}
			}
		}

		return null;
	};
};
