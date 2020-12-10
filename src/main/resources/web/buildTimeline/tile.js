window.addEventListener("xlrelease.load", function() {
    window.xlrelease.queryTileData(function(response) {
		const chart = echarts.init(document.getElementById('main'), 'theme1');
		let rawData = JSON.parse(response.data.data.builds);

		class STATUSES {
			static CANCELED = 'Canceled';
			static SUCCEEDED = 'Succeeded';
			static FAILED = 'Failed';
		}
		const selectedCategories = Object.values(STATUSES).map(s => s.toLowerCase());

		function getMappedData() {
			const data = _.orderBy(rawData, 'startTime')
			return data
				.filter(build => 'result' in build)
				.filter(build => selectedCategories.includes(build.result))
				.map(build => {
					const {buildNumber, result, _links, startTime, finishTime} = build;
					return {
						name: buildNumber,
						value: getTimeDiff(startTime, finishTime),
						itemStyle: {
							color: getBarColor(result)
						},
						url: _links["web"]["href"],
						result,
						buildNumber
					}
				});
		}

		function drawLegend() {
			const legendEl = document.querySelector('.legend');
			Object.values(STATUSES).forEach(status => {
				const legendItem = document.createElement('div');
				const legendIcon = document.createElement('div');
				const legendText = document.createElement('div');
				legendItem.classList.add('legend-item');
				legendIcon.classList.add('icon');
				legendText.classList.add('text');
				legendText.innerHTML = `<span>${status}</span>`;
				legendIcon.style.backgroundColor = getBarColor(status.toUpperCase());
				legendItem.appendChild(legendIcon);
				legendItem.appendChild(legendText);
				addLegendItemEventListener(legendItem, status.toLowerCase());
				legendEl.appendChild(legendItem);
			});
		}
	
		function addLegendItemEventListener(item, status) {
			item.addEventListener('click', () => {
				filterDataByStatus(status);
				const icon = item.querySelector('.icon');
				const text = item.querySelector('.text');
				if (selectedCategories.includes(status)) {
					icon.style.backgroundColor = getBarColor(status.toUpperCase());
					text.style.color = 'black';
				} else {
					icon.style.backgroundColor = 'grey';
					text.style.color = 'grey';
				}
			})
		}
	
		function filterDataByStatus(status) {
			if (selectedCategories.includes(status)) {
				selectedCategories.splice(selectedCategories.indexOf(status), 1);
			} else {
				selectedCategories.push(status);
			}
			chart.setOption(getChartOptions());
		}

		function getTimeDiff(then, now, format) {
			const ms = moment(now).diff(moment(then));
			const d = moment.duration(ms);
			if (format === 'date') {
				return Math.floor(d.asHours()) + moment.utc(ms).format('H:mm:ss');
			} else {
				return ms;
			}
		}

		function getChartOptions() {
			return {
				tooltip: {
					trigger: 'item',
					padding: 15,
					formatter: function (params) {
						const {value, buildNumber, result} = params.data;
						return `Build Number: ${buildNumber} <br>
						Duration: ${getMinutes(value)} <br>
						Result: ${STATUSES[result.toUpperCase()]}`;
					},
					backgroundColor: 'rgba(50,50,50,0.85)'
				},
				xAxis: {
					type: 'category',
					axisLabel: {
						show: false,
					}
				},
				yAxis: {
					type: 'value',
					axisLabel: {
						formatter: (function (value) {
							return getMinutes(value);
						}),
					},
					name: 'Duration',
					nameTextStyle: {
						fontWeight: 'bold',
					}
				},
				series: [
					{
						type: 'bar',
						barMinHeight: 10,
						data: getMappedData(),
						label: {
							show: false,
						},
					}
				]
			}
		};

		chart.setOption(getChartOptions());
		drawLegend();

		function getMinutes(seconds) {
			return moment.utc(seconds).format('HH:mm:ss');
		}

		function getBarColor(result) {
			const resultLowerCase = result.toLowerCase();
			switch (resultLowerCase) {
				case 'failed':
					return '#db4545';
				case 'canceled':
					return '#636363'
				default:
					return '#39aa56';
			}
		}

		chart.on('click', function (params) {
			const url = _.get(params, 'data.url');
			if (url) {
				window.open(url, '_blank');
			}
		});

		window.addEventListener('resize', () => {
			chart.resize();
		});

	});
});