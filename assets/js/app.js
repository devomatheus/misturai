$(function () {
    'use strict';

    /* =========================================================
       1. DADOS TÉCNICOS — LINHA GLASU! CORANTES
       Todos os valores de especificação vêm da ficha técnica:
         Viscosidade ...... KU     · Metodologia 0630
         pH ............... —      · Metodologia 0379
         Densidade ........ g/cm³  · Metodologia 0351
         Poder tintorial .. %      · Metodologia 06238
       Cada faixa é [mínimo, máximo] da especificação.
       ========================================================= */

    const GOTA_ML = 0.05;   // volume nominal de 1 gota de corante (mL)
    const EMBALAGEM_ML = 50;     // embalagem comercial do corante GLASU! (mL)
    const GOTAS_EMBALAGEM = Math.round(EMBALAGEM_ML / GOTA_ML);  // 1.000 gotas por embalagem
    const MAX_EMBALAGENS = 12;     // teto absoluto por corante (12 × 50 mL = 600 mL)
    const CARGA_MAX_PCT = 6;      // carga de corante recomendada, % v/v sobre a base
    const VOL_MIN = 50;     // menor lata aceita (mL)
    const VOL_MAX = 20000;  // maior lata aceita (mL)

    /**
     * Limite de gotas por corante.
     * O corante é vendido em embalagens de 50 mL (1.000 gotas), então o teto não
     * pode ser um número fixo de gotas: ele acompanha o tamanho da lata, limitado
     * pela carga máxima recomendada e por MAX_EMBALAGENS frascos.
     *   900 mL -> 1.080 gotas (54 mL ≈ 1 embalagem)
     *   3,6 L  -> 4.320 gotas (216 mL ≈ 4,3 embalagens)
     *   18 L   -> 12.000 gotas (600 mL = 12 embalagens, teto duro)
     */
    function maxGotasPorCorante(volume) {
        var porCarga = Math.ceil((volume * CARGA_MAX_PCT / 100) / GOTA_ML);
        return Math.max(50, Math.min(porCarga, MAX_EMBALAGENS * GOTAS_EMBALAGEM));
    }
    function limiteGotas() { return maxGotasPorCorante(estado.volume); }

    // "forca" = rendimento tintorial do corante, em unidades K/S por grama.
    // NÃO está na ficha técnica: o "poder tintorial" da tabela (95–105 %) é o
    // controle de lote contra o padrão interno, não a força absoluta do produto.
    // Ponto de calibração: 20 mL de corante em 900 mL de base branca (22 mL/L,
    // ~0,4 embalagem) cai no L* típico do tom cheio do respectivo Color Index.
    const PIGMENTOS = [
        {
            id: 'amarelo',
            nome: 'GLASU! Corante Amarelo',
            curto: 'Amarelo',
            hex: '#FBBA00',
            natureza: 'Preparação pigmentária aquosa a base de pigmento monoazóico',
            ci: 'Pigment Yellow 74 / 11741',
            viscosidade: [65, 75],
            ph: [8.5, 9.5],
            densidade: [1.020, 1.070],
            tintorial: [95, 105],
            forca: 40.31
        },
        {
            id: 'ocre',
            nome: 'GLASU! Corante Ocre',
            curto: 'Ocre',
            hex: '#C1832B',
            natureza: 'Preparação pigmentária aquosa a base de óxido de ferro',
            ci: 'Pigment Yellow 42 / 77492',
            viscosidade: [80, 87],
            ph: [8.0, 9.0],
            densidade: [1.45, 1.65],
            tintorial: [95, 105],
            forca: 23.84
        },
        {
            id: 'vermelho',
            nome: 'GLASU! Corante Vermelho',
            curto: 'Vermelho',
            hex: '#D0271D',
            natureza: 'Preparação pigmentária aquosa a base de vermelho de naphthol AS',
            ci: 'Pigment Red 112 / 12370',
            viscosidade: [60, 70],
            ph: [8.0, 9.0],
            densidade: [1.030, 1.080],
            tintorial: [95, 105],
            forca: 64.22
        },
        {
            id: 'laranja',
            nome: 'GLASU! Corante Laranja',
            curto: 'Laranja',
            hex: '#E4581C',
            natureza: 'Preparação pigmentária aquosa a base de laranja naphthol AS',
            ci: 'Pigment Orange 5 / 12075',
            viscosidade: [63, 70],
            ph: [8.5, 9.5],
            densidade: [1.040, 1.090],
            tintorial: [95, 105],
            forca: 49.14
        },
        {
            id: 'preto',
            nome: 'GLASU! Corante Preto',
            curto: 'Preto',
            hex: '#141414',
            natureza: 'Preparação pigmentária aquosa a base de negro de fumo',
            ci: 'Pigment Black 7 / 77266',
            viscosidade: [63, 70],
            ph: [8.5, 9.5],
            densidade: [1.10, 1.15],
            tintorial: [95, 105],
            forca: 7.46
        },
        {
            id: 'castanho',
            nome: 'GLASU! Corante Castanho',
            curto: 'Castanho',
            hex: '#6E4224',
            natureza: 'Preparação pigmentária aquosa a base de óxido de ferro',
            ci: 'Pigment Yellow 42 / 77492',
            viscosidade: [80, 87],
            ph: [8.0, 9.0],
            densidade: [1.55, 1.75],
            tintorial: [95, 105],
            forca: 25.39
        },
        {
            id: 'verde',
            nome: 'GLASU! Corante Verde',
            curto: 'Verde',
            hex: '#005A46',
            natureza: 'Preparação pigmentária aquosa a base de ftalocianina',
            ci: 'Pigment Green 7 / 74260',
            viscosidade: [63, 70],
            ph: [8.5, 9.5],
            densidade: [1.040, 1.090],
            tintorial: [95, 105],
            forca: 42.47
        },
        {
            id: 'azul',
            nome: 'GLASU! Corante Azul',
            curto: 'Azul',
            hex: '#10387A',
            natureza: 'Preparação pigmentária aquosa a base de ftalocianina',
            ci: 'Pigment Blue 15:1 / 74160',
            viscosidade: [63, 70],
            ph: [8.5, 9.5],
            densidade: [1.05, 1.10],
            tintorial: [95, 105],
            forca: 31.58
        }
    ];

    // Tinta base: valores típicos de látex branco fosco/acetinado.
    // A densidade entra no cálculo (mistura é feita em massa), o KU e o pH
    // entram nas estimativas de viscosidade e pH da mistura final.
    const BASES = [
        { nome: 'Branco Neve', hex: '#FFFFFF', densidade: 1.35, ku: 105, ph: 8.5 },
        { nome: 'Branco Gelo', hex: '#F6F4EE', densidade: 1.32, ku: 102, ph: 8.5 },
        { nome: 'Branco Acetinado', hex: '#FAFAF7', densidade: 1.28, ku: 98, ph: 8.4 },
        { nome: 'Base Palha', hex: '#F2E9D6', densidade: 1.34, ku: 104, ph: 8.5 }
    ];
    const BASE_PADRAO = { densidade: 1.30, ku: 100, ph: 8.5 };

    const LUZES = {
        dia: 'none',
        quente: 'sepia(.18) saturate(1.12) brightness(1.04) hue-rotate(-8deg)',
        sombra: 'brightness(.82) saturate(.92) hue-rotate(6deg)'
    };

    const estado = {
        baseHex: '#FFFFFF',
        baseNome: 'Branco Neve',
        baseDados: BASES[0],
        volume: 900,
        gotas: {},
        luz: 'dia',
        ultimo: null    // resultado do último atualizar(), usado na exportação em PDF
    };
    PIGMENTOS.forEach(function (p) { estado.gotas[p.id] = 0; });

    /* =========================================================
       2. FAIXAS DE ESPECIFICAÇÃO
       Os cálculos usam o centro da faixa da ficha técnica.
       ========================================================= */
    function media(faixa) { return (faixa[0] + faixa[1]) / 2; }

    /* =========================================================
       3. COR — conversões e modelo de mistura (Kubelka-Munk)
       ========================================================= */
    function hexParaRgb(hex) {
        hex = String(hex).replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(function (c) { return c + c; }).join('');
        return [parseInt(hex.substr(0, 2), 16), parseInt(hex.substr(2, 2), 16), parseInt(hex.substr(4, 2), 16)];
    }
    function rgbParaHex(rgb) {
        return '#' + rgb.map(function (v) {
            return Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
        }).join('').toUpperCase();
    }
    function paraLinear(c) { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
    function paraSrgb(l) {
        l = Math.max(0, Math.min(1, l));
        var c = l <= 0.0031308 ? l * 12.92 : 1.055 * Math.pow(l, 1 / 2.4) - 0.055;
        return c * 255;
    }
    // Refletância -> K/S (equação de Kubelka-Munk).
    // Piso de 0,005: evita que canais quase pretos gerem K/S absurdo e distorçam o matiz.
    // Teto de 0,9995: alto o bastante para o branco fazer o caminho de volta
    // (K/S -> R -> sRGB) sem perder o último nível — base sem corante continua #FFFFFF.
    function ks(R) { R = Math.min(0.9995, Math.max(0.005, R)); return ((1 - R) * (1 - R)) / (2 * R); }
    // K/S -> refletância
    function ksParaR(k) { return 1 + k - Math.sqrt(k * k + 2 * k); }

    // Cache de K/S por cor. É descartado ao passar do teto — sem isso ele
    // cresceria sem limite durante o uso.
    var cacheKs = {}, cacheKsN = 0;
    function ksDoHex(hex) {
        if (!cacheKs[hex]) {
            if (cacheKsN > 512) { cacheKs = {}; cacheKsN = 0; }
            cacheKs[hex] = hexParaRgb(hex).map(function (c) { return ks(paraLinear(c)); });
            cacheKsN++;
        }
        return cacheKs[hex];
    }

    /**
     * Massa de corante, em gramas, para um dado número de gotas.
     * gotas -> mL (0,05 mL/gota) -> g, usando a densidade da ficha técnica.
     */
    function massaDoCorante(p, n) {
        return n * GOTA_ML * media(p.densidade);
    }

    /**
     * Cor final da mistura — Kubelka-Munk aditivo em base mássica.
     *
     *   (K/S)mistura = Σ c_i · F_i · (K/S)_i        c_i = fração MÁSSICA
     *
     * onde F_i = força tintorial do pigmento × poder tintorial nominal (95–105 %).
     * A base branca entra como mais um componente, com sua própria densidade.
     * Trabalhar em massa (e não em volume) é o que faz o Ocre (1,45–1,65 g/cm³)
     * render mais por gota que o Amarelo (1,020–1,070 g/cm³).
     */
    function corDaMistura(gotas, volume, baseHex, baseDados) {
        var dados = baseDados || estado.baseDados || BASE_PADRAO;
        var kBase = ksDoHex(baseHex);
        var massaBase = volume * dados.densidade;
        var massaTotal = massaBase;
        var acum = [kBase[0] * massaBase, kBase[1] * massaBase, kBase[2] * massaBase];

        PIGMENTOS.forEach(function (p) {
            var n = gotas[p.id] || 0;
            if (n <= 0) return;
            var massa = massaDoCorante(p, n);
            var forca = p.forca * (media(p.tintorial) / 100);
            var k = ksDoHex(p.hex);
            massaTotal += massa;
            acum[0] += k[0] * forca * massa;
            acum[1] += k[1] * forca * massa;
            acum[2] += k[2] * forca * massa;
        });

        return acum.map(function (v) { return paraSrgb(ksParaR(v / massaTotal)); });
    }

    /* =========================================================
       4. PROPRIEDADES DA MISTURA (pH, viscosidade, massas)
       ========================================================= */

    // pH não é aditivo: a média é feita sobre a concentração de H+ e depois
    // convertida de volta para escala logarítmica.
    function phDaMistura(gotas, volume) {
        var dados = estado.baseDados || BASE_PADRAO;
        var vol = volume;
        var soma = volume * Math.pow(10, -dados.ph);
        PIGMENTOS.forEach(function (p) {
            var n = gotas[p.id] || 0;
            if (n <= 0) return;
            var v = n * GOTA_ML;
            vol += v;
            soma += v * Math.pow(10, -media(p.ph));
        });
        return -Math.log10(soma / vol);
    }

    // Viscosidade da mistura: blenda logarítmica sobre a fração volumétrica.
    // Estimativa — KU é uma escala não linear, serve para indicar a TENDÊNCIA
    // de afinamento da tinta conforme se adiciona corante (60–87 KU) à base (~100 KU).
    function viscDaMistura(gotas, volume) {
        var dados = estado.baseDados || BASE_PADRAO;
        var vol = volume;
        var soma = volume * Math.log(dados.ku);
        PIGMENTOS.forEach(function (p) {
            var n = gotas[p.id] || 0;
            if (n <= 0) return;
            var v = n * GOTA_ML;
            vol += v;
            soma += v * Math.log(media(p.viscosidade));
        });
        return Math.exp(soma / vol);
    }

    function massaTotalCorante(gotas) {
        return PIGMENTOS.reduce(function (s, p) {
            return s + massaDoCorante(p, gotas[p.id] || 0);
        }, 0);
    }

    /* =========================================================
       5. ESPAÇOS DE COR
       ========================================================= */
    function rgbParaHsl(rgb) {
        var r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
        var mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
        var h = 0, l = (mx + mn) / 2;
        var s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
        if (d !== 0) {
            if (mx === r) h = ((g - b) / d) % 6;
            else if (mx === g) h = (b - r) / d + 2;
            else h = (r - g) / d + 4;
            h *= 60; if (h < 0) h += 360;
        }
        return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
    }

    // sRGB -> CIE L*a*b* (iluminante D65, observador 2°)
    function rgbParaLab(rgb) {
        var R = paraLinear(rgb[0]), G = paraLinear(rgb[1]), B = paraLinear(rgb[2]);
        // Normalizado pela soma das próprias colunas da matriz (0,95047 e 1,08883),
        // para que o branco sRGB caia exatamente em L*100 a*0 b*0.
        var X = (0.4124564 * R + 0.3575761 * G + 0.1804375 * B) / 0.95047;
        var Y = (0.2126729 * R + 0.7151522 * G + 0.0721750 * B);
        var Z = (0.0193339 * R + 0.1191920 * G + 0.9503041 * B) / 1.08883;
        var e = 216 / 24389, k = 24389 / 27;
        var f = function (t) { return t > e ? Math.cbrt(t) : (k * t + 16) / 116; };
        X = f(X); Y = f(Y); Z = f(Z);
        return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)];
    }

    function luminancia(rgb) {
        return 0.2126 * paraLinear(rgb[0]) + 0.7152 * paraLinear(rgb[1]) + 0.0722 * paraLinear(rgb[2]);
    }
    // Clareamento/escurecimento feito em espaço LINEAR (fisicamente correto),
    // não diretamente sobre os bytes sRGB.
    function ajustarBrilho(rgb, fator) {
        return rgb.map(function (c) { return paraSrgb(paraLinear(c) * fator); });
    }

    // nome aproximado da cor, só para dar contexto ao usuário
    function nomeDaCor(rgb) {
        var hsl = rgbParaHsl(rgb), h = hsl[0], s = hsl[1], l = hsl[2];
        if (s <= 6) return l > 90 ? 'Branco puro' : l > 70 ? 'Cinza claro' : l > 35 ? 'Cinza médio' : 'Cinza escuro';
        var faixas = [[15, 'Vermelho'], [40, 'Laranja'], [68, 'Amarelo'], [150, 'Verde'],
        [200, 'Ciano'], [255, 'Azul'], [290, 'Violeta'], [335, 'Magenta'], [361, 'Vermelho']];
        var matiz = 'Cor';
        for (var i = 0; i < faixas.length; i++) { if (h < faixas[i][0]) { matiz = faixas[i][1]; break; } }
        var tom = l > 82 ? 'bem claro' : l > 62 ? 'claro' : l > 38 ? 'médio' : l > 20 ? 'escuro' : 'bem escuro';
        var int = s < 22 ? ' acinzentado' : s > 72 ? ' vibrante' : '';
        return matiz + ' ' + tom + int;
    }

    /* =========================================================
       6. FORMATAÇÃO
       ========================================================= */
    function nf(v, d) { return v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }); }
    function volumeTexto(ml) {
        return ml >= 1000 ? nf(ml / 1000, ml % 1000 === 0 ? 1 : 2) + ' L' : nf(ml, 0) + ' mL';
    }
    function totalGotas(g) {
        return PIGMENTOS.reduce(function (s, p) { return s + (g[p.id] || 0); }, 0);
    }

    /* ---------------------------------------------------------
       EMBALAGENS — o corante é vendido em frascos fechados de 50 mL.
       Uma receita não consome "12,5 mL de corante": ela consome parte
       de um frasco que precisa ser comprado inteiro. Frascos NÃO se
       somam entre cores — cada corante exige os seus.
       --------------------------------------------------------- */
    function embalagens(ml) {
        // 1e-9 evita que 50,000000001 mL (erro de ponto flutuante) peça 2 frascos
        var frascos = Math.ceil(ml / EMBALAGEM_ML - 1e-9);
        return {
            ml: ml,
            fracao: ml / EMBALAGEM_ML,                  // consumo real, em frascos
            frascos: frascos,                           // frascos a comprar (inteiros)
            comprado: frascos * EMBALAGEM_ML,           // mL comprados
            sobra: frascos * EMBALAGEM_ML - ml          // mL que restam no frasco aberto
        };
    }
    function frascoTxt(n) { return nf(n, 0) + (n === 1 ? ' frasco' : ' frascos'); }

    // Consolida o consumo de embalagens de uma receita inteira.
    function compraDaReceita(gotas) {
        var itens = [], frascos = 0, comprado = 0, usado = 0;
        PIGMENTOS.forEach(function (p) {
            var n = gotas[p.id] || 0;
            if (n <= 0) return;
            var e = embalagens(n * GOTA_ML);
            itens.push({ p: p, gotas: n, emb: e });
            frascos += e.frascos;
            comprado += e.comprado;
            usado += e.ml;
        });
        return { itens: itens, frascos: frascos, comprado: comprado, usado: usado, sobra: comprado - usado };
    }

    /* =========================================================
       7. MONTAGEM DA TELA
       ========================================================= */
    function montarBases() {
        var $l = $('#listaBases').empty();
        BASES.forEach(function (b, i) {
            var ativa = b.hex === estado.baseHex;
            $l.append(
                $('<li class="col-6 seletor-base__item"></li>').append(
                    $('<button type="button" class="seletor-base__opcao"></button>')
                        .attr('data-hex', b.hex)
                        .attr('data-i', i)
                        .attr('title', 'Densidade ' + nf(b.densidade, 2) + ' g/cm³ · ' + b.ku + ' KU · pH ' + nf(b.ph, 1))
                        .attr('aria-pressed', ativa)
                        .toggleClass('seletor-base__opcao--ativa', ativa)
                        .append($('<span class="seletor-base__amostra" aria-hidden="true"></span>').css('background', b.hex))
                        .append($('<span class="seletor-base__nome"></span>').text(b.nome))
                )
            );
        });
    }

    function montarPigmentos() {
        var $l = $('#listaPigmentos').empty();
        PIGMENTOS.forEach(function (p) {
            var $row = $('<li class="corante"></li>').attr('data-id', p.id);

            $row.append(
                $('<span class="corante__amostra"></span>')
                    .css('background', p.hex)
                    .attr('title', p.natureza)
            );

            var $info = $('<div class="corante__info"></div>');
            $info.append(
                $('<div class="corante__topo"></div>')
                    .append($('<span class="corante__nome"></span>').text(p.curto)
                        .attr('title', p.nome + ' — ' + p.natureza))
                    .append($('<output class="corante__qtd"></output>').text('0 gotas'))
            );
            $info.append(
                $('<input type="range" class="form-range corante__controle">')
                    .attr({ min: 0, max: limiteGotas(), step: 1, value: 0, 'aria-label': 'Gotas de ' + p.nome })
            );
            $row.append($info);

            // data-acao identifica o comportamento; as classes ficam só para o visual
            $row.append(
                '<div class="btn-group btn-group-sm corante__botoes" role="group" ' +
                'aria-label="Ajuste de gotas de ' + p.curto + '">' +
                '<button type="button" class="btn btn-outline-secondary" data-acao="menos" ' +
                'title="-1 gota" aria-label="Remover 1 gota">&minus;</button>' +
                '<button type="button" class="btn btn-outline-secondary" data-acao="mais" ' +
                'title="+1 gota" aria-label="Adicionar 1 gota">+</button>' +
                '<button type="button" class="btn botao botao--contorno" data-acao="mais10" ' +
                'title="+10 gotas" aria-label="Adicionar 10 gotas">+10</button>' +
                '</div>'
            );

            $l.append($row);
        });
    }

    // Passos da evolução da cor, de 0 até a receita atual, na mesma proporção.
    function passosEscala(passos) {
        var lista = [];
        for (var i = 0; i <= passos; i++) {
            var frac = i / passos;
            // gotas são inteiras: o passo é arredondado ANTES de calcular a cor,
            // para que o rótulo e o tom exibidos correspondam à mesma receita.
            var g = {}, soma = 0;
            PIGMENTOS.forEach(function (p) {
                g[p.id] = Math.round((estado.gotas[p.id] || 0) * frac);
                soma += g[p.id];
            });
            lista.push({ soma: soma, rgb: corDaMistura(g, estado.volume, estado.baseHex) });
        }
        return lista;
    }

    function montarEscala() {
        var total = totalGotas(estado.gotas);
        var $e = $('#escala').empty();
        var passos = 12, i;

        if (total === 0) {
            $('#escalaHint').text('Adicione gotas para ver a progressão da cor.');
            for (i = 0; i <= passos; i++) {
                $e.append($('<span class="escala__passo"></span>').css('background', estado.baseHex));
            }
            return;
        }

        $('#escalaHint').html('De <strong>0</strong> até <strong>' + total +
            '</strong> gotas, mantendo a mesma proporção entre os corantes.');

        passosEscala(passos).forEach(function (ps) {
            var claro = luminancia(ps.rgb) > 0.4;
            $e.append(
                $('<span class="escala__passo"></span>')
                    .css('background', rgbParaHex(ps.rgb))
                    .attr('title', nf(ps.soma, 0) + ' gotas · ' + nf(ps.soma * GOTA_ML, 2) + ' mL — ' + rgbParaHex(ps.rgb))
                    .append($('<span class="escala__rotulo"></span>').text(nf(ps.soma, 0))
                        .css('color', claro ? '#3c3d3e' : '#ffffff'))
            );
        });
    }

    function montarReceita(rgb, info) {
        var total = totalGotas(estado.gotas);
        var linha = '--------------------------------------------------------------\n';
        var txt = 'BASE: ' + estado.baseNome + ' (' + estado.baseHex + ') — ' + volumeTexto(estado.volume) + '\n';
        txt += '      densidade ' + nf(estado.baseDados.densidade, 2) + ' g/cm³  ·  ' +
            nf(estado.volume * estado.baseDados.densidade / 1000, 3) + ' kg\n';
        txt += linha;

        if (total === 0) {
            txt += 'Nenhum corante adicionado.\n';
        } else {
            PIGMENTOS.forEach(function (p) {
                var n = estado.gotas[p.id] || 0;
                if (!n) return;
                var porLitro = n / (estado.volume / 1000);
                // colunas dimensionadas para o teto de 12.000 gotas (600 mL)
                txt += (p.curto + ' ').padEnd(12, '.') + nf(n, 0).padStart(6) + ' gotas  ' +
                    nf(n * GOTA_ML, 2).padStart(7) + ' mL  ' +
                    nf(massaDoCorante(p, n), 2).padStart(8) + ' g  ' +
                    nf(porLitro, 1).padStart(6) + ' gt/L\n';
                txt += '             ' + p.ci + '\n';
            });
            txt += linha;
            txt += 'Total ......' + nf(total, 0).padStart(6) + ' gotas  ' +
                nf(total * GOTA_ML, 2).padStart(7) + ' mL  ' +
                nf(info.massaCorante, 2).padStart(8) + ' g\n';
            txt += 'Carga ...... ' + nf(info.pctVol, 3) + ' % v/v  ·  ' +
                nf(info.pctMassa, 3) + ' % m/m\n';

            // Lista de compra: o corante só é vendido em frasco fechado de 50 mL,
            // e frascos não se dividem entre cores — cada corante puxa os seus.
            txt += linha;
            txt += 'EMBALAGENS DE ' + nf(EMBALAGEM_ML, 0) + ' mL (' + nf(GOTAS_EMBALAGEM, 0) + ' gotas cada)\n';
            info.compra.itens.forEach(function (it) {
                txt += '  ' + (it.p.curto + ' ').padEnd(12, '.') +
                    nf(it.emb.fracao, 2).padStart(5) + ' emb. usada(s)  ->  comprar ' +
                    frascoTxt(it.emb.frascos) +
                    '  (sobra ' + nf(it.emb.sobra, 2) + ' mL)\n';
            });
            txt += '  Comprar ..' + nf(info.compra.frascos, 0).padStart(6) + ' frasco(s)  ' +
                nf(info.compra.comprado, 0).padStart(7) + ' mL  ·  usa ' +
                nf(info.compra.usado, 2) + ' mL  ·  sobra ' + nf(info.compra.sobra, 2) + ' mL\n';
        }

        txt += linha;
        txt += 'pH estimado .............. ' + nf(info.ph, 2) + '\n';
        txt += 'Viscosidade estimada ..... ' + nf(info.ku, 0) + ' KU\n';
        txt += 'COR FINAL: ' + rgbParaHex(rgb) + '   RGB ' + rgb.map(Math.round).join(', ');
        $('#receita').text(txt);
    }

    // Painel visual da lista de compra — quantos frascos de 50 mL a receita exige.
    function montarCompra(compra) {
        var $c = $('#compra').empty();

        if (!compra.itens.length) {
            $c.append($('<li class="compra__vazio"></li>').text(
                'Sem corante na lata — nenhuma embalagem necessária.'
            ));
            return;
        }

        compra.itens.forEach(function (it) {
            $c.append(
                $('<li class="compra__linha"></li>')
                    .append($('<span class="compra__amostra" aria-hidden="true"></span>').css('background', it.p.hex))
                    .append($('<span class="compra__nome"></span>').text(it.p.curto))
                    .append($('<span class="compra__uso"></span>').text(
                        nf(it.emb.ml, 2) + ' mL · ' + nf(it.emb.fracao, 2) + ' emb.'
                    ))
                    .append($('<span class="compra__qtd"></span>').text(frascoTxt(it.emb.frascos)))
                    .append($('<span class="compra__sobra"></span>').text('sobra ' + nf(it.emb.sobra, 2) + ' mL'))
            );
        });

        $c.append(
            $('<li class="compra__total"></li>').html(
                'Comprar <strong>' + frascoTxt(compra.frascos) + '</strong> de ' + nf(EMBALAGEM_ML, 0) +
                ' mL &nbsp;·&nbsp; ' + nf(compra.comprado, 0) + ' mL adquiridos &nbsp;·&nbsp; ' +
                nf(compra.usado, 2) + ' mL usados &nbsp;·&nbsp; sobra ' + nf(compra.sobra, 2) + ' mL'
            )
        );
    }

    function atualizar() {
        var rgb = corDaMistura(estado.gotas, estado.volume, estado.baseHex);
        var hex = rgbParaHex(rgb);
        var hsl = rgbParaHsl(rgb);
        var lum = luminancia(rgb);
        var total = totalGotas(estado.gotas);

        var ml = total * GOTA_ML;
        var compra = compraDaReceita(estado.gotas);
        var massaCorante = massaTotalCorante(estado.gotas);
        var massaBase = estado.volume * estado.baseDados.densidade;
        var pctVol = estado.volume ? (ml / estado.volume) * 100 : 0;
        var pctMassa = (massaBase + massaCorante) ? (massaCorante / (massaBase + massaCorante)) * 100 : 0;
        var ph = phDaMistura(estado.gotas, estado.volume);
        var ku = viscDaMistura(estado.gotas, estado.volume);

        $('#swatch').css({ background: hex, color: lum > 0.35 ? '#2f3031' : '#ffffff' });
        $('#lblHex').text(hex);
        $('#lblNomeCor').text(nomeDaCor(rgb));
        $('#lblRgb').text(rgb.map(Math.round).join(', '));
        $('#lblHsl').text(hsl[0] + '°, ' + hsl[1] + '%, ' + hsl[2] + '%');
        $('#lblLum').text(nf(lum * 100, 1) + ' %');
        $('#lblPh').text(nf(ph, 2));
        $('#lblKu').text(nf(ku, 0) + ' KU');
        $('#lblMassa').text(nf((massaBase + massaCorante) / 1000, 3) + ' kg');

        $('#totGotas').text(nf(total, 0));
        $('#totMl').text(nf(ml, 2) + ' mL');
        $('#totEmb').text(
            compra.frascos === 0 ? 'nenhuma' :
                frascoTxt(compra.frascos) + ' · sobra ' + nf(compra.sobra, 2) + ' mL'
        );

        $('#avisoCarga').prop('hidden', pctVol <= CARGA_MAX_PCT)
            .html('<i class="bi bi-exclamation-triangle-fill"></i> Carga de ' + nf(pctVol, 2) +
                ' % v/v acima do limite recomendado de ' + CARGA_MAX_PCT +
                ' % — risco de perda de cobertura, brilho e resistência do filme.');

        var lim = limiteGotas();
        PIGMENTOS.forEach(function (p) {
            var n = estado.gotas[p.id] || 0;
            var $r = $('.corante[data-id="' + p.id + '"]');
            $r.toggleClass('corante--ativo', n > 0);
            $r.find('.corante__qtd').toggleClass('corante__qtd--ativa', n > 0).text(nf(n, 0) + (n === 1 ? ' gota' : ' gotas'));
            // o teto acompanha o volume da lata, então o slider é reconfigurado aqui
            $r.find('.corante__controle').attr('max', lim).val(n);
        });

        estado.ultimo = {
            rgb: rgb, hex: hex, hsl: hsl, total: total, ml: ml,
            compra: compra, massaCorante: massaCorante, massaBase: massaBase,
            pctVol: pctVol, pctMassa: pctMassa, ph: ph, ku: ku
        };

        $('#parede').attr('fill', hex);
        $('#paredeLat').attr('fill', rgbParaHex(ajustarBrilho(rgb, 0.78)));
        $('#rodape').attr('fill', rgbParaHex(ajustarBrilho(rgb, 1.35)));
        $('#ambiente, #swatch').css('filter', LUZES[estado.luz]);

        montarEscala();
        montarCompra(compra);
        montarReceita(rgb, {
            massaCorante: massaCorante,
            pctVol: pctVol,
            pctMassa: pctMassa,
            ph: ph,
            ku: ku,
            compra: compra
        });
    }

    /* =========================================================
       8. EVENTOS
       ========================================================= */
    function setGotas(id, n) {
        n = Math.round(n);
        estado.gotas[id] = Math.max(0, Math.min(limiteGotas(), isNaN(n) ? 0 : n));
        atualizar();
    }
    function idDaLinha(el) { return $(el).closest('.corante').data('id'); }

    $('#listaPigmentos')
        .on('click', '[data-acao="mais"]', function () { var id = idDaLinha(this); setGotas(id, estado.gotas[id] + 1); })
        .on('click', '[data-acao="menos"]', function () { var id = idDaLinha(this); setGotas(id, estado.gotas[id] - 1); })
        .on('click', '[data-acao="mais10"]', function () { var id = idDaLinha(this); setGotas(id, estado.gotas[id] + 10); })
        .on('input', '.corante__controle', function () { setGotas(idDaLinha(this), +this.value); });

    $('#listaBases').on('click', '.seletor-base__opcao', function () {
        var b = BASES[+$(this).attr('data-i')];
        estado.baseHex = b.hex;
        estado.baseNome = b.nome;
        estado.baseDados = b;
        $('.seletor-base__opcao').removeClass('seletor-base__opcao--ativa').attr('aria-pressed', 'false');
        $(this).addClass('seletor-base__opcao--ativa').attr('aria-pressed', 'true');
        atualizar();
    });

    // O teto de gotas por corante depende do volume, então reduzir a lata precisa
    // reduzir também as receitas que passaram a estourar o novo limite.
    function aplicarVolume(v) {
        estado.volume = Math.max(VOL_MIN, Math.min(VOL_MAX, v));
        var lim = limiteGotas(), cortou = false;
        PIGMENTOS.forEach(function (p) {
            if (estado.gotas[p.id] > lim) { estado.gotas[p.id] = lim; cortou = true; }
        });
        atualizar();
        if (cortou) aviso('Receita ajustada ao novo limite de ' + nf(lim, 0) + ' gotas por corante.');
    }

    $('.volume__predefinicao').on('change', function () {
        if (this.checked) aplicarVolume(+this.value);
    });

    // Accordion das seções 1 e 2 só existe no mobile: no desktop (lg+) o CSS
    // mantém as duas abertas e o botão do título sai da navegação por teclado.
    var mqDesktop = window.matchMedia('(min-width: 992px)');
    function ajustarAcordeao() {
        $('.painel__alternar').attr('tabindex', mqDesktop.matches ? -1 : null);
    }
    ajustarAcordeao();
    if (mqDesktop.addEventListener) mqDesktop.addEventListener('change', ajustarAcordeao);
    else mqDesktop.addListener(ajustarAcordeao);

    $('#btnZerar').on('click', function () {
        PIGMENTOS.forEach(function (p) { estado.gotas[p.id] = 0; });
        atualizar();
        aviso('Mistura zerada — voltamos à tinta base.');
    });

    $('#grpLuz').on('click', 'button', function () {
        $('#grpLuz button').removeClass('active').attr('aria-pressed', 'false');
        $(this).addClass('active').attr('aria-pressed', 'true');
        estado.luz = $(this).data('luz');
        atualizar();
    });

    $('#btnCopiarHex').on('click', function () { copiar($('#lblHex').text(), 'Código da cor copiado.'); });
    $('#btnCopiarReceita').on('click', function () { copiar($('#receita').text(), 'Receita copiada.'); });

    $('#btnExportarPdf').on('click', exportarPdf);

    /* =========================================================
       9. EXPORTAÇÃO EM PDF — ficha da amostra atual
       Fontes padrão do PDF (Helvetica) cobrem os acentos do português.
       ========================================================= */
    const PDF_LARANJA = [255, 130, 0];
    const PDF_CINZA = [111, 112, 114];
    const PDF_CLARO = [236, 237, 236];
    const PDF_ESCURO = [47, 48, 49];

    // Logo da barra superior, embutida em base64 por assets/js/logo.js (proporção 640 × 391).
    const LOGO_PROPORCAO = 640 / 391;

    function exportarPdf() {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            aviso('Não foi possível carregar o gerador de PDF — verifique a conexão.');
            return;
        }
        var u = estado.ultimo;
        var doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4' });
        var W = 210, H = 297, M = 16, y;
        var agora = new Date();
        var dataTxt = agora.toLocaleDateString('pt-BR') + ' às ' +
            agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        function preencher(rgb) { doc.setFillColor(rgb[0], rgb[1], rgb[2]); }
        function tinta(rgb) { doc.setTextColor(rgb[0], rgb[1], rgb[2]); }
        function traco(rgb) { doc.setDrawColor(rgb[0], rgb[1], rgb[2]); }
        function fonte(tam, estilo) { doc.setFont('helvetica', estilo || 'normal'); doc.setFontSize(tam); }
        function garantir(h) { if (y + h > H - 24) { doc.addPage(); y = 20; } }

        function secao(titulo) {
            garantir(18);
            fonte(10, 'bold'); tinta(PDF_LARANJA);
            doc.text(titulo.toUpperCase(), M, y);
            traco(PDF_CLARO); doc.setLineWidth(0.5);
            doc.line(M, y + 2, W - M, y + 2);
            y += 8;
        }

        function campo(x, yy, rotulo, valor) {
            fonte(7.5); tinta(PDF_CINZA); doc.text(rotulo, x, yy);
            fonte(10, 'bold'); tinta(PDF_ESCURO); doc.text(valor, x, yy + 5);
        }

        function quadrado(x, yy, w, h, hex) {
            preencher(hexParaRgb(hex)); traco([200, 201, 200]); doc.setLineWidth(0.2);
            doc.roundedRect(x, yy, w, h, 1.2, 1.2, 'FD');
        }

        // Tabela simples: colunas = [{ t: título, x: posição, a: 'left'|'right' }]
        function tabela(colunas, linhas, total) {
            var alt = 7;
            garantir(alt * 2);
            preencher(PDF_CLARO); doc.rect(M, y, W - 2 * M, alt, 'F');
            fonte(8, 'bold'); tinta(PDF_CINZA);
            colunas.forEach(function (c) { doc.text(c.t, c.x, y + 4.7, { align: c.a || 'left' }); });
            y += alt;

            linhas.concat(total ? [total] : []).forEach(function (lin, i) {
                garantir(alt);
                var ehTotal = total && i === linhas.length;
                fonte(8.5, ehTotal ? 'bold' : 'normal'); tinta(PDF_ESCURO);
                colunas.forEach(function (c, j) {
                    var x = c.x;
                    if (j === 0 && lin.hex) { quadrado(x, y + 1.6, 3.8, 3.8, lin.hex); x += 5.5; }
                    doc.text(String(lin.v[j]), x, y + 4.7, { align: c.a || 'left' });
                });
                traco(PDF_CLARO); doc.setLineWidth(0.3);
                if (ehTotal) { traco(PDF_CINZA); doc.line(M, y, W - M, y); }
                doc.line(M, y + alt, W - M, y + alt);
                y += alt;
            });
            y += 6;
        }

        /* ---- cabeçalho ---- */
        preencher(PDF_CLARO); doc.rect(0, 0, W, 30, 'F');
        preencher(PDF_LARANJA); doc.rect(0, 30, W, 1.2, 'F');
        var logoAlt = 18, logoLarg = logoAlt * LOGO_PROPORCAO;
        if (window.LOGO_PNG) {
            doc.addImage(window.LOGO_PNG, 'PNG', M, 6, logoLarg, logoAlt);
        } else {
            fonte(18, 'bold'); tinta(PDF_ESCURO);
            doc.text('MisturAI', M, 16.5);
        }
        fonte(8.5); tinta(PDF_CINZA);
        doc.text(['Simulador de tingimento', 'de tinta branca com corantes'], M + logoLarg + 5, 14);
        fonte(11, 'bold'); tinta(PDF_ESCURO);
        doc.text('Ficha da amostra', W - M, 15, { align: 'right' });
        fonte(8.5); tinta(PDF_CINZA);
        doc.text('Gerada em ' + dataTxt, W - M, 21, { align: 'right' });
        y = 42;

        /* ---- cor resultante ---- */
        var lab = rgbParaLab(u.rgb);
        quadrado(M, y, 64, 42, u.hex);
        var xi = M + 72;
        fonte(22, 'bold'); tinta(PDF_ESCURO); doc.text(u.hex, xi, y + 8);
        fonte(11); tinta(PDF_CINZA); doc.text(nomeDaCor(u.rgb), xi, y + 14.5);
        campo(xi, y + 23, 'RGB', u.rgb.map(Math.round).join(', '));
        campo(xi + 38, y + 23, 'HSL', u.hsl[0] + '°, ' + u.hsl[1] + '%, ' + u.hsl[2] + '%');
        campo(xi + 76, y + 23, 'CIELAB (D65)', nf(lab[0], 1) + ' / ' + nf(lab[1], 1) + ' / ' + nf(lab[2], 1));
        y += 54;

        /* ---- tinta base ---- */
        secao('Tinta base');
        var col = (W - 2 * M) / 4;
        campo(M, y, 'Base', estado.baseNome);
        campo(M + col, y, 'Cor da base', estado.baseHex);
        campo(M + col * 2, y, 'Volume da lata', volumeTexto(estado.volume));
        campo(M + col * 3, y, 'Densidade · massa', nf(estado.baseDados.densidade, 2) + ' g/cm³ · ' +
            nf(u.massaBase / 1000, 3) + ' kg');
        y += 15;

        /* ---- corantes ---- */
        secao('Corantes da receita');
        if (!u.compra.itens.length) {
            fonte(9); tinta(PDF_CINZA);
            doc.text('Nenhum corante adicionado — a amostra corresponde à tinta base pura.', M, y);
            y += 10;
        } else {
            tabela([
                { t: 'Corante', x: M + 2 },
                { t: 'Color Index', x: M + 40 },
                { t: 'Gotas', x: M + 146, a: 'right' },
                { t: 'mL', x: M + 176, a: 'right' }
            ], u.compra.itens.map(function (it) {
                return {
                    hex: it.p.hex,
                    v: [it.p.curto, it.p.ci, nf(it.gotas, 0), nf(it.emb.ml, 2)]
                };
            }), {
                v: ['Total', '', nf(u.total, 0), nf(u.ml, 2)]
            });

            /* ---- embalagens ---- */
            secao('Embalagens necessárias (' + nf(EMBALAGEM_ML, 0) + ' mL · ' + nf(GOTAS_EMBALAGEM, 0) + ' gotas cada)');
            tabela([
                { t: 'Corante', x: M + 2 },
                { t: 'Consumo', x: M + 76, a: 'right' },
                { t: 'Embalagens usadas', x: M + 112, a: 'right' },
                { t: 'Comprar', x: M + 146, a: 'right' },
                { t: 'Sobra', x: M + 176, a: 'right' }
            ], u.compra.itens.map(function (it) {
                return {
                    hex: it.p.hex,
                    v: [it.p.curto, nf(it.emb.ml, 2) + ' mL', nf(it.emb.fracao, 2),
                        frascoTxt(it.emb.frascos), nf(it.emb.sobra, 2) + ' mL']
                };
            }), {
                v: ['Total', nf(u.compra.usado, 2) + ' mL', '', frascoTxt(u.compra.frascos),
                    nf(u.compra.sobra, 2) + ' mL']
            });
        }

        /* ---- propriedades ---- */
        secao('Propriedades estimadas da mistura');
        garantir(13);
        campo(M, y, 'pH estimado', nf(u.ph, 2));
        campo(M + col, y, 'Viscosidade estimada', nf(u.ku, 0) + ' KU');
        campo(M + col * 2, y, 'Massa total da lata', nf((u.massaBase + u.massaCorante) / 1000, 3) + ' kg');
        campo(M + col * 3, y, 'Luminância relativa', nf(luminancia(u.rgb) * 100, 1) + ' %');
        y += 13;
        if (u.pctVol > CARGA_MAX_PCT) {
            fonte(8.5, 'bold'); tinta(PDF_LARANJA);
            doc.text(doc.splitTextToSize('Atenção: carga de ' + nf(u.pctVol, 2) + ' % v/v acima do limite recomendado de ' +
                CARGA_MAX_PCT + ' % — risco de perda de cobertura, brilho e resistência do filme.', W - 2 * M), M, y);
            y += 10;
        }
        y += 2;

        /* ---- evolução ---- */
        if (u.total > 0) {
            secao('Evolução ao pingar as gotas');
            garantir(18);
            var passos = passosEscala(12), gap = 1.5;
            var lw = (W - 2 * M - gap * (passos.length - 1)) / passos.length;
            passos.forEach(function (ps, i) {
                var x = M + i * (lw + gap);
                quadrado(x, y, lw, 9, rgbParaHex(ps.rgb));
                fonte(6.5); tinta(PDF_CINZA);
                doc.text(nf(ps.soma, 0), x + lw / 2, y + 13, { align: 'center' });
            });
            y += 18;
        }

        /* ---- rodapé em todas as páginas ---- */
        var paginas = doc.getNumberOfPages();
        for (var pg = 1; pg <= paginas; pg++) {
            doc.setPage(pg);
            traco(PDF_CLARO); doc.setLineWidth(0.4);
            doc.line(M, H - 16, W - M, H - 16);
            fonte(7); tinta(PDF_CINZA);
            doc.text(doc.splitTextToSize('Valores simulados pelo modelo Kubelka-Munk a partir da ficha técnica dos corantes GLASU!. ' +
                'A cor exibida em tela ou impressa é aproximada — confirme sempre com uma amostra física.', W - 2 * M - 30),
                M, H - 11.5);
            doc.text('Página ' + pg + ' de ' + paginas, W - M, H - 11.5, { align: 'right' });
        }

        var nomeArq = 'amostra-' + u.hex.replace('#', '') + '-' +
            agora.toISOString().slice(0, 10) + '.pdf';
        doc.save(nomeArq);
        aviso('PDF da amostra exportado.');
    }

    /* =========================================================
       10. UTILITÁRIOS
       ========================================================= */
    var toast = new bootstrap.Toast(document.getElementById('toastApp'), { delay: 2600 });
    function aviso(msg) { $('#toastMsg').text(msg); toast.show(); }

    function copiar(texto, msg) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(texto).then(
                function () { aviso(msg); },
                function () { copiarFallback(texto, msg); }
            );
        } else {
            copiarFallback(texto, msg);
        }
    }
    function copiarFallback(texto, msg) {
        var $t = $('<textarea></textarea>').val(texto).css({ position: 'fixed', opacity: 0 }).appendTo('body');
        $t[0].select();
        try { document.execCommand('copy'); aviso(msg); } catch (e) { aviso('Não foi possível copiar.'); }
        $t.remove();
    }

    /* =========================================================
       11. INÍCIO
       ========================================================= */
    montarBases();
    montarPigmentos();
    atualizar();
});
