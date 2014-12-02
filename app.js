//require modules
var request = require('request');
var fs = require('fs');
var cheerio = require('cheerio');

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
String.prototype.killPeriod = function() {
    return this.replace(/\./g, '');
};
String.prototype.escapeComma = function() {
    return this.replace(/,/g, '\,');
};
String.prototype.addQuotes = function() {
    return '"' + this + '"';
};

function writeToCSV(array, filename, callback) {
  //join the 2D array with linebreaks
  array = array.join('\n');
  fs.writeFile(filename, array, function (err) {
    if (err) return console.log(err);
    callback();
  });
}

// This function cleans up the data coming from scraping before writing it
// out to a CSV. There are multiple case statements so that the function
// can clean up different kinds of data before outputing it to a CSV.
function cleanUpArray (array, filename, typeOfCleanUp) {

  switch (typeOfCleanUp) {
    case 'dailyTotals':
      array.forEach(function(element,index,array){
         if (index > 0 ) {
           //remove white space and period
           array[index][0] = array[index][0].killWhiteSpaceAndPeriod();
           //put quotes around date because date have commas in them
           array[index][1] = '"' + array[index][1] + '"';
           //remove comma from this big number
           array[index][2] = array[index][2].killComma();
         }
       });
       break;
    case 'semesterTotals':
      array.forEach(function(element,index,array){
         if (index > 0 ) {
           //remove comma from this big number
           array[index][3] = array[index][3].killComma();
           //entirely remove this column, it's just useless text
           array[index].splice(4);
         }
      });
      break;
    case 'leafletersByLifetime':
      array.forEach(function(element,index,array){
         if (index > 0 ) {
           //get rid of period
           array[index][0] = array[index][0].killPeriod();
           //put quotes around date because date have commas in them
           array[index][1] = array[index][1].addQuotes();
           //remove comma from this big number
           array[index][2] = array[index][2].killComma();
           //put quotes around city because City, State have commas in them
           array[index][3] = array[index][3].addQuotes();
           //remove comma from this big number (not needed yet, but maybe in the future)
           array[index][4] = array[index][4].killComma();
           //remove comma from this big number
           array[index][5] = array[index][5].killComma();
         }
       });
       break;
    case 'yearTotals':
      array.forEach(function(element,index,array){
         if (index > 0 ) {
           //remove comma from this big number, not needed yet but whatev
           array[index][1] = array[index][1].killComma();
           //remove comma from this big number
           array[index][2] = array[index][2].killComma();
           //entirely remove this column, it's just useless text
           array[index].splice(3);
         }
      });
      break;
    case 'grandTotals':
      array.forEach(function(element,index,array){
         if (index > 0 ) {
           //add quotes for this date range
           array[index][1] = array[index][1].addQuotes();
           //nix the commas
           array[index][2] = array[index][2].killComma();
           //nix the commas
           array[index][3] = array[index][3].killComma();
           //nix the commas
           array[index][4] = array[index][4].killComma();
         }
      });
      break;
     default:console.log('nothing');
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

function scrapeYearTotals (yearTotals, url, filename) {
  console.log('Scraping year totals now...');
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
        yearTotals.push(item);
      }
    })
  cleanUpArray(yearTotals, filename, 'yearTotals');

  });


} //scrapeYearTotals
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

function scrapeGrandTotals (yearTotals, url, filename) {
  console.log('Scraping grand totals now...');
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
        yearTotals.push(item);
      }
    })
  cleanUpArray(yearTotals, filename, 'grandTotals');

  });


} //scrapeGrandTotals


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
        scrapeDailyTotals(dailyTotals, url, currentPage+1, lastPage, filename);
      }

    });

  }//scrapeDailyTotals function


function scrapeLeafletersByLifetimeSchools(leafleters, url, currentPage, lastPage, filename) {

  console.log('Scraping leafleters by lifetime. currentPage: ' + currentPage + ' of ' + lastPage+ '...');
  formParams = {
   "var1" : currentPage,
   "var2" : "campus",
   "var3" : "life",
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
          leafleters.push(item);
        }

      })
      if (currentPage >= lastPage)  {
        cleanUpArray(leafleters, filename, 'leafletersByLifetime');
      } else {
        scrapeLeafletersByLifetimeSchools(leafleters, url, currentPage+1, lastPage, filename);
      }

    });

  }//scrapeLeafletersByLifetimeSchools function


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
  var config = {
              "outputDirectory" : 'data/',
              "dailyTotals" : {
                    "headers" : ['Rank','Date','Amount'],
                    "firstPage" : 1,
                    "lastPage" : 50,
                    "filename" : 'daily-totals.csv',
                    "url" : 'http://www.adoptacollege.org/stats/daily.php'
                  },
              "semesterTotals" : {
                    "headers" : ['Semester','Schools','Leafleters', 'Booklets'],
                    "filename" : 'semester-totals.csv',
                    "url" : 'http://www.adoptacollege.org/stats/semesters_table.php'
                  },
              "leafletersByLifetimeSchools" : {
                    "headers" : ['Rank', 'Leafleter', 'Organization', 'Location', 'Schools', 'Total'],
                    "firstPage" : 1,
                    "lastPage" : 30,
                    "filename" : 'leafleters-by-lifetime-schools-only.csv',
                    "url" : 'http://www.adoptacollege.org/leafleter/leafleter_list.php'
                  },
              "grandTotals" : {
                    "headers" : ['Source', 'Date Range', 'Leafleters', 'Schools', 'Booklets'],
                    "filename" : 'grand-totals.csv',
                    "url" : 'http://www.adoptacollege.org/stats/grand.php'
                  },
              "yearTotals" : {
                    "headers" : ['Year','Leafleters','Booklets'],
                    "filename" : 'year-totals.csv',
                    "url" : 'http://adoptacollege.org/stats/years_table.php'
                  },
              };


  console.log('Initializing...');

  initialize (config.outputDirectory, function () {
    console.log('Using this directory for data output: ' + config.outputDirectory);



    ////////////////////////////
    // schools data:
    //////////////////////////////////////

    // Semester totals
    scrapeSemesterTotals(
      [config.semesterTotals.headers],
      config.semesterTotals.url,
      config.outputDirectory + config.semesterTotals.filename
        );

    //Daily totals
    scrapeDailyTotals(
      [config.dailyTotals.headers],
      config.dailyTotals.url,
      config.dailyTotals.firstPage,
      config.dailyTotals.lastPage,
      config.outputDirectory + config.dailyTotals.filename
        );
    //Leafleters by lifetime schools
    scrapeLeafletersByLifetimeSchools(
      [config.leafletersByLifetime.headers],
      config.leafletersByLifetime.url,
      config.leafletersByLifetime.firstPage,
      config.leafletersByLifetime.lastPage,
      config.outputDirectory + config.leafletersByLifetime.filename
        );
    //Leafleters by lifetime venues
    scrapeLeafletersByLifetimeSchools(
      [config.leafletersByLifetime.headers],
      config.leafletersByLifetime.url,
      config.leafletersByLifetime.firstPage,
      config.leafletersByLifetime.lastPage,
      config.outputDirectory + config.leafletersByLifetime.filename
        );

    // Grand totals
      scrapeGrandTotals(
        [config.grandTotals.headers],
        config.grandTotals.url,
        config.outputDirectory + config.grandTotals.filename
          );

  })
}

main();
