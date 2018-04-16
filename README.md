# AWS Mobile Ionic Starter for Facebook Grant Flow
This project is a fork of the <a href="https://github.com/aws-samples/aws-mobile-ionic-sample">aws-mobile-ionic-sample</a> from aws, created to handle the token refresh when Facebook is used as Itentyty provider, i.e. to enable the <a href="https://developer.amazon.com/docs/login-with-amazon/authorization-code-grant.html">Authorization Grant Flow</a> when loggin in with <a href="www.facebook.com">Facebook</a>.

Please, if you have suggestions, make a PR.

## Prerequisites

These <a href="https://github.com/aws-samples/aws-mobile-ionic-sample#prerequisites">prerequisites</a> plus:
- A working Facebook app
- <a href="https://yarnpkg.com/">YARN</a>

## Instructions

<p id="configfile">Assumptions:</p>

In the following, consider the 'config file' to be the `client/src/assets/aws_config.js` file

Clone this repository: `https://github.com/SimoneMSR/aws-mobile-ionic-facebook-auth-grant-flow`

### AWS side
1. log in to aws console
1. go to cognito -> manage my user pool
1. create/go to your **User Pool**
1. take note of your User Pool ID and set to this value the `aws_user_pools_id` variable in the <a href="#configfile">config file</a>
1. got to federation-> identity providers -> select facebook
1. add appId and appSecret of your Facebook app
1. set profile and email as user info to be read (and other if you need)
1. go to federation -> attribute mapping
1. map the email to be the facebook Email
1. go to general settings -> app clients
1. create/select your app and take note of the appID and set to this value the `aws_app_client_id` variable it in the <a href="#configfile">config file</a>
1. go to app client settings and scroll to you selected app
1. enable all identity providers
1. set the callback URL to be http://localhost:8100
1. flag the Allowed OAuth Flows  -> Authorization Code Grant
1. flag the Allowed OAuth Scopes -> `email`, `openid`
1. go to app integration -> domain name
1. set the `aws_domain_name` variable to the domain name in the <a href="#configfile">config file</a>
1. got to cognito-> manage federate identities -> your identity pool
1. edit identity pool
1. make the `aws_cognito_identity_pool_id` variable in the <a href="#configfile">config file</a>  to be you identity pool id
1. go to authentication providers -> facebook
1. set the app id
1. take note of the region of you Identity Pool and set accordingly the value of the variable `aws_cognito_region` in the <a href="#configfile">config file</a>

### Facebook

1. go to your developer account -> you app
2. add the Product 'Facebook Login'
1. go to Product settings
1. rembember the `aws_domain_name` variable you set beforehand in the <a href="#configfile">config file</a>
1. set the Redirect URI as aws_domain_name`/oauth2/idpresponse`
1. enable access from Mobile

## Build

1. yarn install
2. ionic build
