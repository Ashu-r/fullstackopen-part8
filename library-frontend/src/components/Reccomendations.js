import React from 'react';

import { useQuery } from '@apollo/client';
import { BOOKS_BY_GENRE, ME } from '../queries';

const Books = (props) => {
	const currentUser = useQuery(ME);
	const favoriteGenre = currentUser?.data?.me?.favoriteGenre;
	const getBooksByGenre = useQuery(BOOKS_BY_GENRE, { skip: !favoriteGenre, variables: { genre: favoriteGenre } });
	if (!props.show) {
		return null;
	}

	if (getBooksByGenre.loading) {
		return <div>...loading</div>;
	}

	const books = getBooksByGenre.data.allBooks;

	return (
		<div>
			<h2>Reccomendations</h2>
			<p>
				Books in your favorite Genre <strong>{currentUser.data.me.favoriteGenre}</strong>
			</p>
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
		</div>
	);
};

export default Books;
