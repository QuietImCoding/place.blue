function stamp() {
    echo "Drawing image $4 at offset $1, $2"
    lineno=0
    oldy=0
    while IFS= read -r line; do
        x=$(echo $line | cut -d' ' -f 1)
        y=$(echo $line | cut -d' ' -f 2)
        c=$(echo $line | cut -d' ' -f 3)
	x=$((x + $1))
	y=$((y + $1))
        # echo "Working on pixel # $((lineno++)), ($x, $y), color $c"
        cdate="$(date -Iseconds)"
        cat example.json | sed \
            -e "s/COMMENT/$3/g" \
            -e "s/COLOR/$c/g" \
            -e "s/DATE/${cdate:0:19}.00z/g" \
            -e "s/XCOR/$x/g" \
            -e "s/YCOR/$y/g" > record.json
        goat record create -n record.json > /dev/null &
	if [[ $oldy -ne $y ]]
	then
	    echo "made it to line $y"
	    oldy=$y
	fi
        if [[ $((lineno % 8)) -eq 0 ]]
        then
            wait
        fi 
    done <"$4"

}

stamp $3 $4 "$1" "$2"
