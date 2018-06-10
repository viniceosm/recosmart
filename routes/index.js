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

let sessionMiddleware = sessions({
	secret: SECRET,
	name: KEY,
	resave: true,
	saveUninitialized: true,
	store: store
});

router.use(cookie);
router.use(sessionMiddleware);

const cCelulares = require('./../mongo/controller/celulares');

router.get('/', (req, res) => {
	let session = req.session;
	session.exist = true;
	
	cCelulares.pesquisar({}, (celulares) => {
		res.render('home', {
			title: varGlobal.tituloPagina,
			usuario: null,
			celulares,
			pesquisaveis: funcoes.pesquisaveis()
		});
	}, 10, 0);
});

router.get('/pagina/:pagina', (req, res) => {
	let session = req.session;
	session.exist = true;
	
	cCelulares.pesquisar({}, (celulares) => {
		res.render('home', {
			title: varGlobal.tituloPagina,
			usuario: null,
			celulares,
			pesquisaveis: funcoes.pesquisaveis()
		});
	}, 10, (parseInt(req.params.pagina) - 1) * 10);
});

router.post('/pesquisa', (req, res) => {
	let session = req.session;
	if (session.exist) {
		session.pesquisa = req.body;
	} else {
		res.redirect('/');
	}

	res.redirect('/pesquisa');
});

router.get('/pesquisa', (req, res) => {
	let session = req.session;
	if (session.exist) {
		let pesquisa = session.pesquisa;
		let or = [];
		
		funcoes.addOr(or, 'sistema_operacional', pesquisa.chksistema_operacional);
		funcoes.addOr(or, 'marca', pesquisa.chkmarca);
		funcoes.addOr(or, 'resistencia_a_agua', pesquisa.chkresistencia_a_agua);
		funcoes.addOr(or, 'ram', pesquisa.chkram);
		funcoes.addOr(or, 'memoria_max', pesquisa.chkmemoria_max);
		funcoes.addOr(or, 'memoria_expansivel', pesquisa.chkmemoria_expansivel);
		funcoes.addOr(or, 'polegadas', pesquisa.chkpolegadas);
		funcoes.addOr(or, 'resolucao', pesquisa.chkresolucao);
		funcoes.addOr(or, 'densidade_de_pixels', pesquisa.chkdensidade_de_pixels);
		funcoes.addOr(or, 'megapixel', pesquisa.chkmegapixel);
		funcoes.addOr(or, 'camera_frontal', pesquisa.chkcamera_frontal);
		funcoes.addOr(or, 'camera_frontal', pesquisa.chkcamera_frontal);
		funcoes.addOr(or, 'USB', pesquisa.chkUSB);

		let query = {};
		if (or.length > 0) {
			query = { $or: or };
		}

		cCelulares.pesquisar(query, (celulares) => {
			res.render('home', {
				title: varGlobal.tituloPagina,
				usuario: null,
				celulares,
				pesquisaveis: funcoes.pesquisaveis()
			});
		});
	} else {
		res.redirect('/');
	}
});

router.get('/ficha/:idFicha', (req, res) => {
	cCelulares.pesquisarPorId(req.params.idFicha, (ficha) => {
		res.render('ficha', {
			title: varGlobal.tituloPagina,
			usuario: null,
			ficha
		});
	});
});

router.get('/cadastro', (req, res) => {
	res.render('cadastro', { title: varGlobal.tituloPagina });
});

module.exports = {
	router,
	sessionMiddleware
};
