
echo "compiling todomvc.popx"
node ../compiler/popx.js -xco js todomvc.popx

http-server todomvc -p 1999 -o -r
