// main class
function TopHatenar() {
	this.setScore = function() {
		var self = this;
		var cur = window._content.document.location;
		var url = "http://tophatenar.com/view/" + cur;
		if (this.lasturl == url) {
			return;
		}
		this.lasturl = url;
		var req = new XMLHttpRequest();
		req.open("GET", url);
		req.onload = function(evt) {
			if (req.status == 200 && req.responseText.length > 0) {
				data = self.parseText(req.responseText);
				self.update(data);
			}
		};
		req.send(null);
	};

	this.update = function(data) {
		var base  = "chrome://livetophatenar/content/img/";
		if (data.bookmarks) {
			var rRank = this.getRank(data.subscribers);			
			var bRank = this.getRank(data.bookmarks);
			document.getElementById('subscribers-image').src = base + rRank + ".png";
			document.getElementById('bookmarks-image').src   = base + bRank + ".png";

			var rText = "購読者数: " + data.subscribers + " [" + data.subscribers_rank + "位]";
			var bText = "ブクマ数: " + data.bookmarks   + " [" + data.bookmarks_rank   + "位]";
			document.getElementById("my-panel").setAttribute("tooltiptext", rText + "\n" + bText);
		}
		else {
			document.getElementById('subscribers-image').src = base + "na.png";
			document.getElementById('bookmarks-image').src   = base + "na.png";
			document.getElementById("my-panel").setAttribute("tooltiptext", "現在のページは評価できません");
		}
	};

	this.getRank = function(num) {
		var value = Math.floor(Math.LOG10E * Math.log(num) * 2);
		return value > 10 ? 10 : value;
	};

	this.parseText = function(text) {
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
	};
}

// entry point
var tophatenar = new TopHatenar();
window.addEventListener("focus", function() {
	tophatenar.setScore();
}, true);
