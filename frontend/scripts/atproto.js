let domain, username, did, jwt, refresh;
let authIndicator = document.getElementById("account");

// Function to get a jwt from a PDS
function getToken(provider, handle, password) {
  let response = fetch(provider + "/xrpc/com.atproto.server.createSession", {
    method: "POST",
    body: JSON.stringify({
      identifier: handle,
      password: password,
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  })
    .then((response) => response.json())
    .then((json) => {
      domain = provider;
      username = json.handle;
      did = json.did;
      jwt = json.accessJwt;
      refresh = json.refreshJwt;
      authIndicator.innerText = `(logged in as ${handle})`;
      authIndicator.style.color = "green";
      setInterval(refreshToken, 60000);
    });
}

// Function to refresh your jwts
function refreshToken() {
  let response = fetch(domain + "/xrpc/com.atproto.server.refreshSession", {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      Authorization: "Bearer " + refresh,
    },
  })
    .then((response) => response.json())
    .then((json) => {
      jwt = json.accessJwt;
      refresh = json.refreshJwt;
      console.log("REFRESHED JWT");
    });
}

// Function to generate resource ID
// i am scared of this one
function generateTID() {
  return Conversions.base32
    .encode(Date.now().toString())
    .replaceAll("=", "")
    .slice(-13)
    .toLowerCase();
}

// Just put some json on the server they said
// it will be fun, they said (they is David Buchanan)
function publishPixel(xval, yval, cval) {
  let response = fetch(domain + "/xrpc/com.atproto.repo.putRecord", {
    method: "POST",
    body: JSON.stringify({
      repo: did,
      collection: "blue.place.pixel",
      rkey: generateTID(),
      record: {
        x: xval,
        y: yval,
        color: cval,
        createdAt: new Date().toISOString(),
      },
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      Authorization: "Bearer " + jwt,
    },
  })
    .then((response) => response.json())
    .then((json) => {
      console.log(json);
    });
}

// tries to get username for a DID
async function didLookup(queryDID) {
  let response = fetch("https://plc.directory/" + queryDID, {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  })
    .then((response) => response.json())
    .then(
      (json) => {
        if (json.alsoKnownAs.length > 0) {
          return json.alsoKnownAs[0];
        } else {
          return null;
        }
      },
      () => {
        console.log("Unable to resolve DID");
      }
    );
  return await response;
}

let eventbox = document.getElementById("events");
// THE BIG PUSH 
async function pushEvent(rid, eventdid, location, color, text = null) {
  let eventLabel = document.createElement("p");
  let colortag = document.createElement("span");
  colortag.style.backgroundColor = COLORLIST[color];
  colortag.innerText = color;
  let septag = document.createElement("hr");
  if (text != null) {
    let texttag = document.createElement("p");
    texttag.innerText = `Post text was: ${
      text.substring(0, 100) + (text.length > 100 ? "..." : "")
    }.`;
    eventLabel.innerHTML = `<a href="https://bsky.app/profile/${eventdid}/post/${rid}">${eventdid}:</a> created pixel at (${location.toString()}) with color `;
    eventLabel.appendChild(colortag);
    eventLabel.appendChild(texttag);
    eventLabel.appendChild(septag);
  } else {
    eventLabel.innerHTML = `<a href="https://pdsls.dev/at/${eventdid}/blue.place.pixel/${rid}">${eventdid}:</a> created pixel at (${location.toString()}) with color `;
    eventLabel.appendChild(colortag);
    eventLabel.appendChild(septag);
  }
  eventbox.prepend(eventLabel);
  if (eventbox.childElementCount > 10) {
    eventbox.lastChild.remove();
  }
}

// When you click the auth button, do auth
document.getElementById("auth").addEventListener("click", () => {
  getToken(
    document.getElementById("provider").value,
    document.getElementById("handle").value,
    document.getElementById("password").value
  );
});

let altstream = false;

// Jetstream subscription to blue.place.pixel records!
let socketURI =
  "wss://jetstream2.us-east.bsky.network/subscribe?wantedCollections=blue.place.pixel";
subscription = new WebSocket(socketURI);
subscription.onmessage = async (e) => {
  let msgData = JSON.parse(e.data);
  // Filter for only commits
  if ((msgData.type = "com" && msgData.kind == "commit")) {
    let record = msgData.commit.record;
    console.log(
      `User: ${msgData.did} created a type ${record.color} pixel at (${record.x}, ${record.y})`
    );
    console.log(msgData);
    if (!altstream) {
      drawPixel(ctx, record.x, record.y, record.color);
      let userID = await didLookup(msgData.did);
      pushEvent(
        msgData.commit.rkey,
        userID == null ? msgData.did : userID.slice(5),
        [record.x, record.y],
        record.color
      );
    }
  }
};

// Alternative pixel stream
let otherSocketURI =
  "wss://jetstream2.us-east.bsky.network/subscribe?wantedCollections=app.bsky.feed.post";
othersubscription = new WebSocket(otherSocketURI);
othersubscription.onmessage = async (e) => {
  let msgData = JSON.parse(e.data);
  // Filter for only commits
  if ((msgData.type = "com" && msgData.kind == "commit")) {
    let record = msgData.commit.record;
    if (record && "text" in record) {
      let color = record.text.length % 8;
      let lcount = {};
      record.text.split("").forEach((l) => {
        if (lcount[l]) lcount[l] += 1;
        else lcount[l] = 1;
      });
      let x = Math.floor(
        500 *
          Math.cos(
            Object.keys(lcount).reduce(
              (acc, val) => acc + ("aeiou".includes(val) ? lcount[val] : 0),
              0
            )
          ) **
            2
      );
      let y = Math.floor(
        500 *
          Math.cos(
            Object.keys(lcount).reduce(
              (acc, val) => acc + (!"aeiou".includes(val) ? lcount[val] : 0),
              0
            )
          ) **
            2
      );
      // console.log(`ALTERNATIVE STREAM: User: ${msgData.did} created a type ${color} pixel at (${x}, ${y})`)
      if (altstream) {
        if (Date.now() % 500 < parseInt(document.getElementById('eventspeed').value)) {
          drawPixel(ctx, x, y, color);
          let userID = await didLookup(msgData.did);
          pushEvent(
            msgData.commit.rkey,
            userID == null ? msgData.did : userID.slice(5),
            [x, y],
            color,
            record.text
          );
        }
      }
    }
  }
};

document.querySelectorAll('input[name="pixelsource"]').forEach((e) => {
  e.addEventListener("click", (e) => {
    altstream = parseInt(e.target.value);
  });
});
