'use client';

import { useState } from 'react';

export default function Button() {
	const [count, setCount] = useState(0);

	return (
		<button style={{ border: '1px dotted red' }} onClick={() => setCount((count) => count + 1)}>
			Clicks: {count}
		</button>
	);
}
