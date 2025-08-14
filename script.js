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
    const selectedCropGroup = currentFilters.cropGroup || ''; // cropGroupFilter에서 가져온 값
    
    let titleParts = [selectedYear + '년', selectedRegion];
    
    if (selectedCrop) {
        titleParts.push(selectedCrop);
    }
    
    titleParts.push('소득분석표');
    
    const summaryTitle = document.getElementById('summaryTitle');
    summaryTitle.textContent = titleParts.join(' ');

    // 각 차트 제목 업데이트 - 지역과 작물 정보 포함
    const regionText = selectedRegion;
    const cropDetailText = selectedCrop || '전체';
    const cropText = selectedCropGroup || '전체작물'; // cropGroupFilter의 값 사용
    
    // 기존 차트들
    document.getElementById('totalIncomeTitle').textContent = `${regionText} ${cropDetailText} 총수입`;
    document.getElementById('managementCostTitle').textContent = `${regionText} ${cropDetailText} 경영비`;
    document.getElementById('incomeRateTitle').textContent = `${regionText} ${cropDetailText} 소득 및 소득률`;
    document.querySelector('.self-labor-chart .chart-title').textContent = `${selectedYear}년 ${regionText} ${cropDetailText} 자가노동시간`;
    document.querySelector('.hired-labor-chart .chart-title').textContent = `${selectedYear}년 ${regionText} ${cropDetailText} 고용노동시간`;
    document.querySelector('.annual-labor-chart .chart-title').textContent = `${regionText} ${cropDetailText} 노동시간`;
    document.querySelector('.income-chart .chart-title').textContent = `${selectedYear}년 ${regionText} ${cropText} 소득`;
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
                    font: { size: 16,
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
                    right: 45,
                    bottom: 0,
                    left: 45
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { display: false },
                datalabels: { display: true },
                tooltip: {
                    titleFont: {
                        size: 18,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 18,
                        weight: 'bold'
                    },
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
                        font: { size: 14, weight: 'bold' },
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
                        size: 16,
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
                    right: 45,
                    bottom: 0,
                    left: 45
                }
            },
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { display: false },
                datalabels: { display: true },
                tooltip: {
                    titleFont: {
                        size: 18,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 18,
                        weight: 'bold'
                    },
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
                        font: { size: 14, weight: 'bold' },
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
    const incomeAxisMax = maxIncomeValue * 1.6;
    const rateAxisMax = maxRateValue * 1.6;

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
                        font: { size: 16,
                              weight: 'bold'
                              },
                        color: '#374151'
                    }
                },
                {
                    label: '소득률',
                    data: rateValues,
                    type: 'line',
                    borderColor: 'rgba(59, 130, 246, 1)', // 
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
                        font: { size: 16,
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
                    titleFont: {
                        size: 18,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 18,
                        weight: 'bold'
                    },
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
                        font: { size: 14, weight: 'bold' },
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
                backgroundColor: ['#1E88E5', '#4DD0E1'], // 하늘색, 연보라색
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // 범례 삭제
                },
                datalabels: {
                    display: true,
                    formatter: function(value, context) {
                        const label = context.chart.data.labels[context.dataIndex];
                        return label + ' ' + value.toFixed(1) + '시간'; // "남성 1.2" 형태로 표시
                    },
                    color: '#000000',
                    font: {
                        size: 15,
                        weight: 'bold'
                    }
                },
                tooltip: {
                    titleFont: {
                        size: 18,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 18,
                        weight: 'bold'
                    },
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
                backgroundColor: ['#1E88E5', '#4DD0E1'], // 미디엄 블루, 청록색
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // 범례 삭제
                },
                datalabels: {
                    display: true,
                    formatter: function(value, context) {
                        const label = context.chart.data.labels[context.dataIndex];
                        return label + ' ' + value.toFixed(1) + '시간'; // "남성 1.2" 형태로 표시
                    },
                    color: '#000000',
                    font: {
                        size: 15,
                        weight: 'bold'
                    }
                },
                tooltip: {
                    titleFont: {
                        size: 18,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 18,
                        weight: 'bold'
                    },
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

    // 누적 최대값 계산 (자가 + 고용 노동시간의 합)
    const stackedTotals = fixedYears.map((_, index) => 
        selfLaborData[index] + hiredLaborData[index]
    );
    const maxStackedValue = Math.max(...stackedTotals);
    const yAxisMax = maxStackedValue * 1.35;

    const ctx = document.getElementById('annualLaborChart').getContext('2d');
    if (charts['annualLaborChart']) charts['annualLaborChart'].destroy();

    charts['annualLaborChart'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: fixedYears.map(y => y + '년'),
            datasets: [
                {
                    label: '자가노동시간',
                    data: selfLaborData,
                    backgroundColor: 'rgba(37, 99, 235, 0.5)',
                    borderColor: 'transparent',
                    borderWidth: 0
                },
                {
                    label: '고용노동시간',
                    data: hiredLaborData,
                    backgroundColor: 'rgba(96, 165, 250, 0.5)',
                    borderColor: 'transparent',
                    borderWidth: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    titleFont: {
                        size: 18,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 18,
                        weight: 'bold'
                    },
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y + '시간';
                        }
                    }
                },
                datalabels: {
                    anchor: 'center',
                    align: 'center',
                    font: { weight: 'bold', size: 15 },
                    formatter: function(value, context) {
                        const label = context.dataset.label;
                        if(label === '자가노동시간') {
                            return '자가 ' + value.toFixed(1) + '시간';
                        } else if(label === '고용노동시간') {
                            return '고용 ' + value.toFixed(1) + '시간';
                        }
                        return value.toFixed(1);
                    },
                    color: '#000'
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: { display: false },
                    ticks: {
                        font: { size: 15, weight: 'bold' },
                        color: '#1f2937'
                    }
                },
                y: {
                    stacked: true,
                    display: false,
                    beginAtZero: true,
                    max: yAxisMax,
                    ticks: {
                        font: { size: 18 },
                        color: '#6b7280'
                    }
                }
            }
        }
    });
}


function updateCropIncomeChart() {
    let cropIncomeData = csvData.filter(item => {
        return item.category === '소득' &&
               item.region === currentFilters.region &&
               item.year === currentFilters.year &&
               (!currentFilters.cropGroup || item.cropGroup === currentFilters.cropGroup);
    });

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
                backgroundColor: 'rgba(147, 197, 253, 0.7)',  // 통일된 색상
                borderColor: 'transparent', // 테두리 없음
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            indexAxis: 'y',
            maintainAspectRatio: false,
            layout: {
                padding: {
                    right: 15  // 우측 여백 15px
                }
            },
            scales: {
                x: {
                    display: false, // x축 숨김
                    grid: {
                        display: false // x축 격자 숨김
                    },
                    max: Math.max(...cropIncomes.map(item => item.income)) * 1.35 // 최대값의 1.5배
                },
                y: {
                    grid: {
                        display: false // y축 격자 숨김
                    },
                    ticks: {
                        maxWidth: 150,
                        font: {
                            size: 15,   // 
                            weight: 'bold' // 굵게
                        }
                    }
                }
            },
            plugins: {
                datalabels: {
                    anchor: 'end',
                    align: 'right',  // 막대 끝쪽에서 안쪽으로
                    formatter: value => value.toLocaleString(), // '₩' 제거
                    font: { size: 15, weight: 'bold'},
                    color: '#374151'
                },
                legend: { display: false },
                tooltip: {
                    titleFont: {
                        size: 18,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 18,
                        weight: 'bold'
                    },
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

// 1. 사이드바 토글 (모바일 전용) - 디버깅 추가
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.querySelector('.mobile-toggle-btn');
    
    if (!sidebar) {
        console.error('사이드바를 찾을 수 없습니다.');
        return;
    }
    
    console.log('토글 시작 - 현재 클래스:', sidebar.className);
    
    // 강제로 클래스 토글
    if (sidebar.classList.contains('expanded')) {
        // 축소
        sidebar.classList.remove('expanded');
        sidebar.classList.add('collapsed');
        sidebar.style.maxHeight = '45px';
        sidebar.style.overflow = 'hidden';
        sidebar.style.position = 'relative'; // 일반 위치로 복원
        sidebar.style.top = '';
        sidebar.style.left = '';
        sidebar.style.right = '';
        sidebar.style.width = '';
        sidebar.style.zIndex = '';
        if (toggleBtn) {
            toggleBtn.textContent = '필터 ▼';
            toggleBtn.setAttribute('aria-expanded', 'false');
        }
        console.log('사이드바 축소됨');
    } else {
        // 확장
        sidebar.classList.remove('collapsed');
        sidebar.classList.add('expanded');
        sidebar.style.maxHeight = '80vh'; // 문자열로 올바르게 설정
        sidebar.style.overflow = 'auto';
        if (toggleBtn) {
            toggleBtn.textContent = '필터 ▲';
            toggleBtn.setAttribute('aria-expanded', 'true');
        }
        console.log('사이드바 확장됨');
    }
    
    console.log('토글 완료 - 변경된 클래스:', sidebar.className);
    console.log('현재 maxHeight:', sidebar.style.maxHeight);
}

// 안전하게 토글을 생성/반환 (있으면 재사용)
function ensureToggleExists() {
    let btn = document.querySelector('.mobile-toggle-btn');
    if (btn) return btn;

    btn = document.createElement('button');
    btn.className = 'mobile-toggle-btn';
    btn.type = 'button';
    btn.innerText = '필터 ▼';
    btn.setAttribute('aria-expanded', 'false');
    
    // ★ 생성과 동시에 이벤트 리스너 등록 - 디버깅 추가
    btn.addEventListener('click', function(e) {
        console.log('클릭 이벤트 발생!'); // 디버깅용
        e.preventDefault();
        toggleSidebar();
    });
    
    btn.addEventListener('touchstart', function(e) {
        console.log('터치 이벤트 발생!'); // 디버깅용
        e.preventDefault();
        toggleSidebar();
    });
    
    console.log('버튼 생성 및 이벤트 리스너 등록 완료'); // 디버깅용
    
    const container = document.querySelector('.container');
    if (container) {
        container.appendChild(btn);
    } else {
        document.body.appendChild(btn);
    }
    
    return btn;
}

function handleResize() {
    const width = window.innerWidth;
    const sidebar = document.getElementById('sidebar');
    const container = document.querySelector('.container');
    const incomeSection = document.querySelector('.income-analysis-section');
    const toggleBtn = ensureToggleExists();

    // 안전: container가 없다면 더 이상 진행하지 않음
    if (!container) return;

    if (width >= 1400) {
        // 데스크탑 모드
        if (toggleBtn) {
            toggleBtn.style.display = 'none';
            toggleBtn.style.visibility = 'hidden';
            toggleBtn.setAttribute('aria-hidden', 'true');
        }

        if (sidebar) {
            sidebar.classList.remove('expanded', 'collapsed');
            sidebar.style.maxHeight = '';
            sidebar.style.overflow = '';
        }

        // CSS 기반 그리드로 맡기되, 인라인 스타일로 강제한 것이 있다면 초기화
        container.style.display = '';
        container.style.gridTemplateColumns = '';
        container.style.gridTemplateRows = '';
        container.style.flexDirection = '';

        if (incomeSection) {
            incomeSection.style.cssText = '';
        }

    } else {
        // 모바일 모드
        if (toggleBtn) {
            // CSS에서 이미 fixed 위치로 설정했으므로 display만 제어
            toggleBtn.style.display = 'block';
            toggleBtn.style.visibility = 'visible';
            toggleBtn.style.opacity = '1';
            // fixed 위치는 CSS에서 처리하므로 position 관련 인라인 스타일 제거
            toggleBtn.style.position = '';
            toggleBtn.style.top = '';
            toggleBtn.style.right = '';
            toggleBtn.setAttribute('aria-hidden', 'false');
        }

        container.style.display = 'flex';
        container.style.flexDirection = 'column';

        if (incomeSection) {
            incomeSection.style.width = '100%';
            incomeSection.style.height = 'auto';
            incomeSection.style.flex = '1 1 auto';
            incomeSection.style.gridColumn = 'unset';
            incomeSection.style.gridRow = 'unset';
        }

        if (sidebar && !sidebar.classList.contains('expanded')) {
            sidebar.classList.add('collapsed');
            sidebar.style.maxHeight = '45px'; // CSS와 일치하도록 수정
            sidebar.style.overflow = 'hidden';
        }
    }
}

function initResponsiveSidebar() {
    // 토글이 없으면 생성, 클릭 이벤트 한 번만 붙임
    const toggleBtn = ensureToggleExists();
    const sidebar = document.getElementById('sidebar');

    // if (toggleBtn && !toggleBtn.__sidebarToggleInitialized) {
    //     // 클릭과 터치 이벤트 모두 처리
    //     toggleBtn.addEventListener('click', function(e) {
    //         e.preventDefault();
    //         toggleSidebar();
    //     });
        
    //     toggleBtn.addEventListener('touchstart', function(e) {
    //         e.preventDefault();
    //         toggleSidebar();
    //     });
        
    //     // 마커로 중복 등록 방지
    //     toggleBtn.__sidebarToggleInitialized = true;
    // }

    // 초기 상태 설정 - 모바일에서는 기본적으로 축소 상태
    if (sidebar && window.innerWidth < 1400) {
        sidebar.classList.remove('expanded');
        sidebar.classList.add('collapsed');
        sidebar.style.maxHeight = '45px';
        sidebar.style.overflow = 'hidden';
        console.log('초기 상태: 사이드바 축소');
    }

    // resize 이벤트 (디바운스)
    let tid = null;
    window.addEventListener('resize', () => {
        if (tid) clearTimeout(tid);
        tid = setTimeout(handleResize, 120);
    });

    // 초기 상태 적용
    handleResize();
}

// 4. 페이지 초기화
function initializeApp() {
    initResponsiveSidebar();

    if (typeof loadCSVFromGitHub === 'function') {
        loadCSVFromGitHub();
    }
}

// 5. 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// 전역에서 한 번만
Chart.register(ChartDataLabels);
