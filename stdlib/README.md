
## Popx standard libray

Collection of standard JS code modules to be included in popx declarative modules.

### dom
  - **textinput**
    - attaches to text input element to provide value and emit events
    - value inputs
      - *selector*: CSS selector for input tag
    - value outputs
      - *text*: element value
    - event outputs
      - *changed*
      - *focus*
      - *blur*

### utils
  - **log**
    - each pin input creates a timestamped line with pin name and value
    - event inputs
      - *** input: any number of input pins that create log lines
    - value inputs
      - *console* boolean input: send log to stdout (default:true)
      - *path* output: optional file path 
      