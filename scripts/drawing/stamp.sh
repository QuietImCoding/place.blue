## STAMP FUNCTION TAKES 5 ARGS
# stamp <x> <y> <comment> <.stamp file> <skip-lines>
function stamp() {
    echo "Drawing image $4 at offset $1, $2"
    lineno=0
    oldy=0
    while IFS= read -r line; do
        lineno=$((lineno + 1))
        x=$(echo $line | cut -d' ' -f 1)
        y=$(echo $line | cut -d' ' -f 2)
        c=$(echo $line | cut -d' ' -f 3)
        ## SKIP ITERATION IF UNDER 'SKIP PARAM'
        if [[ $lineno -lt $5 ]]; then
            continue
        fi

        x=$((x + $1))
        y=$((y + $2))

        cdate="$(date -Iseconds)"
        cat example.json | sed \
            -e "s/COMMENT/$3/g" \
            -e "s/COLOR/$c/g" \
            -e "s/DATE/${cdate:0:19}.00z/g" \
            -e "s/XCOR/$x/g" \
            -e "s/YCOR/$y/g" > record.json
        goat record create -n record.json >/dev/null &
        printf '.'
        if [[ $((lineno % 16)) -eq 0 ]]; then
            wait
        fi
    done < <(cat $4 | sort -k3n -k1R )

}


stamp $3 $4 "$1" "$2" 0
