import React, { useCallback, useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { ApolloClient, InMemoryCache, gql, useQuery } from '@apollo/client';
import { ApolloProvider } from '@apollo/client';
import PropTypes from 'prop-types';

const apolloClient = new ApolloClient({
  uri: 'http://localhost:4000/',
  cache: new InMemoryCache()
})

const GAMES_QUERY = gql`
  query getGames {
    games {
      id
      wonBy
      history {
        turn
        squares
      }
    }
  }
`;

const ADD_GAME_MUTATION = gql`
  mutation Mutation($addGameInput: GameInput!) {
    addGame(input: $addGameInput) {
      id
      history {
        turn
        squares
      }
      wonBy
    }
  }
`

const History = ({ recentGame }) => {
  const { loading, error, data } = useQuery(GAMES_QUERY);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  let games = data.games;

  if (recentGame) {
    games = [games, recentGame];
  }

  return games
    .map(({ id, wonBy, history }) => (
      <div key={id}>
        <p>Game won by {wonBy}.</p>
        <div>
          History:
          {
            history.map(({ turn, squares }) => (
              <div key={turn}>
                <p>Turn {turn}</p>
                <Board
                  squares={squares}
                />
              </div>
            ))
          }
        </div>
      </div>
    ));
}

const Square = ({ id, value, onClick }) => {
  return (
    <button
      className="square"
      onClick={() => onClick(id)}
    >
      {value}
    </button>
  );
}

Square.propTypes = {
  value: PropTypes.string,
  onClick: PropTypes.any,
  id: PropTypes.number
}

const Board = ({ squares, onClick }) => {
  const rows = [];

  for (let i = 0; i < 3; i++) {
    const row = [];
    for (let j = 0; j < 3; j++) {
      const squareNumber = i * 3 + j;
      row.push(
        <Square
          onClick={onClick}
          value={squares[squareNumber]}
          key={j}
          id={squareNumber}
        />
      )
    }
    rows.push(
      <div className="board-row" key={i}>
        {row}
      </div>
    )
  }

  return (
    <div>
      {rows}
    </div>
  );
}

Board.propTypes = {
  squares: PropTypes.arrayOf(PropTypes.string),
  onClick: PropTypes.any
}

const Game = () => {
  const [ history, setHistory ] = useState([{
    squares: Array(9).fill(null),
  }]);
  const [ stepNumber, setStepNumber ] = useState(0);
  const [ xIsNext, setXIsNext ] = useState(true);

  const handleClick = useCallback(
    (i) => {
      const historyC = history.slice(0, stepNumber + 1);
      const current = historyC[stepNumber];
      const squares = current.squares.slice();
      if (calculateWinner(squares) || squares[i]) {
        return;
      }
      squares[i] = xIsNext ? 'X' : 'O';
      setHistory(historyC.concat([{
        squares: squares,
      }]));
      setStepNumber(historyC.length);
      setXIsNext(!xIsNext);
    },
    [history, stepNumber, xIsNext],
  )

  const jumpTo = useCallback(
    (step) => {
      setStepNumber(step);
      setXIsNext((step % 2) === 0)
    },
    [stepNumber],
  )

  const historyC = history;
  const current = historyC[stepNumber];
  const winner = calculateWinner(current.squares);
  let addedGame;

  const moves = historyC.map((step, move) => {
    const desc = move ?
      'Go to move #' + move :
      'Go to game start';
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{desc}</button>
      </li>
    );
  });

  let status;
  if (winner) {
    status = 'Winner: ' + winner;
    let turnCounter = 1;

    const queryHist = history
    .slice(1) // No need to save an empty board.
    .map((state) => ({
      turn: turnCounter++,
      squares: state.squares
    }));

    const query = {
      addGameInput: {
        history: queryHist,
        wonBy: winner
      }
    };

    mutate(ADD_GAME_MUTATION, query)
      .catch(err => console.log("Something went wrong while mutating a game: " + err))

  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board
          squares={current.squares}
          onClick={handleClick}
        />
      </div>
      <div className="game-info">
        <div>{status}</div>
        <ol>{moves}</ol>
      </div>
      <History
        recentGame={addedGame}
      />
    </div>
  );
}

async function mutate(mutation, variables) {
  return await apolloClient.mutate({
    mutation: mutation,
    variables: variables
  })
}

// ========================================

ReactDOM.render(
  <ApolloProvider client={apolloClient}>
    <Game />
  </ApolloProvider>,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
