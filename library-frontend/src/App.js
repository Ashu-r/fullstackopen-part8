import React, { useState } from 'react';
import Authors from './components/Authors';
import Books from './components/Books';
import NewBook from './components/NewBook';
import Login from './components/Login';
import Recommendations from './components/Reccomendations';
import { useApolloClient } from '@apollo/client';

const Notify = ({ errorMessage }) => {
	if (!errorMessage) {
		return null;
	}
	return <div style={{ color: 'red' }}>{errorMessage}</div>;
};

const App = () => {
	const [page, setPage] = useState('authors');
	const [errorMessage, setErrorMessage] = useState(null);
	const [token, setToken] = useState(localStorage.getItem('library-user-token'));
	const client = useApolloClient();

	const notify = (message) => {
		setErrorMessage(message);
		setTimeout(() => {
			setErrorMessage(null);
		}, 10000);
	};

	const logout = () => {
		setToken(null);
		localStorage.clear();
		client.resetStore();
	};

	return (
		<div>
			<Notify errorMessage={errorMessage} />
			<div>
				<button onClick={() => setPage('authors')}>authors</button>
				<button onClick={() => setPage('books')}>books</button>
				{token ? (
					<div>
						<button onClick={() => setPage('add')}>add book</button>
						<button onClick={() => logout()}>log out</button>
						<button onClick={() => setPage('rec')}>recommendations</button>
					</div>
				) : (
					<Login setToken={setToken} setError={notify} />
				)}
			</div>

			<Authors show={page === 'authors'} setError={notify} />

			<Books show={page === 'books'} />

			<NewBook show={page === 'add'} setError={notify} />

			<Recommendations show={page === 'rec'} />
		</div>
	);
};

export default App;
