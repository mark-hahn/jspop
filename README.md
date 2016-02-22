## JSPOP

### A Reactive Dataflow framework

### Notes
- app consists of hierarchical levels
  - module nesting creates tree structure
  - jspop modules
    - non-leaf modules
    - strictly declarative
    - creates dataflow graphs
    - sets up code module instances and runs them
    - .jspop file format is JSON
  - code modules
    - leaf modules
    - standard code, JS for now
    
    
- jspop connections, aka pipes, values, wires
  - multiple readers and writers to single connection
  - any JS value (must be serializable with JSON)
  - change in value can trigger reaction (data-flow)
  - Optionally trigger reaction when writing same value (event)
  - works across processes and networks
  - connections are totally asynchronous
    - no callbacks
  - traffic rate is not meant to be high-speed
    - millisecond rates not microsecond
    - data may be serialized
    - data may cross process/network connections
    - performance achieved by appropriate module arhictecture
    - example is processing web pages as requests come in

      
- jspop app
  - App is tree of jspop files and inluded code modules
  - root of app tree is always a jspop file
  - jspop file may include other jspop files and code modules
  - code modules can only include other code modules


- jspop ide
  - graphical display of modules
    - shows modules as boxes with "pins and wiring"
  - single click pops open jspop or code module
    - jspop module shown as nested graphics
    - code module shown with normal text-based code editor
    - jspop name comes from popping open module
  - runs in browser or Atom desktop editor
  - single click on connection wire shows current value
  - May single step at connection value level
  - Breaks on specific values or change/events on wires
  - May slow down execution to watch values as they change


- jspop code modules
  - code modules have interaction rules
    - May call other nested code modules as usual
    - May not call other jspop code modules
    - May communicate through inter-module jspop connections
    - May use jspop global namspaced connections
  - JS version requires ES6 (babel)
    
    
- jspop npm module provides code module access to jspop connections
  - single jspop object, usually in variable named `$`
  - assignment to `$.varname` triggers write/event to connection `varname`
  - referencing `$.varname` reads value from connection
  - function `$.react` is called on `$.varname` input connection value change
    - function can react to one or more connections
    
    
- code module execution
  - top level runs under various specifiable conditions
    - at start of app
    - when any input connection has value
    - when all input connections have value
  - react functions
    - all execution after first run is by reaction only
  - code module execution is normal usually imperative code
    - first implementation only supports ES6 JS


- Parallel processing
  - supports code modules in different processes/cores/servers
  - isomorphic, code can be trivially moved between locations
  - Avoids nodejs single process performance limitation


- Uses
  - apps with circle of human input to processing to output
    - web apps with browser actions to logic to DOM display
    - server is just one component in circle
  - dataflow control apps from sensors to actions


- similar paradigm to reactiveX
  - both use reactive, event-driven pattern
  - both designed to work with any language
  - reactiveX
    - api of functions
    - pure functional
  - jspop 
    - much simpler with imperative code modules
    - declarative data-flow connections
    - JS implementation only for now


- Status
  - Beta
  - used in production
    - moderate-sized multi-zone HVAC app
  
  
- MIT license
