
import AppRoot from "./app";

window.onload = function() {
    var app = new AppRoot();
    
    document.getElementById("root")?.appendChild(app);
}