import React, { useState } from 'react';
import Select from 'react-select';

import { gql, useMutation, useQuery } from '@apollo/client';

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

const EDIT_AUTHOR = gql`
	mutation editAuthor($name: String!, $setBornTo: Int!) {
		editAuthor(name: $name, setBornTo: $setBornTo) {
			name
			id
			born
		}
	}
`;

const Authors = (props) => {
	const [name, setName] = useState('');
	const [born, setBorn] = useState('');

	const allAuthors = useQuery(ALL_AUTHORS);
	const [editAuthor] = useMutation(EDIT_AUTHOR);

	const submit = async (event) => {
		event.preventDefault();

		editAuthor({ variables: { name: name.value, setBornTo: born } });
		setName(null);
		setBorn('');
	};

	if (!props.show) {
		return null;
	}

	if (allAuthors.loading) {
		return <div>loading ...</div>;
	}

	const authors = allAuthors.data.allAuthors;

	const options = authors.map((a) => ({ value: a.name, label: a.name }));

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

			<h3>Set Birth Year</h3>
			<form onSubmit={submit}>
				<div>
					name
					<Select defaultValue={name} onChange={setName} options={options} />
				</div>
				<div>
					born
					<input value={born} onChange={({ target }) => setBorn(parseInt(target.value, 10))} />
				</div>
				<button type='submit'>update</button>
			</form>
		</div>
	);
};

export default Authors;
