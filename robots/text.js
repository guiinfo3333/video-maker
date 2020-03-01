const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey //pega a chave para se autenticar com o aughorithmia
const sentenceBoundaryDetection = require('sbd') //pegando uma biblioteca do nod que quebra em sentencas de acordo com o ponto da frase

const watsonApiKey = require ('../credentials/watson-nlu.json').apikey
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js')
const nlu = new NaturalLanguageUnderstandingV1({
  iam_apikey: watsonApiKey,
  version: '2018-04-05',
  url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
})
//inicializando robo de estado
const state = require('./state.js')
//fim do robo de estado
var robot = async function robot(){
	const content = state.load() //pegando o que tava salvo e colocando agora no content
	//baixando o conteudo do wipidea atraves do alghotirmea
	await fetchContentFromWikipedia(content)
	sanitizeContent(content)
	breakContentIntoSentences(content)
	limitMaximumSentences(content)
	await fetchKeywordsOfAllSentences(content)
	async function fetchContentFromWikipedia(content){   //funcao que pega dos dados da wikipedia
const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
//const wikipediaResponde = await wikipediaAlgorithm.pipe(content.searchTerm)
 const wikipediaResponde = await wikipediaAlgorithm.pipe({
      "articleName": content.searchTerm,
      "lang": 'pt'
    })
const wikipediaContent = wikipediaResponde.get()
content.sourceContentOriginal = wikipediaContent.content //pegando apenas o 'content' e armazenando nesse atributo

//console.log(wikipediaContent)
	}
	function sanitizeContent(content) {  //vou limpar o texto aqui
    const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)  //tira as linhas em branco
    const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)  //remove as datas
    content.sourceContentSanitized = withoutDatesInParentheses //salvando o texto ja limpo

    function removeBlankLinesAndMarkdown(text) {
      const allLines = text.split('\n')

      const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
        if (line.trim().length === 0 || line.trim().startsWith('=')) {
          return false
        }

        return true
      })

      return withoutBlankLinesAndMarkdown.join(' ')
    }
  }
  function removeDatesInParentheses(text) {   //remove as datas desnecessarias
    return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
  }
  function breakContentIntoSentences(content) {  //quebra em sentencas e adiciona alguns atributos
    content.sentences = []

    const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized) //usando a biblioteca q eu importei do node + o metodo sentences
    sentences.forEach((sentence) => {
      content.sentences.push({
        text: sentence,
        keywords: [],
        images: []
      })
    })
  }
  function limitMaximumSentences(content){       //diminuindo as sentencas
  	content.sentences = content.sentences.slice(0,content.maximumSentences)	 //pega da posicao - ate o maximo sentences
  }
  async function fetchKeywordsOfAllSentences(content) {
    for (const sentence of content.sentences) {
      sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)
    }
  }
async function fetchWatsonAndReturnKeywords(sentence) {
    return new Promise((resolve, reject) => {
      nlu.analyze({
        text: sentence,
        features: {
          keywords: {}
        }
      }, (error, response) => {
        if (error) {
          reject(error)
          return
        }

        const keywords = response.keywords.map((keyword) => {
          return keyword.text
        })

        resolve(keywords)
      })
    })
  }
  }





module.exports = robot