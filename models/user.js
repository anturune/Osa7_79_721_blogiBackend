//-----------Loggautumiseen ja usereiden skeema ja liitos blogi id:hen------
const mongoose = require('mongoose')
//Unnikin käyttäjätunnuksen uniikeuden validointiin määrittely
const uniqueValidator = require('mongoose-unique-validator')
//Käyttäjäskeema ja liitos
const userSchema = mongoose.Schema({
    username: {
        type: String,
        //Käyttäjätunnus oltava uniikki
        unique: true
    },
    name: String,
    passwordHash: String,
    //Liitetään blogit käyttäjään
    //Huom! [] -sulut, koska yhdellä käyttäjällä voi olla monta blogia
    blogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            //Muistiinpanojen id:t on talletettu käyttäjien sisälle taulukkona mongo-id:itä.
            ref: 'Blogi'
        }
    ],
})
//Uniikkivalidaattoorin käyttöönotto
userSchema.plugin(uniqueValidator)

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        //ei haluta paljastaa passworhashia
        delete returnedObject.passwordHash
    }
})

const User = mongoose.model('User', userSchema)

module.exports = User