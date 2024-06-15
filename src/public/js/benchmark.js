console.log("[benchmark.js]")

document.querySelector('.benchamrk-button').addEventListener('click', () => {
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
				let avgTime = await benchmarkBestMove(sampleFEN, depth, threads, benchmarkData.sampleSize)
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