const fs = require('fs');
const jsonfile = require('jsonfile');

let contents = fs.readFileSync("data.json");
let celulares = JSON.parse(contents);
let celularesNovoModelo = [];

for (let celular of celulares) {
    let objCelular = { 
        nome: celular.nome,
        imagem: celular.imagem,
        caracteristicas: ''
    };
    let celularSemNomeImagem = {};
    
    Object.keys(celular).filter(key => key !== 'nome' && key !== 'imagem').map(key => {
        return celularSemNomeImagem[key] = celular[key];
    });

    for (key of Object.keys(celularSemNomeImagem)) {
        let valor = celularSemNomeImagem[key].toLowerCase();

        if (key == 'sistema_operacional') {
            valor = adicionaPontoFlutuante(valor);
        }

        objCelular.caracteristicas += `${key}${valor ? ' ' + valor : ''}, `;
    }

    // nome, imagem, caracteristicas + o resto
    objCelular = { ...objCelular, ...celularSemNomeImagem };

    celularesNovoModelo.push(objCelular);
}

var file = __dirname + '/dataModeloNovo.txt';

jsonfile.writeFile(file, celularesNovoModelo, { spaces: 2 }, function (err) {
    if (err) {
        process.stdout.write('\nERROR jsonfile ' + err);
    } else {
        process.stdout.write(`\nGravou json.`);
    }
});

function adicionaPontoFlutuante(str) {
    astr = str.split(' ');

    nastr = astr.map(v => {
        if (!isNaN(v) && v.indexOf('.') == -1) {
            return v + '.0';
        }
        return v;
    });

    return nastr.join(' ');
}