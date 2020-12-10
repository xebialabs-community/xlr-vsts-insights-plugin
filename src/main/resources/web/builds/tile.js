window.addEventListener("xlrelease.load", function() {
    window.xlrelease.queryTileData(function(response) {
        let results = JSON.parse(response.data.data.builds).map(build => _.startCase(build["result"]))
        let counts = []

        results.forEach(result => {
          let index = counts.map(count => count["name"]).indexOf(result)
          if (index != -1) {
            counts[index]["value"] += 1
          } else {
            counts.push({
              name: result,
              value: 1,
              itemStyle: {
                color: getColor(result)
              }
            })
          }
        })

        function getColor(result) {
          switch (result) {
            case 'Failed':
              return '#db4545';
            case 'Canceled':
              return '#636363'
            default:
              return '#39aa56';
          }
        }

        var chart = echarts.init(document.getElementById('piechart'), 'theme1');
        var option = {
          tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} Builds ({d}%)"
          },
          label: {
            fontSize: 14
          },
          series: {
               type: 'pie',
               name: 'Build Results',
               data: counts,
               radius: ['30%', '70%'],
          }
        };
        chart.setOption(option);

        window.addEventListener('resize', () => {
          chart.resize();
        });
    });

});