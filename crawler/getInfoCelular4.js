const cheerio = require('cheerio');
const jsonfile = require('jsonfile');
const myReqs = require('./../libs/myReqs');

const cCelulares = require('../mongo/controller/celulares');

let urlInicio = 'https://www.tudocelular.com';
let urlPagina1 = 'https://www.tudocelular.com/celulares/fichas-tecnicas_1.html';

let celulares = [];
let nCelularEncontrado = 0;
let terminouBusca = false;
let numeroPaginaMax = 27;

let linksCelular = [];

let controlaTimeout = 88;

visitaPagina(urlPagina1, 1);

function visitaPagina(url, numeroPagina) {
    new myReqs(url, function (error, html) {
        if (!error) {
            var $ = cheerio.load(html);

            if (numeroPagina > numeroPaginaMax) {
                // quer dizer que não tem mais pagina
                terminouBusca = true;

                if (linksCelular.length > 0) {
                    for (let chamarIndice = 0; chamarIndice < controlaTimeout; chamarIndice++) {
                        if (linksCelular[chamarIndice]) {
                            visitaPaginaCelular(linksCelular[chamarIndice].url, chamarIndice);
                        }
                    }
                }
            } else {
                process.stdout.write('\nPagina ' + numeroPagina);

                //Busca celular #cellphones_list > article:nth-child(3) > a
                $('.phonelist_item > a').each(function (i, element) {
                    let href = $(this).attr('href');
                    nCelularEncontrado++;
                    linksCelular.push({ url: urlInicio + href, visitado: false });
                });

                visitaPagina(`https://www.tudocelular.com/celulares/fichas-tecnicas_${numeroPagina + 1}.html`, numeroPagina + 1);
            }
        } else {
            process.stdout.write('\nDeu erro!', error.toString());

            if (error.toString().includes('ETIMEDOUT')) {
                setTimeout(() => {
                    visitaPagina(url, numeroPagina);
                }, 2000);
            }
        }
    }).req();
}

function visitaPaginaCelular(url, numeroLink) {
    if (linksCelular[numeroLink] && !linksCelular[numeroLink].visitado) {
        linksCelular[numeroLink].visitado = true;

        new myReqs(url, function (error, html) {
            if (!error) {
                var $ = cheerio.load(html);
                let jsonCelular = {};

                let keys = [];

                $('#controles_titles > .row_titles > ul.phone_column_features > li').each(function (i, elem) {
                    keys[i] = $(elem).text();
                    keys[i] = keys[i].replace(/\-/g, '').trim();
                    keys[i] = keys[i].replace(/ /g, '_').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                });

                let values = [];

                $('#phone_columns > .phone_column > ul.phone_column_features > li').each(function (i, elem) {
                    var temBool = $(elem).find('i').length > 0;
                    if (temBool) {
                        if ($(elem).find('i.ok').length > 0) {
                            values[i] = $(elem).text();
                        } else if ($(elem).find('i.wrong').length > 0) {
                            values[i] = 'Não';
                        }
                    } else {
                        values[i] = $(elem).text();
                    }
                });

                jsonCelular['nome'] = $('#fwide_column > h2').text();
                jsonCelular['marca'] = $('#fwide_column > h2 > strong').text();
                jsonCelular['imagem'] = $('.narrow_column > img').attr('src');
                jsonCelular['caracteristicas'] = '';

                if (keys.length == values.length) {
                    for (i in keys) {
                        jsonCelular[keys[i]] = values[i];
                    }
                }
                
                // add key caracteristicas
                let celularSemNomeImagem = {};
                
                Object.keys(jsonCelular).filter(key => key !== 'nome' && key !== 'imagem').map(key => {
                    return celularSemNomeImagem[key] = jsonCelular[key];
                });
                
                for (key of Object.keys(celularSemNomeImagem)) {
                    let valor = celularSemNomeImagem[key].toLowerCase();
                    
                    if (key == 'sistema_operacional') {
                        valor = adicionaPontoFlutuante(valor);
                    }
                    
                    jsonCelular.caracteristicas += `${key}${valor ? ' ' + valor : ''}, `;
                }
                
                celulares.push(jsonCelular);
                
                // Adiciona no mongo
                cCelulares.criar(jsonCelular, () => {
                    process.stdout.write(`\nGravou celular. ${celulares.length}/${nCelularEncontrado} celulares.`);
                });

                var file = __dirname + './../dataModeloNovo.json';

                jsonfile.writeFile(file, celulares, { spaces: 2 }, function (err) {
                    if (err) {
                        process.stdout.write('\nERROR jsonfile ' + err);
                    } else {
                        process.stdout.write(`\nGravou json. ${celulares.length}/${nCelularEncontrado} celulares.`);
                    }
                });

                for (let chamarIndice = 1; chamarIndice <= controlaTimeout; chamarIndice++) {
                    if (linksCelular[numeroLink + chamarIndice]) {
                        visitaPaginaCelular(linksCelular[numeroLink + chamarIndice].url, numeroLink + chamarIndice);
                    }
                }
            } else {
                process.stdout.write('\nDeu erro!' + error.toString());
                
                if (error.toString().includes('ETIMEDOUT')) {
                    visitaPaginaCelular(url, numeroLink);
                }
            }
        }).req();
    }
}

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