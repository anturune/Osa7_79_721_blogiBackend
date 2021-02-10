//Dummy, konfiguraation testaamiseen-->toimiiko yleensäkään
//Palautetaan aina arvo 1 ja "tests/blogi.test.js" filessä oleva
//Dummy testi verifioi tämän filen ja "tests/blogi.test.js" kommunikoinnin
const dummy = (blogs) => {
    return 1
}

//funktion blogin tykkäyksien verifiointiin
//Huom! tulee taulukkona "tests/blogi.test.js" filestä
const totalLikes = (blogs) => {
    console.log('ARRAYDEN KOOT', blogs.length)

    //Ajetaan mapilla ensin kaikki arvot ja summataan yhteen
    //Jos tyhjä array, palautetaan 0
    const totalLikes = blogs.map(blog => blog.likes).reduce((sum, nextLike) => {
        return sum + nextLike
    }, 0)
    console.log('TOTAL LIKES ', totalLikes)
    //Jos array on tyhjä, palautetaan arvo 0 ja muutoin summa liketyksistä
    return totalLikes

}

const favoriteBlog = (blogs) => {
    const mostLiked = blogs.reduce((prev, current) => {
        return (prev.likes > current.likes)
            ? prev
            : current
    }, 0)
    console.log('ENITEN TYKÄTTY ', mostLiked.title)
    return mostLiked
}


module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}

