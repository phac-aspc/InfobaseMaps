// This makes detail tags work in IE
    function Open_Close(){
        if(/MSIE \d|Trident.*rv:/.test(navigator.userAgent)) {
            console.log(document.getElementById("det").hasAttribute("open"))
            if (document.getElementById("det").hasAttribute("open")){
                console.log("Close")
                document.getElementById("det").removeAttribute("open")
            } else {
                console.log("Open")
                document.getElementById("det").setAttribute("open", "true");
            }
        }
    }
