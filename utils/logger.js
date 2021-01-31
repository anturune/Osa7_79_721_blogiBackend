//normaalit logiviestit
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