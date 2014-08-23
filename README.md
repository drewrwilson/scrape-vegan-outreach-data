scrape-vegan-outreach-data
==========================

This app collects data about leafleting numbers from Vegan Outreach's [AdoptACollege webpages](http://adoptacollege.org) and saves them as comma-seperated value files (CSV files).

It hits various endpoints on [adoptacollege.org](http://adoptacollege.org), scrapes the data, and then writes the data to a file.

How to use locally:
* Fork or clone this code
* Run ``npm install`` in your code directory to install dependencies
* Run ``node app.js``

Data will be saved in ``data/`` in CSV format

# Data Inventory

## Schools
* [X] Semester totals
* [X] Daily totals
* [X] Leafleters by lifetime
* [ ] Leafleters by semester
* [ ] Biggest events
* [ ] Individual schools
* [ ] Individual states

## Venues
* [X] Year totals
* [ ] Daily totals
* [ ] Leafleters by lifetime
* [ ] Leafleters by year
* [ ] Biggest events
* [ ] Warped tour
* [ ] All events

## Combined
* [ ] Grand totals
* [ ] Daily totals
* [ ] Leafleters by lifetime
* [ ] Summer totals



# Ideas
## Ideas for possible improvements
* Make an API for this data
  * But build an API directly from the actual  DB as opposed to using scraping to build an API
* Make some tests to make sure the data coming out is accurate and formatted properly.
 * Maybe a CSV linter
* Schedule regular scraping
* Automatically upload CSVs to a public place after scraping


## Hair-brained ideas
* Scrape daily and tweet when there's a new update
* Tweet a random featured leafleter and their stats
* Associate twitter handles with names in the data and tweet @mentioning someone when there's a change to their data
