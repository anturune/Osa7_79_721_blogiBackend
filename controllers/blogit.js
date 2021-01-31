
//Luodaan Router -olio
const blogiRouter = require('express').Router()
const Blogi = require('../models/blogi')

//Kaikkien blogien hakemiseen
blogiRouter.get('/', (request, response) => {
    Blogi.find({}).then(blogs => {
        response.json(blogs.map(blog => blog.toJSON()))
    })
})

//Lisätään uusi blogi HUOM! vain polku '/'
blogiRouter.post('/', (request, response, next) => {

    const body = request.body
    console.log('POST header', request.headers)
    //Tsekataan, että blogiin annettu title ja author
    if (!body.title || !body.author) {
        console.log('Title or author missing')
        return response.status(400).json({ error: 'Title or author missing' })
    }

    //Mongoa varten luodaan objekti scheeman mukaisesti
    const blogi = new Blogi({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
    })
    //Blogin tallennus
    blogi
        .save()
        .then(savedBlogi => savedBlogi.toJSON())
        .then(savedAndFormattedsavedBlogi => {
            response.json(savedAndFormattedsavedBlogi)
        })
        .catch(error => next(error))
})

module.exports = blogiRouter