# Standards For Web Apps on Mobile: State and Roadmap

This repository holds the data and part of the tools needed to build the quarterly [Standards for Web Applications on Mobile: current state and roadmap](http://www.w3.org/Mobile/mobile-web-app-state/) document.

## Data
### Data model
Each JSON file contains an object that describes a given spec with the following properties:
* TR: url of the TR document (if it exists);  if it doesn't, please also document the following data:
    * title: title of the spec (if known)
    * wgs: working groups responsible for the spec, described as an array of objects with properties "label" (name of the group) and "url" (homepage of the group)
    * maturity: "ed" for editors draft, "N/A" if not even a draft is available
* coremob: "fulfills" if the spec was part of CoreMob 2012; "partial" if the spec partially fulfills CoreMob 2012; omit completely otherwise
* stability: object with property "level" (one of "low", "medium", "high") and "label" that describes textually the stability of the spec
* editors: object with property "url" that points to the editors draft of the spec; if there isn't one, use a property "label" set to "N/A" instead
* impl: current level of implementation of the feature in mobile browsers, described via an object with properties "level" (one of "low", "medium", "high"), "label" (a textual description of the implementation level), and "id", the id of the feature in @dontcallmedom/canmymobilebrowser
* tests: information about test suite for the spec, described via an object with properties "url" (url of the tests that can be run), "repo" (url of the repository of test cases), "level" (how complete the test suite is, one of "low", "medium", "high"), and "label" (a textual description of the coverage level)

## Feature description
The index.html file contains purely textual description of a set of features; these features are then automatically summarized in data tables (one per section of the document) via generate.js.

To enable this generation of summary tables, each feature of the document is annotated with:
* a `data-feature` attribute whose content will be re-used to label the feature in the summary table 
* one or several `a` elements with a `data-featureid` attribute whose value matches the basename of a file in the data directory; each of these elements will generate a row describing the relevant spec

```html
<p data-feature="Name of the highlevel feature">Lorem ipsum <a 
 data-featureid="shortname-used-in-data-directory">Foo
 Specficiation</a> lorem ipsum.</p>
```

## Contributing
### Document
Contributions to the body of the document to improve the descriptions of the various features can be made via pull requests on [index.html](index.html).

Particularly worth checking for updates: sentences that use future events (“will”, “would”, “proposed”, “expect”) or evoke recent events (“new“, “recent”).

### Data
The most simple form of contribution is to ensure that the data about the various features is kept up to date.

Most of the data is stored in JSON files in the [data](data/) directory; please make pull requests to update it. The data that requires most frequent updates is:
* the level of stability of a given feature
* the advancement of the test suite.
* the link to the TR document

The data about the state of implementation is maintained in a separate repository: @dontcallmedom/canmymobilebrowser to which contributions are also most welcomed.

Note that the data about maturity and Working Groups is automatically obtained from the W3C list of Technical reports.

### Adding new spec
To add a new spec to the document:
* create a JSON file in the data directory with the required information
* add the document to the relevant section of index.html as in the example given in “Feature description”

## Building
Building the document remains a somewhat convoluted process:
* build the editors activity images via @dontcallmedom/w3c-editors-draft-tracker
* build the implementation status images via @dontcallmedom/canmymobilebrowser
* install the images generated in the two steps above resp. in editors-activity and images
* copy the images at the root of @dontcallmedom/canmymobilebrowser in the directory
* load index.html in a browser
* export the resulting DOM as the final document
* add the changelog to that document, set the date, update the version URLs
* convert it to PDF