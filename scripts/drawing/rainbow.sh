function draw_pixel() {
    x=$1
    y=$2
    c=$3
    sleep 0.3
    cdate="$(date -Iseconds)"
    cat example.json | sed -e "s/COMMENT/taste the rainbow/g" \
			   -e "s/COLOR/$((c % 6 + 8))/g" \
			   -e "s/DATE/${cdate:0:19}.00z/g" \
			   -e "s/XCOR/$((499 - x))/g" -e "s/YCOR/$y/g" > record.json
    goat record create -n record.json &    
}

for iter in `seq 0 100`; do
    x=$iter
    for y in `seq 0 $iter`; do
	draw_pixel $x $y $iter
    done
    for x in `seq $iter 0`; do
	draw_pixel $x $y $iter
    done
    wait
done


# staic color
#cat example.json | sed -e "s/COLOR/12/g" -e "s/DATE/${cdate:0:19}.00z/g" -e "s/XCOR/$x/g" -e "s/YCOR/$((500 - y))/g" | tee record.json
# more rainbowy

#
