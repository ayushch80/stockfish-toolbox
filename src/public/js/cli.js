console.log("[cli.js]")

document.querySelector(".cli-execute").addEventListener('click', () => {
	executeStockfishCommand()
})

document.querySelector(".clear-output").addEventListener('click', () => {
	clearOutput()
})

function executeStockfishCommand () {
	if (wasmThreadsSupported()) {
		var command = document.querySelector(".command-input").value
		execute(command)
	} else {
		addNewError("WASM Threads are not supported, please contact administrator of the website")
	}
}

function execute (command) {
	Stockfish().then((sf) => {
		sf.addMessageListener((line) => {
			//console.log(line)
			document.querySelector(".output").innerHTML += `<p>${line}</p>`
		})
		sf.postMessage(command)
	})
}

function clearOutput () {
	document.querySelector(".output").innerHTML = ""
}