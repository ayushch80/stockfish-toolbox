const router = new Navigo('/');

router
	.on('/', () => {
		changeRootContent('home');
	})
	.on('/cli', () => {
		changeRootContent('cli');
	})
	.on('/benchmark', () => {
		changeRootContent('benchmark');
	})
	.on('/insights', () => {
		changeRootContent('insights');
	})
	.notFound(() => {
		changeRootContent('404');
	})
	.resolve();

window.addEventListener('popstate', () => {
	router.navigate(window.location.pathname);
});

window.addEventListener('DOMContentLoaded', () => {
	router.navigate(window.location.pathname);
});

function changeRootContent(fileName) {
	const root = document.getElementById('root');
	fetch(`/html/${fileName}.html`)
		.then(response => response.text())
		.then(html => {
			root.innerHTML = html;
			fetch(`/js/${fileName}.js`)
				.then(response => response.text())
				.then(js => {
					const scriptEl = document.createElement('script')
					scriptEl.type = 'module'
					scriptEl.textContent = js
					root.appendChild(scriptEl)
				})
		})
		.catch((error) => {
			console.error('Error fetching HTML:', error);
		});
}
