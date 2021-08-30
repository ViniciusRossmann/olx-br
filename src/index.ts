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

    getToken(code: string, callback: (error: Error | null, data: Object | null) => void) {
        
    }

}

export = Olx;