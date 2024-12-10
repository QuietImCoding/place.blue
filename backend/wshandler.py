import asyncio
from websockets.asyncio.client import connect

bsky_jetstream="wss://jetstream1.us-west.bsky.network/subscribe?wantedCollections=blue.place.pixel"

async def hello():
    async with connect(bsky_jetstream) as websocket:
        while true;
        message = await websocket.recv()
        print(message)


if __name__ == "__main__":
    asyncio.run(hello())