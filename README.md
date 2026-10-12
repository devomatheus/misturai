# MisturAI

Simulador web de tingimento de tinta branca com os corantes da linha **GLASU!**.

Escolha a tinta base e o volume da lata, adicione gotas de cada corante e veja na hora:

- a cor resultante e a simulação em um ambiente;
- a receita da mistura;
- a lista de compra de embalagens (frascos de 50 mL);
- uma ficha exportável em PDF.

## Como usar

O projeto é 100% estático, sem build nem instalação.

- Abra o `index.html` direto no navegador, **ou**
- sirva a pasta com qualquer servidor estático:

```bash
python -m http.server
```

e acesse `http://localhost:8000`.

> As bibliotecas (Bootstrap, jQuery e jsPDF) são carregadas via CDN. Sem internet, a exportação em PDF não funciona.

## Estrutura

```text
index.html          Marcação da página
assets/css/         Estilos (BEM sobre Bootstrap)
assets/js/app.js    Lógica de cálculo, interface e PDF
assets/js/logo.js   Logo em base64 usada no PDF
assets/images/      Imagens e logos
```

## Licença

[MIT](LICENSE)
