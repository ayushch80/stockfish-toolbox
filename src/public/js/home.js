import validateFEN from './js/fen-validator.min.js';

console.log("[home.js]")

const nextMoveButton = document.querySelector('.next-move-button');
const stockfishVersion = document.querySelector('select');
const fenInput = document.querySelector('.fen-input');
const depthInput = document.querySelector('.depth-input');
const threadInput = document.querySelector('.thread-input');


nextMoveButton.addEventListener('click', () => {
	var formData = {
		stockfishVersion: stockfishVersion.value,
		fen: fenInput.value,
		depth: depthInput.value,
		threads: threadInput.value
	};

	if (!validateFEN(formData.fen)) {
		addNewError("Invalid FEN")
	} else if (formData.depth == '0') {
		addNewError("Depth cannot be Zero")
	} else if (formData.threads == '0') {
		addNewError("Threads cannot be Zero")
	} else {
		findNextMove(formData)
	}
})

function findNextMove(data) {
	if (!data || !data.fen || !data.depth || !data.stockfishVersion) {
		console.log("Invalid Data");
		console.log({
			dataExists: !!data,
			fenExists: !!data?.fen,
			depthExists: !!data?.depth,
			stockfishVersionExists: !!data?.stockfishVersion
		});
		return null;
	}

	if (data.stockfishVersion === "Stockfish NNUE 16" && wasmThreadsSupported()) {
		document.querySelector(".bestmove").innerText = `Best Move: Finding ...`
		document.querySelector(".pondermove").innerText = `Ponder Move: Finding ...`
		const startTime = performance.now();
		Stockfish().then((sf) => {
			sf.addMessageListener((line) => {
				//console.log(line);
				if (line.startsWith("bestmove")) {
					var splitLine = line.split(" ")
					if (splitLine.length == 4) {
						document.querySelector(".bestmove").innerText = `Best Move: ${splitLine[1]}`
						document.querySelector(".pondermove").innerText = `Ponder Move: ${splitLine[3]}`
						const endTime = performance.now();
						const timeTaken = endTime - startTime;
						document.querySelector(".time-taken").innerText = `${(timeTaken/1000).toFixed(2)}s`
						sf.terminate()
					}
				}
			});
			sf.postMessage("uci");
			sf.postMessage(`setoption name Threads value ${data.threads}`)
			sf.postMessage(`position fen ${data.fen}`);
			sf.postMessage(`go depth ${data.depth}`)
		});
		
	} else {
		addNewError("Something went wrong in background, copy the logs and open an issue.")
		console.log("SOMETHING WENT WRONG");
		console.log("data", data);
		return null;
	}
}