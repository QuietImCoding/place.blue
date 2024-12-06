# ugh okay fine we'll use a "real programming language"
# * * * * 

import json
from httpx_ws import connect_ws 
from PIL import Image, ImageDraw, ImageColor


COLORLIST = [
    "#000000",
    "#1D2B53",
    "#7E2553",
    "#008751",
    "#AB5236",
    "#5F574F",
    "#C2C3C7",
    "#FFF1E8",
    "#FF004D",
    "#FFA300",
    "#FFEC27",
    "#00E436",
    "#29ADFF",
    "#83769C",
    "#FF77A8",
    "#FFCCAA"
];

BSKY_JETSTREAM = "wss://jetstream1.us-west.bsky.network/subscribe?wantedCollections=blue.place.pixel"

with connect_ws(BSKY_JETSTREAM) as ws:
    with Image.open("base.png") as im:
        draw = ImageDraw.Draw(im)
        while True:
                res = json.loads(ws.receive_text())
                if res["kind"] == "commit": 
                    record = res["commit"]["record"]
                    color = COLORLIST[int(record["color"])]
                    note = record["note"]
                    x = record["x"]
                    y = record["y"]
                    draw.point([(x, y)], fill=color)
                    im.save("updated.png")
                    print(f"{color} pixel at [{x}, {y}], provided note: {note}")
                
