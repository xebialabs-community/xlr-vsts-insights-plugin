window.addEventListener("xlrelease.load", function() {
    window.xlrelease.queryTileData(function(response) {
		let rawData = JSON.parse(response.data.data.workItems)

		// table settings
		const tableEl = document.querySelector('table');
		const tableColumns = ['id', 'title', 'state', 'assigned_to'];
		let totalAssets;
		let rowsOnScreen;
		let currentPage = 1;
		let totalPages = 1;
		let rowsPerPage = 10;
		let sortingDir = 'asc';
		let sortingCol = 'id';

		// buttons
		const prevBtnEl = document.querySelector('.btn-prev');
		const nextBtnEl = document.querySelector('.btn-next');
		const currentPageEl = document.querySelector('.current-page-num');

		(function viewInit() {
			prepareData();
			initSubscriptions();
			validatePagination();
		})();

		function initSubscriptions() {
			prevBtnEl.addEventListener('click', () => paginate('down'));
			nextBtnEl.addEventListener('click', () => paginate('up'));
		}

		function prepareData() {
			const mainKey = 'fields';
			totalAssets = rawData.map(asset => ({
				id: asset['id'],
				href: asset['href'],
				title: asset[mainKey]['System.Title'],
				state: asset[mainKey]['System.State'],
				assigned_to: getAssignedToField(asset[mainKey]['System.AssignedTo'])
			}));
			sortData();
		}

		function sortData() {
			totalAssets = _.sortBy([...totalAssets], [sortingDir], [sortingCol]);
			filterRowsToBeDrawn();
		}

		function filterRowsToBeDrawn() {
			rowsOnScreen = totalAssets.slice((currentPage * rowsPerPage) - rowsPerPage, currentPage * rowsPerPage);
			drawTableRows();
			updateCurrentPageAndTotal();
		}

		function getAssignedToField(value) {
			if (value) {
				if (typeof value === 'object' && 'displayName' in value) {
					return value['displayName'];
				}
				if (value.indexOf('<') >= 0) {
					return value.substring(0, value.indexOf('<'));
				}
				return value;
			}
			return '';
		}

		function drawTableRows() {
			const tableBody = document.querySelector('table tbody');
			tableBody.innerHTML = '';
			rowsOnScreen.forEach(row => {
				const tableRow = document.createElement('tr');
				tableColumns.forEach(col => {
					const td = document.createElement('td');
					if (col === 'id') {
						td.innerHTML = `<a href='${row['href']}' target="_blank">${row[col]}</a>`
					} else {
						td.innerHTML = row[col];
					}
					tableRow.appendChild(td);
				});
				tableBody.appendChild(tableRow);
			});
		}

		function paginate(dir) {
			if (dir === 'up') {
				currentPage++;
			} else {
				currentPage--;
			}
			validatePagination();
			filterRowsToBeDrawn();
			updateCurrentPageAndTotal();
		}

		function updateCurrentPageAndTotal() {
			totalPages = Math.ceil(totalAssets.length / rowsPerPage);
			currentPageEl.innerText = `${currentPage} / ${totalPages}`;
		}

		function validatePagination() {
			if (currentPage === Math.ceil(totalAssets.length / rowsPerPage)) {
				addAttribute(nextBtnEl, 'disabled');
				toggleClass(tableEl, 'last', 'add');
			} else {
				removeAttribute(nextBtnEl, 'disabled')
				toggleClass(tableEl, 'last', 'rm');
			}
			if (currentPage === 1) {
				addAttribute(prevBtnEl, 'disabled');
			} else {
				removeAttribute(prevBtnEl, 'disabled')
			}
		}

		function addAttribute(element, attributeName, value = null) {
			element.setAttribute(attributeName, value);
		}

		function removeAttribute(element, attributeName) {
			element.removeAttribute(attributeName);
		}

		function toggleClass(element, className, operation) {
			if (operation === 'add') {
				element.classList.add(className);
			} else {
				element.classList.remove(className);
			}
		}
	});
});
