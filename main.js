import validateFEN from 'fen-validator';

var formData = {}

document.addEventListener('DOMContentLoaded', () => {
	//console.log("\"",window.location.hash,"\"", window.location.hash.length)
	showPage(window.location.hash)
	const button = document.querySelector('.button.is-info');
	const stockfishVersion = document.querySelector('select');
	const fenInput = document.querySelector('.fen-input');
	const depthInput = document.querySelector('.depth-input');
	const threadInput = document.querySelector('.thread-input');

	button.addEventListener('click', () => {
		formData = {
			stockfishVersion: stockfishVersion.value,
			fen: fenInput.value,
			depth: depthInput.value,
			threads: threadInput.value
		};

		console.log(formData);

		//removeError()

		if (!validateFEN(formData.fen)) {
			addNewError("Invalid FEN")
		} else {
			findNextMove(formData)
		}
	});
});

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
					//console.log(splitLine)
					if (splitLine.length == 4) {
						document.querySelector(".bestmove").innerText = `Best Move: ${splitLine[1]}`
						document.querySelector(".pondermove").innerText = `Ponder Move: ${splitLine[3]}`
						const endTime = performance.now();
						const timeTaken = endTime - startTime;
						document.querySelector(".time-taken").innerText = `${(timeTaken/1000).toFixed(2)}s`
						console.log(performance.memory)
						sf.terminate()
						console.log(performance.memory)
					}
				}
			});
			sf.postMessage("uci");
			sf.postMessage(`setoption name Threads value ${data.threads}`)
			sf.postMessage(`position fen ${data.fen}`);
			sf.postMessage(`go depth ${data.depth}`)
			//if (document.querySelector(".bestmove").innerText !== "Best Move: Finding ...") console.log("success")
		});

		//Stockfish().terminate()
	} else {
		console.log("SOMETHING WENT WRONG");
		console.log("data", data);
		return null;
	}
}
