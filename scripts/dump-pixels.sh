for r in $(goat ls --collection blue.place.pixel alf.zip | cut -d$'\t' -f2);
do
    echo "deleting record $r"
    goat record delete -c blue.place.pixel -r "$r" &
done
