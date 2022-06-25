import { getData } from "/login/fetch.mjs";

let socket;

export function closeStream() {
    socket.close();
}

export async function openStream() {
    const loginRequest = await getLoginRequest();

    const dataRequests = {
        "requests": [ loginRequest,
            {
                "service": "NEWS_HEADLINE", 
                "requestid": 1, 
                "command": "SUBS", 
                "account": loginRequest.account,
                "source": loginRequest.source,
                "parameters": {
                    "keys": "GOOG", 
                    "fields": "0,1,2,3,4"
                }
            },
            {
                "service": "ACTIVES_NASDAQ", 
                "requestid": 2, 
                "command": "SUBS", 
                "account": loginRequest.account,
                "source": loginRequest.source,
                "parameters": {
                    "keys": "NASDAQ-60", 
                    "fields": "0,1"
                }
            }, 
            {
                "service": "QUOTE",
                "requestid": 3,
                "command": "SUBS",
                "account": loginRequest.account,
                "source": loginRequest.source,
                "parameters": {
                    "keys": "AAPL,MSFT",
                    "fields": "0,1,2,3,4,5,6,7,8"
                }
            },
            {
                "service": "QUOTE",
                "requestid": 4,
                "command": "SUBS",
                "account": loginRequest.account,
                "source": loginRequest.source,
                "parameters": {
                    "keys": "AAPL,MSFT",
                    "fields": "0,1,2,3,4,5,6,7,8"
                }
            }
        ]
    };

    socket = new WebSocket("wss://" + loginRequest.streamerSocketUrl + "/ws");
    socket.onopen = event => socket.send(JSON.stringify(dataRequests));
    socket.onmessage = event => console.log(event.data);
    socket.onclose = event => console.info("CLOSED");
    socket.onerror = event => console.error(event);
}

async function getLoginRequest() {
    const userPrincipalsResponse = await getUserPrincipals();

    const credentials = {
        "userid": userPrincipalsResponse.accounts[0].accountId,
        "token": userPrincipalsResponse.streamerInfo.token,
        "company": userPrincipalsResponse.accounts[0].company,
        "segment": userPrincipalsResponse.accounts[0].segment,
        "cddomain": userPrincipalsResponse.accounts[0].accountCdDomainId,
        "usergroup": userPrincipalsResponse.streamerInfo.userGroup,
        "accesslevel": userPrincipalsResponse.streamerInfo.accessLevel,
        "authorized": "Y",
        "timestamp": new Date(userPrincipalsResponse.streamerInfo.tokenTimestamp).getTime(),
        "appid": userPrincipalsResponse.streamerInfo.appId,
        "acl": userPrincipalsResponse.streamerInfo.acl
    };

    const loginRequest = {
        "service": "ADMIN",
        "command": "LOGIN",
        "requestid": 0,
        "account": userPrincipalsResponse.accounts[0].accountId,
        "source": userPrincipalsResponse.streamerInfo.appId,
        "parameters": {
            "credential": jsonToQueryString(credentials),
            "token": userPrincipalsResponse.streamerInfo.token,
            "version": "1.0",
            "qoslevel": "5"
        },
        streamerSocketUrl: userPrincipalsResponse.streamerInfo.streamerSocketUrl
    };

    return loginRequest;
}

async function getUserPrincipals() {
    const user = await getData('https://api.tdameritrade.com/v1/userprincipals', { fields: 'streamerSubscriptionKeys,streamerConnectionInfo' });
    return user;
}

function jsonToQueryString(json) {
    return Object.keys(json).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(json[key])).join('&');
}