import {Injectable} from '@angular/core'
import {Http, Request, Response} from '@angular/http'
import { Observable } from 'rxjs/Observable'
import * as aws4 from 'aws4'

let Sigv4HttpFactory = (http:Http) => { return new Sigv4Http(http) }

export let Sigv4HttpProvider = {
  provide: Sigv4Http,
  useFactory: Sigv4HttpFactory,
  deps: [Http]
}

let DEFAULT_TYPE = 'application/json'

@Injectable()
export class Sigv4Http {

  parser = document.createElement('a')

  constructor(private http: Http){}

  public get(endpoint, path, creds): Observable<Response> { return this.request({ verb: 'GET', endpoint: endpoint, path: path }, creds) }
  public post(endpoint, path, body, creds): Observable<Response> { return this.request({ verb: 'POST', endpoint: endpoint, path: path, body: body }, creds) }
  public put(endpoint, path, body, creds): Observable<Response> { return this.request({ verb: 'PUT', endpoint: endpoint, path: path, body: body }, creds) }
  public del(endpoint, path, creds): Observable<Response> { return this.request({ verb: 'DELETE', endpoint: endpoint, path: path }, creds) }

  public request(request, credentials): Observable<Response> {
    return this._request(request, credentials)//.concatAll().share()
  }

  private _request (request, credentials) : Observable<Response> {
    let reqEndpoint = /(^https?:\/\/[^\/]+)/g.exec(request.endpoint)[1]
    let reqPathComponent = request.endpoint.substring(reqEndpoint.length)
    let verb = request.verb
    let path = reqPathComponent + '/' + request.path
    let headers = request.headers || {}

    //If the user has not specified an override for Content type the use default
    if (headers['Content-Type'] === undefined) { headers['Content-Type'] = DEFAULT_TYPE }

    //If the user has not specified an override for Accept type the use default
    if (headers['Accept'] === undefined) { headers['Accept'] = DEFAULT_TYPE }

    let body = request.body
    // override request body and set to empty when signing GET requests
    body = (body === undefined || verb === 'GET') ? '' : JSON.stringify(body)

    //If there is no body remove the content-type header so it is not included in SigV4 calculation
    if (body === '' || body === undefined || body === null) { delete headers['Content-Type'] }

    this.parser.href = reqEndpoint

    let aws4Options = {
      host: this.parser.hostname,
      path: path,
      method: verb,
      headers: headers,
      body: body
    }

    let aws4Sign = aws4.sign(
      aws4Options,
      {secretAccessKey: credentials.secretAccessKey, accessKeyId: credentials.accessKeyId, sessionToken: credentials.sessionToken}
    )
    aws4Sign.url = reqEndpoint + path
    if(headers['Content-Type'] === undefined) { headers['Content-Type'] = DEFAULT_TYPE }
    delete headers['Host']
    delete headers['Content-Length']
    console.log(aws4Sign)
    return this.http.request(new Request(aws4Sign))
  }
}
