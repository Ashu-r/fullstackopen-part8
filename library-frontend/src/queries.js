import { gql } from '@apollo/client';

const BOOK_DETAILS = gql`
	fragment BookDetails on Book {
		id
		title
		author {
			name
		}
		published
		genres
	}
`;

export const ALL_BOOKS = gql`
	query {
		allBooks {
			...BookDetails
		}
	}
	${BOOK_DETAILS}
`;

export const BOOKS_BY_GENRE = gql`
	query booksByGenre($genre: String) {
		allBooks(genre: $genre) {
			...BookDetails
		}
	}
	${BOOK_DETAILS}
`;

export const ALL_AUTHORS = gql`
	query {
		allAuthors {
			name
			born
			id
			bookCount
		}
	}
`;

export const ME = gql`
	query {
		me {
			username
			favoriteGenre
		}
	}
`;

export const EDIT_AUTHOR = gql`
	mutation editAuthor($name: String!, $setBornTo: Int!) {
		editAuthor(name: $name, setBornTo: $setBornTo) {
			name
			id
			born
		}
	}
`;

export const ADD_BOOK = gql`
	mutation addBook($title: String!, $published: Int!, $author: String!, $genres: [String]!) {
		addBook(title: $title, published: $published, author: $author, genres: $genres) {
			title
			published
		}
	}
`;

export const LOGIN = gql`
	mutation login($username: String!, $password: String!) {
		login(username: $username, password: $password) {
			value
		}
	}
`;

export const BOOK_ADDED = gql`
	subscription {
		bookAdded {
			...BookDetails
		}
	}
	${BOOK_DETAILS}
`;
