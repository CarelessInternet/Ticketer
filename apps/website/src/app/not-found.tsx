'use client';

import ErrorPage from 'next/error';

export default function NotFound() {
	return (
		<html lang="en">
			<body>
				<ErrorPage statusCode={404} />
			</body>
		</html>
	);
}
