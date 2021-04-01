const mongoose = require('mongoose')

//Mongon osoite annetaan sovellukselle ympäristömuuttujan MONGODB_URI välityksellä
//const url = process.env.MONGODB_URI

//console.log('connecting to', url)
//mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
//.then(result => {
//console.log('connected to MongoDB')
//})
//.catch((error) => {
//console.log('error connecting to MongoDB:', error.message)
//})

const blogiSchema = new mongoose.Schema({
    title: String,
    author: String,
    url: String,
    likes: Number,
    comments: [],
    //----Kirjautmiseen liittyvä lisäys eli liitetään user blogiin----
    //Huom! ei []-sulkuja, koska vain yksi käyttäjä per blogi
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

//Muutetaan id String muotoiseksi, koska muutoin tulee oliona skeemasta
//Poistetaan lisäksi id olio, joka korvattu Stringilla sekä mongon versiointi
blogiSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Blogi', blogiSchema)