/*
import validateFEN from 'fen-validator';

document.addEventListener('DOMContentLoaded', () => {
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

		//console.log(formData);

		//removeError()

		if (!validateFEN(formData.fen)) {
			addNewError("Invalid FEN")
		} else {
			findNextMove(formData)
		}
	});

	const benchmarkButton = document.querySelector('.benchamrk-button');

	benchmarkButton.addEventListener('click', () => {
		(async () => {
			var benchmarkData = {}

			var maxDepthInput = document.querySelector('.max-depth-input')
			var maxThreadsInput = document.querySelector('.max-threads-input')
			var sampleSizeInput = document.querySelector('.sample-size-input')

			benchmarkData = {
				maxDepth: Number(maxDepthInput.value),
				maxThreads: Number(maxThreadsInput.value),
				sampleSize: Number(sampleSizeInput.value)
			}

			const sampleFEN = "2r5/1N1NpPk1/2P1p1P1/pp2Pp1P/2rp2pK/2b4R/2PR1P1B/2q5 w - - 0 1"

			console.log(benchmarkData)
			document.querySelector(".benchamrk-output").innerHTML = `<p>Benchmarking ...</p><p>It'll take around ${estimateBenchmarkingTime(benchmarkData)} seconds</p><br><br>`
			
			//let b1 = await benchmarkBestMove(sampleFEN, 1, 1, 10)
			//console.log(b1)
			

			var benchmarkResults = {}

			document.querySelector(".benchamrk-output").innerHTML += `	<table class="table benchmark-table">
																			<thead>
																				<tr>
																					<th>Depth</th>
																					<th>Threads</th>
																					<th>Average Time</th>
																					<th></th>
																				</tr>
																			</thead>
																			<tfoot>
																				<tr>
																					<th>Depth</th>
																					<th>Threads</th>
																					<th>Average Time</th>
																					<th></th>
																				</tr>
																			</tfoot>
																		</table>`

			for (let depth = 1; depth <= benchmarkData.maxDepth; depth++) {
				benchmarkResults[depth] = []
				for (let threads = 1; threads <= benchmarkData.maxThreads; threads++) {
					console.log('yes')
					let avgTime = await benchmarkBestMove(sampleFEN, depth, threads, benchmarkData.sampleSize)
					//document.querySelector(".benchamrk-output").innerHTML += `<p>[DEPTH = ${depth}] [THREADS = ${threads}] ${avgTime}s</p>` 
					document.querySelector(".benchmark-table").innerHTML += `	<tbody>
																					<tr class="${depth}-${threads}">
																						<th>${depth}</th>
																						<th>${threads}</th>
																						<th>${avgTime}</th>
																						<th><a onclick="reEvaluate('${depth}-${threads}')">Re-Evaluate</a></th>
																					</tr>
																				</tbody>`

					benchmarkResults[depth].push(avgTime)
				}
			}

			console.log(benchmarkResults)
			highlightBetterResult(benchmarkResults)
		})()
	})

});

function highlightBetterResult (benchmarkResults) {
	for (let i = 1; i <= Object.keys(benchmarkResults).length; i++) {
		// i is depth
		var bestTimeIndex = 0
		for (let j = 0; j < benchmarkResults[Object.keys(benchmarkResults)[i-1]].length; j++) {
			// j is number of threads
			if ( benchmarkResults[Object.keys(benchmarkResults)[i-1]][j] < benchmarkResults[Object.keys(benchmarkResults)[i-1]][bestTimeIndex]) bestTimeIndex = j
		}
		document.getElementsByClassName(`${i}-${bestTimeIndex+1}`)[0].classList.add("is-success")
	}
}

async function wait(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

function estimateBenchmarkingTime (data) {
	let time = 0
	for (let i = 1; i <= data.maxDepth; i++) {
		if (i < 17) {
			time += 0.50 * data.sampleSize
		} else {
			time += 2 * data.sampleSize
		}
	}
	return time
}

async function benchmarkBestMove(FEN, depth, threads, sampleSize) {
	let totalTime = 0;
	let iterationsCompleted = 0;
	let startTime;

	return new Promise((resolve, reject) => {
		(async () => {
			const sf = await Stockfish();

			const messageListener = (line) => {
				if (line.startsWith("bestmove")) {
					const endTime = performance.now();
					totalTime += endTime - startTime;
					iterationsCompleted++;

					console.log(`iterationsCompleted ${iterationsCompleted}`);

					if (iterationsCompleted < sampleSize) {
						startSimulation();  // Start the next iteration
					} else {
						sf.removeMessageListener(messageListener);  // Remove the listener once done
						sf.terminate();
						const averageTime = totalTime / sampleSize;
						const averageTimeInSeconds = (averageTime / 1000).toFixed(3);
						resolve(parseFloat(averageTimeInSeconds));
					}
				}
			};

			sf.addMessageListener(messageListener);

			const startSimulation = () => {
				startTime = performance.now();  // Set startTime here before each iteration
				sf.postMessage(`setoption name Threads value ${threads}`);
				sf.postMessage(`position fen ${FEN}`);
				sf.postMessage(`go depth ${depth}`);
			};

			startSimulation();  // Start the first iteration
		})();
	});
}

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
		console.log("SOMETHING WENT WRONG");
		console.log("data", data);
		return null;
	}
}
*/