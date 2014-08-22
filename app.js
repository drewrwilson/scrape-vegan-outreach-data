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

//require from modules
var request = require('request');
var fs = require("fs");
var cheerio = require("cheerio");

url = 'http://www.adoptacollege.org/stats/daily.php';

function writeToCSV(array, filename, callback) {
  //join the 2D array with linebreaks
  array = array.join('\n');
  fs.writeFile(filename, array, function (err) {
    if (err) return console.log(err);
    callback();
  });
}

function cleanUpArray (array, filename) {
  array.forEach(function(element,index,array){
     if (index > 0 ) {
       array[index][0] = array[index][0].killWhiteSpaceAndPeriod();
       array[index][1] = '"' + array[index][1] + '"';
       array[index][2] = array[index][2].killComma();
     }
  })

  writeToCSV(array, filename, function () {
    console.log('Successfully wrote to CSV');
  })
}

function scrapeDailyTotals(dailyTotals, currentPage, lastPage, filename) {

  console.log('Scraping daily totals currentPage: ' + currentPage + '...');
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
        cleanUpArray(dailyTotals, filename);
      } else {
        scrapeDailyTotals(dailyTotals, currentPage+1, lastPage, filename);
      }

    });

  }//scrapeDailyTotals function


function main () {

  console.log('Initializing...');
  var config = {
                "outputDirectory" : 'data/',
                "dailyTotals" : {
                      "headers" : ['Rank','Date','Amount'],
                      "firstPage" : 1,
                      "lastPage" : 2,
                      "filename" : 'daily-totals.csv'
                    }
                }
  console.log('Loaded config.');

  //scrape daily totals and save to a CSV
  scrapeDailyTotals([config.dailyTotals.headers], config.dailyTotals.firstPage, config.dailyTotals.lastPage, config.outputDirectory + config.dailyTotals.filename);




}


main();
