# place.blue
the blue place

## Usage

- completely static frontend, currently hosted [place.blue](https://place.blue)
- backend is a python file in the `backend/` directory
- 

## Dependencies

### Python Dependencies

- `httpx_ws` : used as a (mercifully) straighforward firehose reader
- `Pillow` : (PIL) used to render pixels on images

### Good to have

- [Goat CLI](https://github.com/bluesky-social/indigo/tree/main/cmd/goat) : Used for scripts in the atproto folder, helpful for CLI exploration of protocol stuff
- [neocities CLI](https://neocities.org/cli) : not neccesary but used to upload the website, currently there is a cron job copying the `output/base.png` file to https://place.blue/base.png