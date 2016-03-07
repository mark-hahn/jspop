
# echo "compile hello-world.popx with no debug"
# node --harmony /root/dev/apps/popx/compiler/popx.js -co hello-world hello-world/hello-world.popx

# echo "compile hello-world.popx with debug"
# node-debug --nodejs --harmony /root/dev/apps/popx/compiler/popx.js -co hello-world hello-world/hello-world.popx

# echo "compile hello-world.popx and run in node with no debug"
# node /root/dev/apps/popx/compiler/popx.js -co hello-world hello-world/hello-world.popx
# node --harmony /root/dev/apps/popx/hello-world/hello-world.js  
 
echo "compile hello-world.popx and run in node with debug"
node /root/dev/apps/popx/compiler/popx.js -co hello-world hello-world/hello-world.popx
node-debug --nodejs --harmony /root/dev/apps/popx/hello-world/hello-world.js

# echo "compile hello-world.popx into bundle with debug"
# node-debug --nodejs --harmony \
# /root/dev/apps/popx/compiler/popx.js - -bmp js/bundle.js hello-world/hello-world.popx

# echo "compile hello-world.popx into bundle and run in browser"
# node /root/dev/apps/popx/compiler/popx.js - -bmp js/bundle.js hello-world/hello-world.popx
# http-server . -p 1999 -o -r
