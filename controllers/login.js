const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
    const body = request.body
    //etsitään pyynnön mukana olevaa usernamea vastaavan käyttäjän tietokannasta
    const user = await User.findOne({ username: body.username })
    //katsotaan onko pyynnön mukana oleva password oikea
    //tehdään vertailu metodilla bcrypt.compare, koska salasanoja ei talleteta tietokantaan
    const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(body.password, user.passwordHash)
    //Jos käyttäjää ei ole olemassa tai salasana on väärä, vastataan kyselyyn
    //statuskoodilla 401 unauthorized ja kerrotaan syy vastauksen bodyssä.
    if (!(user && passwordCorrect)) {
        return response.status(401).json({
            error: 'invalid username or password'
        })
    }
    //Jos salasana on oikein, luodaan metodin jwt.sign avulla token, joka sisältää
    //digitaalisesti allekirjoitetussa muodossa käyttäjätunnuksen ja käyttäjän id
    const userForToken = {
        username: user.username,
        id: user._id,
    }
    //Token on digitaalisesti allekirjoitettu käyttämällä salaisuutena ympäristömuuttujassa 
    //SECRET olevaa merkkijonoa. Digitaalinen allekirjoitus varmistaa sen,
    //että ainoastaan salaisuuden tuntevilla on mahdollisuus generoida validi token.
    //Ympäristömuuttujalle pitää muistaa asettaa arvo tiedostoon .env
    const token = jwt.sign(userForToken, process.env.SECRET)

    //Onnistuneeseen pyyntöön vastataan statuskoodilla 200 ok ja generoitu token sekä
    //kirjautuneen käyttäjän käyttäjätunnus ja nimi lähetetään vastauksen bodyssä pyynnön tekijälle
    response
        .status(200)
        .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter