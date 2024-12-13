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

## Todos!!

I shall hold myself accountable to implementing at least a few of these

- [x] (BUG !) - Add some sort of indicator for failed login
- [ ] Logout button, to allow you to login as someone else... in case you got rate limited ... couldn't b me - IN PROGRESS lol 
- [ ] (BACKEND) - Log all incoming pixels to allow redrawing the canvas from history
- [x] (FRONTEND) - Add a pane where you can see your past pixel contributions... Grouped like in the event list 
- [ ] Epic profile pages! Cute, bestickered, simple... include links
    - Real-time canvas fill of your pixel contributions
    - overview of pixel stats
    - sticker collection
- [ ] Leadeboard -- powered by LOGGING ... so should get on that 
- [ ] Fix numerous mobile issues (unimportant)
- [ ] Join a webring?? 