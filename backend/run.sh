websocat wss://jetstream2.us-east.bsky.network/subscribe\?wantedCollections=blue.place.pixel | \
    jq -r --unbuffered 'if .type != "com" then empty else .commit.record | to_entries[] | .value | @sh end' | \
    ./trackpixels.sh