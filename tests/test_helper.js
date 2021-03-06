
//Importataan tietokanta käskyt get, post jne. käyttöön tänne
//Blogien osalta
const Blog = require('../models/blogi')
//Importataan tietokanta käskyt get, post jne. käyttöön tänne
//Käyttäjien osalta
const User = require('../models/user')
//Testiarray, jonka sisällä blogit
const initialBlogs = [
    {
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7, __v: 0
    },
    {
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5,
        __v: 0
    },
    {
        title: "Lisäblogi että deltointitestin jälkeen enemmän kuin yksi blogi",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5,
        __v: 0
    },
]
//Haetaan kaikki blogit testin käyttöön filen "tests/blogi.test.js" testeille
const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}
//Haetaan kaikki käyttäjät testin käyttöön filen "tests/blogi.test.js" testeille
const usersInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
}

module.exports = {
    initialBlogs,
    blogsInDb,
    usersInDb
}