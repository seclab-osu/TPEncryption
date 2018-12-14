set hidden3d
set grid

set xrange [10:64]
set xtics 16,16,80 offset -5
set xlabel "blocksize" offset -1 rotate by -10 font ",20"

set yrange [500:7000]
set ytics 1000,2000,6000
set ylabel "rounds" offset 0 font ",20"

set zrange [250:2000]
set ztics 300,500,2300 offset -2
set zlabel "time (sec)" offset 5 rotate by 90 font ",20"

unset key

set term qt size 1300, 900 font "Helvetica,18"
splot 'enc.csv' using 1:2:3 with lines