# Stockfish Toolbox

Stockfish Toolbox is a web application that allows users to interact with the Stockfish chess engine in their browser. It provides a user-friendly interface for analyzing chess positions, executing Stockfish commands, and viewing performance benchmarks and insights of Stockfish on their browser.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Home](#home)
  - [CLI](#cli)
  - [Benchmark](#benchmark)
  - [Insights](#insights)
- [Features](#features)
- [Support](#support)
- [License](#license)

## Installation

To run Stockfish Toolbox locally, follow these steps:

1. Clone the repository:
    ```sh
    git clone https://github.com/ayushch80/stockfish-toolbox.git
    cd stockfish-toolbox
    ```

2. Install the dependencies:
    ```sh
    npm install
    ```

3. Start the development server:
    ```sh
    npm run dev
    ```

4. Open your browser and navigate to `http://localhost:5173`.

## Usage

### Home

The Home page allows users to input a chess position in FEN notation, set the search depth, and specify the number of threads. Clicking the "NEXT MOVE" button will run Stockfish to find the best move for the given position.

### CLI

The CLI page provides an interface to execute arbitrary Stockfish commands. Users can input commands and view the output directly in the browser.

### Benchmark

The Benchmark page provides performance metrics for Stockfish running in the browser.

### Insights

The Insights page will offer detailed analysis and insights into Stockfish's performance and behavior.

## Features

- **FEN Input**: Enter a chess position in FEN notation.
- **Search Depth**: Set the search depth for Stockfish's analysis.
- **Thread Control**: Specify the number of threads to use for analysis.
- **Command Execution**: Run custom Stockfish commands and view output in real-time.

## Support

For any issues or questions, please open an issue on the [GitHub repository](https://github.com/ayushch80/stockfish-toolbox/issues).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
