import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ALL_BOOKS, ADD_BOOK, ALL_AUTHORS } from '../queries';

const NewBook = (props) => {
	const [title, setTitle] = useState('');
	const [author, setAuhtor] = useState('');
	const [published, setPublished] = useState('');
	const [genre, setGenre] = useState('');
	const [genres, setGenres] = useState(['']);

	const [addBook] = useMutation(ADD_BOOK, {
		refetchQueries: [{ query: ALL_BOOKS }, { query: ALL_AUTHORS }],
		onError: (error) => {
			error.graphQLErrors[0] ? props.setError(error.graphQLErrors[0].message) : props.setError('Please check all the fields');
		},
	});

	if (!props.show) {
		return null;
	}

	const submit = async (event) => {
		event.preventDefault();

		console.log('add book...');
		await addBook({ variables: { title, published, author, genres } });

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
