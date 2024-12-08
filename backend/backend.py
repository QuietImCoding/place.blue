# ugh okay fine we'll use a "real programming language"
# * * * *

import json
from httpx_ws import connect_ws
from PIL import Image, ImageDraw, ImageColor
from datetime import datetime as dt
import queue, threading

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
    "#FFCCAA",
]

BSKY_JETSTREAM = (
    "wss://jetstream1.us-west.bsky.network/subscribe?wantedCollections=blue.place.pixel"
)

q = queue.Queue()

lastcolor = ""
def process_messages():
    while True: 
        res = q.get()
        global lastcolor, COLORLIST
        record = res["commit"]["record"]
        colorindex = int(record["color"])
        color = COLORLIST[int(record["color"])]
        note = record["note"]
        x = record["x"]
        y = record["y"]
        if x > 0 and x < 500 and y > 0 and y < 500:
            draw.point([(x, y)], fill=color)
            im.save("base.png", "PNG", optimize=1)
            if color != lastcolor:
                im.save(
                    f"snapshots/{str(dt.today()).split(' ', maxsplit=1)[0]}-block{colorindex}.png",
                    optimize=1
                )
                lastcolor = color
        print(f"{color} pixel at [{x}, {y}], provided note: {note}")
        q.task_done()

## we do a little threading... this will kill the project i can feel it
threading.Thread(target=process_messages, daemon=True).start()

with connect_ws(BSKY_JETSTREAM) as ws:
    with Image.open("base.png") as im:
        draw = ImageDraw.Draw(im)
        while True:
            res = json.loads(ws.receive_text())
            if res["kind"] == "commit":
                q.put(res)
        q.join()