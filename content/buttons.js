let EXPORTED_SYMBOLS = ["Buttons"];

Components.utils.import("resource://gre/modules/Services.jsm");

function $(node, childId) {
	if (node.getElementById) {
		return node.getElementById(childId);
	} else {
		return node.querySelector("#" + childId);
	}
}

let Buttons = function(extName, Prefs, Blacklist, Utils) {
	this.skinURL = "chrome://" + extName + "/skin/";

	this.iconFileNames = {
		unknown: "unknown.png",
		normal: "default.png",
		nomse: "nomse.png",
		nohtml5: "nohtml5.png"
	};

	this.buttonId = "h5vtunerButton";

	this.menuitemIds = {
		normal: "h5vtunerNormal",
		nomse: "h5vtunerNomse",
		nohtml5: "h5vtunerNohtml5"
	};

	this.menupopupId = "h5vtunerMenupopup";

	this.init = function(window) {
		let document = window.document;

		if (document.getElementById(this.buttonId)) {
			return;
		}

		let button = document.createElement("toolbarbutton");
		button.setAttribute("id", this.buttonId);
		button.setAttribute("label", Utils.translate("Name"));
		button.setAttribute("type", "menu");
		button.setAttribute("class", "toolbarbutton-1 chromeclass-toolbar-additional");
		button.setAttribute("orient", "horizontal");
		button.setAttribute("tooltiptext", Utils.translate("Tooltip"));
		button.style.listStyleImage = "url(" + this.skinURL + this.iconFileNames.unknown + ")";

		let Buttons = this;

		let menuitemNormal = document.createElement("menuitem");
		menuitemNormal.setAttribute("id", this.menuitemIds.normal);
		menuitemNormal.setAttribute("label", Utils.translate("MLnormal"));
		menuitemNormal.setAttribute("type", "radio");
		menuitemNormal.setAttribute("name", "h5vtuner");
		menuitemNormal.addEventListener("command", function(event) {
			let window = Services.wm.getMostRecentWindow("navigator:browser");
			let domain = Utils.getHostFromTab(window.gBrowser.selectedTab);
			if (domain) {
				let baseDomain = Utils.getBaseDomain(domain);

				if (Prefs.getValue("nohtml5")) {
					if (Blacklist.isBlacklisted(baseDomain) != 2) {
						Blacklist.addToBlacklist(baseDomain, 2);

						Buttons.refresh();
					}
				} else {
					if (Blacklist.isBlacklisted(baseDomain)) {
						Blacklist.removeFromBlacklist(baseDomain);

						Buttons.refresh();
					}
				}
			}
		}, false);

		let menuitemNomse = document.createElement("menuitem");
		menuitemNomse.setAttribute("id", this.menuitemIds.nomse);
		menuitemNomse.setAttribute("label", Utils.translate("MLnomse"));
		menuitemNomse.setAttribute("type", "radio");
		menuitemNomse.setAttribute("name", "h5vtuner");
		menuitemNomse.addEventListener("command", function(event) {
			let window = Services.wm.getMostRecentWindow("navigator:browser");
			let domain = Utils.getHostFromTab(window.gBrowser.selectedTab);
			if (domain) {
				let baseDomain = Utils.getBaseDomain(domain);

				if (Blacklist.isBlacklisted(baseDomain) != 1) {
					Blacklist.addToBlacklist(baseDomain, 1);

					Buttons.refresh();
				}
			}
		}, false);

		let menuitemNohtml5 = document.createElement("menuitem");
		menuitemNohtml5.setAttribute("id", this.menuitemIds.nohtml5);
		menuitemNohtml5.setAttribute("label", Utils.translate("MLnohtml5"));
		menuitemNohtml5.setAttribute("type", "radio");
		menuitemNohtml5.setAttribute("name", "h5vtuner");
		menuitemNohtml5.addEventListener("command", function(event) {
			let window = Services.wm.getMostRecentWindow("navigator:browser");
			let domain = Utils.getHostFromTab(window.gBrowser.selectedTab);
			if (domain) {
				let baseDomain = Utils.getBaseDomain(domain);

				if (Prefs.getValue("nohtml5")) {
					if (Blacklist.isBlacklisted(baseDomain)) {
						Blacklist.removeFromBlacklist(baseDomain);

						Buttons.refresh();
					}
				} else {
					if (Blacklist.isBlacklisted(baseDomain) != 2) {
						Blacklist.addToBlacklist(baseDomain, 2);

						Buttons.refresh();
					}
				}
			}
		}, false);

		let menupopup = document.createElement("menupopup");
		menupopup.setAttribute("id", this.menupopupId);
		menupopup.addEventListener("popupshowing", function(event) {
			let window = Services.wm.getMostRecentWindow("navigator:browser");
			let document = window.document;

			let menuitemNormal = document.getElementById(Buttons.menuitemIds.normal);
			let menuitemNomse = document.getElementById(Buttons.menuitemIds.nomse);
			let menuitemNohtml5 = document.getElementById(Buttons.menuitemIds.nohtml5);

			let domain = Utils.getHostFromTab(window.gBrowser.selectedTab, window);
			if (domain) {
				let baseDomain = Utils.getBaseDomain(domain);
				let nohtml5 = Prefs.getValue("nohtml5");

				if (Blacklist.isBlacklisted(baseDomain) == 1) {
					menuitemNomse.setAttribute("checked", "true");
				} else if (!nohtml5 && Blacklist.isBlacklisted(baseDomain) == 2
						|| nohtml5 && !Blacklist.isBlacklisted(baseDomain)) {
					menuitemNohtml5.setAttribute("checked", "true");
				} else if (!nohtml5 && !Blacklist.isBlacklisted(baseDomain)
						|| nohtml5 && Blacklist.isBlacklisted(baseDomain) == 2) {
					menuitemNormal.setAttribute("checked", "true");
				}
				menuitemNormal.removeAttribute("disabled");
				menuitemNomse.removeAttribute("disabled");
				menuitemNohtml5.removeAttribute("disabled");
			} else {
				menuitemNormal.setAttribute("disabled", "true");
				menuitemNormal.setAttribute("checked", "true");
				menuitemNomse.setAttribute("disabled", "true");
				menuitemNohtml5.setAttribute("disabled", "true");
			}
		}, false);

		if (Prefs.getValue("toolbarButtonPlaceId") == "nav-bar") {
			menupopup.appendChild(menuitemNormal);
			menupopup.appendChild(menuitemNomse);
			menupopup.appendChild(menuitemNohtml5);
		} else {
			menupopup.appendChild(menuitemNohtml5);
			menupopup.appendChild(menuitemNomse);
			menupopup.appendChild(menuitemNormal);
		}

		button.appendChild(menupopup);

		let toolbox = $(document, "navigator-toolbox");
			toolbox.palette.appendChild(button);

		let toolbarId = Prefs.getValue("toolbarButtonPlaceId"),
			nextItemId = Prefs.getValue("toolbarButtonNextItemId"),
			toolbar = toolbarId && $(document, toolbarId),
			nextItem = toolbar && nextItemId != "" && $(document, nextItemId);
		
		if (toolbar) {
			if (nextItem && nextItem.parentNode && nextItem.parentNode.id == toolbarId) {
				toolbar.insertItem(this.buttonId, nextItem);
			} else {
				let ids = (toolbar.getAttribute("currentset") || "").split(",");
				nextItem = null;
				for (let i = ids.indexOf(this.buttonId) + 1; i > 0 && i < ids.length; i++) {
					nextItem = $(document, ids[i])
					if (nextItem) {
						break;
					}
				}
				if (toolbar.id == "addon-bar" && nextItem === null) {
					nextItem = $(document, "status-bar");
				}
				toolbar.insertItem(this.buttonId, nextItem);
			}
			window.setToolbarVisibility(toolbar, true);
		}

		this.afterCustomization = this.afterCustomization.bind(this);
		window.addEventListener("aftercustomization", this.afterCustomization, false);

		this.refresh();
	};

	this.afterCustomization = function(event) {
		let toolbox = event.target,
			b = $(toolbox.parentNode, this.buttonId),
			toolbarId, nextItemId;
		if (b) {
			let parent = b.parentNode,
				nextItem = b.nextSibling;
			if (parent && parent.localName == "toolbar") {
				toolbarId = parent.id;
				nextItemId = nextItem && nextItem.id;
			}
			if ((toolbarId.substring(0, 7) == "nav-bar" && b.firstChild.childNodes[0].id == this.menuitemIds.nohtml5) 
					|| (toolbarId.substring(0, 7) != "nav-bar" && b.firstChild.childNodes[0].id == this.menuitemIds.normal)) {
				let mnp = b.firstChild;
				for (let i = mnp.childNodes.length - 2; i >= 0; i--) {
					mnp.appendChild(mnp.childNodes[i]);
				}
			}
		}
		this.setPrefs(toolbarId, nextItemId);
	};

	this.setPrefs = function(toolbarId, nextItemId) {
		Prefs.setValue("toolbarButtonPlaceId", toolbarId || "");
		Prefs.setValue("toolbarButtonNextItemId", nextItemId || "");
		Prefs.save();
	};

	this.refresh = function() {
		if (Prefs.getValue("toolbarButtonPlaceId") == "") {
			return;
		}

		let windowsEnumerator = Services.wm.getEnumerator("navigator:browser");
		while (windowsEnumerator.hasMoreElements()) {
			let window = windowsEnumerator.getNext().QueryInterface(Components.interfaces.nsIDOMWindow);
			this.refreshForWindow(window);
		}
	};

	this.refreshForWindow = function(window) {
		let button = window.document.getElementById(this.buttonId);

		if (button) {
			let domain = Utils.UTF8toACE(Utils.getHostFromTab(window.gBrowser.selectedTab, window));
			let nohtml5 = Prefs.getValue("nohtml5");

			if (!domain) {
				button.style.listStyleImage = "url(" + this.skinURL + this.iconFileNames.unknown + ")";
				button.setAttribute("tooltiptext", Utils.translate("TooltipU"));
			} else if (Blacklist.isBlacklisted(domain) == 1) {
				button.style.listStyleImage = "url(" + this.skinURL + this.iconFileNames.nomse + ")";
				button.setAttribute("tooltiptext", Utils.translate("Tooltip") + " " + Utils.translate("MLnomse"));
			} else if (!nohtml5 && Blacklist.isBlacklisted(domain) == 2 ||
					nohtml5 && !Blacklist.isBlacklisted(domain)) {
				button.style.listStyleImage = "url(" + this.skinURL + this.iconFileNames.nohtml5 + ")";
				button.setAttribute("tooltiptext", Utils.translate("Tooltip") + " " + Utils.translate("MLnohtml5"));
			} else if (!nohtml5 && !Blacklist.isBlacklisted(domain)||
					nohtml5 && Blacklist.isBlacklisted(domain) == 2) {
				button.style.listStyleImage = "url(" + this.skinURL + this.iconFileNames.normal + ")";
				button.setAttribute("tooltiptext", Utils.translate("Tooltip") + " " + Utils.translate("MLnormal"));
			}
		}
	};

	this.clear = function(window) {
		window.removeEventListener("aftercustomization", this.afterCustomization, false);

		let button = window.document.getElementById(this.buttonId);
		if (button) {
			button.parentNode.removeChild(button);
		}
	};
};
