const { UserInputError } = require('apollo-server');
const { ApolloServer, gql } = require('apollo-server');
const mongoose = require('mongoose');
const Author = require('./models/author');
const Book = require('./models/book');

const MONGO_URI = 'mongodb+srv://ashu:ashudive@fso-phonebook.aaxdo.gcp.mongodb.net/fso-library?retryWrites=true&w=majority';

mongoose
	.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
	.then(() => {
		console.log('Connected to momngoDb');
	})
	.catch((e) => console.log('Error connecting to mongodb', error.message));

let authors = [
	{
		name: 'Robert Martin',
		id: 'afa51ab0-344d-11e9-a414-719c6709cf3e',
		born: 1952,
	},
	{
		name: 'Martin Fowler',
		id: 'afa5b6f0-344d-11e9-a414-719c6709cf3e',
		born: 1963,
	},
	{
		name: 'Fyodor Dostoevsky',
		id: 'afa5b6f1-344d-11e9-a414-719c6709cf3e',
		born: 1821,
	},
	{
		name: 'Joshua Kerievsky', // birthyear not known
		id: 'afa5b6f2-344d-11e9-a414-719c6709cf3e',
	},
	{
		name: 'Sandi Metz', // birthyear not known
		id: 'afa5b6f3-344d-11e9-a414-719c6709cf3e',
	},
];

/*
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 */

let books = [
	{
		title: 'Clean Code',
		published: 2008,
		author: 'Robert Martin',
		id: 'afa5b6f4-344d-11e9-a414-719c6709cf3e',
		genres: ['refactoring'],
	},
	{
		title: 'Agile software development',
		published: 2002,
		author: 'Robert Martin',
		id: 'afa5b6f5-344d-11e9-a414-719c6709cf3e',
		genres: ['agile', 'patterns', 'design'],
	},
	{
		title: 'Refactoring, edition 2',
		published: 2018,
		author: 'Martin Fowler',
		id: 'afa5de00-344d-11e9-a414-719c6709cf3e',
		genres: ['refactoring'],
	},
	{
		title: 'Refactoring to patterns',
		published: 2008,
		author: 'Joshua Kerievsky',
		id: 'afa5de01-344d-11e9-a414-719c6709cf3e',
		genres: ['refactoring', 'patterns'],
	},
	{
		title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
		published: 2012,
		author: 'Sandi Metz',
		id: 'afa5de02-344d-11e9-a414-719c6709cf3e',
		genres: ['refactoring', 'design'],
	},
	{
		title: 'Crime and punishment',
		published: 1866,
		author: 'Fyodor Dostoevsky',
		id: 'afa5de03-344d-11e9-a414-719c6709cf3e',
		genres: ['classic', 'crime'],
	},
	{
		title: 'The Demon ',
		published: 1872,
		author: 'Fyodor Dostoevsky',
		id: 'afa5de04-344d-11e9-a414-719c6709cf3e',
		genres: ['classic', 'revolution'],
	},
];

const typeDefs = gql`
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
	}
	type Mutation {
		addBook(title: String!, author: String!, published: Int!, genres: [String]!): Book
		editAuthor(name: String!, setBornTo: Int!): Author
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
	},
	Author: {
		bookCount: async (root) => {
			const author = await Author.findOne({ name: root.name });
			return Book.find({ author: author }).countDocuments();
		},
	},
	Mutation: {
		addBook: async (root, args) => {
			const author = await Author.findOne({ name: args.author });
			console.log(author);

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
		editAuthor: async (root, args) => {
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
	},
};

const server = new ApolloServer({
	typeDefs,
	resolvers,
});

server.listen().then(({ url }) => {
	console.log(`Server ready at ${url}`);
});
