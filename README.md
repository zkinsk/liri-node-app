# liri-node-app - University of Richmond BootCamp Project

**Siri like app that runs in the cosole instead of by voice.**

It can provied info on:
- Songs via Spotify api
- Movies via Open Movies Database api
- Concerts via Bands in Town api

There are 3 ways to submit a query: 

1. command line prompt via additional text after initializing the app
  -command line examples: 
    - spotify-this-song Time Pink Floyd
    - movie-this Star Wars Return of the Jedi
    - concert-this Hootie and the Blow Fish

1. A text file, accessed via "do-what-it-says", which contains the query type and search string in the same form as listed in item 1

1. Command prompts via inquiry npm which is the default interaction when there are no search parameters entered at app initialization

Search result are provided via command line returns as well as a text file this is updated with every search request and its results. 


