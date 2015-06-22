var path = require('path');

// Postgres DATABASE_URL = postgres://user:passwd@host:port/database
// SQLite DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name = (url[6] || null);
var user = (url[2] || null);
var pwd = (url[3] || null);
var protocol = (url[1] || null);
var dialect = (url[1] || null);
var port = (url[5] || null);
var host = (url[4] || null);
var storage = process.env.DATABASE_STORAGE;

// Cargar Modelo ORM
var Sequelize = require('sequelize');

// Usar BBDD SQLite o Postgres
var sequelize = new Sequelize(DB_name, user, pwd, {
    dialect: protocol,
    protocol: protocol,
    port: port,
    host: host,
    storage: storage, // solo SQLite (.env)
    omitNull: true // solo Postgres
});


// Importamos la definición de la tabla Categories desde
// 'categories.js' en la propiedad Categories del modelo
var Categories = sequelize.import(path.join(__dirname, 'categories'));


// Importamos la definíción de la tabla desde 'quiz.js'
// y la exportamos en la propiedad Quiz de 'models.js'
var Quiz = sequelize.import(path.join(__dirname, 'quiz'));
Quiz.belongsTo(Categories, { foreignKey : 'cat_id' });


// Importamos la definicion de la tabla Comments
var Comment = sequelize.import(path.join(__dirname, 'comment'));
Comment.belongsTo(Quiz);
Quiz.hasMany(Comment);

exports.sequelize = sequelize;
exports.Categories = Categories;
exports.Quiz = Quiz;
exports.Comment = Comment;


// Sincronizamos todos los modelos con las
// tablas de las BBDD 'físicas'. Si no existe 'físicamente' se
// crean (automáticamente) y la rellenamos con los primeros registros
var first_cat_id;
Categories.sync().then(function () {
    Categories
    .count()
    .then(function (count) {
        if (count === 0) {
            Categories.bulkCreate([
                { categoria : 'Otros' },
                { categoria : 'Humanidades' },
                { categoria : 'Ocio' },
                { categoria : 'Ciencia' },
                { categoria : 'Tecnología' }
            ]).then(function () {
                Categories.findOne({
                    where : {
                        categoria : 'Otros'
                    }
                }).then(function (categoria) {
                    first_cat_id = categoria.id;
                    Quiz.sync({ force : true }).then(function () {
                        Quiz.bulkCreate([
                            { pregunta  : 'Capital de italia', respuesta : 'Roma', cat_id : first_cat_id },
                            { pregunta : 'Capital de Portugal', respuesta : 'Lisboa', cat_id : first_cat_id }
                        ]).then(function () {
                            Comment.sync().then(function() {
                                console.log('Base de datos inicializada');
                            });
                        });
                    });
                });
            });
        }
    });
});