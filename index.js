
 const input = require('./robots/input.js')
 const robots = require('./robots/text.js')
//const state = require('./robots/state.js')
	
	//inicializando o robo dentro do orquestrador :)

async function start(){
input()
await robots()
const content = robots.state.load()
console.dir(content,{depth:null})
}

  



start()

