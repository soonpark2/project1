// 전역 변수
let csvData = [];
let filteredData = [];
let currentFilters = {
    region: '전국',
    cropGroup: '',
    crop: '',
    year: '2023'
};
let charts = {};

// GitHub에서 CSV 파일 불러오기
async function loadCSVFromGitHub() {
    try {
        const csvUrl = 'https://raw.githubusercontent.com/soonpark2/project1/main/DB.csv';
        const response = await fetch(csvUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        console.log('CSV 데이터 로드 성공:', csvText.substring(0, 200) + '...');
        parseCSV(csvText);
    } catch (error) {
        console.error('CSV 파일 로드 오류:', error);
        showError(`GitHub에서 CSV 파일을 불러올 수 없습니다: ${error.message}`);
        loadTestData();
    }
}

// 테스트 데이터 (백업용)
function loadTestData() {
    console.log('테스트 데이터 로드 중...');
    const testData = `지역구분,년,작목군,작목,구분,값
전국,2023,쌀,쌀,소득,5000000
전국,2023,쌀,쌀,소득률,18.8
전국,2023,쌀,쌀,총수입,8500000
전국,2023,쌀,쌀,경영비,3000000
전국,2023,쌀,쌀,생산비,3500000
전국,2023,쌀,쌀,주산물가액,8000000
전국,2023,쌀,쌀,주산물수량,755
전국,2023,쌀,쌀,부산물가액,500000
전국,2023,쌀,쌀,수취가격,5299
전국,2023,쌀,쌀,자가노동시간,100.1
전국,2023,쌀,쌀,자가노동시간(남),70.6
전국,2023,쌀,쌀,자가노동시간(여),29.5
전국,2023,쌀,쌀,고용노동시간,18.0
전국,2023,쌀,쌀,고용노동시간(남),3.3
전국,2023,쌀,쌀,고용노동시간(여),14.7
전국,2022,쌀,쌀,소득,4800000
전국,2022,쌀,쌀,소득률,17.5
전국,2022,쌀,쌀,총수입,8200000
전국,2022,쌀,쌀,경영비,2900000
전국,2022,쌀,쌀,자가노동시간,102.0
전국,2022,쌀,쌀,고용노동시간,15.8
전국,2021,쌀,쌀,소득,4500000
전국,2021,쌀,쌀,소득률,16.8
전국,2021,쌀,쌀,총수입,7800000
전국,2021,쌀,쌀,경영비,2700000
전국,2021,쌀,쌀,자가노동시간,109.3
전국,2021,쌀,쌀,고용노동시간,7.3
전국,2020,쌀,쌀,소득,4200000
전국,2020,쌀,쌀,소득률,16.2
전국,2020,쌀,쌀,총수입,7500000
전국,2020,쌀,쌀,경영비,2600000
전국,2020,쌀,쌀,자가노동시간,113.7
전국,2020,쌀,쌀,고용노동시간,10.8
전국,2019,쌀,쌀,소득,4000000
전국,2019,쌀,쌀,소득률,15.8
전국,2019,쌀,쌀,총수입,7200000
전국,2019,쌀,쌀,경영비,2500000
전국,2019,쌀,쌀,자가노동시간,118.0
전국,2019,쌀,쌀,고용노동시간,11.8
전국,2023,과일,사과,소득,4500000
전국,2023,과일,사과,소득률,17.2
전국,2023,과일,사과,총수입,7000000
전국,2023,과일,사과,경영비,2000000
전국,2023,과일,사과,자가노동시간,95.5
전국,2023,과일,사과,자가노동시간(남),65.2
전국,2023,과일,사과,자가노동시간(여),30.3
전국,2023,과일,사과,고용노동시간,25.2
전국,2023,과일,사과,고용노동시간(남),12.1
전국,2023,과일,사과,고용노동시간(여),13.1
전국,2023,채소,감자,소득,3200000
전국,2023,채소,감자,소득률,19.8
전국,2023,채소,감자,총수입,4000000
전국,2023,채소,감자,경영비,1200000
전국,2023,채소,감자,자가노동시간,85.2
전국,2023,채소,감자,자가노동시간(남),55.1
전국,2023,채소,감자,자가노동시간(여),30.1
전국,2023,채소,감자,고용노동시간,12.5
전국,2023,채소,감자,고용노동시간(남),8.2
전국,2023,채소,감자,고용노동시간(여),4.3`;
    
    parseCSV(testData);
}

function showError(message) {
    console.error(message);
    const tableBody = document.getElementById('detailTableBody');
    tableBody.innerHTML = `<tr><td colspan="2" style="text-align: center; color: #ef4444;">${message}</td></tr>`;
}

function parseCSV(csvText) {
    console.log('CSV 파싱 시작...');
    Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            console.log('파싱 결과:', results);
            
            if (results.errors && results.errors.length > 0) {
                console.error('파싱 에러:', results.errors);
            }
            
            csvData = results.data.map(row => ({
                region: (row['지역구분'] || '').trim(),
                year: (row['년'] || '').trim(),
                cropGroup: (row['작목군'] || '').trim(),
                crop: (row['작목'] || '').trim(),
                category: (row['구분'] || '').trim(),
                value: parseFloat((row['값'] || '0').toString().replace(/,/g, '')) || 0
            })).filter(row => row.region && row.cropGroup);
            
            console.log('파싱된 데이터:', csvData.slice(0, 5));
            console.log('총 데이터 수:', csvData.length);
            
            if (csvData.length > 0) {
                initializeFilters();
                updateDisplay();
            } else {
                showError('유효한 데이터가 없습니다.');
            }
        },
        error: function(error) {
            console.error('Papa Parse 에러:', error);
            showError('CSV 파싱 중 오류가 발생했습니다.');
        }
    });
}

function initializeFilters() {
    console.log('필터 초기화 중...');
    
    // 지역 필터 초기화
    const regions = [...new Set(csvData.map(item => item.region))].sort();
    const regionFilter = document.getElementById('regionFilter');
    regionFilter.innerHTML = '';
    regions.forEach((region, index) => {
        const isActive = index === 0;
        regionFilter.innerHTML += `<div class="filter-item ${isActive ? 'active' : ''}" data-region="${region}">${region}</div>`;
        if (isActive) {
            currentFilters.region = region;
        }
    });
    
    // 작목군 필터 초기화
    const cropGroups = [...new Set(csvData.map(item => item.cropGroup))].sort();
    const cropGroupFilter = document.getElementById('cropGroupFilter');
    cropGroupFilter.innerHTML = '<div class="filter-item active" data-crop-group="">전체</div>';
    cropGroups.forEach(group => {
        cropGroupFilter.innerHTML += `<div class="filter-item" data-crop-group="${group}">${group}</div>`;
    });

    // 연도 필터 초기화
    const years = [...new Set(csvData.map(item => item.year))].sort().reverse();
    const yearFilter = document.getElementById('yearFilter');
    yearFilter.innerHTML = '';
    years.forEach((year, index) => {
        const isActive = index === 0;
        yearFilter.innerHTML += `<div class="year-btn ${isActive ? 'active' : ''}" data-year="${year}">${year}</div>`;
        if (isActive) {
            currentFilters.year = year;
        }
    });

    updateCrops();
    attachFilterEvents();
}

function updateCrops() {
    let filtered = csvData.filter(item => item.region === currentFilters.region);
    if (currentFilters.cropGroup) {
        filtered = filtered.filter(item => item.cropGroup === currentFilters.cropGroup);
    }
    
    const crops = [...new Set(filtered.map(item => item.crop))].sort();
    const cropFilter = document.getElementById('cropFilter');
    cropFilter.innerHTML = '<div class="filter-item active" data-crop="">전체</div>';
    crops.forEach(crop => {
        cropFilter.innerHTML += `<div class="filter-item" data-crop="${crop}">${crop}</div>`;
    });
}

function attachFilterEvents() {
    // 지역 필터
    document.querySelectorAll('#regionFilter .filter-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('#regionFilter .filter-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            currentFilters.region = this.dataset.region;
            updateCrops();
            updateDisplay();
        });
    });

    // 작목군 필터
    document.addEventListener('click', function(e) {
        if (e.target.matches('#cropGroupFilter .filter-item')) {
            document.querySelectorAll('#cropGroupFilter .filter-item').forEach(i => i.classList.remove('active'));
            e.target.classList.add('active');
            currentFilters.cropGroup = e.target.dataset.cropGroup;
            currentFilters.crop = '';
            updateCrops();
            updateDisplay();
        }
    });

    // 작목 필터
    document.addEventListener('click', function(e) {
        if (e.target.matches('#cropFilter .filter-item')) {
            document.querySelectorAll('#cropFilter .filter-item').forEach(i => i.classList.remove('active'));
            e.target.classList.add('active');
            currentFilters.crop = e.target.dataset.crop;
            updateDisplay();
        }
    });

    // 연도 필터
    document.addEventListener('click', function(e) {
        if (e.target.matches('#yearFilter .year-btn')) {
            document.querySelectorAll('#yearFilter .year-btn').forEach(i => i.classList.remove('active'));
            e.target.classList.add('active');
            currentFilters.year = e.target.dataset.year;
            updateDisplay();
        }
    });
}

function updateDisplay() {
    filterData();
    updateSummary();
    updateSummaryTitle();
    updateTable();
    updateCharts();
}

function filterData() {
    filteredData = csvData.filter(item => {
        return item.region === currentFilters.region &&
               (!currentFilters.cropGroup || item.cropGroup === currentFilters.cropGroup) &&
               (!currentFilters.crop || item.crop === currentFilters.crop) &&
               (!currentFilters.year || item.year === currentFilters.year);
    });
    console.log('필터링된 데이터:', filteredData.length, '개');
}

function updateSummary() {
    const income = filteredData.filter(i => i.category === '소득').reduce((a, b) => a + b.value, 0);
    const rateArr = filteredData.filter(i => i.category === '소득률');
    const avgRate = rateArr.reduce((a, b) => a + b.value, 0) / (rateArr.length || 1);
    
    document.getElementById('totalIncome').textContent = `₩${income.toLocaleString()}`;
    document.getElementById('totalRate').textContent = `${avgRate.toFixed(1)}%`;
}

function updateSummaryTitle() {
    const selectedYear = currentFilters.year || '2023';
    const selectedRegion = currentFilters.region || '전국';
    const selectedCrop = currentFilters.crop || '';
    
    let titleParts = [selectedYear + '년', selectedRegion];
    
    if (selectedCrop) {
        titleParts.push(selectedCrop);
    }
    
    titleParts.push('소득분석표');
    
    const summaryTitle = document.getElementById('summaryTitle');
    summaryTitle.textContent = titleParts.join(' ');

    // 각 차트 제목 업데이트
    const cropDetailText = selectedCrop || '전체';
    document.getElementById('totalIncomeTitle').textContent = `${cropDetailText} 총수입`;
    document.getElementById('managementCostTitle').textContent = `${cropDetailText} 경영비`;
    document.getElementById('incomeRateTitle').textContent = `${cropDetailText} 소득 및 소득률`;
}

function updateTable() {
    const tableBody = document.getElementById('detailTableBody');
    
    // 현재 필터링된 데이터에서 실제 값을 가진 비목 데이터 매핑
    const itemValueMap = {};
    
    filteredData.forEach(item => {
        itemValueMap[item.category] = item.value;
    });
    
    let html = '';
    
    // 총수입 박스
    const totalRevenue = itemValueMap['총수입'] || 0;
    html += `<tr class="summary-row"><td colspan="2">총수입 ₩${totalRevenue.toLocaleString()}</td></tr>`;
    
    const revenueItems = ['주산물가액', '주산물수량', '부산물가액', '수취가격'];
    revenueItems.forEach(itemName => {
        const value = itemValueMap[itemName];
        const displayValue = value !== undefined ? 
            (itemName === '주산물수량' ? value.toLocaleString() : (typeof value === 'number' ? value.toLocaleString() : value)) : '-';
        html += `<tr><td>${itemName}</td><td>${displayValue}</td></tr>`;
    });
    html += '<tr class="separator-row"><td colspan="2"></td></tr>';
    
    // 중간재비 박스
    let allMaterialCostItems = [];
    
    if (currentFilters.cropGroup === '과수') {
        allMaterialCostItems = [
            '과수원조성비', '보통(무기질)비료비', '부산물(유기질)비료비',
            '농약비', '수도광열비', '기타재료비', '소농구비',
            '대농구상각비', '영농시설상각비', '수리·유지비', '기타비용'
        ];
    } else if (['쌀', '콩', '고추', '양파', '마늘'].includes(currentFilters.crop)) {
        allMaterialCostItems = [
            '종자·종묘비', '보통(무기질)비료비', '부산물(유기질)비료비',
            '농약비', '수도광열비', '기타재료비', '소농구비',
            '대농구상각비', '영농시설상각비', '자동차비', '기타비용'
        ];
    } else {
        allMaterialCostItems = [
            '종자·종묘비', '보통(무기질)비료비', '부산물(유기질)비료비',
            '농약비', '수도광열비', '기타재료비', '소농구비',
            '대농구상각비', '영농시설상각비', '수리·유지비', '기타비용'
        ];
    }
    
    // 중간재비 총합 계산
    let totalMaterialCost = 0;
    allMaterialCostItems.forEach(itemName => {
        const value = itemValueMap[itemName];
        if (typeof value === 'number') {
            totalMaterialCost += value;
        }
    });
    html += `<tr class="summary-row"><td colspan="2">중간재비 ₩${totalMaterialCost.toLocaleString()}</td></tr>`;
    
    allMaterialCostItems.forEach(itemName => {
        const value = itemValueMap[itemName];
        const displayValue = value !== undefined ? value.toLocaleString() : '-';
        html += `<tr><td>${itemName}</td><td>${displayValue}</td></tr>`;
    });
    
    // 경영비 박스
    const totalCost = itemValueMap['경영비'] || 0;
    html += `<tr class="summary-row"><td colspan="2">경영비 ₩${totalCost.toLocaleString()}</td></tr>`;
    
    const costItems = ['농기계·시설임차료', '토지임차료', '위탁영농비', '고용노동비'];
    costItems.forEach(itemName => {
        const value = itemValueMap[itemName];
        const displayValue = value !== undefined ? 
            (typeof value === 'number' ? value.toLocaleString() : value) : '-';
        html += `<tr><td>${itemName}</td><td>${displayValue}</td></tr>`;
    });
    html += '<tr class="separator-row"><td colspan="2"></td></tr>';
    
    // 생산비 박스
    const totalProductionCost = itemValueMap['생산비'] || 0;
    html += `<tr class="summary-row"><td colspan="2">생산비 ₩${totalProductionCost.toLocaleString()}</td></tr>`;
    
    const productionItems = ['자가노동비', '유동자본용역비', '고정자본용역비', '토지자본용역비'];
    productionItems.forEach(itemName => {
        const value = itemValueMap[itemName];
        const displayValue = value !== undefined ? 
            (typeof value === 'number' ? value.toLocaleString() : value) : '-';
        html += `<tr><td>${itemName}</td><td>${displayValue}</td></tr>`;
    });
    
    tableBody.innerHTML = html || '<tr><td colspan="2">데이터가 없습니다.</td></tr>';
}


function updateCharts() {
    const fixedYears = ['2019', '2020', '2021', '2022', '2023'];
    
    // 총수입 차트
    updateTotalIncomeChart(fixedYears);
    
    // 경영비 차트
    updateManagementCostChart(fixedYears);
    
    // 소득 및 소득률 차트
    updateIncomeRateChart(fixedYears);
    
    // 자가 노동시간 도넛 차트
    updateSelfLaborChart();
    
    // 고용 노동시간 도넛 차트
    updateHiredLaborChart();
    
    // 년도별 노동시간 누적 차트
    updateAnnualLaborChart();
    
    // 작목별 소득 차트
    updateCropIncomeChart();
}

function updateTotalIncomeChart(fixedYears) {
    const values = fixedYears.map(y => {
        const match = csvData.find(row =>
            row.category === '총수입' &&
            row.year === y &&
            row.region === currentFilters.region &&
            (!currentFilters.cropGroup || row.cropGroup === currentFilters.cropGroup) &&
            (!currentFilters.crop || row.crop === currentFilters.crop)
        );
        return match ? match.value : 0;
    });

    const maxValue = Math.max(...values);
    const yAxisMax = maxValue * 1.6;

    const ctx = document.getElementById('totalIncomeChart').getContext('2d');
    if (charts['totalIncomeChart']) charts['totalIncomeChart'].destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(147, 197, 253, 0.6)'); // 밝은 하늘색
    gradient.addColorStop(1, 'rgba(191, 219, 254, 0.2)');

    charts['totalIncomeChart'] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: fixedYears.map(y => y + '년'),
            datasets: [{
                data: values,
                borderColor: 'rgba(59, 130, 246, 1)', // 하늘색
                backgroundColor: gradient,
                borderWidth: 3,
                pointRadius: 3,
                pointHoverRadius: 5,
                tension: 0.4,
                fill: true,
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    formatter: value => value.toLocaleString(),
                    font: { size: 11,
                          weight: 'bold'
                          },
                    color: '#374151'
                }
            }]
        },
        options: {
            layout: {
                padding: {
                    top: 0,
                    right: 30,
                    bottom: 0,
                    left: 30
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { display: false },
                datalabels: { display: true },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '₩' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        font: { size: 11, weight: 'bold' },
                        color: '#1f2937'
                    }
                },
                y: {
                    display: false,
                    beginAtZero: true,
                    max: yAxisMax
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}


function updateManagementCostChart(fixedYears) {
    const values = fixedYears.map(y => {
        const match = csvData.find(row =>
            row.category === '경영비' &&
            row.year === y &&
            row.region === currentFilters.region &&
            (!currentFilters.cropGroup || row.cropGroup === currentFilters.cropGroup) &&
            (!currentFilters.crop || row.crop === currentFilters.crop)
        );
        return match ? match.value : 0;
    });

    const maxValue = Math.max(...values);
    const yAxisMax = maxValue * 1.6;

    const ctx = document.getElementById('managementCostChart').getContext('2d');
    if (charts['managementCostChart']) charts['managementCostChart'].destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(147, 197, 253, 0.6)');
    gradient.addColorStop(1, 'rgba(191, 219, 254, 0.2)');

    charts['managementCostChart'] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: fixedYears.map(y => y + '년'),
            datasets: [{
                data: values,
                borderColor: 'rgba(59, 130, 246, 1)',
                backgroundColor: gradient,
                borderWidth: 3,
                pointRadius: 3,
                pointHoverRadius: 5,
                tension: 0.4,
                fill: true,
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    formatter: value => value.toLocaleString(),
                    font: { 
                        size: 11,
                        weight: 'bold'
                    },
                    color: '#374151'
                }
            }]
        },
        options: {
            layout: {
                padding: {
                    top: 0,
                    right: 25,
                    bottom: 0,
                    left: 25
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { display: false },
                datalabels: { display: true },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '₩' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        font: { size: 11, weight: 'bold' },
                        color: '#1f2937'
                    }
                },
                y: {
                    display: false,
                    beginAtZero: true,
                    max: yAxisMax
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}


function updateIncomeRateChart(fixedYears) {
    const incomeValues = fixedYears.map(y => {
        const match = csvData.find(row =>
            row.category === '소득' &&
            row.year === y &&
            row.region === currentFilters.region &&
            (!currentFilters.cropGroup || row.cropGroup === currentFilters.cropGroup) &&
            (!currentFilters.crop || row.crop === currentFilters.crop)
        );
        return match ? match.value : 0;
    });

    const rateValues = fixedYears.map(y => {
        const match = csvData.find(row =>
            row.category === '소득률' &&
            row.year === y &&
            row.region === currentFilters.region &&
            (!currentFilters.cropGroup || row.cropGroup === currentFilters.cropGroup) &&
            (!currentFilters.crop || row.crop === currentFilters.crop)
        );
        return match ? match.value : 0;
    });

    const maxIncomeValue = Math.max(...incomeValues);
    const maxRateValue = Math.max(...rateValues);
    const incomeAxisMax = maxIncomeValue * 1.3;
    const rateAxisMax = maxRateValue * 1.3;

    const ctx = document.getElementById('incomeRateChart').getContext('2d');
    if (charts['incomeRateChart']) charts['incomeRateChart'].destroy();

    charts['incomeRateChart'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: fixedYears.map(y => y + '년'),
            datasets: [
                {
                    label: '소득',
                    data: incomeValues,
                    type: 'bar',
                    backgroundColor: 'rgba(147, 197, 253, 0.7)', // 하늘색 + 투명도
                    borderColor: 'transparent',
                    borderWidth: 0,
                    yAxisID: 'y',
                    datalabels: {
                        anchor: 'center',
                        align: 'center',
                        formatter: value => value.toLocaleString(),
                        font: { size: 11,
                              weight: 'bold'
                              },
                        color: '#374151'
                    }
                },
                {
                    label: '소득률',
                    data: rateValues,
                    type: 'line',
                    borderColor: 'rgba(59, 130, 246, 1)', // 연보라톤
                    backgroundColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    tension: 0.4,
                    yAxisID: 'y1',
                    fill: false,
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        formatter: value => value + '%',
                        font: { size: 11,
                              weight: 'bold'
                              },
                        color: '#374151'
                    }
                }
            ]
        },
        options: {
            layout: {
                padding: {
                    top: 0,
                    right: 5,
                    bottom: 0,
                    left: 5
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                datalabels: { display: true },
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.datasetIndex === 0) {
                                return '소득: ₩' + context.parsed.y.toLocaleString();
                            } else {
                                return '소득률: ' + context.parsed.y + '%';
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        font: { size: 11, weight: 'bold' },
                        color: '#1f2937'
                    }
                },
                y: {
                    display: false,
                    beginAtZero: true,
                    position: 'left',
                    max: incomeAxisMax
                },
                y1: {
                    display: false,
                    beginAtZero: true,
                    position: 'right',
                    max: rateAxisMax
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}


function updateSelfLaborChart() {
    const maleLabor = filteredData.find(i => i.category === '자가노동시간(남)')?.value || 0;
    const femaleLabor = filteredData.find(i => i.category === '자가노동시간(여)')?.value || 0;
    
    const ctx = document.getElementById('selfLaborChart').getContext('2d');
    if (charts['selfLaborChart']) charts['selfLaborChart'].destroy();

    charts['selfLaborChart'] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['남성', '여성'],
            datasets: [{
                data: [maleLabor, femaleLabor],
                backgroundColor: ['#3b82f6', '#ec4899'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        font: { size: 10 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '시간';
                        }
                    }
                }
            }
        }
    });
}

function updateHiredLaborChart() {
    const maleLabor = filteredData.find(i => i.category === '고용노동시간(남)')?.value || 0;
    const femaleLabor = filteredData.find(i => i.category === '고용노동시간(여)')?.value || 0;
    
    const ctx = document.getElementById('hiredLaborChart').getContext('2d');
    if (charts['hiredLaborChart']) charts['hiredLaborChart'].destroy();

    charts['hiredLaborChart'] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['남성', '여성'],
            datasets: [{
                data: [maleLabor, femaleLabor],
                backgroundColor: ['#06b6d4', '#8b5cf6'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        font: { size: 10 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '시간';
                        }
                    }
                }
            }
        }
    });
}

function updateAnnualLaborChart() {
    const fixedYears = ['2019', '2020', '2021', '2022', '2023'];
    
    const selfLaborData = fixedYears.map(y => {
        const match = csvData.find(row =>
            row.category === '자가노동시간' &&
            row.year === y &&
            row.region === currentFilters.region &&
            (!currentFilters.cropGroup || row.cropGroup === currentFilters.cropGroup) &&
            (!currentFilters.crop || row.crop === currentFilters.crop)
        );
        return match ? match.value : 0;
    });

    const hiredLaborData = fixedYears.map(y => {
        const match = csvData.find(row =>
            row.category === '고용노동시간' &&
            row.year === y &&
            row.region === currentFilters.region &&
            (!currentFilters.cropGroup || row.cropGroup === currentFilters.cropGroup) &&
            (!currentFilters.crop || row.crop === currentFilters.crop)
        );
        return match ? match.value : 0;
    });

    const ctx = document.getElementById('annualLaborChart').getContext('2d');
    if (charts['annualLaborChart']) charts['annualLaborChart'].destroy();

    charts['annualLaborChart'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: fixedYears.map(y => y + '년'),
            datasets: [
                {
                    label: '자가노동',
                    data: selfLaborData,
                    backgroundColor: '#10b981',
                    borderColor: '#059669',
                    borderWidth: 1
                },
                {
                    label: '고용노동',
                    data: hiredLaborData,
                    backgroundColor: '#f59e0b',
                    borderColor: '#d97706',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        font: { size: 10 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y + '시간';
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: { display: false },
                    ticks: {
                        font: { size: 10 },
                        color: '#1f2937'
                    }
                },
                y: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: {
                        font: { size: 9 },
                        color: '#6b7280'
                    }
                }
            }
        }
    });
}

function updateCropIncomeChart() {
    // 현재 지역과 년도로 필터링된 작목별 소득 데이터
    let cropIncomeData = csvData.filter(item => {
        return item.category === '소득' &&
               item.region === currentFilters.region &&
               item.year === currentFilters.year &&
               (!currentFilters.cropGroup || item.cropGroup === currentFilters.cropGroup);
    });
    
    // 작목별로 그룹핑하고 정렬
    const cropIncomes = cropIncomeData
        .map(item => ({
            crop: item.crop,
            income: item.value
        }))
        .sort((a, b) => b.income - a.income);
    
    const ctx = document.getElementById('cropIncomeChart').getContext('2d');
    if (charts['cropIncomeChart']) charts['cropIncomeChart'].destroy();
    
    charts['cropIncomeChart'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: cropIncomes.map(item => item.crop),
            datasets: [{
                label: '소득',
                data: cropIncomes.map(item => item.income),
                backgroundColor: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#84cc16'],
                borderColor: ['#059669', '#0891b2', '#7c3aed', '#d97706', '#dc2626', '#65a30d'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            indexAxis: 'y', // 가로 막대로 설정
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: {
                        font: { size: 9 },
                        callback: val => '₩' + val.toLocaleString()
                    }
                },
                y: {
                    ticks: { font: { size: 9 } }
                }
            },
            plugins: {
                datalabels: {
                    anchor: 'end', //바 끝에
                    align: 'right', // 오른쪽으로
                    formatter: value => '₩' + value.toLocaleString(),
                    font: { size : 10},
                    color: '#374151'
                },
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '소득: ₩' + context.parsed.x.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// 사이드바 토글 함수 (모바일용)
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('expanded');
}

// 전역에서 한 번만
Chart.register(ChartDataLabels);

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadCSVFromGitHub();

});





















