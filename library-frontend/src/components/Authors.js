import React from 'react';

import { gql, useQuery } from '@apollo/client';

const Authors = (props) => {
	const ALL_AUTHORS = gql`
		query {
			allAuthors {
				name
				born
				id
				bookCount
			}
		}
	`;
	const allAuthors = useQuery(ALL_AUTHORS);

	if (!props.show) {
		return null;
	}

	if (allAuthors.loading) {
		return <div>loading ...</div>;
	}

	const authors = allAuthors.data.allAuthors;

	return (
		<div>
			<h2>authors</h2>
			<table>
				<tbody>
					<tr>
						<th></th>
						<th>born</th>
						<th>books</th>
					</tr>
					{authors.map((a) => (
						<tr key={a.name}>
							<td>{a.name}</td>
							<td>{a.born}</td>
							<td>{a.bookCount}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default Authors;
