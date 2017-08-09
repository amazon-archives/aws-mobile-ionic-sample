import { Injectable } from '@angular/core'

declare const aws_cognito_region
declare const aws_user_pools_id
declare const aws_user_pools_web_client_id
declare const aws_cognito_identity_pool_id
declare const aws_cloud_logic_custom

@Injectable()
export class AwsConfig {
  public load () {
    let aws_cloud_logic_custom_obj = JSON.parse(aws_cloud_logic_custom)
    return {
      'region': aws_cognito_region, // region you are deploying (all lower caps, e.g: us-east-1)
      'userPoolId': aws_user_pools_id, // your user pool ID
      'appId': aws_user_pools_web_client_id, // your user pool app ID
      'idpURL': `cognito-idp.${aws_cognito_region}.amazonaws.com`, // cognito idp url
      'identityPool': aws_cognito_identity_pool_id, // your federated identity pool ID
      'APIs': aws_cloud_logic_custom_obj.reduce((m, v) => { m[v.name] = v.endpoint; return m }, {})
    }
  }
}
