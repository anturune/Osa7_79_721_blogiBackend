
//Luodaan Router -olio
const blogiRouter = require('express').Router()
const Blogi = require('../models/blogi')

/*
//Kaikkien blogien hakemiseen
blogiRouter.get('/', (request, response) => {
    Blogi.find({}).then(blogs => {
        response.json(blogs.map(blog => blog.toJSON()))
    })
})
*/



/*
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
*/

//---------------async ja await lisäys integraatiotestejä varten alkaa----------------
//Kaikkien blogien hakemiseen (async ja await lisätty integraatiotestejä varten)
//koska kaikki asynkroniset operaatiot tehdään funktioiden sisällä
blogiRouter.get('/', async (request, response) => {
    const blogs = await Blogi.find({})
    response.json(blogs.map(blog => blog.toJSON()))
})

//Lisätään uusi blogi HUOM! vain polku '/'
blogiRouter.post('/', async (request, response, next) => {

    const body = request.body
    //Tsekataan, että blogiin annettu title ja url. Jos ei, niin tulee virhekoodi "400"
    if (!body.title || !body.url) {
        console.log('Title or url missing')
        return response.status(400).json({ error: 'Title or url missing' })
    }
    console.log('TULEEKO POSTIIN REST TESTISTÄ MITÄÄN', body.title)
    //Mongoa varten luodaan objekti scheeman mukaisesti
    //Jos tykkäyksiä ei ole tulossa, niin laitetaan tilalle "0"
    const blogi = new Blogi({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes === undefined ? 0 : body.likes,
    })
    //Blogin tallennus
    //Poikkeuksen catchaaminen express-async-errors -kirjaston avulla 
    //ei siis tarvita try-catch koodia, koska kirjasto hoitaa sen
    const savedBlogi = await blogi.save()
    response.json(savedBlogi.toJSON())

})
//Blogin poistaminen/deletointi
blogiRouter.delete('/:id', async (request, response) => {
    console.log('TULEEKO REST TESTISTÄ DELETEEN:', request.params.id)
    await Blogi.findByIdAndRemove(request.params.id)
    response.status(204).end()
})

//Blogin muuttaminen
blogiRouter.put('/:id', async (request, response) => {
    const body = request.body

    const blogi = {
        title: body.title,
        url: body.url,
        author: body.author,
        likes: body.likes,
    }
    //HUOM! { new: true } tarvitaan, jotta palautuu frontendiin
    const modifiedBlogi = await Blogi.findByIdAndUpdate(request.params.id, blogi, { new: true })
    response.json(modifiedBlogi.toJSON())
})
//---------------async ja await lisäys integraatiotestejä varten loppuu----------------


module.exports = blogiRouter