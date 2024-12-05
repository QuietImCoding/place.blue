COLORLIST=('rgb(255, 0, 0)' 'rgb(255, 165, 0)' 'rgb(255, 255, 0)' 'rgb(0, 128, 0)' 'rgb(0, 0, 255)' 'rgb(238, 130, 238)' 'rgb(0, 0, 0)' 'rgb(255, 255, 255)')

while true; 
do 
    read -r type
    read -r color
    read -r xcor
    read -r ycor
    echo "Setting pixel at $xcor $ycor to ${COLORLIST[color]}"
    convert base.png -fill "${COLORLIST[$color]}" -draw "color $xcor,$ycor point" out.png
    mv out.png base.png
    neocities upload base.png &
done
