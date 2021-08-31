# olx-br

Esse é um pacote simples de integração com a [Api Importação de Anúncios](https://github.com/olxbr/ad_integration) da OLX Brasil hospedado no [NPM](https://www.npmjs.com/package/olx-br). Eu não tenho nenhuma afiliação com a OLX.

## Instalação

```bash
npm i olx-br
```

## Inicialização no Node.js

```javascript
import Olx from 'olx-br';
const olx = new Olx(client_id, client_secret, redirect_uri);
```

## Utilização

Para correta compreensão dos métodos, é necessário conhecer o funcionamento da [API da OLX](https://github.com/olxbr/ad_integration/blob/master/api/README.md).

```javascript
//obter token de acesso de usuário 
olx.getToken(code, (err, res) => { /* 'code' é obtido no processo de autenticação, saiba mais em https://github.com/olxbr/ad_integration/blob/master/api/oauth.md */
  if (err) console.warn(err);
  else {
    const access_token = res.access_token;
  }
});

//publicar um novo anúncio
const anuncio = { "subject": "Peça de carro em ótimo estado", ... } /* veja a estrutura completa de um anuncio em https://github.com/olxbr/ad_integration/blob/master/api/import.md */
olx.putAnuncios(access_token, [anuncio], (err, res) => {
  if (err) console.warn(err);
  else {
    if (res.statusCode == 0) { //anuncio foi importado e será processado
      const token_anuncio = res.token; //token usado para buscar o status do anuncio
    }
  }
});

//obter status da publicação de um anúncio
olx.getStatusAnuncio(access_token, token_anuncio, (err, res) => {
  if (err) console.warn(err);
  else {
    const status = res.status; // valores possíveis: pending, error, queued, accepted, refused
  }
});

//obter a lista de anúncios ativos do usuário
olx.getAnuncios(access_token, (err, res) => {
  if (err) console.warn(err);
  else {
    const anuncios_ativos = res;
  }
});
```
A lista completa de métodos pode ser vista [aqui](https://github.com/ViniciusRossmann/olx-br/blob/main/src/index.ts).

## Contato

- Autor: Vinícius Rossmann Nunes
- Contato: viniciusrossmann@gmail.com
