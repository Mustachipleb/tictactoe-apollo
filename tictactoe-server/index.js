const { ApolloServer, gql } = require('apollo-server');
const { stripIgnoredCharacters } = require('graphql');

const typeDefs = gql`
  input GameInput {
    history: [BoardStateInput!]!
    wonBy: String
  }

  input BoardStateInput {
    turn: Int
    squares: [String]!
  }

  type BoardState {
    turn: Int
    squares: [String]!
  }

  type Game {
    id: ID
    history: [BoardState!]!
    wonBy: String
  }

  type Query {
    games: [Game]
  }

  type Mutation {
    addGame(input: GameInput!): Game!
  }
`;

const sampleGame = [
  {
    id: '1',
    history: [
      {
        turn: 1,
        squares: [
          'X', null, null,
          null, null, null,
          null, null, null
        ]
      },
      {
        turn: 2,
        squares: [
          'X', null, null,
          null, 'O', null,
          null, null, null
        ]
      },
      {
        turn: 3,
        squares: [
          'X', 'X', null,
          null, 'O', null,
          null, null, null
        ]
      },
      {
        turn: 4,
        squares: [
          'X', 'X', null,
          null, 'O', null,
          'O', null, null
        ]
      },
      {
        turn: 5,
        squares: [
          'X', 'X', 'X',
          null, 'O', null,
          'O', null, null
        ]
      }
    ],
    wonBy: 'X',
  },
  {
    id: '2',
    history: [
      {
        turn: 1,
        squares: [
          'X', null, null,
          null, null, null,
          null, null, null
        ]
      },
      {
        turn: 2,
        squares: [
          'X', null, null,
          null, 'O', null,
          null, null, null
        ]
      },
      {
        turn: 3,
        squares: [
          'X', 'X', null,
          null, 'O', null,
          null, null, null
        ]
      },
      {
        turn: 4,
        squares: [
          'X', 'X', 'O',
          null, 'O', null,
          null, null, null
        ]
      },
      {
        turn: 5,
        squares: [
          'X', 'X', 'X',
          null, 'O', 'X',
          'O', null, null
        ]
      },
      {
        turn: 6,
        squares: [
          'X', 'X', 'X',
          null, 'O', 'X',
          'O', 'O', null
        ]
      },
      {
        turn: 7,
        squares: [
          'X', 'X', 'X',
          null, 'O', 'X',
          'O', 'O', 'X'
        ]
      }
    ],
    wonBy: 'X',
  }
]

let idCount = sampleGame.length + 1;
const resolvers = {
  Query: {
    games: () => sampleGame,
  },
  Mutation: {
    addGame: (parent, args) => {
      const game = {
        id: idCount++,
        history: args.input.history,
        wonBy: args.input.wonBy
      };
      sampleGame.push(game);
      console.log("Added game with id " + game.id)
      return game;
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers, tracing: true });

(async () => {
  let instance = await server.listen();
  console.log(`Server ready at ${instance.url}`);
})();
