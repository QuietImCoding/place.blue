// Function to get a jwt from a PDS
function getToken(provider, handle, password) {
  return ( fetch(provider + "/xrpc/com.atproto.server.createSession", {
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
      listAllPixels()
      setInterval(refreshToken, 60000);
    })
    );
}


function authenticatedATMessage(auth, target, content = null, method="POST") {
    let params = method == "GET" ? "?"+(new URLSearchParams(content)).toString() : ""
    console.log(`GET REQUEST WITH PARAMS ${params}`)
    return (
        fetch( target + params ,
           content == null ? {
            method: method,
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                Authorization: "Bearer " + auth,
             } 
            } : {
              method: method,
              body: method == "GET" ? null : JSON.stringify(content),
              headers: {
                  "Content-type": "application/json; charset=UTF-8",
                  Authorization: "Bearer " + auth,
               },
    }).then((response) => response.json())
)
}

// Function to refresh your jwts
function refreshToken() {
  authenticatedATMessage(
    refresh,
    domain + "/xrpc/com.atproto.server.refreshSession"
  ).then((json) => {
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

async function listPixels(nextcursor = null) {
    
    return authenticatedATMessage(
        jwt, 
        domain + "/xrpc/com.atproto.repo.listRecords", 
        nextcursor != null ? {
            repo: did, 
            collection: "blue.place.pixel",
            limit: 100,
            cursor: nextcursor,
        } : {
            repo: did, 
            collection: "blue.place.pixel",
            limit: 100,
        }, 
        "GET"
    )
}

async function listAllPixels() {
    let response = await listPixels();
    let pixeldata = Array.from(response.records);
    while (response.records.length > 0) {
        console.log(response.records)
        response = await listPixels(response.cursor)
        if (response.records.length > 0) {
            pixeldata = pixeldata.concat(Array.from(response.records));
        }
    }
    console.log(pixeldata);
    let history = document.getElementById("pixelhistory");
    let lastcolor = "";
    let blocksize = 1;
    let lastnote = ""
    pixeldata.forEach( record => {
        let pixelbox = document.createElement("li");
        pixelbox.classList.add("pixelrecord");
        pixelbox.style.backgroundColor = COLORLIST[record.value.color];
        pixelbox.value = blocksize;
        if (record.value.note.length > 0) pixelbox.setAttribute("note", record.value.note);
        pixelbox.style.width = `${20 * Math.floor(Math.sqrt(blocksize))}px`;
        if ( record.value.color != lastcolor || record.value.note != lastnote  ) {
            pixelbox.innerHTML = `<span class="highlighted">${blocksize}</span>`; 
            history.appendChild(pixelbox);
            blocksize = 1; 
            lastcolor = record.value.color;
            lastnote = record.value.note;
        } else {
            blocksize += 1; 
        }
    })
}

// Just put some json on the server they said
// it will be fun, they said (they is David Buchanan)
function publishPixel(xval, yval, cval, text = null) {
    authenticatedATMessage(
        jwt,
        domain + "/xrpc/com.atproto.repo.putRecord",
        {
            repo: did,
            collection: "blue.place.pixel",
            rkey: generateTID(),
            record: {
              x: xval,
              y: yval,
              color: cval,
              note: text,
              createdAt: new Date().toISOString(),
            },
          }
    ).then(json => console.log(json));
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

let prevDID, prevNote, prevColor;
let repeatCount = 1;
// THE BIG PUSH
async function pushEvent(
  rid,
  eventdid,
  location,
  color,
  text = null,
  blueplace = true
) {
  if (eventdid != prevDID || text != prevNote || color != prevColor) {
    let eventLabel = document.createElement("p");
    eventLabel.id = rid;
    eventLabel.classList.add(eventdid, `color${color}`);
    let colortag = document.createElement("span");
    colortag.style.backgroundColor = COLORLIST[color];
    colortag.innerText = color;
    let septag = document.createElement("hr");
    let texttag;

    if (text != null) {
      texttag = document.createElement("p");
      texttag.innerText = `Post text was: ${
        text.substring(0, 100) + (text.length > 100 ? "..." : "")
      }.`;
    }
    eventLabel.innerHTML = blueplace
      ? `<a href="https://pdsls.dev/at/${eventdid}/blue.place.pixel/${rid}">${eventdid}:</a> created <span class="pcount">pixel</span> at (${location.toString()}) with color `
      : `<a href="https://bsky.app/profile/${eventdid}/post/${rid}">${eventdid}:</a> created <span class="pcount">pixel</span> at (${location.toString()}) with color `;
    eventLabel.appendChild(colortag);
    eventLabel.appendChild(texttag);
    eventLabel.appendChild(septag);

    eventbox.prepend(eventLabel);
    repeatCount = 1;
    prevDID = eventdid;
    prevNote = text; 
    prevColor = color;
  } else {
    eventbox.firstChild.querySelector(
      ".pcount"
    ).innerText = `${++repeatCount} pixels`;
  }
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
    if (!altstream) {
      drawPixel(ctx, record.x, record.y, record.color);
      let userID = await didLookup(msgData.did);
      pushEvent(
        msgData.commit.rkey,
        userID == null ? msgData.did : userID.slice(5),
        [record.x, record.y],
        record.color,
        record.note,
        true
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
      let color = record.text.length % COLORLIST.length;
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
        if (
          Date.now() % 500 <
          parseInt(document.getElementById("eventspeed").value)
        ) {
          drawPixel(ctx, x, y, color);
          let userID = await didLookup(msgData.did);
          pushEvent(
            msgData.commit.rkey,
            userID == null ? msgData.did : userID.slice(5),
            [x, y],
            color,
            record.text,
            false
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
