var sections = document.querySelectorAll("section.featureset");
var template = document.getElementById("template").textContent;

var maturityLevels = {"ed":"low","LastCall":"medium","WD":"low","CR":"high","PR":"high","REC":"high"};

function fill(el, data, image) {
    if (data.level) {
	el.setAttribute("class",data.level);
    }
    if (image) {
	var img = new Image();
	img.setAttribute("src", image.src);
	img.setAttribute("alt", image.alt);
    }
    if (data.url) {
	var a = document.createElement("a");
	a.setAttribute("href", data.url);
	if (image) {
	    a.setAttribute("title", data.label);
	    a.appendChild(img);
	} else {
	    a.appendChild(document.createTextNode(data.label));
	}
	el.appendChild(a);
    } else {
	if (image) {
	    el.appendChild(img);
	} else {
	    el.appendChild(document.createTextNode(data.label));
	}
    }    
}
var specData;
var specXhr = new XMLHttpRequest();
specXhr.open("GET", "specs/tr.json");
specXhr.onload = function() {
    specData = JSON.parse(this.responseText);
    fillTables();
};
specXhr.send();

function fillTables() {
    var counterReq = 0 ,counterRes = 0;
    var editorDrafts = {};
    for (var i = 0; i < sections.length; i++) {
	var section = sections[i];
	var dataTable = document.createElement("div");
	dataTable.innerHTML = template;
	var tbody = dataTable.querySelector("tbody");
	var features = section.querySelectorAll("[data-feature]");
	for (var j = 0; j < features.length; j++) {
	    var featureEl = features[j];
	    var featureName = featureEl.dataset["feature"];
	    var tr = document.createElement("tr");
	    var th = document.createElement("th");
	    th.appendChild(document.createTextNode(featureName));
	    var specs = [];
	    if (featureEl.dataset["featureid"]) {
		specs = [featureEl.dataset["featureid"]];
	    } else {
		var specEls = featureEl.querySelectorAll("[data-featureid]");
		for (var k = 0; k <specEls.length; k++) {
		    if (specs.indexOf(specEls[k].dataset["featureid"]) < 0) {
			specs.push(specEls[k].dataset["featureid"]);
		    }
		}
	    }
	    if (specs.length > 1) {
		th.setAttribute("rowspan", specs.length);
	    }
	    tr.appendChild(th);
	    for (var k = 0; k < specs.length; k++) {
		var spec = specs[k];
		if (k > 0) {
		    tr = document.createElement("tr");
		}
		tbody.appendChild(tr);

		var specTd = document.createElement("td");
		var wgTd = document.createElement("td");
		var maturityTd = document.createElement("td");
		var stabilityTd = document.createElement("td");
		var editorsTd = document.createElement("td");
		var implTd = document.createElement("td");
		var docTd = document.createElement("td");
		var tsTd = document.createElement("td");
		var xhr = new XMLHttpRequest();
		xhr.open("GET", "data/" + spec + ".json");
		counterReq++;
		xhr.onload = function(x, s, el1, el2, el3, el4, el5, el6, el7, el8) {
		    return function() {
			counterRes++;
			var obj, level, editorsactivity;
			var data = JSON.parse(x.responseText);
			var links = document.querySelectorAll("a[data-featureid='" + s + "']");
			for (var l = 0 ; l < links.length; l++) {
			    var url = data.editors.url;
			    if (!url) {
				url = data.TR;
			    }
			    links[l].setAttribute("href",url);
			}
			if (data.TR !== "") {
			    fill(el1, {label: specData[s].title, url: data.TR});
			} else {
			    fill(el1, {label: data.title});
			    specData[s] = { maturity: data.maturity, wgs:data.wgs};
			}
			if (data.coremob=="fulfills") {
			    el1.appendChild(document.createElement("br"));
			    fill(el1,{url:"http://coremob.github.io/coremob-2012/FR-coremob-20130131.html#specifications-which-address-the-derived-requirements"},{src:"http://www.w3.org/Mobile/mobile-web-app-state/coremob.png",alt:"CoreMob 2012"});
			} else if (data.coremob=="partial") {
			    el1.appendChild(document.createElement("br"));
			    fill(el1,{url:"http://coremob.github.io/coremob-2012/FR-coremob-20130131.html#requirements-only-partially-addressed-by-existing-specifications"},{src:"http://www.w3.org/Mobile/mobile-web-app-state/coremob-wanted.png",alt:"Partially addresses requirements of CoreMob 2012"});

			}
			for (var w = 0 ; w < specData[s].wgs.length; w++) {
			    wg = specData[s].wgs[w];
			    wg.label = wg.label.replace(/ Working Group/,'').replace(/Cascading Style Sheets \(CSS\)/,'CSS');
			    if (w > 0) {
				el2.appendChild(document.createElement("br"));
			    }
			    fill(el2, wg);
			}
			var maturity ;
			var maturityIcon ;
			if (!maturityLevels[specData[s].maturity]) {
			    if (specData[s].maturity == "NOTE") {
				level = "high";
			    } else {
				level = "low";
			    }
			    maturity = {label: specData[s].maturity, level:level};
			} else {
			    maturity = {label:specData[s].maturity, level: maturityLevels[specData[s].maturity]};
			    maturityIcon = {src:"http://www.w3.org/2013/09/wpd-rectrack-icons/" + specData[s].maturity.toLowerCase().replace(/lastcall/,'lcwd') + '.svg', alt:specData[s].maturity};
			}
			fill(el3, maturity, maturityIcon);
			fill(el4, data.stability);
			fill(el5, data.editors);
			if (data.editors.url) {			    
			    editorsactivity = data.editors.url.replace(/^https?:\/\//, '').replace(/[^a-z0-9]/g,'');
			    editorDrafts[editorsactivity] = 1;
			    el5.appendChild(document.createElement("br"));
			    obj = document.createElement("object");
			    obj.setAttribute("type", "image/svg+xml");
			    obj.setAttribute("data", "editors-activity/" + editorsactivity + ".svg");
			    obj.setAttribute("class","editorsactivity");
			    obj.setAttribute("height",55);
			    obj.setAttribute("width",125);
			    el5.appendChild(obj);
			}
			fill(el6, data.impl);
			el6.appendChild(document.createElement("br"));
			obj = document.createElement("object");
			obj.setAttribute("data", "images/" + s + ".svg");
			el6.appendChild(obj);
			if (data.wpd) {
			    fill(el7, data.wpd, {src:"http://www.webplatform.org/logo/wplogo_transparent.png", alt: "WebPlatform.org"});
			}
			if (data.wdc) {
			    if (data.wdc) {
				el7.appendChild(document.createElement("br"));
			    }
			    fill(el7, data.wdc, {src:"http://www.w3.org/Mobile/mobile-web-app-state/w3devcampus.png", alt: "W3DevCampus"});
			}
			if (data.tests.repo) {
			    var div = document.createElement("div");
			    var div2 = document.createElement("div");
			    div2.setAttribute("class","githubribbon");
			    fill(div2, {"url":data.tests.repo, "label":"Fork me on GitHub"});
			    div.appendChild(div2);
			    fill(div, data.tests);
			    el8.appendChild(div);
			    el8.classList.add(data.tests.level);
			} else {
			    fill(el8, data.tests);
			}
			el8.classList.add("tests");

			if (counterReq == counterRes) {
			    updateEditorsActivity(editorDrafts);
			    mergeWGCells();
			}
		    };
		}(xhr, spec, specTd, wgTd, maturityTd, stabilityTd, editorsTd, implTd, docTd, tsTd);
		xhr.send();
		tr.appendChild(specTd);
		tr.appendChild(wgTd);
		tr.appendChild(maturityTd);
		tr.appendChild(stabilityTd);
		tr.appendChild(editorsTd);
		tr.appendChild(implTd);
		tr.appendChild(docTd);
		tr.appendChild(tsTd);
	    }
	}
	section.appendChild(dataTable);
    }
}

function mergeWGCells() {
    var rows = document.querySelectorAll("tbody tr");
    var wgCells = [];
    for (var i = 0 ; i < rows.length; i++) {
	if (rows[i].getElementsByTagName("td")) {
	    wgCells.push(rows[i].getElementsByTagName("td")[1]);
	}
    }
    for (var i = wgCells.length - 1 ; i >= 0; i--) {
	var wgCell = wgCells[i];
	var prevTr = wgCell.parentNode.previousElementSibling;
	if (prevTr && prevTr.getElementsByTagName("td")[1] && prevTr.getElementsByTagName("td")[1].textContent == wgCell.textContent) {
	    var rowspan;
	    if (wgCell.getAttribute("rowspan")) {
		rowspan = parseInt(wgCell.getAttribute("rowspan"), 10);
	    } else {
		rowspan = 1;
	    }
	    prevCell = prevTr.getElementsByTagName("td")[1];
	    prevCell.setAttribute("rowspan", rowspan + 1);
	    wgCell.remove();
	}
    }
}

function updateEditorsActivity(editorDrafts) {
    var drafts = Object.keys(editorDrafts);
    drafts.forEach(function (d) {
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "editors-activity/" + d + ".svg");
	xhr.responseType = "document";
	xhr.onload = function (draftname) {
	    return function (e) {
		var svg, height, desc;
		if (e.target.status == "200" || e.target.status == "304") {
		    svg = e.target.response;
		    if (svg) {
			height = svg.documentElement.getAttribute("height");
			desc = svg.getElementsByTagNameNS("http://www.w3.org/2000/svg", "desc")[0].textContent;
		    }
		}
		var draftimages = document.querySelectorAll('object[data="editors-activity/' + draftname + '.svg"');
		for (var j = 0 ; j < draftimages.length ; j++) {
		    if (svg) {
			draftimages[j].setAttribute("height",height);
			draftimages[j].parentNode.querySelector("a").textContent = desc;
		    } else {
			draftimages[j].parentNode.querySelector("a").textContent = "@@@ TBD";
			draftimages[j].remove();

		    }
		}
	    };
	}(d);
	xhr.send();
    });

}

// clean up
var scripts = document.querySelectorAll("script");
for (var i = 0; i < scripts.length; i++) {
    scripts[i].remove();
}