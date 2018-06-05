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
            keysOpcoes.push({ nome: label.nome, opcoes: [] });    
        });

        dadosCelulares.forEach((celular) => {
            labelKeyOpcoes.forEach((label, i) => {
                if (keysOpcoes[i].opcoes.length == 0 || !keysOpcoes[i].opcoes.includes(celular[label.keyJson])) {
                    keysOpcoes[i].opcoes.push(celular[label.keyJson]);
                }
            });
            
            /*if (keysOpcoes[1].opcoes.length == 0 || !keysOpcoes[1].opcoes.includes(celular.sistema_operacional)) {
                keysOpcoes[1].opcoes.push(celular.sistema_operacional);
            }*/
        });

        return keysOpcoes;
    }
};

module.exports = util;