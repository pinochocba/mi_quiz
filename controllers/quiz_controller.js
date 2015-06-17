var models = require('../models/models.js');

// Autoload - factoriza el código si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
    models.Quiz.findById(quizId).then(
        function(quiz) {
            if (quiz) {
                req.quiz = quiz;
                next();
            } else { 
                next(new Error('No existe quizId=' + quizId)) }
        }
    ).catch(function(error) { next(error)});
};

// GET /quizes
exports.index = function(req, res) {
    models.Quiz.findAll({
            include: [models.Categories]
    }).then(
        function(quizes) {
            res.render('quizes/index', { 
                            quizes: quizes, 
                            errors: []
                        });
        }
    ).catch(function(error) { next(error);})
};

// GET /quizes/:id
exports.show = function(req, res) {
    res.render('quizes/show', { 
                quiz: req.quiz, 
                errors: []
            });
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
    var resultado = 'Incorrecto';
    if (req.query.respuesta === req.quiz.respuesta) {
        resultado = 'Correcto';
    }
    res.render(
        'quizes/answer', 
        {   quiz: req.quiz, 
            respuesta: resultado,
            errors: []
        }
    );
};

// GET /quizes/new
exports.new = function(req, res){
    var quiz = models.Quiz.build(   // crea el objeto quiz
        { pregunta: "Pregunta", respuesta: "Respuesta" }
    );
    models.Categories.findAll().then(function (categories) {
            res.render('quizes/new', { 
                        quiz: quiz, 
                        categories: categories,
                        errors: [] 
                    })
        });
};

// POST /quizes/create
exports.create = function(req, res) {
    var quiz = models.Quiz.build( req.body.quiz );

    quiz
    .validate()
    .then(
        function(err){
            if(err) {
                models.Categories.findAll().then(function (categories) {
                        res.render('quizes/new', {
                                    quiz: quiz, 
                                    categories: categories,
                                    errors: err.errors
                                })
                    });
            } else {
                 // guarda en DB los campos pregunta y respuesta de quiz
                quiz
                .save({fields: ["pregunta", "respuesta", "cat_id"]})
                .then(function(){
                    res.redirect('/quizes')})  // Redireccion HTTP (URL relativo) lista de preguntas
            }
        }
   );
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
    models.Categories.findAll().then(function (categories) {
            res.render('quizes/edit', {
                        quiz: req.quiz, 
                        categories: categories,
                        errors: []
                    })
        });
};

// PUT /quizes/:id
exports.update = function(req, res) {
    req.quiz.pregunta  = req.body.quiz.pregunta;
    req.quiz.respuesta = req.body.quiz.respuesta;
    req.quiz.cat_id = req.body.quiz.cat_id;

    req.quiz
    .validate()
    .then(
        function(err) {
            if(err) {
                models.Categories.findAll().then(function (categories) {
                        res.render('quizes/edit', { 
                                    quiz: req.quiz, 
                                    categories: categories,
                                    errors: err.errors 
                                })
                    });
            }else {
                req.quiz    // save: guarda campors pregunta y respuesta en DB
                .save( { fields: [ "pregunta", "respuesta", "cat_id"]})
                .then( function() { res.redirect('/quizes');});
                    // Redireccion HTTP a lista preguntas
            }
        }) 
}

// DELETE /quizes/:id
exports.destroy = function(req, res) {
    req.quiz.destroy().then(function() {
        res.redirect('/quizes');
    }).catch(function(error){next(error)});
};