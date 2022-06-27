import { getData } from "/login/fetch.mjs";
import { WATCHLIST } from "../robot/stocks.mjs";

function renderStreams(stream) {
    if (stream.notify) {
        document.getElementById('heartbeat').textContent = new Date(Number(stream.notify[0].heartbeat)).toLocaleString();
    } else if (stream.response) {
        handleResponse(stream.response[0]);

        const li = document.createElement('li');
        const ul = document.createElement('ul');
        document.getElementById('streams').prepend(li);
        li.append(ul);
        
        for (const prop in stream.response[0]) {
            const li = document.createElement('li');
            const b = document.createElement('b');
            const span = document.createElement('span');
            b.textContent = prop + ": ";

            if (prop === 'timestamp') {
                span.textContent = new Date(stream.response[0].timestamp).toLocaleString();
            } else if (prop === 'content') {
                span.textContent = JSON.stringify(stream.response[0].content);
            } else {
                span.textContent = stream.response[0][prop];
            }

            li.append(b, span);
            ul.append(li);
        }
    }
}

function handleResponse(response) {
    if (response.content.code === 3 || response.content.code === 20) {
        openStream();
    } else {
        switch (response.service) {
            case "ADMIN":
                if (response.command === 'LOGIN') document.getElementById('heartbeat').style.color = 'green';
                if (response.command === 'LOGOUT') socket.close();
                break;
        }
    }
}

/////////////

let socket, loginRequest;

export function closeStream() {
    const logoutRequest = {
        "requests": [ 
            {
                "service": "ADMIN", 
                "requestid": 10, 
                "command": "LOGOUT", 
                "account": loginRequest.account,
                "source": loginRequest.source, 
                "parameters": {}
            }
        ]
    };

    if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(logoutRequest));
}

export async function openStream() {
    loginRequest = await getLoginRequest();
    const stocks = WATCHLIST.join(",").replace(".", "/");

    const dataRequests = {
        "requests": [ loginRequest,
            {
                "service": "ADMIN",
                "requestid": 1,
                "command": "QOS",
                "account": loginRequest.account,
                "source": loginRequest.source,
                "parameters": {
                    "qoslevel": "2"
                }
            },
            {
                "service": "NEWS_HEADLINE", 
                "requestid": 2, 
                "command": "SUBS", 
                "account": loginRequest.account,
                "source": loginRequest.source,
                "parameters": {
                    "keys": stocks, 
                    "fields": [...Array(10).keys()].join(",")
                }
            },
            {
                "service": "QUOTE",
                "requestid": 3,
                "command": "SUBS",
                "account": loginRequest.account,
                "source": loginRequest.source,
                "parameters": {
                    "keys": stocks,
                    "fields": [...Array(52).keys()].join(",")
                }
            },
            {
                "service": "NASDAQ_BOOK",
                "requestid": 4,
                "command": "SUBS",
                "account": loginRequest.account,
                "source": loginRequest.source,
                "parameters": {
                    keys: stocks,
                    fields: [...Array(3).keys()].join(",")
                }
            },
            {
                "service": "LISTED_BOOK", // nyse
                "requestid": 5,
                "command": "SUBS",
                "account": loginRequest.account,
                "source": loginRequest.source,
                "parameters": {
                    keys: stocks,
                    fields: [...Array(3).keys()].join(",")
                }
            }
        ]
    };

    socket = new WebSocket("wss://" + loginRequest.streamerSocketUrl + "/ws");
    socket.onopen = event => socket.send(JSON.stringify(dataRequests));
    socket.onmessage = event => renderStreams(JSON.parse(event.data));
    socket.onclose = event => document.getElementById('heartbeat').style.color = 'red';
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
            "version": "1.0"
        },
        streamerSocketUrl: userPrincipalsResponse.streamerInfo.streamerSocketUrl
    };

    return loginRequest;
}

async function getUserPrincipals() {
    const user = await getData('personal', 'https://api.tdameritrade.com/v1/userprincipals', { fields: 'streamerSubscriptionKeys,streamerConnectionInfo' });
    return user;
}

function jsonToQueryString(json) {
    return Object.keys(json).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(json[key])).join('&');
}