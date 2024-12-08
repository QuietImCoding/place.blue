function stamp() {

    lineno=0
    while IFS= read -r line; do
        x=$(echo $line | cut -d' ' -f 1)
        y=$(echo $line | cut -d' ' -f 2)
        c=$(echo $line | cut -d' ' -f 3)
        echo "Working on pixel # $((lineno++)), offset $1 $2"
        cdate="$(date -Iseconds)"
        cat example.json | sed \
            -e "s/COMMENT/rat city baby/g" \
            -e "s/COLOR/$c/g" \
            -e "s/DATE/${cdate:0:19}.00z/g" \
            -e "s/XCOR/$((x + $1))/g" \
            -e "s/YCOR/$((y + $2))/g" >record.json
        goat record create -n record.json &   
        if [[ $((lineno % 8)) -eq 0 ]]
        then
            echo "waiting"
            wait
        fi 
    done <"../stamps/sprayrat.stamp"

}

stamp 30 30