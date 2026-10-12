$(function () {
    'use strict';

    /* =========================================================
       1. DADOS — subconjunto do app.js (seção 1)
       Mantenha hex, densidade e forca em sincronia com PIGMENTOS
       do app.js, para a demonstração dar a mesma cor do simulador.
       ========================================================= */
    const GOTA_ML = 0.05;
    const GOTAS_EMBALAGEM = 1000;   // frasco de 50 mL
    const GOTAS_POR_TOQUE = 25;
    const DEMO_VOLUME = 900;        // mL
    const DEMO_BASE = { hex: '#FFFFFF', densidade: 1.35 };
    const DEMO_MAX_GOTAS = Math.ceil((DEMO_VOLUME * 6 / 100) / GOTA_ML);   // carga de 6 % v/v

    const PIGMENTOS = [
        { id: 'amarelo', curto: 'Amarelo', hex: '#FBBA00', densidade: 1.045, forca: 40.31, natureza: 'Monoazóico', ci: 'PY 74 / 11741' },
        { id: 'ocre', curto: 'Ocre', hex: '#C1832B', densidade: 1.55, forca: 23.84, natureza: 'Óxido de ferro', ci: 'PY 42 / 77492' },
        { id: 'vermelho', curto: 'Vermelho', hex: '#D0271D', densidade: 1.055, forca: 64.22, natureza: 'Vermelho naphthol AS', ci: 'PR 112 / 12370' },
        { id: 'laranja', curto: 'Laranja', hex: '#E4581C', densidade: 1.065, forca: 49.14, natureza: 'Laranja naphthol AS', ci: 'PO 5 / 12075' },
        { id: 'preto', curto: 'Preto', hex: '#141414', densidade: 1.125, forca: 7.46, natureza: 'Negro de fumo', ci: 'PBk 7 / 77266' },
        { id: 'castanho', curto: 'Castanho', hex: '#6E4224', densidade: 1.65, forca: 25.39, natureza: 'Óxido de ferro', ci: 'PY 42 / 77492' },
        { id: 'verde', curto: 'Verde', hex: '#005A46', densidade: 1.065, forca: 42.47, natureza: 'Ftalocianina', ci: 'PG 7 / 74260' },
        { id: 'azul', curto: 'Azul', hex: '#10387A', densidade: 1.075, forca: 31.58, natureza: 'Ftalocianina', ci: 'PB 15:1 / 74160' }
    ];

    var gotas = {};
    PIGMENTOS.forEach(function (p) { gotas[p.id] = 0; });

    /* =========================================================
       2. COR — Kubelka-Munk em base mássica (igual ao app.js)
       ========================================================= */
    function hexParaRgb(hex) {
        hex = String(hex).replace('#', '');
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
        return (l <= 0.0031308 ? l * 12.92 : 1.055 * Math.pow(l, 1 / 2.4) - 0.055) * 255;
    }
    function ks(R) { R = Math.min(0.9995, Math.max(0.005, R)); return ((1 - R) * (1 - R)) / (2 * R); }
    function ksParaR(k) { return 1 + k - Math.sqrt(k * k + 2 * k); }
    function ksDoHex(hex) { return hexParaRgb(hex).map(function (c) { return ks(paraLinear(c)); }); }

    function corDaMistura() {
        var kBase = ksDoHex(DEMO_BASE.hex);
        var massaBase = DEMO_VOLUME * DEMO_BASE.densidade;
        var massaTotal = massaBase;
        var acum = [kBase[0] * massaBase, kBase[1] * massaBase, kBase[2] * massaBase];
        PIGMENTOS.forEach(function (p) {
            var n = gotas[p.id];
            if (n <= 0) return;
            var massa = n * GOTA_ML * p.densidade;
            var k = ksDoHex(p.hex);
            massaTotal += massa;
            for (var i = 0; i < 3; i++) acum[i] += k[i] * p.forca * massa;
        });
        return rgbParaHex(acum.map(function (v) { return paraSrgb(ksParaR(v / massaTotal)); }));
    }

    function luminancia(hex) {
        var c = hexParaRgb(hex).map(paraLinear);
        return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    }

    function nf(n) { return n.toLocaleString('pt-BR'); }

    /* =========================================================
       3. DEMONSTRAÇÃO
       ========================================================= */
    var $lista = $('#demoCorantes');
    PIGMENTOS.forEach(function (p) {
        $('<li>').append(
            $('<button type="button" class="demo__corante">')
                .attr({ 'data-i': p.id, 'aria-label': 'Pingar ' + GOTAS_POR_TOQUE + ' gotas de ' + p.curto })
                .append(
                    $('<span class="demo__gota">').css('background', p.hex),
                    $('<span class="demo__nome">').text(p.curto),
                    $('<span class="demo__qtd">').text('0')
                )
        ).appendTo($lista);
    });

    function atualizarDemo() {
        var hex = corDaMistura();
        var total = 0, frascos = 0;
        PIGMENTOS.forEach(function (p) {
            var n = gotas[p.id];
            total += n;
            if (n > 0) frascos += Math.ceil(n / GOTAS_EMBALAGEM);
            var $b = $lista.find('[data-i="' + p.id + '"]');
            $b.toggleClass('demo__corante--ativo', n > 0)
                .prop('disabled', n >= DEMO_MAX_GOTAS);
            $b.find('.demo__qtd').text(nf(n));
        });

        $('#demoParede [data-parede]').attr('fill', hex);
        $('#demoHex').text(hex);
        $('#demoParede').toggleClass('demo__parede--escura', luminancia(hex) < 0.25);
        $('#demoResumo').text(total
            ? nf(total) + ' gotas · ' + nf(total * GOTA_ML) + ' mL · ' + frascos + (frascos > 1 ? ' frascos' : ' frasco') + ' de 50 mL'
            : 'Nenhum corante ainda');
    }

    $lista.on('click', '[data-i]', function () {
        var id = $(this).attr('data-i');
        gotas[id] = Math.min(DEMO_MAX_GOTAS, gotas[id] + GOTAS_POR_TOQUE);
        atualizarDemo();
    });
    $('[data-acao="zerar"]').on('click', function () {
        PIGMENTOS.forEach(function (p) { gotas[p.id] = 0; });
        atualizarDemo();
    });

    // Começa com um bege pronto, para a parede já chamar atenção.
    gotas.ocre = 50;
    gotas.castanho = 25;
    atualizarDemo();

    /* =========================================================
       4. TABELA DE CORANTES
       ========================================================= */
    var $tabela = $('#tabelaCorantes');
    PIGMENTOS.forEach(function (p) {
        $('<tr>').append(
            $('<td>').append(
                $('<span class="tabela-corantes__amostra">').css('background', p.hex),
                $('<strong>').text(p.curto)
            ),
            $('<td>').text(p.natureza),
            $('<td class="tabela-corantes__ci">').text(p.ci)
        ).appendTo($tabela);
    });

    /* =========================================================
       5. CONTADOR REGRESSIVO
       data-fim na faixa de urgência define o fim da campanha;
       sem ele, a contagem vai até a meia-noite de hoje.
       ========================================================= */
    function fimDaCampanha() {
        var fim = new Date($('#faixaUrgencia').attr('data-fim') || '');
        if (isNaN(fim.getTime()) || fim <= new Date()) {
            fim = new Date();
            fim.setHours(24, 0, 0, 0);
        }
        return fim;
    }
    var fim = fimDaCampanha();
    function doisDigitos(n) { return String(n).padStart(2, '0'); }
    function atualizarContador() {
        var resta = Math.max(0, fim - new Date());
        if (resta === 0) { fim = fimDaCampanha(); resta = fim - new Date(); }
        var s = Math.floor(resta / 1000);
        $('[data-contador]').text(
            doisDigitos(Math.floor(s / 3600)) + ':' + doisDigitos(Math.floor(s % 3600 / 60)) + ':' + doisDigitos(s % 60)
        );
    }
    atualizarContador();
    setInterval(atualizarContador, 1000);

    /* =========================================================
       6. BARRA FIXA NO CELULAR — aparece depois do herói
       ========================================================= */
    var $barra = $('#barraMovel');
    var limiteBarra = $('.heroi').outerHeight() || 600;
    $(window).on('scroll', function () {
        $barra.toggleClass('barra-movel--visivel', window.scrollY > limiteBarra);
    });

    /* =========================================================
       7. MODAL DE SAÍDA — uma vez por sessão, só no desktop
       ========================================================= */
    function jaMostrouSaida() {
        try { return sessionStorage.getItem('misturai-saida') === '1'; } catch (e) { return false; }
    }
    function marcarSaida() {
        try { sessionStorage.setItem('misturai-saida', '1'); } catch (e) { /* sem storage: só não lembra */ }
    }
    var saidaMostrada = jaMostrouSaida();
    var podeMostrarSaida = false;
    setTimeout(function () { podeMostrarSaida = true; }, 8000);   // não incomoda quem acabou de chegar

    $(document).on('mouseout', function (e) {
        if (saidaMostrada || !podeMostrarSaida || e.relatedTarget || e.clientY > 10) return;
        saidaMostrada = true;
        marcarSaida();
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalSaida')).show();
    });
});
