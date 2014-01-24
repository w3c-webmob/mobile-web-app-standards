var sections = document.querySelectorAll("section.featureset");
var template = document.getElementById("template").textContent;

var maturityLevels = {"LC":"medium","WD":"low","CR":"high","PR":"high","REC":"high"};

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
		xhr.onload = function(x, s, el1, el2, el3, el4, el5, el6, el7, el8) {
		    return function() {
			var data = JSON.parse(x.responseText);
			fill(el1, {label: specData[s].title, url: data.TR});
			for (var w = 0 ; w < specData[s].wgs.length; w++) {
			    wg = specData[s].wgs[w];
			    wg.label[0] = wg.label[0].replace(/ Working Group/,'').replace(/Cascading Style Sheets \(CSS\)/,'CSS');
			    if (w > 0) {
				el2.appendChild(document.createElement("br"));
			    }
			    fill(el2, wg);
			}
			fill(el3, {label:specData[s].maturity, level: maturityLevels[specData[s].maturity]},{src:"http://www.w3.org/2013/09/wpd-rectrack-icons/" + specData[s].maturity.toLowerCase() + '.svg', alt:specData[s].maturity});
			fill(el4, data.stability);
			fill(el5, data.editors);
			fill(el6, data.impl);
			if (data.wpd) {
			    fill(el7, data.wpd, {src:"http://www.webplatform.org/logo/wplogo_transparent.png", alt: "WebPlatform.org"});
			}
			if (data.wdc) {
			    if (data.wpd) {
				el7.appendChild(document.createElement("br"));
			    }
			    fill(el7, data.wpd, {src:"http://www.w3.org/Mobile/mobile-web-app-state/w3devcampus.png", alt: "W3DevCampus"});
			}
			fill(el8, data.tests);
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