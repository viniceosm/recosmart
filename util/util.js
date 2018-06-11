const dadosCelulares = require('../celulares');

const util = {
    pesquisaveis: () => {
        let keysOpcoes = [];

        let labelKeyOpcoes = [
            { nome: 'Sistema operacional', keyJson: 'sistema_operacional' },
            { nome: 'Marca', keyJson: 'marca' },
            { nome: 'Resistencia a agua', keyJson: 'resistencia_a_agua' },
            { nome: 'Ram', keyJson: 'ram' },
            { nome: 'Memoria maxima interna', keyJson: 'memoria_max' },
            { nome: 'Memoria expansivel', keyJson: 'memoria_expansivel' },
            { nome: 'Polegadas', keyJson: 'polegadas' },
            { nome: 'Resolucao', keyJson: 'resolucao' },
            { nome: 'Densidade de pixels', keyJson: 'densidade_de_pixels' },
            { nome: 'Megapixel', keyJson: 'megapixel' },
            { nome: 'Camera frontal', keyJson: 'camera_frontal' },
            { nome: 'USB', keyJson: 'usb' }
        ];

        labelKeyOpcoes.forEach(label => {
            keysOpcoes.push({
                nome: label.nome, 
                keyJson: label.keyJson, 
                opcoes: [] 
            });
        });

        dadosCelulares.forEach((celular) => {
            labelKeyOpcoes.forEach((label, i) => {
                if (celular[label.keyJson] !== undefined) {
                    let valorTestar = celular[label.keyJson].trim();

                    if (keysOpcoes[i].keyJson == 'sistema_operacional') {
                        valorTestar = valorTestar.split(' ');
                        valorTestar = valorTestar[0] + (valorTestar.length > 1 ? ' ' + valorTestar[1] : '');
                    } else if (keysOpcoes[i].keyJson == 'memoria_expansivel') {
                        valorTestar = valorTestar.substring(valorTestar.indexOf('atè'), valorTestar.length);
                    }

                    if (valorTestar !== '') {
                        if (keysOpcoes[i].opcoes.length == 0 || !keysOpcoes[i].opcoes.includes(valorTestar)) {
                            keysOpcoes[i].opcoes.push(valorTestar);
                        }

                    }
                    keysOpcoes[i].opcoes.sort();
                }
            });


        });

        return keysOpcoes;
    },

    addOr: (or, keyMongo, filtroPesquisa) => {
        if (!Array.isArray(filtroPesquisa)) {
            if (filtroPesquisa) {
                or.push({ [keyMongo]: { $regex: new RegExp(filtroPesquisa + '.*'), $options: 'i' } });
            }
        } else {
            filtroPesquisa.map(op => {
                or.push({ [keyMongo]: { $regex: new RegExp(op + '.*'), $options: 'i' } });
            });
        }

        return or;
    }
};

module.exports = util;