

//require from modules
var request = require('request');
var fs = require("fs");
var cheerio = require("cheerio");

function ensureExists(path, mask, cb) {
    if (typeof mask == 'function') { // allow the `mask` parameter to be optional
        cb = mask;
        mask = 0777;
    }
    fs.mkdir(path, mask, function(err) {
        if (err) {
            if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
            else cb(err); // something else went wrong
        } else cb(null); // successfully created folder
    });
}

//define some global string functions
String.prototype.killWhiteSpaceAndPeriod = function() {
    return this.replace(/.\s/g, '');
};
String.prototype.killWhiteSpace = function() {
    return this.replace(/\s/g, '');
};
String.prototype.killComma = function() {
    return this.replace(/,/g, '');
};
String.prototype.escapeComma = function() {
    return this.replace(/,/g, '\,');
};

function writeToCSV(array, filename, callback) {
  //join the 2D array with linebreaks
  array = array.join('\n');
  fs.writeFile(filename, array, function (err) {
    if (err) return console.log(err);
    callback();
  });
}

function cleanUpArray (array, filename, typeOfCleanUp) {
  if (typeOfCleanUp == 'dailyTotals') {
    array.forEach(function(element,index,array){
       if (index > 0 ) {
         array[index][0] = array[index][0].killWhiteSpaceAndPeriod();
         array[index][1] = '"' + array[index][1] + '"';
         array[index][2] = array[index][2].killComma();
       }
    })
  } else if (typeOfCleanUp == 'semesterTotals') {
      //TODO: remove the 5th column: array[4]
      array.forEach(function(element,index,array){
         if (index > 0 ) {
           array[index][3] = array[index][3].killComma();
           //remove 5th column here
         }
      })
  }

  writeToCSV(array, filename, function () {
    console.log('Successfully wrote data to CSV: ' + filename);
  })
}

function scrapeSemesterTotals (semesterTotals, url, filename) {
  console.log('Scraping semester totals now...');
  formParams = {
   "var1" : "",
   "var2" : "",
   "var3" : "",
   "var4" : "",
   "var5" : "",
   "var6" : ""
  }

request({
  uri: url,
  method: "POST",
  timeout: 10000,
  followRedirect: true,
  form: formParams,
  maxRedirects: 10
}, function(error, response, body) {

  //load body into cheerio
  var $ = cheerio.load(body);


  //loop through all rows <tr>
  $('table tr').map(function(i, row) {
      var item = [];
      //loop through all columns <td>
      $(row).children('td').each(function() {
        item.push( $(this).text() );
      });

      if (item.length > 0) {
        semesterTotals.push(item);
      }
    })
  cleanUpArray(semesterTotals, filename, 'semesterTotals');

  });


} //scrapeSemesterTotals


function scrapeDailyTotals(dailyTotals, url, currentPage, lastPage, filename) {

  console.log('Scraping semester totals currentPage: ' + currentPage + ' of ' + lastPage+ '...');
  formParams = {
   "var1" : currentPage,
   "var2" : "campus",
   "var3" : "all",
   "var4" : "total",
   "var5" : "",
   "var6" : ""
  }

  request({
    uri: url,
    method: "POST",
    timeout: 10000,
    followRedirect: true,
    form: formParams,
    maxRedirects: 10
  }, function(error, response, body) {

    //load body into cheerio
    var $ = cheerio.load(body);


    //loop through all rows <tr>
    $('table tr').map(function(i, row) {
        var item = [];
        //loop through all columns <td>
        $(row).children('td').each(function() {
          item.push( $(this).text() );
        });

        if (item.length > 0) {
          dailyTotals.push(item);
        }

      })
      if (currentPage >= lastPage)  {
        cleanUpArray(dailyTotals, filename, 'dailyTotals');
      } else {
        scrapeDailyTotals(dailyTotals, currentPage+1, lastPage, filename);
      }

    });

  }//scrapeDailyTotals function

function initialize (directory, callback) {
  //make sure data directory exists, if not create it
  ensureExists(__dirname + '/' + directory, 0744, function(err) {
    if (err) {
      console.log(err);
    } // handle folder creation error
    else {
      callback();
    }// we're all good
  });

}

function main () {
  console.log('Initializing...');
  var config = {
                "outputDirectory" : 'data/',
                "dailyTotals" : {
                      "headers" : ['Rank','Date','Amount'],
                      "firstPage" : 1,
                      "lastPage" : 2,
                      "filename" : 'daily-totals.csv',
                      "url" : 'http://www.adoptacollege.org/stats/daily.php'
                    },
                "semesterTotals" : {
                      "headers" : ['Semester','Schools','Leafleters', 'Booklets'],
                      "firstPage" : 1,
                      "lastPage" : 1,
                      "filename" : 'semester-totals.csv',
                      "url" : 'http://www.adoptacollege.org/stats/semesters_table.php'
                    },
                }
  console.log('Loaded config.');

  initialize (config.outputDirectory, function () {
    console.log('Using this directory for data output: ' + config.outputDirectory);

    //scrape daily totals and save to a CSV

    //schools data:
    //scrapeDailyTotals([config.dailyTotals.headers], config.dailyTotals.url, config.dailyTotals.firstPage, config.dailyTotals.lastPage, config.outputDirectory + config.dailyTotals.filename);
    scrapeSemesterTotals([config.semesterTotals.headers], config.semesterTotals.url, config.outputDirectory + config.semesterTotals.filename);



    //venues data:

    //grand totals data:

  })
}

main();
