// Función para crear un gráfico de torta (pie chart) con los porcentajes
function crearGraficoTorta(porcentajes) {
    const ctx = document.getElementById('graficoTorta').getContext('2d');
    
    // Configuración de los datos para el gráfico
    const data = {
        labels: porcentajes.map(item => item.nombre), // Nombre de las materias como etiquetas
        datasets: [{
            data: porcentajes.map(item => item.porcentaje), // Porcentajes calculados
            backgroundColor: ['#FF5733', '#33FF57', '#5733FF', '#FF33A1', '#FF8D1A'],
            hoverOffset: 4
        }]
    };

    // Crear el gráfico de torta (circular)
    new Chart(ctx, {
        type: 'pie', // Tipo de gráfico
        data: data, // Datos que se usarán
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            // Formato del tooltip
                            return tooltipItem.label + ': ' + tooltipItem.raw.toFixed(2) + '%';
                        }
                    }
                }
            }
        }
    });
}

// Función para crear un gráfico de barras con los porcentajes
function crearGraficoBarras(porcentajes) {
    const ctx = document.getElementById('graficoBarras').getContext('2d');
    
    const data = {
        labels: porcentajes.map(item => item.nombre), // Nombre de las materias como etiquetas
        datasets: [{
            label: 'Porcentaje (%)',
            data: porcentajes.map(item => item.porcentaje), // Porcentajes calculados
            backgroundColor: '#FF5733',
            borderColor: '#FF5733',
            borderWidth: 1
        }]
    };

    new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.label + ': ' + tooltipItem.raw.toFixed(2) + '%';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 10
                    }
                }
            }
        }
    });
}

// Función para obtener los porcentajes y crear los gráficos
function crearGraficos() {
    // Porcentaje de ejemplo, esto deberías reemplazarlo con los datos calculados
    const porcentajes = [
        { nombre: 'TEA', porcentaje: 35.5 },
        { nombre: 'TEP', porcentaje: 40.2 },
        { nombre: 'TED', porcentaje: 24.3 }
    ];

    // Crear el gráfico de torta
    crearGraficoTorta(porcentajes);

    // Crear el gráfico de barras
    crearGraficoBarras(porcentajes);
}
