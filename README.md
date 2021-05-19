# OAuth Final SPA

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/f2c5ede8739440599096fc25010ab6f6)](https://www.codacy.com/gh/gary-archer/oauth.websample.final/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=gary-archer/oauth.websample.final&amp;utm_campaign=Badge_Grade)
 
[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/oauth.websample.final/badge.svg?targetFile=spa/package.json)](https://snyk.io/test/github/gary-archer/oauth.websample.final?targetFile=spa/package.json)

### Overview

An OpenID Connect secured ReactJS Typescript SPA, which aims for the cleanest overall architecture.\
The SPA interfacts with an [OAuth Proxy API](https://github.com/gary-archer/oauth.webproxyapi) as part of a `Back End for Front End` solution.

### Main Features

The overall objective is to separate Web and API concerns and meet our [Web Architecture Goals](https://authguidance.com/2017/09/08/goal-1-requirements/):

- The SPA's static content is deployed to 20 global locations with low cost and maintenance
- The SPA is in full control of usability aspects, such as actions before and after redirects
- The SPA's web content can potentially be composed into other apps, such as those of business partners
- The Proxy API is a small, easy to manage microservice, that is developed once and then should not change

### Deployed Solution

The SPA is deployed to the AWS Cloud and any reader can sign in via the [Quick Start Page](https://authguidance.com/home/code-samples-quickstart/):

* AWS CloudFront is used as the SPA's Content Delivery Network
* The OAuth Proxy API runs as a Serverless Lambda and is called via AWS API Gateway
* The SPA uses a separate [Business API](https://github.com/gary-archer/oauth.apisample.serverless) for its application data
* AWS Cognito is used as the default Authorization Server, though all code is standards based

### Blog Posts

* See the [Final SPA Overview](https://authguidance.com/2019/04/07/local-ui-setup) for a summary of behaviour
* See the [Final SPA Instructions](https://authguidance.com/2019/04/08/how-to-run-the-react-js-spa) for details on how to run the code
* See the [Web Content Delivery](https://authguidance.com/2018/12/02/spa-content-deployment) post for details on Cloudfront deployment
* See the [Final HTTP Messages](https://authguidance.com/2020/05/24/spa-and-api-final-http-messages) for a detailed technical workflow

### Same Site Cookies

The Proxy API writes a cookie storing a refresh token, which the SPA sends during OAuth requests.\
The cookie has these properties to ensure good security and to limit the scope of the Proxy API:

- HTTP Only
- Secure
- AES 256 encrypted
- SameSite = strict
- Domain = .authsamples.com
- Path = /proxy/spa

This cookie only comes into play during OAuth related calls to the Proxy API at https://api.authsamples.com/proxy/spa. \
It is not used during requests for Web or API resources, so that the SPA's main functionality is cookieless.

### Access Tokens in the Browser

The sample keeps options open about use of access tokens in the browser.\
This can potentially enable more advanced scenarios related to composing web content across domains.

The SPA sends the same site cookie to the Proxy API to get an access token, then calls business APIs with it.\
The SPA only uses tokens in direct HTTPS calls to APIs, and the following behaviour is avoided:

- Storing tokens in HTML5 storage
- Sending tokens between iframes
- Returning tokens to the SPA as a login result

The SPA also uses a Content Security Policy to restrict allowed domains for Javascript and HTTP calls.\
Future standards such as [Demonstrable Proof of Possession](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-dpop) may further stengthen use of tokens in the browser.

### Design Variations

Some companies may prefer to double hop all API calls via the Proxy API, so that tokens are never available to Javascript.\
This may make stakeholders feel that security is better, though browser security with cookies is also imperfect.

The sample could be easily adapted to double hop API calls, though this can result in some undesired behaviour.\
In particular the Proxy API may need to change often and deal with more web concerns than it should.

Similarly it may be more convenient for developers to include the OAuth Proxy Logic in the Web Host.\
This tends to lead to problems later though, such as preventing the use of a Content Delivery Network.

## Local Developer Setup

Build the SPA static content:

- git clone https://github.com/gary-archer/oauth.websample.final
- cd oauth.websample.final/spa
- npm install && npm run build

Serve it via the Web Host, which listens at https://web.mycompany.com/spa:

- cd ../webhost
- npm install && npm start

Run the Proxy API, which listens at https://api.mycompany.com:444/proxy. \
On a developer workstation, the same site cookie is then issued to the `.mycompany.com`domain:

- git clone https://github.com/gary-archer/oauth.webproxyapi
- cd oauth.webproxyapi
- npm install && npm start

Browse to https://web.mycompany.com/spa and login with one of these credentials.\
The API Authorization behind the sample demonstrates use of a domain specific array claim:

| User | Credential | Allowed Access |
| ---- | ---------- | -------------- |
| guestuser@mycompany.com | Password1 | The user can only see data from US regions |
| guestadmin@mycompany.com | Password1 | The user can see data from additional regions |
 
### Key Classes

* The [SPA WebAuthenticator Class](https://github.com/gary-archer/oauth.websample.final/blob/feature/revamp/spa/src/plumbing/oauth/web/webAuthenticator.ts) demonstrates the technically simple front end security
* The [Proxy API Authorizer Class](https://github.com/gary-archer/oauth.webproxyapi/blob/main/src/core/services/authorizer.ts) provides an outline of the more complex back end security
 
### SSL Certificates

* Certificates in the certs folder originate from the [OAuth Development Certificates](https://github.com/gary-archer/oauth.developmentcertificates) repository
