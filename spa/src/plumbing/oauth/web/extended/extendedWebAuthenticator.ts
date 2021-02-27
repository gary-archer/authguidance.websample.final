import {UserManager, UserManagerSettings, WebStorageStateStore} from 'oidc-client';
import {WebAuthenticator} from '../webAuthenticator';
import {WebAuthenticatorOptions} from '../webAuthenticatorOptions';
import {ExtendedUserManager} from './extendedUserManager';
import {HybridTokenStorage} from './hybridTokenStorage';
import {WebReverseProxyClient} from './webReverseProxyClient';

/*
 * Extends the standard authenticator to handle refresh tokens stored in encrypted HTTP only cookies
 */
export class ExtendedWebAuthenticator extends WebAuthenticator {

    private _extendedUserManager?: ExtendedUserManager;
    private readonly _webReverseProxyClient: WebReverseProxyClient;

    public constructor(options: WebAuthenticatorOptions) {

        super(options);

        // Use a custom option to store OIDC state, but not tokens, in local storage
        // This is needed to make the library send token refresh grant messages for new browser tabs
        (this._options.settings as any).userStore = new WebStorageStateStore({ store: new HybridTokenStorage() });

        // Create an object to manage calls vui the web reverse proxy endpoint
        this._webReverseProxyClient = new WebReverseProxyClient(
            this._options.configuration.clientId,
            this._options.webBaseUrl,
            this._options.configuration.reverseProxyPath);

        this._setupDerivedCallbacks();
    }

    /*
     * Override the base class to make the refresh token in the HTTP only cookie act expired
     */
    public async expireRefreshToken(): Promise<void> {

        await super.expireAccessToken();
        await this._webReverseProxyClient.expireRefreshToken();
    }

    /*
     * Create a custom user manager used to subclass certain OAuth events
     */
    protected _createUserManager(settings: UserManagerSettings): UserManager {

        this._extendedUserManager = new ExtendedUserManager(settings, this._onSignInResponse);
        return this._extendedUserManager;
    }

    /*
     * Updates needed to proxy refresh tokens in an HTTP only cookie, along with a CSRF field
     */
    protected async _onInitialise(): Promise<void> {

        // Update the metadata's token endpoint field to point to that of the web reverse proxy
        // Note that metadata is stored against the settings object and the MetadataService is not properly overridable
        const settings = this._extendedUserManager!.settings;
        await this._extendedUserManager!.metadataService.getMetadata();
        settings.metadata!.token_endpoint = this._webReverseProxyClient.getTokenEndpoint();

        // Initialise the web reverse proxy, so that it sends a CSRF field later
        this._webReverseProxyClient.initialise();
    }

    /*
     * Handle the response of the authorization code grant message
     */
    private _onSignInResponse(response: any): void {
        this._webReverseProxyClient.storeCsrfFieldFromProxy(response);
    }

    /*
     * When a user session ends, ensure that the refresh token cookie is removed
     */
    protected async _onSessionExpiring(): Promise<void> {
        await this._webReverseProxyClient.clearRefreshToken();
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private _setupDerivedCallbacks(): void {
        this._onSignInResponse = this._onSignInResponse.bind(this);
    }
}