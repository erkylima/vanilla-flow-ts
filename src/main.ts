
import AppRoot from "./app";
import './app.css'
window.onload = function() {
    var app = new AppRoot();
    document.getElementById("root")?.appendChild(app);
}