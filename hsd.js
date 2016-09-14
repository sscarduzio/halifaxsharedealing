var casper = require('casper').create({
    verbose: true,
    logLevel: "debug",
    waitTimeout: 20000,
    viewportSize: { width: 1200, height: 900 },
    pageSettings: {
        loadImages: false,
        loadPlugins: false,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.94 Safari/537.4'
    }
});

// Read configuration file
var data = require('fs').read('secrets.json');
var conf = null;
try {
    conf = JSON.parse(data);
} catch (e) {
    casper.echo(e)
}

// Error handler
casper.on('error', function(msg, backtrace) {
    this.capture('error.png');
    throw new ErrorFunc("fatal", "error", "filename", backtrace, msg);
});

// Redirect handler
casper.on('http.status.302', function(resource) {
    var redirectURL = this.currentResponse.redirectURL;
    this.log("opening redirect url: " + redirectURL, 'debug');
    this.open(redirectURL)
});


casper.start('https://www.halifaxsharedealing-online.co.uk/_mem_bin/formslogin.asp?WT.ac=HSDL2')

// First stage: USERNAME AND PASSWORD
casper.waitForSelector("form[name=frmFormsLogin]");

casper.then(function login() {
    this.fillSelectors('form[name=frmFormsLogin]', {
        'input[name = Username ]': conf.username,
        'input[name = password ]': conf.password
    }, true);

    this.log('username and password submitted', 'debug')
});


// Second stage: memorable word challenge
casper.waitForSelector("input[value='Sign In']");

casper.then( function respondChallenge() {
    var q = casper.fetchText('label');
    this.log('found challenge question: ' + q , 'warning');
    var ans = null;
    if (q.match(/school/i)) {
        ans = conf.school;
    } else if (q.match(/father/i)) {
        ans = conf.father;
    } else if (q.match(/mother/i)) {
        ans = conf.mother;
    } else if (q.match(/town/i)) {
        ans = conf.city;
    } else {
        this.log('could not match any question: ' + q, 'error')
        return;
    }
    this.sendKeys('input[type=password]', ans);
    this.click('input[title="Sign in"]');

    this.log('submitted challenge with ans ' + ans, 'debug');
});


// Phase three: Home menu
casper.thenClick("a[href$='sdaccountvaluation.asp']");

casper.waitForSelector('.MainPage')

casper.thenClick('a[title="Current Valuation"]');


// Phase four: Current valuation table
casper.waitForSelector('.DataTable')

var jtable = null;

casper.then(function currentValuationFromTable() {
    jtable = this.evaluate(function() {

		// Extrapolate the data from the HTML table
        function tableToJson(table) {
            var data = [];

            // first row needs to be headers
            var headers = [];
            for (var i = 0; i < table.rows[0].cells.length; i++) {
                headers[i] = table.rows[0].cells[i].innerHTML.toLowerCase().replace(/ /gi, '');
            }

            // go through cells
            for (var i = 1; i < table.rows.length; i++) {
                var tableRow = table.rows[i];
                var rowData = {};

                for (var j = 0; j < tableRow.cells.length; j++) {
                    var value = tableRow.cells[j]
                    if (value && value.firstElementChild) {
                        value = value.firstChild;
                    }
                    var key = headers[j];
                    if (key && typeof key == 'string') {
                        key = key.replace('&nbsp;', 'profit/loss pct')
                    }
                    rowData[key] = typeof value.innerHTML == 'string' ? value.innerHTML.trim().replace('*','') : value.innerHTML;
                }
                data.push(rowData);
            }
            return data;
        }
        var tb = document.querySelectorAll('table.MainPage tbody');
        return tableToJson(tb[tb.length - 1]);
    });
});

// Serialize the table as JSON 
casper.then(function printData()  {
    this.echo(JSON.stringify(jtable).replace(/\*/g,''));
});

// Optionally, you can take a screenshot :)
// casper.then(function() {
//     capture('screen.png');
// });

casper.run();