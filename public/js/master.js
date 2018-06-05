var socket;
socket = io.connect();


$(document).ready(function(){
	var fingerprint = new Fingerprint({screen_resolution: true}).get();
	console.log('my fingerprint: ', fingerprint);
	
	$('#formSimulaRecomendados').submit(function (e) {
		e.preventDefault();

		var caracteristicas = $('#formSimulaRecomendados [name="caracteristicas"]').val();

		if (caracteristicas.trim()!=='') {
			socket.emit('pesquisarRecomendados', caracteristicas);
		}
	});
});

socket.on('retornoPesquisarRecomendados', function (recomendados) {
	$('#listaRecomendados').html('');
	
	let html = '';
	
	for(let recomendado of recomendados.likelihoods) {
		html += `
			<div class="col col-md-3"> 
				<div class="panel">
					<div class="panel-body cardPequeno">
						<img src="${recomendado.imagem}" height="60">
						<b>&nbsp;&nbsp;${ recomendado.category }</b>
						<p>${ recomendado.caracteristicas }</p>
					</div>
				</div>
			</div>`;
	}

	$('#listaRecomendados').html(html);
});