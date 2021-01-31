



//Moduloinnin jälkeen koodi typistuu näin
// varsinainen Express-sovellus
const app = require('./app')
const http = require('http')
const config = require('./utils/config')
const logger = require('./utils/logger')

const server = http.createServer(app)

server.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`)
})



/*
//Otetaan ympäristömuuttujat käyttöön, jossa mongodb URI ja salasana ja portti
Ks. .env file ja utils/config.js
const config = require('./utils/config')


Tuodaan models polusta/kansiosta blogi.js index.js:n käyttöön
HUOM! TÄMÄN PITÄÄ OLLA require('dotenv').config() JÄLKEEN
const Blogi = require('./models/blogi')

Expressin määrittely
const express = require('express')
*/
//Logitukseen
//const morgan = require('morgan')

//cors:lla mahdollistetaan backendin ja fronendin kommunikointi
//Koska eri origineissa Front endin origin portti 3000 ja backendin portti 3001
//const cors = require('cors')

//expressin määrittelyä
//const app = express()

//Virheenkäsittelyyn viety utils/middleware.js
//const unknownEndpoint = (request, response) => {
//response.status(404).send({ error: 'unknown endpoint' })
//}
// Tämä Error handelerin middlewaren määritys viety utils/middleware.js
//Otetaan käyttöön vasta koodin lopussa, ennen porttimäärityksiä, mutta määritellään jo alussa
//const errorHandler = (error, request, response, next) => {

//if (error.name === 'CastError') {
//return response.status(400).send({ error: 'malformatted id' })
//} else if (error.name === 'ValidationError') {
//return response.status(400).json({ error: error.message })
//}

//next(error)
//}

//app.use(express.static('build'))
//Otetaan middlwaret käyttöön
//app.use(express.json())
//app.use(cors())

//Tehdään kustomoitu logitus, jossa on mukana POST actionin body eli sisältö joka
//lähetetään palvelimelle
//morgan.token('body', (req, res) => JSON.stringify(req.body))

//Otetaan logitus käyttöön, tässä alku on 'tiny' + määritelty body
//voisi käyttää myös app.use(morgan('tiny')), mutta silloin ei saada mukaan
//POST actionin bodya=palvelimelle lähetettävä data
//app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


//Haetaan kaikki blogit
//app.get('/api/blogs', (req, res) => {
//Haetaan Mongosta kaikki
//Blogi
//.find({})
//.then(blogit => {
//res.json(blogit)
//})
//})

//Lisätään Mongoon uusi blogi
//app.post('/api/blogs', (request, response, next) => {

//const body = request.body
//console.log('POST header', request.headers)
//Tsekataan, että blogin annettu
//if (!body.title || !body.author) {
//console.log('Title or author missing')
//return response.status(400).json({ error: 'Title or author missing' })
//}

//Mongoa varten luodaan objekti scheeman mukaisesti
//const blogi = new Blogi({
//title: body.title,
//author: body.author,
// url: body.url,
//likes: body.likes,
//})
//Blogin tallennus
//blogi
//.save()
//.then(savedBlogi => savedBlogi.toJSON())
//.then(savedAndFormattedsavedBlogi => {
// response.json(savedAndFormattedsavedBlogi)
//})
//.catch(error => next(error))
//})


//HUOM! Nämä kaksi otetaan käyttöön backendkoodin ihan lopussa, juuri ennen porttimäärityksiä
//Olemattomien osoitteiden Middleware tänne Ihan loppuun
//app.use(unknownEndpoint)

//Middleware virheiden käsittelyyn käyttö tänne Ihan loppuun
//app.use(errorHandler)


//const PORT = config.PORT
//app.listen(PORT, () => {
//console.log(`Server running on port ${config.PORT}`)
//})