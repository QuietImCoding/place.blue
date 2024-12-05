let domain, username, did, jwt, refresh;
let authIndicator = document.getElementById("account")

// Function to get a jwt from a PDS
function getToken(provider, handle, password) { 
    let response = fetch(provider + '/xrpc/com.atproto.server.createSession', {
    method: "POST",
    body: JSON.stringify({
        identifier: handle,
        password: password,
    }),
    headers: {
        "Content-type": "application/json; charset=UTF-8"
    }
    }).then((response) => response.json())
    .then((json) => {
        domain = provider;
        username = json.handle;
        did = json.did;
        jwt = json.accessJwt;
        refresh = json.refreshJwt
        authIndicator.innerText = `(logged in as ${handle})`
        authIndicator.style.color = "green"
        setInterval(refreshToken, 60000)
    });
}

// Function to refresh your jwts
function refreshToken() {
    let response = fetch(domain + '/xrpc/com.atproto.server.refreshSession', {
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Authorization": "Bearer " + refresh
        }
        }).then((response) => response.json())
        .then((json) => {
            jwt = json.accessJwt;
            refresh = json.refreshJwt
            console.log("REFRESHED JWT")
        });
}

// Function to generate resource ID
// i am scared of this one
function generateTID() {
    return( 
        Conversions.base32.encode(Date.now().toString())
            .replaceAll("=", "")
            .slice(-13)
            .toLowerCase()
    );
}

// Just put some json on the server they said
// it will be fun, they said (they is David Buchanan)
function publishPixel(xval, yval, cval) {
    let response = fetch(domain + '/xrpc/com.atproto.repo.putRecord', {
        method: "POST",
        body: JSON.stringify({
            repo: did,
            collection: "blue.place.pixel",
            rkey: generateTID(),
            record: {
                x: xval,
                y: yval,
                color: cval
            }
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
            "Authorization": "Bearer " + jwt
        }
        }).then((response) => response.json())
        .then((json) => {
            console.log(json)
        });

}

// tries to get username for a DID
function didLookup(queryDID) {
    let response = fetch('https://plc.directory/'+ queryDID, {
        method: "GET",
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        }
        }).then((response) => response.json())
        .then((json) => {
            if ( json.alsoKnownAs.length > 0 ){
                console.log(`^ Last pixel by ${json.alsoKnownAs[0]}`); 
            } 
        });

}


// When you click the auth button, do auth
document.getElementById("auth").addEventListener("click", () => {
    getToken(
        document.getElementById("provider").value,
        document.getElementById('handle').value,
        document.getElementById('password').value
    )
})

// Jetstream subscription to blue.place.pixel records!
let socketURI = 'wss://jetstream2.us-east.bsky.network/subscribe\?wantedCollections=blue.place.pixel'
subscription = new WebSocket(socketURI);
subscription.onmessage = e => {
    let msgData = JSON.parse(e.data);
    // Filter for only commits
    if ( msgData.type = "com" && msgData.kind == "commit") {
        let record = msgData.commit.record
        console.log(`User: ${msgData.did} created a type ${record.color} pixel at (${record.x}, ${record.y})`)
        drawPixel(ctx, record.x, record.y, record.color);
    }
};