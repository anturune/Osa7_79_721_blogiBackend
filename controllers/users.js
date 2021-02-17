//------Kirjautumista varten users routerin määritys----------
//Salasanan kryptaus
const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
/*
//Haetaan kaikki käyttäjät testin käyttöön filen "tests/blogi.test.js" testeille
const usersInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
}
*/

//Käyttäjän postaukseen liittyvä actioni
usersRouter.post('/', async (request, response) => {
    const body = request.body
    //Haetaan kaikki käyttäjät
    const users = await User.find({})

    console.log('ONKO PASSWORD UNDEFINED', body.password)

    //Tarkastetaan, että samaa usernamea ei käytössä, salasana väh 3 merkkiä pitkä ja
    //username ja salasana annettu
    if (body.username === undefined || body.password === undefined) {
        return response.status(400).json({ error: 'password or username missing' })
    }
    else if (users.find(user => user.username === body.username)) {
        return response.status(400).json({ error: 'username already in use' })
    }
    else if (body.password.length < 3) {
        return response.status(400).json({ error: 'password too short' })
    }

    //SaltRounds ja arvo 10 on hyvä käytäntö ja ei oleellista ymmärtää
    //Hashataan salasana tunnistamattamokasi
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
        username: body.username,
        name: body.name,
        //Tietokantaan siis ei talleteta pyynnön mukana tulevaa salasanaa,
        //vaan funktion bcrypt.hash avulla laskettu hash
        passwordHash,
    })
    const savedUser = await user.save()

    response.json(savedUser)
})
//Kaikkien käyttäjien hakemiseen
usersRouter.get('/', async (request, response) => {
    //".populate('blogs')" lisätty, kun halutaan näyttää käyttäjien kaikki blogit
    //id:iden lisäksi eli näytetään myös blogien sisältö
    //Näillä rajataan mitä kenttiä halutaan näyttää { title: 1, author: 1, url: 1, likes: 1, id: 1 }
    const users = await User.find({}).populate('blogs', { title: 1, author: 1, url: 1, likes: 1, id: 1 })
    response.json(users.map(u => u.toJSON()))
})

module.exports = usersRouter