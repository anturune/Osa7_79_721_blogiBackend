
/*
//normaalit logiviestit CMD:stä pois, kun testausmoodissa
const info = (...params) => {
    if (process.env.NODE_ENV !== 'test') {
        console.log(...params)
    }
}
*/

//normaalit logiviestit, kun halutaan logiviestit CMD:hen näkyviin
//Esim. "Server running on port 3001" ja "connected to MongoDB"
const info = (...params) => {
    console.log(...params)
}

//virhetilanteisiin
const error = (...params) => {
    console.error(...params)
}

module.exports = {
    info, error
}