window.addEventListener("xlrelease.load", function() {
    window.xlrelease.queryTileData(function(response) {
		const chart = echarts.init(document.getElementById('main'), 'theme1');
		let rawData = JSON.parse(response.data.data.workItems)
		let assetCount = 0;
		let assetCategories;

		prepareData();

		(function renderChart() {
			chart.setOption(getChartOptions());
		})();

		function getChartOptions() {
			return {
				tooltip: {
					trigger: 'item',
					formatter: '{b}: {c}'
				},
				legend: {
					show: true,
					type: 'scroll',
					orient: 'vertical',
					top: 'middle',
					right: '5%',
					height: 500,
					align: 'right',
					icon: 'circle'
				},
				series: [
					{
						label: {
							position: 'center',
							show: true,
							fontSize: 'min(9vw, 9vh)',
							fontWeight: 600,
							color: 'black',
							formatter: value => {
								if (value['dataIndex'] === 0) {
									return assetCount + '\nwork items';
								} else {
									return '';
								}
							}
						},
						minAngle: 3,
						type: 'pie',
						radius: ['55%', '85%'],
						avoidLabelOverlap: true,
						labelLine: {
							show: false
						},
						width: '80%',
						data: assetCategories,
					}
				]
			};
		}

		function prepareData() {
			assetCount = rawData.length;
			const allCats = rawData.reduce((p, c) => {
				const name = c['fields']['System.State'];
				if (name) {
					const asset = p.find(asset => asset.name === name);
					if (!asset) {
						p.push({name, value: 1});
					} else {
						asset.value++;
					}
				}
				return p;
			}, []);
			assetCategories = _.sortBy(allCats, ['asc'], ['value']);
		}

		window.addEventListener('resize', () => {
			chart.resize();
		});
	});
});
