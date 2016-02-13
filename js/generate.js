var sections = document.querySelectorAll("section.featureset");
var template = document.getElementById("template").textContent;

var maturityLevels = {"ed":"low","Last Call":"medium","Working Draft":"low","Candidate Recommendation":"high","Proposed Recommendation":"high","Recommendation":"high"};

function fillCell(el, data, image) {
    if (data.level) {
	el.setAttribute("class",data.level);
    }
    if (image) {
	var img = new Image();
	img.setAttribute("src", image.src);
	img.setAttribute("alt", image.alt);
	if (image.width) {
	    img.setAttribute("width", image.width);
	}
	if (image.height) {
	    img.setAttribute("height", image.height);
	}
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

function importSVG(svgurl, el, postHook) {
    fetch(svgurl, {mode:'cors'}).then(response => response.text())
        .then(function(svg) {
            if (svg) {
                var d = document.createElement("p");
                d.innerHTML = svg;
                d.querySelector("style").remove();
                el.appendChild(d);
                if (postHook) {
                    postHook(el);
                }
            }
        }).catch(function(e) {
            console.error(e);
        });
}

function maturityData(spec) {
    var maturityMapping = { 'Working Draft': 'WD', 'Last Call': 'lcwd', 'Candidate Recommendation': 'CR', 'Proposed Recommendation': 'PR', 'Recommendation': 'REC', 'Note': 'NOTE'};
    var maturity ;
    var maturityIcon ;
    if (!maturityLevels[spec.maturity]) {
	if (spec.maturity == "NOTE") {
	    level = "high";
	} else {
	    level = "low";
	}
	maturity = {label: spec.maturity, level:level};
    } else {
	maturity = {label:spec.maturity, level: maturityLevels[spec.maturity]};
	maturityIcon = {src:"http://www.w3.org/2013/09/wpd-rectrack-icons/" + maturityMapping[spec.maturity].toLowerCase() + '.svg', alt:spec.maturity, width:50, height:50};
	if (spec.maturity == "Recommendation" || spec.maturity == "Last Call") {
	    maturityIcon.height = 53;
	}
    }
    return {maturity: maturity, maturityIcon: maturityIcon};
}

var specData = {};
fillTables();
var w3cApiAuth = "?apikey=rvl38z1hpvkw0g804gk48o0s8408w88";
var w3cApiFetchConfig = { method:'GET', mode:'cors'};


function fetchSpecData(d) {
    if (!d.TR) {
        return new Promise((res,rej) => { res({maturity:d.maturity, wgs: d.wgs, title: d.title});});
    }
    var shortName = d.TR.split('#')[0].split('/')[4];
    var ret = {};
    return fetch("https://api.w3.org/specifications/" + shortName + "/versions" + w3cApiAuth + "&embed=1", w3cApiFetchConfig)
        .then(response =>  response.json())
        .then(function(data) {
            var latest = data._embedded['version-history'][0];
            ret = { maturity: latest.status, title: latest.title};
            return fetch(latest._links["deliverers"].href  + w3cApiAuth + "&embed=1", w3cApiFetchConfig).then(response => response.json());
        })
        .then(function(data) {
            ret["wgs"] = data._embedded.deliverers.map(g => ({label: g.name, url: g._links["homepage"].href}));
            return ret;
        });
}

function ghLink(url, title, width) {
  var gh_link = document.createElement("a");
  var gh_logo = document.createElement("img");
  gh_logo.setAttribute("src", "github.svg");
  if (width) {
    gh_logo.setAttribute("width", width);
  }
  gh_link.setAttribute("href", url);
  gh_link.setAttribute("title", title);
  gh_link.appendChild(gh_logo);
 return gh_link;
}

function fillTables() {
    var counterReq = 0 ,counterRes = 0;
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
            var promises = [];
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
                
		function trClosure(s, el1, el2, el3, el4, el5, el6, el7, el8) {
		    return function(data) {
			var obj, level, editorsactivity, maturityInfo;
			var links = document.querySelectorAll("a[data-featureid='" + s + "']");
			for (var l = 0 ; l < links.length; l++) {
			    var url = data.editors.url;
			    if (!url) {
				url = data.TR;
			    }
			    links[l].setAttribute("href",url);
			}
                        fetchSpecData(data).then(function(d) {
                            specData[s] = d;
			    fillCell(el1, {label: (data.feature ? data.feature + " in " : "") + specData[s].title, url: data.TR});
			for (var w = 0 ; w < specData[s].wgs.length; w++) {
			    wg = specData[s].wgs[w];
			    wg.label = wg.label.replace(/ Working Group/,'').replace(/Cascading Style Sheets \(CSS\)/,'CSS').replace(/Technical Architecture Group/,'TAG');
			    if (w > 0) {
				if (w < specData[s].wgs.length - 1) {
				    el2.appendChild(document.createTextNode(","));
				} else {
				    el2.appendChild(document.createTextNode(" and"));
				}
				el2.appendChild(document.createElement("br"));
			    }
			    fillCell(el2, wg);
			}
                        maturityInfo = maturityData(specData[s]);
			fillCell(el3, maturityInfo.maturity, maturityInfo.maturityIcon);
			fillCell(el4, data.stability);
			if (data.editors.url) {
          if (specData[s].maturity === "REC") {
            el5.appendChild(document.createTextNode("Finished"));
          } else {
			      fillCell(el5, data.editors);
			      editorsactivity = data.editors.url.replace(/^https?:\/\//, '').replace(/#.*/,'').replace(/[^a-z0-9]/g,'');
			      el5.appendChild(document.createElement("br"));
			      importSVG("editors-activity/" + editorsactivity + ".svg", el5, updateEditorsActivity);
            if (data.editors.url.match(/https?:\/\/[^\.\/]*\.github\.io\//)) {
              var ghUser = data.editors.url.split(".")[0].split("/")[2];
              var ghRepo = data.editors.url.split("/")[3];
              el5.appendChild(ghLink("https://github.com/" + ghUser + "/" + ghRepo + "/", "Contribute to " + data.title + " on GitHub", 20));
            }
          }
			}
			fillCell(el6, data.impl);
			el6.appendChild(document.createElement("br"));
			importSVG("images/" + s + ".svg", el6);
			if (data.wpd) {
			    fillCell(el7, data.wpd, {src:"http://www.webplatform.org/logo/wplogo_transparent.png", alt: "WebPlatform.org", width:115,height:124});
			}
			if (data.wdc) {
			    if (data.wdc) {
				el7.appendChild(document.createElement("br"));
			    }
			    fillCell(el7, data.wdc, {src:"http://www.w3.org/Mobile/mobile-web-app-state/w3devcampus.png", alt: "W3DevCampus", width:115, height:43});
			}
			if (data.tests.repo) {
			    el8.appendChild(ghLink(data.tests.repo, "Fork the test suite for " + specData[s].title + " on GitHub"));
			}
			fillCell(el8, data.tests);
			el8.classList.add("tests");
		        });
                    };
                }
                var p = fetch("data/" + spec + ".json").then(
                    response => response.json())
                    .then(trClosure(spec, specTd, wgTd, maturityTd, stabilityTd, editorsTd, implTd, docTd, tsTd))
                    .catch(console.error.bind(console));

/*                         if (counterReq == counterRes) {
                            mergeWGCells();
                            markDupLinks();
                        }
*/
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

// When two rows in a row (!) have the same content in the WG column,
// merge the two cells
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

// For printing, we only want to print the first occurence of the target
// of a link; so we mark links whose reference has already been printed
// with a class dupref
function markDupLinks() {
    var links = document.querySelectorAll("a[href]");
    var targets = {};
    for (var i = 0 ; i < links.length; i++) {
        var link = links[i];
        if (targets[link.getAttribute("href")]) {
            link.classList.add("dupref");
        } else {
            targets[link.getAttribute("href")] = 1;
        }
    }

}

function updateEditorsActivity(el) {
    var descEl = el.querySelector("desc");
    if (descEl) {
	el.querySelector("a").textContent = descEl.textContent;
  var t = descEl.getAttribute("title");
  if (t) {
    var commitsCount  = parseInt(t.split(" ")[0], 10);
    if (commitsCount === 0) {
      el.querySelector('svg').outerHTML = '';
    }
  }
    }
}

// clean up
var scripts = document.querySelectorAll("script");
for (var i = 0; i < scripts.length; i++) {
    scripts[i].remove();
}
