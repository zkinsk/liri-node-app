require("dotenv").config();
var Spotify = require('node-spotify-api')
var keys = require("./keys.js");
var spotify = new Spotify(keys.spotify);
var fs = require("fs");
var axios = require("axios");
var inquire = require("inquirer");
var stringify = require('json-stringify-safe');
var moment = require('moment');

// inquire prompt with swtich for additional prompts and function launches
function inquireDefault(){
  if (process.argv.length < 3){
    inquire.prompt([
      {
        type: "list",
        message: "What type of info are you looking for?",
        choices: ["spotify-this-song", "concert-this", "movie-this", "do-what-it-says"],
        name: "action"
      }
    ]).then(function(actionInput) {
      queryGet(actionInput.action)
    });
  }else{
    let action = process.argv[2].toLowerCase();
    let query = process.argv.slice(3);
    query = query.join("+");
    // console.log(action, query);
    actionSwitch(action, query)
  }
}

function actionSwitch(action, query){
  // console.log("aS:" + action + " query: " + query);
  switch(action){
    case "concert-this":
    concertThis(query);
    break;

    case "spotify-this-song":
    spotiFy(query);
    break;

    case "movie-this":
    movieThis(query);
    break;

    case "do-what-it-says":
    doSays();
    break;
  }
};

function queryGet(action){
  switch(action){
    case "concert-this":
    inquire.prompt([
      {
        type: "input",
        message: "What band are you interested in?",
        name: "bandName",      
      }
    ]).then(function(data){
      actionSwitch("concert-this", data.bandName)
    })
    break;

    case "spotify-this-song":
    inquire.prompt([
      {
        type: "input",
        message: "What song are you interested in?",
        name: "songName",      
      }
    ]).then(function(data){
      actionSwitch("spotify-this-song", data.songName)
    })
    break;

    case "movie-this":
    inquire.prompt([
      {
        type: "input",
        message: "What movie to do you want info on?",
        name: "movieName",      
      }
    ]).then(function(data){
      actionSwitch("movie-this", data.movieName)
    })
    break;

    case "do-what-it-says":
    actionSwitch("do-what-it-says");
    break;
  }
}

function concertThis(bandName){
  // console.log(`band Name: ${bandName}`)
  axios.get("https://rest.bandsintown.com/artists/" + bandName + "/events?app_id=codingbootcamp").then(
  function(response) {
    let venueInfo = response.data;
    console.log("\n=========************=============\n")
    for (venue in venueInfo){
      let vName = venueInfo[venue].venue.name;
      let vCity = venueInfo[venue].venue.city;
      let vRegion = venueInfo[venue].venue.region;
      let vCounty = venueInfo[venue].venue.country;
      let vDate = moment(venueInfo[venue].datetime).format("MM/DD/YYYY");
      if (vRegion){vRegion += ", "}
      console.log(`Venue: ${vName}, on ${vDate}`) 
      console.log(`Location: ${vCity}, ${vRegion}${vCounty}`)
      console.log("\n=========************=============\n")
    }
    // console.log(stringify(response, null, 4));
  })
  .catch(function(error) {
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      console.log(error.request);
    } else {
      console.log("Error", error.message);
    }
    console.log(error.config);
  });
  writeLog("concert-this", bandName);
};

function spotiFy(songName){
  if(!songName){songName = "The Sign Ace of Base"}
  spotify.search({ type: 'track', query: songName, limit: 1 })
  .then(function(response) {
    let track = response.tracks.items[0]
    let artist = track.album.artists[0].name;
    let album = track.album.name
    for (let i = 1; i < track.album.artists.length; i++){
      artist += ", " + track.album.artists[i].name;
    }
    // console.log(JSON.stringify(response, null, 2));
    console.log("\n\n=========************=============\n\n")
    console.log(`You have chosen the song "${track.name}" by ${artist}, from the album ${album}`) 
    console.log(`\nHere is a Spotify preview link: ${track.preview_url}`)
    console.log("\n\n=========************=============\n\n")
    writeLog("spotify-this-song", songName)
  })
  .catch(function(err) {
    console.log(err);
  });
}

function movieThis(movieName){
  if (!movieName){movieName = "Mr+Nobody"}
  let movieObj = {};
  axios.get("http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy").then(
  function(response) {
    let movieInfo = response.data;
    // console.log(movieInfo);
    let IMDBRate = movieInfo.imdbRating;
    let rotTomatoes;
    if (movieInfo.Ratings[1] != undefined){
      rotTomatoes = movieInfo.Ratings[1].Value
    }else {rotTomatoes = "Oops, no rating"};
    console.log("\n=========************=============\n")
    console.log(`\nYou chose : ${movieInfo.Title}, which came out in ${movieInfo.Year}.`)
    console.log(`It is rated: ${movieInfo.Rated}`);
    console.log(`\nIMDB rates ${movieInfo.Title} at a ${IMDBRate}, while Rotten Tomatoes rates it at ${rotTomatoes}.`)
    console.log(`It was produced in ${movieInfo.Country}, and is a ${movieInfo.Language} language film.`)
    console.log(`\nHere is the basic plot: ${movieInfo.Plot}`)
    console.log(`\nHere are some of the stars from ${movieInfo.Title}: ${movieInfo.Actors}\n`)
    console.log("\n=========************=============\n")
  })
  .catch(function(error) {
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      console.log(error.request);
    } else {
      console.log("Error", error.message);
    }
    console.log(error.config);
  });
writeLog("movie-this", movieName, movieObj)
}

function doSays(){
  console.log("Do Say");
  fs.readFile("random.txt", "utf8", function(error, data) {
    if (error) {
      return console.log(error);
    }
    var dataArr = data.split(",");
    let action = dataArr[0].toLowerCase();
    let query = dataArr.slice(1);
    query = query.join("+");
    for(i in query){
      if(query[i] == "\""){
        query = query.replace("\"", "")
      }
    }
    // console.log(action, query);
    actionSwitch(action, query);
  });
}

function writeLog(fnc, query){
  let logTime = moment();
  let queryData = `${fnc}, "${query}", ${logTime} \n`;
  fs.appendFile("log.txt", queryData, function(err) {
    if (err) {console.log(err)}
  });
}

inquireDefault()