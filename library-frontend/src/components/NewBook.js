import { gql, useMutation } from '@apollo/client';
import React, { useState } from 'react';
import { ALL_BOOKS, ALL_AUTHORS } from '../queries';

const NewBook = (props) => {
	const [title, setTitle] = useState('');
	const [author, setAuhtor] = useState('');
	const [published, setPublished] = useState('');
	const [genre, setGenre] = useState('');
	const [genres, setGenres] = useState([]);

	const ADD_BOOK = gql`
		mutation createBook($title: String!, $published: Int!, $author: String!, $genres: [String]!) {
			addBook(title: $title, published: $published, author: $author, genres: $genres) {
				title
				published
				author
				genres
			}
		}
	`;

	const [createBook] = useMutation(ADD_BOOK, { refetchQueries: [{ query: ALL_BOOKS }, { query: ALL_AUTHORS }] });

	if (!props.show) {
		return null;
	}

	const submit = async (event) => {
		event.preventDefault();

		console.log('add book...');
		createBook({ variables: { title, published, author, genres } });

		setTitle('');
		setPublished('');
		setAuhtor('');
		setGenres([]);
		setGenre('');
	};

	const addGenre = () => {
		setGenres(genres.concat(genre));
		setGenre('');
	};

	return (
		<div>
			<form onSubmit={submit}>
				<div>
					title
					<input value={title} onChange={({ target }) => setTitle(target.value)} />
				</div>
				<div>
					author
					<input value={author} onChange={({ target }) => setAuhtor(target.value)} />
				</div>
				<div>
					published
					<input type='number' value={published} onChange={({ target }) => setPublished(parseInt(target.value), 10)} />
				</div>
				<div>
					<input value={genre} onChange={({ target }) => setGenre(target.value)} />
					<button onClick={addGenre} type='button'>
						add genre
					</button>
				</div>
				<div>genres: {genres.join(' ')}</div>
				<button type='submit'>create book</button>
			</form>
		</div>
	);
};

export default NewBook;
