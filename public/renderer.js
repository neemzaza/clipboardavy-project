const { remote } = require('electron');
const dbInstance = remote.getGlobal('db');

dbInstance.readAll().then(allTodolists => {
    console.log(allTodolists)
})

document.getElementById("list1").addEventListener('click', () => {
    console.log("CLICKED!")
})