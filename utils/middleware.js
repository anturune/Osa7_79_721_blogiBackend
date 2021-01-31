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

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

//Exportataan muiden moduulien käyttöön
module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler
}