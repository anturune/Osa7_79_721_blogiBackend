const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const blogiRouter = require('./controllers/blogit')
//Määritellään käyttöön usersRouter filestä "controllers/users.js"
const usersRouter = require('./controllers/users')
//Määritellään käyttöön kirjautuminen tokeneill
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

logger.info('connecting to', config.MONGODB_URI)
//Otetaan yhteys tietokantaan
mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
    .then(() => {
        logger.info('connected to MongoDB')
    })
    .catch((error) => {
        logger.error('error connection to MongoDB:', error.message)
    })

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(middleware.requestLogger)
//tokenExtarctor middleware pitää ottaa käyttöön ennen Routereita
app.use(middleware.tokenExtractor)
//Otetaan käyttöön blogiRouter ja näin mahdollistetaan/huolehditaan
//Polulle /api/blogs tulevat pyynnöt
app.use('/api/blogs', blogiRouter)
//Otetaan käyttöön usersRouter ja näin mahdollistetaan/huolehditaan
//Polulle /api/users tulevat pyynnöt
app.use('/api/users', usersRouter)
//Otetaan käyttöön loginRouter ja näin mahdollistetaan/huolehditaan
//Polulle /api/login tulevat pyynnöt
app.use('/api/login', loginRouter)

//Testejä varten router tietokannan tyhjäämiseen
//HUOM! mukana vain jos ajetaan testimoodissa eli tyhjää testikannan
if (process.env.NODE_ENV === 'test') {
    const testingRouter = require('./controllers/testing')
    app.use('/api/testing', testingRouter)
}

//Otetaan middlewaret käyttöön
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)


module.exports = app