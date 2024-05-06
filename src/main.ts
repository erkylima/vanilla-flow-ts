import styles from "./style.module.css"

window.onload = () => {
    var e = document.createElement("div");
    e.className = styles.container;
    document.getElementById("root")?.append(e)
}