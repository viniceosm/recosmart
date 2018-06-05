const express = require('express');
let router = express.Router();

const sessions = require('express-session');
const cookieParser = require('cookie-parser');
const KEY = 'chaaaaaaaaaaaave';
const SECRET = 'seeeeeeeeeeeegredoo';
const cookie = cookieParser(SECRET);
let store = new sessions.MemoryStore();
const varGlobal = require('./../libs/varGlobal');
let funcoes = require('./../util/util');
const bayes = require('classificator');
const classifier = bayes();
const fs = require('fs');
const dadosCelulares = require('../celulares');

let sessionMiddleware = sessions({
	secret: SECRET,
	name: KEY,
	resave: true,
	saveUninitialized: true,
	store: store
});

router.use(cookie);
router.use(sessionMiddleware);

// const cUsuarios = require('./../mongo/controller/usuarios');

function telaLoginCasoNaoLogado(req, res) {
	let session = req.session;
	if (!session.exist) {
		res.redirect('/login');
	} else {
		callback(session);
	}
}

router.get('/', (req, res) => {
	let session = req.session;

	// cUsuarios.pesquisarPorId(session._id, (usuario) => {
		dadosCelulares.forEach(element => classifier.learn(element.caracteristicas, element.nome));

		let classificado = classifier.categorize('sistema_operacional android 7');

		classificado.likelihoods = classificado.likelihoods.map((recomendado) => {
			let celularEncontrado = dadosCelulares.find(o => o.nome == recomendado.category);
			
			recomendado = {
				...recomendado, 
				...celularEncontrado
			};

			return recomendado;
		});

		res.render('home', {
			title: varGlobal.tituloPagina,
			usuario: null,
			recomendados: classificado,
			pesquisaveis: funcoes.pesquisaveis()
		});
	// });
});

router.get('/login', (req, res) => {
	res.render('index', { title: varGlobal.tituloPagina});
});

router.get('/cadastro', (req, res) => {
	res.render('cadastro', { title: varGlobal.tituloPagina });
});

router.post('/logar', (req, res) => {
	let campos = req.body;
	/*cUsuarios.logar({nome:campos.nome, senha:campos.senha}, (valido, usuario) => {
		if (valido) {
			let session = req.session;
			session.exist = true;
			session._id = usuario._id;
			res.redirect('/logando');
		} else {
			res.redirect('/');
		}
	});*/
	res.redirect('/');
});

router.get('/logando', (req, res) => {
	/*let session = req.session;
	if (session.exist) {
		res.redirect('/');
	} else {
		res.redirect('/login');
	}*/
	res.redirect('/');
});

router.get('/sair', (req, res) => {
	req.session.destroy(() => res.redirect('/login'));
});

router.post('/cadastrar', (req, res) => {
	let campos = req.body;
	// cUsuarios.criar({nome:campos.nome, senha:campos.senha}, () => {
		res.redirect('/');
	// });
});

module.exports = {
	router,
	sessionMiddleware
};
