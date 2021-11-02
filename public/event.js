const Store = require('./store');

const store = new Store({
    configName: 'example',
    defaults: {
      exampleData: { text: "hello", owner: "Airwavy" }
    }
  })

let text = document.getElementById("text")
text.innerHTML = store.get("exampleData")