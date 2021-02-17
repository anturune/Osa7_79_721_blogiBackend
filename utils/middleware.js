//Importataan itse tehdyt loggerit logger.js filestä
const logger = require('./logger')

const requestLogger = (request, response, next) => {
    logger.info('Method:', request.method)
    logger.info('Path:  ', request.path)
    logger.info('Body:  ', request.body)
    logger.info('---')
    next()
}


//Virheenkäsittelyyn
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
// Tämä Error handelerin middlewaren määritys
//Otetaan käyttöön vasta koodin lopussa app.js filessä, ennen porttimäärityksiä, 
//mutta määritellään jo alussa
const errorHandler = (error, request, response, next) => {
    console.log('TULEEKO errorHandlreiin')
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
        //Token tsekkaaminen, onko virheellinen.
        //Tämän voi testata "requests/post_new_blogi_with_token.rest" poistamalla vaiks
        //pari kirjainta tokenista
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(401).json({
            error: 'invalid token'
        })
    }
    logger.error(error.message)
    next(error)
}

const tokenExtractor = (request, response, next) => {
    console.log('TULEEKO TOKEN EXTRACTORIIN', request)
    // tokenin ekstraktoiva koodi
    const authorization = request.get('authorization')

    //Jos Token olemassa ja header (ks. header "requests/post_new_blogi_with_token.rest")
    //alkaa "bearer" -sanalla, niin lisätään token requestiin, 
    //joka saatavilla sitten "controllers/blogit.js" filen routeilla
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        request.token = authorization.substring(7)
    }
    next()
}

//Exportataan muiden moduulien käyttöön
module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    tokenExtractor
}