
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

//Luodaan Router -olio
const blogiRouter = require('express').Router()
const Blogi = require('../models/blogi')
//Tämä määrittely User:n liitämiseksi blogiRouter.post:ssa
const User = require('../models/user')

//-----Kirajutumiseen liittyvän tokenin määritykset alkaa------------------------------------
//Tämä määrittely kirjautumissen liityvän tokenin saamiseksi blogiRouter.post:iin
//Eli vain kirjautunut käyttäjä voi tehdä blogin postauksen
const jwt = require('jsonwebtoken')

/*
const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }
    return null
}
*/
//-----Kirajutumiseen liittyvän tokenin määritykset loppuu-----------------------------------

//---------------async ja await lisäys integraatiotestejä varten alkaa----------------
//Kaikkien blogien hakemiseen (async ja await lisätty integraatiotestejä varten)
//koska kaikki asynkroniset operaatiot tehdään funktioiden sisällä
blogiRouter.get('/', async (request, response) => {
    const blogs = await Blogi
        //populate metodilla saadaan käyttäjän tiedot "username ja name" näkyviin
        //Haettaessa kaikki blogit
        .find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs.map(blog => blog.toJSON()))
})

//Lisätään uusi blogi HUOM! vain polku '/'
blogiRouter.post('/', async (request, response, next) => {

    const body = request.body

    //----Kirjautumiseen liittyvän tokenin tarkastus alkaa-----------------

    //Apufunktio getTokenFrom eristää tokenin headerista authorization.
    //const token = getTokenFrom(request)
    //Tokenin oikeellisuus varmistetaan metodilla jwt.verify. Metodi myös dekoodaa tokenin,
    //eli palauttaa olion, jonka perusteella token on laadittu
    //Tässä token on erotettu "utils/middleware.js" filessä
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    //Jos tokenia ei ole tai tokenista dekoodattu olio ei sisällä käyttäjän identiteettiä
    //(eli decodedToken.id ei ole määritelty), palautetaan virheestä kertova statuskoodi 401 unauthorized
    //ja kerrotaan syy vastauksen bodyssä
    /*
    if (!request.token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }*/
    const user = await User.findById(decodedToken.id)

    //----Kirjautumiseen liittyvän tokenin tarkastus loppuu----------------

    //Tämä, jotta voidaan lisätä käyttäjän id luodulle blogille (jos ei vielä tokenia)
    //const user = await User.findById(body.userId)

    //Tsekataan, että blogiin annettu title ja url. Jos ei, niin tulee virhekoodi "400"
    if (!body.title || !body.url) {
        console.log('Title or url missing')
        return response.status(400).json({ error: 'Title or url missing' })
    }

    //Mongoa varten luodaan objekti scheeman mukaisesti
    //Jos tykkäyksiä ei ole tulossa, niin laitetaan tilalle "0"
    const blogi = new Blogi({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes === undefined ? 0 : body.likes,
        //Tämä tarvitaan, jotta käyttäjä voidaan pointata luotuun blogiin
        user: user._id,
    })
    //Blogin tallennus
    //Poikkeuksen catchaaminen express-async-errors -kirjaston avulla
    //ei siis tarvita try-catch koodia, koska kirjasto hoitaa sen
    const savedBlogi = await blogi.save()

    //Lisätään userin blogeihin uusi blogi ks. "models/uesr.js" skeemasta tuo "blogs"
    //eli minkä niminen kenttä
    user.blogs = user.blogs.concat(savedBlogi._id)
    await user.save()

    response.json(savedBlogi.toJSON())

})
//Blogin poistaminen/deletointi
blogiRouter.delete('/:id', async (request, response) => {
    console.log('TULEEKO REST TESTISTÄ DELETEEN:', request.params.id)
    const blog = await Blogi.findById(request.params.id)
    console.log('POISTETTAVA BLOGI', blog)

    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    const user = await User.findById(decodedToken.id)
    //Kannasta haettu id tulee muuttaa vertailua varten merkkijonoksi
    if (blog.user.toString() === user.id.toString()) {
        await Blogi.findByIdAndRemove(request.params.id)
        response.status(204).end()
    }

})

//Blogin muuttaminen
blogiRouter.put('/:id', async (request, response) => {
    const body = request.body

    const blogi = {
        title: body.title,
        url: body.url,
        author: body.author,
        likes: body.likes,
        //Skeemassa komentti on array ja tähän tulee kuitenkin
        //Ilman arrayn vaatimia hakasulkeita, koska uusi taulukko
        //uudella kommentilla luodaan frontendissä
        //HUOM! React js:ssä ei koskaan päivitetä taulukkoa vaan
        //vanha korvataan aina uudella
        comments:body.comments
    }
    //HUOM! { new: true } tarvitaan, jotta palautuu frontendiin
    const modifiedBlogi = await Blogi.findByIdAndUpdate(request.params.id, blogi, { new: true })
    response.json(modifiedBlogi.toJSON())
})
//---------------async ja await lisäys integraatiotestejä varten loppuu----------------


module.exports = blogiRouter