# authguidance.websample.final

### Overview

* The completed SPA code sample using OAuth 2.0 and Open Id Connect, referenced in my blog at https://authguidance.com
* **The goals of this sample are a technology update and to simplify the local web development setup**

### Details

* See the [ReactJS SPA Overview](https://authguidance.com/2019/04/07/local-ui-setup/) for a summary of behaviour
* See the [ReactJS SPA Instructions](https://authguidance.com/2019/04/08/how-to-run-the-react-js-spa/) for details on how to run the code
* See the [Web Content Delivery Write Up](https://authguidance.com/2018/12/02/spa-content-deployment/) for instructions on cloud deployment

### Programming Languages

* TypeScript and ReactJS are used to implement the SPA

### SPA Middleware Used

* The [Oidc-Client Library](https://github.com/IdentityModel/oidc-client-js) is used to implement SPA logins and for token handling

### Hosting

* AWS API Gateway is used to host the SPA's OAuth 2.0 Secured API
* AWS Cognito is used as the Authorization Server for the SPA and API
* AWS CloudFront is used as the SPA's Content Delivery Network
