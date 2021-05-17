const { UserInputError } = require('apollo-server');
const { ApolloServer, gql } = require('apollo-server');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Author = require('./models/author');
const Book = require('./models/book');
const User = require('./models/user');
const { AuthenticationError } = require('apollo-server');

const JWT_SECRET = 'JWTsecret';
const MONGO_URI = 'mongodb+srv://ashu:ashudive@fso-phonebook.aaxdo.gcp.mongodb.net/fso-library?retryWrites=true&w=majority';

mongoose
	.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
	.then(() => {
		console.log('Connected to momngoDb');
	})
	.catch((e) => console.log('Error connecting to mongodb', error.message));

const typeDefs = gql`
	type User {
		username: String!
		favoriteGenre: String!
		id: ID!
	}

	type Token {
		value: String!
	}

	type Author {
		name: String!
		id: ID!
		born: Int
		bookCount: Int
	}
	type Book {
		title: String!
		published: Int!
		author: Author!
		id: ID!
		genres: [String]!
	}
	type Query {
		bookCount: Int!
		authorCount: Int!
		allBooks(author: String, genre: String): [Book!]!
		allAuthors: [Author!]!
		me: User
	}
	type Mutation {
		addBook(title: String!, author: String!, published: Int!, genres: [String]!): Book
		editAuthor(name: String!, setBornTo: Int!): Author
		createUser(username: String!, favoriteGenre: String!): User
		login(username: String!, password: String!): Token
	}
`;

const resolvers = {
	Query: {
		bookCount: () => Book.collection.countDocuments(),
		authorCount: () => Author.collection.countDocuments(),
		allBooks: async (root, args) => {
			if (!args.author && !args.genre) {
				return Book.find({}).populate('author');
			}
			if (!args.author) {
				return Book.find({ genres: { $in: [args.genre] } }).populate('author');
			}
			const author = await Author.findOne({ name: args.author });
			if (!args.genre) {
				return Book.find({ author: author }).populate('author');
			}
			return Book.find({ author: author, genres: args.genre }).populate('author');
		},
		allAuthors: () => Author.find({}),
		me: (root, args, context) => {
			return context.currentUser;
		},
	},
	Author: {
		bookCount: async (root) => {
			const author = await Author.findOne({ name: root.name });
			return Book.find({ author: author }).countDocuments();
		},
	},
	Mutation: {
		addBook: async (root, args, context) => {
			const currentUser = context.currentUser;

			if (!currentUser) {
				throw new AuthenticationError('not authenticated');
			}

			const author = await Author.findOne({ name: args.author });

			if (!author) {
				const newAuthor = new Author({ name: args.author });
				try {
					await newAuthor.save();
				} catch (error) {
					throw new UserInputError(error.message, { invalidArgs: args });
				}
				const book = new Book({ ...args, author: newAuthor });
				try {
					book.save();
				} catch (error) {
					throw new UserInputError(error.message, { invalidArgs: args });
				}
				return book;
			}
			const book = new Book({ ...args, author });
			try {
				book.save();
			} catch (error) {
				throw new UserInputError(error.message, { invalidArgs: args });
			}
			return book;
		},
		editAuthor: async (root, args, context) => {
			const currentUser = context.currentUser;

			if (!currentUser) {
				throw new AuthenticationError('not authenticated');
			}
			const author = await Author.findOne({ name: args.name });
			if (author) {
				author.born = args.setBornTo;
				try {
					author.save();
				} catch (error) {
					throw new UserInputError(error.message, { invalidArgs: args });
				}
				return author;
			}
			return null;
		},
		createUser: (root, args) => {
			const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre });

			return user.save().catch((error) => {
				throw new UserInputError(error.message, { invalidArgs: args });
			});
		},
		login: async (root, args) => {
			const user = await User.findOne({ username: args.username });

			if (!user || args.password !== 'secret') {
				throw new UserInputError('wrong credentials');
			}

			const userForToken = {
				username: user.username,
				id: user.__id,
			};

			return { value: jwt.sign(userForToken, JWT_SECRET) };
		},
	},
};

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: async ({ req }) => {
		const auth = req ? req.headers.authorization : null;

		if (auth && auth.toLowerCase().startsWith('bearer ')) {
			const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET);

			const currentUser = await User.findById(decodedToken.id);
			return { currentUser };
		}
	},
});

server.listen().then(({ url }) => {
	console.log(`Server ready at ${url}`);
});
