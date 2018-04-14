# AWS Mobile Ionic Starter for Facebook Grant Flow
This project is a fork of the <a href="https://github.com/aws-samples/aws-mobile-ionic-sample">aws-mobile-ionic-sample</a> from aws, created to handle the token refresh when Facebook is used as Itentyty provider, i.e. to enable the <a href="https://developer.amazon.com/docs/login-with-amazon/authorization-code-grant.html">Authorization Grant Flow</a> when loggin in with <a href="www.facebook.com">Facebook</a>.

Please, if you have suggestions, make a PR.

## Prerequisites

These <a href="https://github.com/aws-samples/aws-mobile-ionic-sample#prerequisites">prerequisites</a> plus:
- A working Facebook app
- <a href="https://yarnpkg.com/">YARN</a>

## Instructions

Assumptions:
<span id="configfile"></span>In the following, consider the 'config file' to be the `client/src/assets/aws_config.js` file

Clone this repository: `https://github.com/SimoneMSR/aws-mobile-ionic-facebook-auth-grant-flow`

### AWS side
- log in to aws console
- go to cognito -> manage my user pool
- create/go to your **User Pool**
- take note of your User Pool ID and set to this value the `aws_user_pools_id` variable in the <a href="#configfile">config file</a>
- got to federation-> identity providers -> select facebook
- add appId and appSecret of your Facebook app
- set profile and email as user info to be read (and other if you need)
- go to federation -> attribute mapping
- map the email to be the facebook Email
- go to general settings -> app clients
- create/select your app and take note of the appID and set to this value the `aws_app_client_id` variable it in the <a href="#configfile">config file</a>
- go to app client settings and scroll to you selected app
- enable all identity providers
- set the callback URL to be http://localhost:8100
- flag the Allowed OAuth Flows  -> Authorization Code Grant
- flag the Allowed OAuth Scopes -> `email`, `openid`
- go to app integration -> domain name
- set the `aws_domain_name variable` to the domain name in the <a href="#configfile">config file</a>
- got to cognito-> manage federate identities -> your identity pool
- edit identity pool
- make the `aws_cognito_identity_pool_id variable` in the <a href="#configfile">config file</a>  to be you identity pool id
- go to authentication providers -> facebook
- set the app id
- take note of the region of you Identity Pool and set accordingly the value of the variable `aws_cognito_region` in the <a href="#configfile">config file</a>

### Facebook

- go to your developer account -> you app
- add the Product 'Facebook Login'
- go to Product settings
- rembember the `aws_domain_name` variable you set beforehand in the <a href="#configfile">config file</a>
- set the Redirect URI as aws_domain_name`/oauth2/idpresponse`
- enable access from Mobile
