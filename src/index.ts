import { authApi, appApi } from "./services/api";

class Olx {
    client_id: string;
    client_secret: string;
    redirect_uri: string;

    constructor(client_id: string, client_secret: string, redirect_uri: string) {
        this.client_id = client_id
        this.client_secret = client_secret;
        this.redirect_uri = redirect_uri;
    }

    getAuthUrl(autoupload: boolean = true, state?: string) {
        let scope = 'basic_user_info';
        if (autoupload) scope += '%20autoupload';
        let query = `response_type=code&client_id=${this.client_id}&redirect_uri=${this.redirect_uri}&scope=${scope}`;
        if (state) query += `&state=${state}`;
        return authApi.getUri() + '/oauth?' + query;
    }

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
                return callback(err, null);
            })
    }

    async getAnuncios(access_token: string, callback: (error: Error | null, data: Object | null) => void) {
        appApi.post("/autoupload/published", { access_token })
            .then((result) => {
                callback(null, result.data);
            })
            .catch((err) => {
                return callback(err, null);
            })
    }

    async getBasicInfo(access_token: string, callback: (error: Error | null, data: Object | null) => void) {
        appApi.post("/oauth_api/basic_user_info", { access_token })
            .then((result) => {
                callback(null, result.data);
            })
            .catch((err) => {
                return callback(err, null);
            })
    }

    async putAnuncios(access_token: string, anuncios: Object[], callback: (error: Error | null, data: Object | null) => void) {
        var data = { access_token, "ad_list": anuncios };
        appApi.put("/autoupload/import", data)
            .then((result) => {
                callback(null, result.data);
            })
            .catch((err) => {
                return callback(err, null);
            })
    }

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
                return callback(err, null);
            })
    }

    async getStatusAnuncio(access_token: string, token_anuncio: string, callback: (error: Error | null, data: Object | null) => void) {
        appApi.post(`/autoupload/import/${token_anuncio}`, { access_token })
            .then((result) => {
                callback(null, result.data);
            })
            .catch((err) => {
                return callback(err, null);
            })
    }
}

export = Olx;