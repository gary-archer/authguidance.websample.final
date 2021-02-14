import {OAuthConfiguration} from '../../../../configuration/oauthConfiguration';
import {ErrorHandler} from '../../../errors/errorHandler';
import {UrlHelper} from '../../../utilities/urlHelper';

/*
 * A class to manage logout via a vendor specific URL
 */
export class CustomLogoutManager {

    private readonly _webBaseUrl: string;
    private readonly _configuration: OAuthConfiguration;

    public constructor(webBaseUrl: string, configuration: OAuthConfiguration) {
        this._webBaseUrl = webBaseUrl;
        this._configuration = configuration;
    }

    /*
     * Format the Cognito specific logout URL
     */
    public getCustomLogoutUrl(): string {

        // We currently only support this provider
        if (this._configuration.authority.indexOf('cognito') === -1) {
            throw ErrorHandler.getFromLogoutUnsupported();
        }

        // Form the full logout redirect URI
        const clientId = encodeURIComponent(this._configuration.clientId);
        const logoutPath = UrlHelper.append(this._webBaseUrl, this._configuration.postLogoutRedirectUri);
        const postLogoutReturnUri = encodeURIComponent(logoutPath);

        // Upon return, loggedout.html redirects to https://web.authsamples.com/spa#loggedout
        return `${this._configuration.customLogoutEndpoint}?client_id=${clientId}&logout_uri=${postLogoutReturnUri}`;
    }
}