let Cc = Components.classes, Ci = Components.interfaces, Cu = Components.utils;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

const extName = "h5vtuner";
const extJSPath = "chrome://" + extName + "/content/";

let Prefs, Buttons, gWindowListener, deiObserver, prefObserver, nohtml5;

let onBrowserProgress = {
	onLocationChange: function(aWebProgress, aRequest, aLocation, aFlag) {
		try {
			Buttons.refresh();
		} catch(e) {}
	}
}

function browserWindowObserver(handlers) {
	this.handlers = handlers;
}

browserWindowObserver.prototype = {
	observe: function(aSubject, aTopic, aData) {
		if (aTopic == "domwindowopened") {
			aSubject.QueryInterface(Ci.nsIDOMWindow).addEventListener("load", this, false);
		} else if (aTopic == "domwindowclosed") {
			if (aSubject.document.documentElement.getAttribute("windowtype") == "navigator:browser") {
				this.handlers.onShutdown(aSubject);
			}
		}
	},
	handleEvent: function(aEvent) {
		let aWindow = aEvent.currentTarget;
		aWindow.removeEventListener(aEvent.type, this, false);

		if (aWindow.document.documentElement.getAttribute("windowtype") == "navigator:browser") {
			this.handlers.onStartup(aWindow);
		}
	}
};

function browserWindowStartup(aWindow) {
	Buttons.init(aWindow);
	aWindow.gBrowser.addProgressListener(onBrowserProgress);
}

function browserWindowShutdown(aWindow) {
	aWindow.gBrowser.removeProgressListener(onBrowserProgress);
	Buttons.clear(aWindow);
}

function startup(data, reason) {
	let Imports = {};
	Cu.import(extJSPath + "utils.js", Imports);
	Cu.import(extJSPath + "preflib.js", Imports);
	Cu.import(extJSPath + "blacklist.js", Imports);
	Cu.import(extJSPath + "buttons.js", Imports);

	let Utils = new Imports.Utils(extName);
	Prefs = new Imports.Prefs(extName, Utils);
	let Blacklist = new Imports.Blacklist(Prefs, Utils);
	Buttons = new Imports.Buttons(extName, Prefs, Blacklist, Utils);

	Prefs.init();
	Blacklist.init();
	nohtml5 = Services.prefs.getBoolPref("extensions." + extName + ".nohtml5");

	prefObserver = {
		observe: function (aSubject, aTopic, aData) {
			if (aTopic == "nsPref:changed" && aData == "nohtml5") {
				nohtml5 = Services.prefs.getBoolPref("extensions." + extName + ".nohtml5");
				Prefs.setValue("nohtml5", nohtml5);
			}
		},

		register: function () {
			this.prefsBranch = Services.prefs.getBranch("extensions." + extName + ".");
			this.prefsBranch.addObserver("", this, false);
		},

		unregister: function () {
			this.prefsBranch.removeObserver("", this);
		}
	};
	prefObserver.register();

	deiObserver = {
		QueryInterface: XPCOMUtils.generateQI([Ci.nsIObserver, Ci.nsISupportsWeakReference]),

		observe: function(aSubject, aTopic, aData) {
			if (aTopic == "document-element-inserted" && aSubject instanceof Ci.nsIDOMDocument
					&& aSubject.defaultView && aSubject.contentType == "text/html"
					&& (aSubject.location.protocol == "http:" || aSubject.location.protocol == "https:")) {
				let blacklisted = Blacklist.isBlacklisted(Utils.getBaseDomain(aSubject.defaultView.top.location.hostname));
				if (!nohtml5 && !blacklisted && aSubject.defaultView != aSubject.defaultView.top) {
					blacklisted = Blacklist.isBlacklisted(Utils.getBaseDomain(aSubject.defaultView.location.hostname));
				}
				if (nohtml5) {
					if (blacklisted == 1) {
						delete aSubject.defaultView.wrappedJSObject["MediaSource"];
					} else if (!blacklisted) {
						delete aSubject.defaultView.wrappedJSObject["MediaSource"];
						aSubject.defaultView.wrappedJSObject.document.createElement("video").constructor.prototype.canPlayType = function(mediaType) { return ""; };
					}
				} else {
					if (blacklisted) {
						delete aSubject.defaultView.wrappedJSObject["MediaSource"];
						if (blacklisted == 2) {
							aSubject.defaultView.wrappedJSObject.document.createElement("video").constructor.prototype.canPlayType = function(mediaType) { return ""; };
						}
					}
				}
			}
		}
	};
	Services.obs.addObserver(deiObserver, "document-element-inserted", false);

	gWindowListener = new browserWindowObserver({
		onStartup: browserWindowStartup,
		onShutdown: browserWindowShutdown
	});
	Services.ww.registerNotification(gWindowListener);

	let winenu = Services.wm.getEnumerator("navigator:browser");
	while (winenu.hasMoreElements()) {
		browserWindowStartup(winenu.getNext());
	}
}

function shutdown(data, reason) {
	if (reason == APP_SHUTDOWN) {
		return;
	}

	Services.ww.unregisterNotification(gWindowListener);
	let winenu = Services.wm.getEnumerator("navigator:browser");
	while (winenu.hasMoreElements()) {
		browserWindowShutdown(winenu.getNext());
	}

	Services.obs.removeObserver(deiObserver, "document-element-inserted", false);
	prefObserver.unregister();

	Cu.unload(extJSPath + "buttons.js");
	Cu.unload(extJSPath + "blacklist.js");
	Cu.unload(extJSPath + "preflib.js");
	Cu.unload(extJSPath + "utils.js");
}

function install() {}

function uninstall() {}
