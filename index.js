const readline = require("readline-sync")
 const robots = require('./robots/text.js')
	//inicializando o robo dentro do orquestrador :)

async function start(){
const content ={
maximumSentences: 7
}
content.searchTerm = askAndReturnSearchTerm()
content.prefix = askAndReturnPrefix()
await robots(content) 
function askAndReturnSearchTerm(){
	return readline.question('Type a Wikipedia seach term :')
	//pega o dado do usuario atraves do question
}
function askAndReturnPrefix(){
const prefixes = ['Who is','What is','The history of']
const selectedPrefixIndex = readline.keyInSelect(prefixes,'Chose one option :')
//keyInSelect retorna o indice de algo q foi selecionado
const selectPrefixText = prefixes[selectedPrefixIndex]
//pegando o texto do prefixo
return selectPrefixText
}

console.log(JSON.stringify(content,null,4))
}


start()

