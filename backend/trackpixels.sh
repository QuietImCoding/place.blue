source colorlist.sh 

function update_image() {
    while true; do
        read -r type
        read -r color
        read -r createdat
        read -r note
        read -r xcor
        read -r ycor
        echo "[$createdat] - Setting pixel at $xcor $ycor to ${COLORLIST[color]}, note was: $note"
        convert base.png -fill "${COLORLIST[$color]}" -draw "point $xcor,$ycor" out.png
        mv out.png base.png
        neocities upload base.png &
    done
}

update_image