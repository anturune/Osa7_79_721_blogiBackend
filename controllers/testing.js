//Luodaan Router -olio
const router = require('express').Router()
const Blogi = require('../models/blogi')
//Tämä määrittely User:n liitämiseksi blogiRouter.post:ssa
const User = require('../models/user')

//Nyt HTTP POST -operaatio backendin endpointiin "/api/testing/reset"
//tyhjentää tietokannan
router.post('/reset', async (request, response) => {
    await Blogi.deleteMany({})
    await User.deleteMany({})

    response.status(204).end()
})

module.exports = router