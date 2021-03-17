#!/bin/bash

#teamA start
node app.js teamA g gl -45 0 &
sleep 1s 
node app.js teamA hb fplt -30 10 &
sleep 1s 
node app.js teamA hb fplc -30 5 &
sleep 1s 
node app.js teamA hb fplc -30 -10 &
sleep 1s 
node app.js teamA hb fplb -30 -5 &
sleep 1s 

node app.js teamA cb fct -20 10 &
sleep 1s 
node app.js teamA cb fc -20 5 &
sleep 1s 
node app.js teamA cb fc -20 -5 &
sleep 1s 
node app.js teamA cb fcb -20 -10 &
sleep 1s 

node app.js teamA k fprt -10 5 &
sleep 1s 
node app.js teamA k fprb -10 -5 &
sleep 1s 

#teamB start
node app.js teamB g gr -45 0 &
sleep 1s 

node app.js teamB hb fprt -30 10 &
sleep 1s 

node app.js teamB hb fprc -30 5 &
sleep 1s 
node app.js teamB hb fprc -30 -5 &
sleep 1s 
node app.js teamB hb fprb -30 -10 &
sleep 1s 

node app.js teamB cb fct -20 10 &
sleep 1s 
node app.js teamB cb fc -20 5 &
sleep 1s 
node app.js teamB cb fc -20 -5 &
sleep 1s 
node app.js teamB cb fcb -20 -10 &
sleep 1s 

node app.js teamB k fplt -10 5 &
sleep 1s 
node app.js teamB k fplb -10 -5 &
sleep 1s 

