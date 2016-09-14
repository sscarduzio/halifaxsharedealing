# Web automation for Halifax Share Dealing (UK)

This is a Casper.js script that completely automates the slow/tedious login process in Halifax Share Dealing and outputs a JSON object containing all the positions data:

* companyname	
* listedonmarket	
* avgcostpershare(p)	
* bookcost(£)	
* change(p)	
* latestprice(p)	
* profit/loss	
* profit/loss pct	
* quantity	
* valuation(£)

## Usage

Edit the secrets.json file:

```bash
$ cp secrets.json.example secrets.json
$ vi secrets.json
```

Install phantomjs and casperjs, and run the script.

```bash
$ npm install phantomjs
$ npm install casperjs

$ casperjs hsd.js
```

Be patient, in the end the output is going to be a JSON string.


## Troubleshooting

edit the script and uncomment debug log level and verbose mode

```javascript
var casper = require('casper').create({
   // verbose: true,  // <--- uncomment
   // logLevel: "debug""  // <--- uncomment
    waitTimeout: 20000,
    viewportSize: { width: 1200, height: 900 },
    pageSettings: {
        loadImages: false,
        loadPlugins: false,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.94 Safari/537.4'
    }
});

```

