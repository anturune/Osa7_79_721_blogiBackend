//--------------------INTEGRAATIOTESTAUS ALKAA--------------
//-------Nämä integraatiotestejä varten (Tietokanta mukana)-----
const mongoose = require('mongoose')
const supertest = require('supertest')
//Tällä otetaan käyttöön yhteisiä funktioita, ettei tarvitse kirjoittaa uusiksi
//kokoajan
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blogi')
//-------Nämä integraatiotestejä varten (Tietokanta mukana)-----

//-----Nämä lisätään uuden käyttäjän luomiseen liittyviin testeihin---
const bcrypt = require('bcrypt')
const User = require('../models/user')
//-----Nämä lisätään uuden käyttäjän luomiseen liittyviin testeihin---

//------------UUDEN KÄYTTÄJÄN LUOMISEN TESTIT ALKAA-------------------
describe('KÄYTTÄJÄN LUOMINEN KANTAAN', () => {
    beforeEach(async () => {
        //Tyhjätään testin aluksi kannassa olevat käyttäjät
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        //Luodaan initial käyttäjä "root"
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })
    //Testi käyttäjän luomiseksi
    test('Käyttäjän luominen onnistui', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'turuukkainen',
            name: 'Antti Muukkainen',
            password: 'arvaatKylla',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        console.log('LÖYTYYKÖ KANNASTA Turuukkainen', usersAtEnd[usersAtStart.length])

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })
    //Testi, jos käyttäjä jo tietokannassa, niin luonti epäonnistuu
    test('Käyttäjän luonti epäonnistuu, jos käyttäjätunnus jo käytössä', async () => {
        const usersAtStart = await helper.usersInDb()
        //Yritetään luoda käyttäjä "root" ja sen pitää epäonnistua, koska jo kantaan luotu yllä
        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'salainen',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('`username` to be unique')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })
})
//------------UUDEN KÄYTTÄJÄN LUOMISEN TESTIT LOPPUU------------------


//------------INTEGRAATIOTESTIT---------------------------------------

//------------INTEGRAATIOTESTIT---------------------------------------
//Alustetaan Mongo DB deletoimalla vanhat ja lisäämäällä pari uutta
//Tällöin aloitetaan aina alussa samasta tilanteesta
//Huom! Lisää loppuun "30000", niin ei tule timeout erroria
beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
}, 30000)

describe('KOKEILU DESCRIBE', () => {
    //Ajetaan integraatiotestejä vasten tietokantaa
    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })
    //Testataan, että blogikannassa on sama määrä blogeja, kuin yllä on syötetty testikantaan
    test('there are two blogs', async () => {
        const response = await api.get('/api/blogs')
        // tänne tullaan vasta kun edellinen komento eli HTTP-pyyntö on suoritettu
        // muuttujassa response on nyt HTTP-pyynnön tulos
        //expect(response.body).toHaveLength(initialBlogs.length)
        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })
    //Testataan, että jokin tietty blogi löytyy kannasta
    test('a specific blog is within the returned blogs', async () => {
        const blogsAtEnd = await helper.blogsInDb()
        const contents = blogsAtEnd.map(blog => blog.title)
        //Tässä määritellään, että blogin pitää sisältää tietty teksti
        expect(contents).toContain(
            'React patterns'
        )
    })
})
//Testataan, että blogin lisäys kantaan toimii
test('a valid blogi can be added', async () => {
    //Luodaan uusi blogi scheeman mukaisesti
    const newBlog = {
        title: "Possible to add to MongoDB",
        author: "Qanon Turutino",
        url: "https://qanon.com/",
        likes: 50

    }
    //Tallennetaan blogi kantaan statuskoodia 200 -OK odottaen
    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    //Kaikkien blogien haku "tests/test_helper.js" fileen
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    //Käydään blogit läpi mapilla
    const contents = blogsAtEnd.map(blogi => blogi.title)
    //Tsekataan, että blogien joukossa on title, joka tässä testissä määritelty
    //Uuteen blogiin
    expect(contents).toContain(
        'Possible to add to MongoDB'
    )
})

//Testataan, että blogin lisäys ilma liketyksiä lisää nollan
//Nollan lisäys on "controllers/blogit.js" filessä
test('without likes, likes are 0', async () => {
    //Luodaan uusi blogi scheeman mukaisesti
    const newBlog = {
        title: "Without likes, 0 is the fact",
        author: "Qanon Turtiainen",
        url: "https://qanon.com/",
    }
    //Tallennetaan blogi kantaan statuskoodia 200 -OK odottaen
    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)
    //Kaikkien blogien haku "tests/test_helper.js" fileen
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    //Viimeisin lisäys menee aina viimeisimpään indeksiin ja sieltä otetaan likesit
    const zeroLike = blogsAtEnd[helper.initialBlogs.length].likes
    //Tsekataan, että kun ei anneta tykkäyksiä, niin liketyksien arvoksi tulee "0"
    expect(zeroLike).toEqual(0)
})

//Testataan, että blogin lisäys ilma titleä ja urlia palauttaa "400 Bad request"
// "controllers/blogit.js" filessä
test('without title and url, return 400 bad request', async () => {
    //Luodaan uusi blogi scheeman mukaisesti
    const newBlog = {
        author: "Qanon Turtiainen",
        likes: 10
    }
    //Tallennetaan blogi kantaan statuskoodia 400 -bad request odottaen
    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
})
//Testataan, että jokaisella blogilla on id eikä _id attribuutti
//"models/blogi.js" tiedostossa on määriteltynä, että tulee id:nä eikä _id
test('all the returned blogs has id attribute, not _id', async () => {
    //Haetaan kaikki blogit kannasta "tests/test_helper.js"
    const blogsAtEnd = await helper.blogsInDb()

    //Tsekataan, että id attribuutti olemassa yhdellä blogilla
    expect(blogsAtEnd[0].id).toBeDefined()
})

//Blogin deltointi
describe('BLOGIN DELETOINTI', () => {
    test('succeeds with status code 204 if id is valid', async () => {
        //Haetaan kaikki blogit
        const blogsAtStart = await helper.blogsInDb()
        //Valitaan indeksissä 0 oleva blogi poistettavaksi
        const blogToDelete = blogsAtStart[0]
        //"controllers/blogit.js" filessä deletointi
        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .expect(204)
        //Haetaan kaikki blogit positon jälkeen ja tarkastetaan,
        //että arrayn koko on vähentynyt yhdellä
        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(
            helper.initialBlogs.length - 1
        )
        //Käydään blogit läpi ja varmistetaan ettei sisällä poistetun blogin
        //Titleä enää
        const contents = blogsAtEnd.map(blogi => blogi.title)

        expect(contents).not.toContain(blogToDelete.title)
    })
})
//Blogin muuttaminen
describe('BLOGIN MUUTTAMINEN', () => {
    test('blog updated successfully', async () => {
        //Haetaan kaikki blogit
        const blogsAtStart = await helper.blogsInDb()
        //Valitaan indeksissä 0 oleva blogi muutettavaksi
        const blogToBeChanged = blogsAtStart[0]
        //Muutetaan blogia liketysten osalta, lisätään 1000
        const blogi = {
            title: blogToBeChanged.title,
            url: blogToBeChanged.url,
            author: blogToBeChanged.author,
            likes: blogToBeChanged.likes + 1000,
        }

        await api
            .put(`/api/blogs/${blogToBeChanged.id}`)
            .send(blogi)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        //Haetaan tietokannasta kaikki blogit
        const blogsAtEnd = await helper.blogsInDb()
        //Haetaan muutettu blogi ja tsekataan onko muutokset menneet läpi
        //Liketysten osalta
        const blogChangedLikes = blogsAtEnd[0].likes
        expect(blogChangedLikes).toEqual(blogsAtStart[0].likes + 1000)

    })
})

//Klousataan mongoDB
afterAll(() => {
    mongoose.connection.close()
})
//------------INTEGRAATIOTESTIT---------------------------------------
//--------------------INTEGRAATIOTESTAUS LOPPUU-------------------------------------------------------------


/*
//--------------------YKSIKKÖTESTAUS ALKAA------------------------------------------------------------------

/*
//Testiarray, jonka sisällä blogit
//Tämä viety "tests/test_helper.js" tiedostoon
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
]


//Importataan apufunktiot käyttöön yksikkötestejä varten
const listHelper = require('../utils/list_helper')
test('dummy returns one', () => {
    const blogs = []

    const result = listHelper.dummy(blogs)
    expect(result).toBe(1)
})

//Describe lohkoilla saadaan nätin näköisiä ryhmiä
describe('total likes', () => {

    const listWithNoBlogs = []

    const listWithOneBlog = [
        {
            _id: "5a422a851b54a676234d17f7",
            title: "React patterns",
            author: "Michael Chan",
            url: "https://reactpatterns.com/",
            likes: 7, __v: 0
        }
    ]

    const listWithManyBlogs = [
        {
            _id: "5a422a851b54a676234d17f7",
            title: "React patterns",
            author: "Michael Chan",
            url: "https://reactpatterns.com/",
            likes: 7, __v: 0
        },
        {
            _id: "5a422aa71b54a676234d17f8",
            title: "Go To Statement Considered Harmful",
            author: "Edsger W. Dijkstra",
            url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
            likes: 5,
            __v: 0
        },
        {
            _id: "5a422b3a1b54a676234d17f9",
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
            likes: 12,
            __v: 0
        },
        {
            _id: "5a422b891b54a676234d17fa",
            title: "First class tests",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
            likes: 10,
            __v: 0
        }
    ]

    //Testit näin
    test('of empty list is zero', () => {
        //Otetaan "listWithOneBlog" taulukko käsittelyyn
        const result = listHelper.totalLikes(listWithNoBlogs)
        expect(result).toBe(0)
    })

    test('when list has only one blog equals the likes of that', () => {
        //Otetaan "listWithOneBlog" taulukko käsittelyyn
        const result = listHelper.totalLikes(listWithOneBlog)
        expect(result).toBe(7)
    })

    test('of bigger list calculated right', () => {
        //Otetaan "listWithManyBlogs" taulukko käsittelyyn
        const result = listHelper.totalLikes(listWithManyBlogs)
        expect(result).toBe(34)
    })
})

describe('most liked', () => {

    const listWithManyBlogs = [
        {
            _id: "5a422a851b54a676234d17f7",
            title: "React patterns",
            author: "Michael Chan",
            url: "https://reactpatterns.com/",
            likes: 30, __v: 0
        },
        {
            _id: "5a422aa71b54a676234d17f8",
            title: "Go To Statement Considered Harmful",
            author: "Edsger W. Dijkstra",
            url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
            likes: 5,
            __v: 0
        },
        {
            _id: "5a422b3a1b54a676234d17f9",
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
            likes: 50,
            __v: 0
        },
        {
            _id: "5a422b891b54a676234d17fa",
            title: "First class tests",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
            likes: 10,
            __v: 0
        }
    ]

    test('most liked blog', () => {
        //Otetaan "listWithManyBlogs" taulukko käsittelyyn ja indeksissä "2" on suurin tykkäysmäärä
        const result = listHelper.favoriteBlog(listWithManyBlogs)
        expect(result).toEqual(listWithManyBlogs[2])
    })
    //--------------------YKSIKKÖTESTAUS LOPPUU----------------------------------------------------------

})
*/