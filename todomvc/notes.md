

webpage
  in head
  in title
  in style
  in body
  out html
  out events
  
evt-router
  in events
  in type
  in selector
  out event
  
fill
  in data
  in template
  out ele
  out html

ele-append
  in parent
  in child*
  out ele
  out html
  
$.html = $template`
  div #pane
    input #task-input placeholder="Enter Task Name"
    div 

create
  in key*
  in val*
  out obj

---
# ====== popx ======
app:
  
  





