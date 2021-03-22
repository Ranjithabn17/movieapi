const express =require('express')
const request=require('request')
const breaker=require('express-circuit-breaker')
const MOVIE_API="https://api.themoviedb.org/3/movie/now_playing?api_key=97b3e86e7d5ac232a8719be121c2eb5c&language=en-US&page=1";
const GENREAPI="https://api.themoviedb.org/3/genre/movie/list?api_key=97b3e86e7d5ac232a8719be121c2eb5c&language&language=en-US";
const app=express()
 
let options1={
    url:MOVIE_API,
    strictSSL:false,
     rejectUnauthorized: false,//add when working with https sites
     requestCert: false,//add when working with https sites
     agent: false,
    secureProtocol:'TLSv1_method'
}
//URL to get the Genre List
let options2={
    url:GENREAPI,
    strictSSL:false,
     rejectUnauthorized: false,//add when working with https sites
     requestCert: false,//add when working with https sites
     agent: false,
    secureProtocol:'TLSv1_method'

}
//Circuit breaker
var CB = breaker({
  catchError: e => 'trip',
  handleBlockedRequest: (req, res) => res.sendStatus(500)
})
//Asynchronous Get Request to Fetch movie data
app.get('/',CB, async (req,res)=>{       
        await request.get(options1,(err,response,body)=>{
            if(err)
            console.log(err);
            else{
              let popularityRating=req.headers['popularity'];
              let content= null ||JSON.parse(body);
              if(content){
                  //Calling method to display as per user specified genre
                  getMovieWithGenre(content);
                  //Calling method to display as per the popularity rating
               // getMoviesWithPopularity(content,popularityRating)
                  //res.send(content)
              }
              else{
                  res.send("Error with Fetching the data")
              }
            }
        })
        // const getMoviesWithPopularity=(data,popularityRating)=>{
        //     let results=data.results;         
        //     const rating=results.filter(results=>results.popularity>popularityRating)
        //   res.send(rating.sort())
        // }

       const getMovieWithGenre=(movieapi)=>{
             request.get(options2,(err,response,body)=>{
                if(err)
                console.log(err);
                else{
                  let genreId=[];
                  let movies=[];
                  let filteredMovies=[];
                  let genreList= 0||JSON.parse(body).genres; 
                  let genres=req.headers['genre'].split(',');   
                //    console.log(genres);
                  if(genres.length!==0){
                  genreList.forEach(element => {
                      if(genres.includes(element.name))
                      {
                          genreId.push(element.id);
                      }
                  });
                 movieapi.results.filter(movie=>{
                  movies.push(movie)
                 })
                 movies.filter(movie => 
                    {
                      genreId.forEach(id => {
                        if(movie.genre_ids.includes(id)){
                          filteredMovies.push(movie)
                        }
                      })
                    }
                  )
                  console.log(`Total Movies Filtered from ${movieapi.results.length} to ${filteredMovies.length}` )
                  res.send(filteredMovies);

                }
                else{
                  res.json({message:"No genre selected"});
                  res.send(movielist);
                }
              }
             
            })
        }
}
)

const PORT= process.env.PORT||3000;

app.listen(PORT,console.log(`Server is running at port ${PORT}`));
