import { gql } from '@apollo/client';

export const ALL_BOOKS = gql`
	query {
		allBooks {
			id
			title
			author {
				name
			}
			published
		}
	}
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

export const EDIT_AUTHOR = gql`
	mutation editAuthor($name: String!, $setBornTo: Int!) {
		editAuthor(name: $name, setBornTo: $setBornTo) {
			name
			id
			born
		}
	}
`;
