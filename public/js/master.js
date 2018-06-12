var socket;
socket = io.connect();

var fingerprint = undefined;

$(document).ready(function(){
	fingerprint = new Fingerprint({screen_resolution: true}).get();

	var href = window.location.href;
	href = href.split('/');
	href.shift();
	href.shift();
	href = href.join('/');
	href = href.substring(href.indexOf('/'), href.length);
	
	if (window.location.href.includes('/ficha/')) {
		// Se abriu alguma ficha
		var fichaId = window.location.href.substring(window.location.href.indexOf('/ficha/') + 7, window.location.href.length);

		socket.emit('adicionaFichaHistorico', fichaId, fingerprint);
	} else if (href.includes('/pesquisa') || window.location.href.includes('/pagina/') || href == '/') {
		// Se for inicio
		socket.emit('pesquisarRecomendados', fingerprint);
	} else if (href == '/historico') {
		// Se for historico
		socket.emit('pesquisarHistorico', fingerprint);
	}
});

socket.on('retornoPesquisarRecomendados', function (recomendados) {
	$('#listaRecomendados').html('');

	let html = '';

	for (let recomendado of recomendados[0].likelihoods) {
		html += `
			<div class="panel panel-inline">
				<div class="panel-body cardPequeno">
					<div class="overflow-hidden">
						<img class="pull-left" src="${recomendado.imagem}" height="60">
						<div class="nomeCelular pull-left">
							<b>${recomendado.category}</b>
						</div>
					</div>
					<div>
						<p>SO: ${recomendado.sistema_operacional}</p>
						<p>Processador: ${recomendado.processador}</p>
						<p>${recomendado.ram} RAM</p>
					</div>
				</div>
			</div>`;
	}

	$('#listaRecomendados').html(html);
});

socket.on('retornoDeletaHistorico', function (fichaId) {
	$('#historico' + fichaId).remove();	
});

socket.on('retornoPesquisarHistorico', function (fichas) {
	$('#listaFichasTecnicas').html('');

	let html = '';

	for (let ficha of fichas) {
		html += `
			<div id="historico${ficha._id}" class="panel panel-inline">
				<div class="panel-body cardPequeno">
					<div class="overflow-hidden">
						<img class="pull-left" src="${ficha.imagem}" height="60">
						<div class="nomeCelular pull-left">
							<b>${ficha.nome}</b>
						</div>
						<button class="btn btn-primary btn-just-icon pull-right" onclick="deletaHistorico('${ficha._id}')">
							<i class="material-icons">delete</i>
						</button>
					</div>
					<div>
						<p>SO: ${ficha.sistema_operacional}</p>
						<p>Processador: ${ficha.processador}</p>
						<p>${ficha.ram} RAM</p>
					</div>
				</div>
			</div>`;
	}

	$('#listaFichasTecnicas').html(html);
});

function deletaHistorico(fichaId) {
	socket.emit('deletaHistorico', fichaId, fingerprint);
}