import React, { useState } from 'react';

import { useLazyQuery, useQuery } from '@apollo/client';
import { ALL_BOOKS, BOOKS_BY_GENRE } from '../queries';

const Books = (props) => {
	const allBooks = useQuery(ALL_BOOKS);
	const [genre, setGenre] = useState(null);
	const [getBooksByGenre, result] = useLazyQuery(BOOKS_BY_GENRE, { variables: { genre } });
	if (!props.show) {
		return null;
	}

	if (allBooks.loading || result.loading) {
		return <div>...loading</div>;
	}

	const books = !genre ? allBooks.data.allBooks : result.data.allBooks;
	let arr = [];
	allBooks.data.allBooks.map((a) => (arr = arr.concat(a.genres)));
	const genres = [...new Set(arr)];

	const changeGenre = (g) => {
		getBooksByGenre({ variables: { genre: g } });
		setGenre(g);
	};
	return (
		<div>
			<h2>books</h2>
			{genre ? <h4>Books in genre {genre}</h4> : null}
			<table>
				<tbody>
					<tr>
						<th></th>
						<th>author</th>
						<th>published</th>
					</tr>
					{books.map((a) => (
						<tr key={a.id}>
							<td>{a.title}</td>
							<td>{a.author.name}</td>
							<td>{a.published}</td>
						</tr>
					))}
				</tbody>
			</table>

			{genres.map((g) => (
				<button key={g} onClick={() => changeGenre(g)}>
					{g}
				</button>
			))}
			<button onClick={() => setGenre(null)}>All genre</button>
		</div>
	);
};

export default Books;
