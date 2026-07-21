export type StoreTab = 'menu' | 'search' | 'promos' | 'info';

function createStoreUi() {
	let tab = $state<StoreTab>('menu');
	let query = $state('');

	return {
		get tab() {
			return tab;
		},
		get query() {
			return query;
		},
		setTab(t: StoreTab) {
			tab = t;
			if (t !== 'search') query = '';
		},
		setQuery(q: string) {
			query = q;
		},
		reset() {
			tab = 'menu';
			query = '';
		},
	};
}

export const storeUi = createStoreUi();
