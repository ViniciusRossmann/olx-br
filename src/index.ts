/*!
 * olx-br
 * Copyright(c) 2021 Vinícius Rossmann Nunes
 * MIT Licensed
 */

import { authApi, appApi } from "./services/api";

class Olx {
    client_id: string;
    client_secret: string;
    redirect_uri: string;

    /**
     * @constructor
     *
     * @param {string} client_id
     *   A identificação do cliente que foi fornecida pelo olx.com.br através do registro da aplicação.
     * @param {string} client_secret
     *   Chave de segurança fornecida pela OLX após o registro da aplicação.
     * @param {string} redirect_uri
     *   Endpoint do cliente que será alvo de redirecionamento no processo de autenticação. Deve ter sido fornecida no registro da aplicação.
     */
    constructor(client_id: string, client_secret: string, redirect_uri: string) {
        this.client_id = client_id
        this.client_secret = client_secret;
        this.redirect_uri = redirect_uri;
    }

    /**
     * Obtém a URL de autenticação da OLX, onde será solicitada a autorização do usuário.
     * @param {boolean} [autoupload=true] Requerir acesso ao sistema de autouploads (Envio de anúncios de forma automática). Caso falso, terá apenas acesso aos dados básicos do usuário.
     * @param {string} state Fornece qualquer valor que pode ser útil a aplicação ao receber a resposta de requisição.
     * @returns {string} URL a ser usada para obter a autorização da OLX. 
     */
    getAuthUrl(autoupload: boolean = true, state?: string): string {
        let scope = 'basic_user_info';
        if (autoupload) scope += '%20autoupload';
        let query = `response_type=code&client_id=${this.client_id}&redirect_uri=${this.redirect_uri}&scope=${scope}`;
        if (state) query += `&state=${state}`;
        return authApi.defaults.baseURL + '/oauth?' + query;
    }

    /**
     * Gera um token de acesso a partir do código gerado pelo serviço de autenticação.
     * @param {string} code Código de autorização gerado pelo servidor de autenticação.
     * @param {void} callback Retorna a resposta da requisição
     */
    async getToken(code: string, callback: (error: Error | null, data: Object | null) => void) {
        const params = new URLSearchParams();
        params.append('code', code);
        params.append('client_id', this.client_id);
        params.append('client_secret', this.client_secret);
        params.append('redirect_uri', this.redirect_uri);
        params.append('grant_type', "authorization_code");

        authApi.post("/oauth/token", params)
            .then((result) => {
                callback(null, result.data);
            })
            .catch((err) => {
                return callback(err.response?.data || err, null);
            })
    }

    /**
     * Obtém a lista de anúncios ativos do usuário.
     * @param {string} access_token Chave de acesso do usuário
     * @param {void} callback Retorna a resposta da requisição
     */
    async getAnuncios(access_token: string, callback: (error: Error | null, data: Object | null) => void) {
        appApi.post("/autoupload/published", { access_token })
            .then((result) => {
                callback(null, result.data);
            })
            .catch((err) => {
                return callback(err.response?.data || err, null);
            })
    }

    /**
     * Obtém os dados básicos do usuário (nome e email)
     * @param access_token Chave de acesso do usuário
     * @param {void} callback Retorna a resposta da requisição
     */
    async getBasicUserInfo(access_token: string, callback: (error: Error | null, data: Object | null) => void) {
        appApi.post("/oauth_api/basic_user_info", { access_token })
            .then((result) => {
                callback(null, result.data);
            })
            .catch((err) => {
                return callback(err.response?.data || err, null);
            })
    }

    /**
     * Faz upload de uma lista de anúncios a serem publicados 
     * @param {string} access_token Chave de acesso do usuário
     * @param {Object[]} anuncios Array com os anúncios a serem publicados
     * @param callback Retorna a resposta da requisição
     */
    async putAnuncios(access_token: string, anuncios: Object[], callback: (error: Error | null, data: Object | null) => void) {
        var data = { access_token, "ad_list": anuncios };
        appApi.put("/autoupload/import", data)
            .then((result) => {
                callback(null, result.data);
            })
            .catch((err) => {
                return callback(err.response?.data || err, null);
            })
    }

    /**
     * Apaga uma lista de anúncios publicados
     * @param {string} access_token Chave de acesso do usuário
     * @param {string[]} id_anuncios Array com ids doa anúncios a serem excluidos
     * @param {void} callback Retorna a resposta da requisição
     */
    async deleteAnuncios(access_token: string, id_anuncios: string[], callback: (error: Error | null, data: Object | null) => void) {
        let anuncios: Object[] = [];
        id_anuncios.forEach((id: string) => {
            anuncios.push({
                id,
                operation: "delete"
            });
        });
        var data = { access_token, "ad_list": anuncios };
        appApi.put("/autoupload/import", data)
            .then((result) => {
                callback(null, result.data);
            })
            .catch((err) => {
                return callback(err.response?.data || err, null);
            })
    }

    /**
     * Obtém o status da publicação de um anúncio que foi importado
     * @param {string} access_token Chave de acesso do usuário
     * @param {string} token_anuncio Identificação do anúncio. Obtido após a importação pelo método putAnuncios()
     * @param {void} callback Retorna a resposta da requisição
     */
    async getStatusAnuncio(access_token: string, token_anuncio: string, callback: (error: Error | null, data: Object | null) => void) {
        appApi.post(`/autoupload/import/${token_anuncio}`, { access_token })
            .then((result) => {
                callback(null, result.data);
            })
            .catch((err) => {
                return callback(err.response?.data || err, null);
            })
    }

    /**
     * Obtem o catálogo de marcas e modelos de carros que podem ser publicados na OLX
     * @param {string} access_token Chave de acesso do usuário
     * @param {number|null} id_marca id da marca a ser consultada. Caso nulo, retorna a lista de todas as marcas.
     * @param {number|null} id_modelo id do modelo a ser consultado. Caso nulo, retorna a lista de todos os modelos da marca.
     * @param {void} callback Retorna a resposta da requisição
     */
    async getCarroInfo(access_token: string, id_marca: number | null, id_modelo: number | null, callback: (error: Error | null, data: Object | null) => void) { 
        var uri = '/autoupload/car_info';
        if (id_marca) {
            uri+= `/${id_marca}`;
            if (id_modelo) uri+= `/${id_modelo}`;
        }
        appApi.post(uri, { access_token })
            .then((result) => {
                callback(null, result.data);
            })
            .catch((err) => {
                return callback(err.response?.data || err, null);
            })
    }

    /**
     * Obtem o catálogo de marcas e modelos de motos que podem ser publicados na OLX
     * @param {string} access_token Chave de acesso do usuário
     * @param {number|null} id_marca id da marca a ser consultada. Caso nulo, retorna a lista de todas as marcas.
     * @param {number|null} id_modelo id do modelo a ser consultado. Caso nulo, retorna a lista de todos os modelos da marca.
     * @param {void} callback Retorna a resposta da requisição
     */
    async getMotoInfo(access_token: string, id_marca: number | null, id_modelo: number | null, callback: (error: Error | null, data: Object | null) => void) { 
        var uri = '/autoupload/moto_info';
        if (id_marca) {
            uri+= `/${id_marca}`;
            if (id_modelo) uri+= `/${id_modelo}`;
        }
        appApi.post(uri, { access_token })
            .then((result) => {
                callback(null, result.data);
            })
            .catch((err) => {
                return callback(err.response?.data || err, null);
            })
    }

    /**
     * Obtém a lista de cilindradas disponíveis para motos
     * @param {string} access_token Chave de acesso do usuário
     * @param {void} callback Retorna a resposta da requisição
     */
    async getMotoCilindradas(access_token: string, callback: (error: Error | null, data: Object | null) => void) { 
        appApi.post('/autoupload/moto_cubiccms_info', { access_token })
            .then((result) => {
                callback(null, result.data);
            })
            .catch((err) => {
                return callback(err.response?.data || err, null);
            })
    }
}

export = Olx;