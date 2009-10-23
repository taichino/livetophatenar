// main class
var TopHatenar = {
	baseurl   : "http://tophatenar.com/view/",
	imagepath : "chrome://livetophatenar/content/img/",
	lasturl   : null,

	setScore: function() {
		var self = this;
		var cur = window._content.document.location;
		var url = this.baseurl + cur;
		if (this.lasturl == url) {
			return;
		}
		this.lasturl = url;
		var req = new XMLHttpRequest();
		req.open("GET", url);
		req.onload = function(evt) {
			if (req.status == 200 && req.responseText.length > 0) {
				data = self._parseText(req.responseText);
				self._update(data);
			}
		};
		req.send(null);
	},

	goSrc: function() {
        var windowManager = (Components.classes["@mozilla.org/appshell/window-mediator;1"]).getService();
		var windowManagerInterface = windowManager.QueryInterface(Components.interfaces.nsIWindowMediator);
		var browser = (windowManagerInterface.getMostRecentWindow("navigator:browser")).getBrowser();
		var url = this.baseurl + window._content.document.location;
		browser.addTab(url);
	},
	
	_update: function(data) {
		var base  = this.imagepath;
		if (data.bookmarks) {
			var rRank = this._getRank(data.subscribers);			
			var bRank = this._getRank(data.bookmarks);
			document.getElementById('subscribers-image').src = base + rRank + ".png";
			document.getElementById('bookmarks-image').src   = base + bRank + ".png";

			var rText = "購読者数: " + data.subscribers + " [" + data.subscribers_rank + "位]";
			var bText = "ブクマ数: " + data.bookmarks   + " [" + data.bookmarks_rank   + "位]";
			document.getElementById("livetophatenar-panel").setAttribute("tooltiptext", rText + "\n" + bText);
		}
		else {
			document.getElementById('subscribers-image').src = base + "na.png";
			document.getElementById('bookmarks-image').src   = base + "na.png";
			document.getElementById("livetophatenar-panel").setAttribute("tooltiptext", "現在のページは評価できません");
		}
	},

	_getRank: function(num) {
		var value = Math.floor(Math.LOG10E * Math.log(num) * 2);
		return value > 10 ? 10 : value;
	},

	_parseText: function(text) {
		var result = {};
		var lines = text.split(/\n/);
		var bookmarkFlag = false;
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			line = line.replace(/(^\s*)|(\s*$)/g, "");  // trim
			if (line.substring(0, 4) == "購読者:") {
				result["subscribers"] = line.match(/購読者:\s*(\d+)\s*/)[1];
			}
			else if (line == "ブックマーク:") {
				result["bookmarks"] = lines[i + 1].match(/<a [^>]+>\s*(\d+)\s*<img/)[1];
				bookmarkFlag = true;
			}
			else if (line.substring(0, 3) == "全体で") {
				var rank = lines[i + 1].match(/<b [^>]+>(\d+)</)[1];
				if (bookmarkFlag) {
					result["bookmarks_rank"] = rank;
				}
				else {
					result["subscribers_rank"] = rank;
					result["total"] = lines[i + 3].match(/<b>(\d+)</)[1];
				}
			}
		}
		return result;
	}
};

// entry point
window.addEventListener("focus", function() {
	TopHatenar.setScore();
}, true);
