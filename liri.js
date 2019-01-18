require("dotenv").config();
var keys = require("./keys.js");
var spotify = new Spotify(keys.spotify);
var fs = require("fs");
var axios = require("axios");

var fnc = process.argv[2];
switch(fnc){
  case "concert-this":
  concertThis()
  break;
  case "spotify-this-song":
  spotiFy()
  break;
  case "movie-this":
  movieThis();
  break;
  case "do-what-it-says":
  doSays()
  break;
}


function concertThis(){

}

function spotiFy(){

}

function movieThis(){
  var movieName = process.argv[3];
  for (let i = 4; i < process.argv.length; i++){
    let x = process.argv[i];
    if (x){
      movieName += "+" + x;
    }
  }
  axios.get("http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey=trilogy").then(
  function(response) {
    // console.log(response)
    console.log("The movie's rating is: " + response.data.imdbRating);
    console.log("The movie was released in " + response.data.Year);
    console.log("Name: " + movieName);
    
  }
);

}

function doSays(){

}