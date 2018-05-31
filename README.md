
Install virtulabox
Install vagrant


git clone http://git.ironbit.net/webapp/webapp-cev-protegelos.git

$ cd webapp-cev-protegelos          // Go to the proyect folder  
$ git checkout develop
$ vagrant up

$ vagrant ssh
$ cd webapp-cev-protegelos          // Go to the proyect folder  
$ sudo bower install --allow-root   // Install angular 1.5.5 
$ gulp

// open new console.
$ vagrant ssh
$ cd webapp-cev-protegelos          // Go to the proyect folder  
$ node server
 
http://localhost:9090/              // Use this URL in the browser




error:
"The guest machine entered an invalid state while waiting for it to boot. Valid states are 'starting, running'. The machine is in the 'poweroff' state. Please verify everything is configured properly and try again." 

solution:
You need to modify your BIOS to enable VT-x features on your motherboard.




Versions:

node -v
v0.10.25

npm -v
1.3.24

gulp -v
CLI version 3.9.1

bower -v
1.8