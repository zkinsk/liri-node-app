require("dotenv").config();
var Spotify = require('node-spotify-api')
var keys = require("./keys.js");
var spotify = new Spotify(keys.spotify);
var fs = require("fs");
var axios = require("axios");
var inquire = require("inquirer");
var stringify = require('json-stringify-safe'); //this is not needed at the finished product but was very useful during devlopment for viewing the data returns from and api
var moment = require('moment');

// as a help for development I added an inquire function so I wouldn't have to type so much when re-running code - 
// I kept it in the file and use it as a fallback if no parameters are entered during app initializaiton
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
    actionSwitch(action, query)
  }
}

// switch function to point at the correct fuction based on search type
function actionSwitch(action, query){
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

// this prompts for search query on inquire fallback
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

// concert this function - reaches out to bands in town api
function concertThis(bandName){
  if(!bandName){bandName = "Zoe Keating"}
  writeLog("concert-this", bandName); /* pushes search type and query into log file */
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
      let result = `
      Venue: ${vName}, on ${vDate}
      Location: ${vCity}, ${vRegion}${vCounty}
      \n=========************=============\n`

      console.log(result);
      writeLog(null, result); /* calls for result to be pushed into the log file */
    }
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
};

// spotify api call
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
    
    let result = `
    \n=========************=============\n
    You have chosen the song "${track.name}" by ${artist}, from the album ${album} 
    Here is a Spotify preview link: ${track.preview_url}
   \n=========************=============\n`;

    console.log(result);
    writeLog("spotify-this-song", songName)
    writeLog(null, result, true)
  })
  .catch(function(err) {
    console.log(err);
  });
}

// OMDB database call
function movieThis(movieName){
  if (!movieName){movieName = "Mr+Nobody"}
  axios.get("http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy").then(
  function(response) {
    let movieInfo = response.data;
    // console.log(movieInfo);
    let IMDBRate = movieInfo.imdbRating;
    let rotTomatoes;
    if (movieInfo.Ratings[1] != undefined){
      rotTomatoes = movieInfo.Ratings[1].Value
    }else {rotTomatoes = "Oops, no rating"};

    let result = `
    \n=========************=============\n
    You chose : ${movieInfo.Title}, which came out in ${movieInfo.Year}.
    It is rated: ${movieInfo.Rated}
    IMDB rates ${movieInfo.Title} at a ${IMDBRate}, while Rotten Tomatoes rates it at ${rotTomatoes}.
    It was produced in ${movieInfo.Country}, and is a ${movieInfo.Language} language film.
    Here is the basic plot: ${movieInfo.Plot}
    Here are some of the stars from ${movieInfo.Title}: ${movieInfo.Actors}
    \n=========************=============\n`

    console.log(result);

    writeLog("movie-this", movieName)
    writeLog(null, result)
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
}

// do say function to read the random text file and run the function contained within
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
    actionSwitch(action, query);
  });
}
// write to the log file
function writeLog(fnc, query){
  if (fnc === null){
    fs.appendFile("log.txt", query, function(err) {
      if (err) {console.log(err)}
    });
  }else{
    let logTime = moment();
    let queryData = `\n${fnc}, "${query}", ${logTime}`;
    fs.appendFile("log.txt", queryData, function(err) {
      if (err) {console.log(err)}
    });
  }
}

// starts the ball rolling!
inquireDefault()