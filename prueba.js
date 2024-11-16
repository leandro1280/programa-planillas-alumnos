document.addEventListener('DOMContentLoaded', () => { 
    const inputCSV = document.getElementById('inputCSV');
    const cursoContainer = document.getElementById('curso-container');
    const planillaContainer = document.getElementById('planilla-container');
    const exportarCompletaButton = document.getElementById('exportarCompleta');
    const exportarParcialButton = document.getElementById('exportarParcial');
    const exportarExcelButton = document.getElementById('exportarExcel');

    let alumnosData = []; // Datos de los alumnos
    let cursosDisponibles = []; // Cursos disponibles
    let cursoSeleccionado = ''; // Curso seleccionado
    let materiasPorCurso = {}; // Materias por curso

    // Definir las materias para cada curso (asegurando que los nombres de los cursos están en minúsculas)
    materiasPorCurso = {
        '1ro 1ra': ['CNT', 'CS', 'CCD', 'ART', 'EFC', 'IGS', 'MTM', 'PLG'],
        '1ro 2da': ['CNT', 'CS', 'CCD', 'ART', 'EFC', 'IGS', 'MTM', 'PLG'],
        '1ro 3ra': ['CNT', 'CS', 'CCD', 'ART', 'EFC', 'IGS', 'MTM', 'PLG'],
        '2do 1ra': ['BLG', 'ART', 'IGS', 'CCD', 'EFC', 'FQA', 'GGF', 'HTR', 'MTM', 'PLG'],
        '2do 2da': ['BLG', 'ART', 'IGS', 'CCD', 'EFC', 'FQA', 'GGF', 'HTR', 'MTM', 'PLG'],
        '2do 3ra': ['BLG', 'ART', 'IGS', 'CCD', 'EFC', 'FQA', 'GGF', 'HTR', 'MTM', 'PLG'],
        '3ro 1ra': ['BLG', 'ART', 'IGS', 'CCD', 'EFC', 'FQA', 'GGF', 'HTR', 'MTM', 'PLG'],
        '3ro 2da': ['BLG', 'ART', 'IGS', 'CCD', 'EFC', 'FQA', 'GGF', 'HTR', 'MTM', 'PLG'],
        '4to 1ra': ['INT FISICA', 'BLG', 'NTICX', 'IGS', 'PSI', 'EFC', 'SYA', 'GGF', 'HTR', 'MTM', 'LIT'],
        '4to 2da': ['INT FISICA', 'BLG', 'NTICX', 'IGS', 'PSI', 'EFC', 'SYA', 'GGF', 'HTR', 'MTM', 'LIT'],
        '5to 1ra': ['CCS', 'ECO', 'INT QUI', 'PYC', 'IGS', 'SOC', 'EFC', 'GGF', 'HTR', 'MTM', 'LIT'],
        '5to 2da': ['CCS', 'ECO', 'INT QUI', 'PYC', 'IGS', 'SOC', 'EFC', 'GGF', 'HTR', 'MTM', 'LIT'],
        '6to 1ra': ['PIC', 'TYC', 'FILO', 'ARTE', 'IGS', 'EFC', 'GGF', 'HTR', 'MTM', 'LIT'],
        '6to 2da': ['PIC', 'TYC', 'FILO', 'ARTE', 'IGS', 'EFC', 'GGF', 'HTR', 'MTM', 'LIT'],
    };

    inputCSV.addEventListener('change', handleFileSelect);
    exportarCompletaButton.addEventListener('click', () => exportToPDF('completa'));
    exportarParcialButton.addEventListener('click', () => exportToPDF('parcial'));
    exportarExcelButton.addEventListener('click', exportToExcel);

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const contents = e.target.result;
                parseCSV(contents);
            };
            reader.readAsText(file);
        }
    }

    function parseCSV(contents) {
        const rows = contents.split('\n').map(r => r.trim()).filter(r => r);

        // Ignorar la línea de encabezado si existe
        let dataRows = rows;
        if (rows[0].includes(';')) {
            dataRows = rows.slice(1); // Si hay encabezado, lo ignoramos
        }

        const data = dataRows.map(row => {
            const cols = row.split(';').map(c => c.trim()); // Usamos punto y coma como separador
            if (cols.length >= 2) {
                return {
                    Curso: cols[0].toLowerCase().trim(),
                    Nombre: cols[1]
                };
            } else {
                return null; // Ignorar filas que no tienen al menos dos columnas
            }
        }).filter(item => item !== null);

        alumnosData = data;
        cursosDisponibles = [...new Set(alumnosData.map(a => a.Curso))];

        displayCursoSelection();
    }

    function displayCursoSelection() {
        cursoContainer.innerHTML = '';
        const label = document.createElement('label');
        label.textContent = 'Selecciona el curso:';
        label.classList.add('form-label');

        const select = document.createElement('select');
        select.classList.add('form-select');

        if (cursosDisponibles.length === 0) {
            select.innerHTML = '<option value="">No hay cursos disponibles</option>';
            select.disabled = true;
        } else {
            select.innerHTML = cursosDisponibles.map(curso => `<option value="${curso}">${curso.toUpperCase()}</option>`).join('');
            select.disabled = false;
        }

        cursoContainer.appendChild(label);
        cursoContainer.appendChild(select);

        select.addEventListener('change', () => {
            cursoSeleccionado = select.value.toLowerCase().trim();
            const alumnosDelCurso = alumnosData.filter(a => a.Curso === cursoSeleccionado);
            displayPlanilla(alumnosDelCurso);
        });

        // Seleccionar el primer curso por defecto si hay cursos disponibles
        if (cursosDisponibles.length > 0) {
            select.value = cursosDisponibles[0];
            select.dispatchEvent(new Event('change'));
        }
    }

    function displayPlanilla(alumnos) {
        planillaContainer.innerHTML = '';

        // Crear contenedor de la planilla
        const planilla = document.createElement('div');
        planilla.classList.add('planilla');

        // Título de la planilla
        const titulo = document.createElement('h3');
        titulo.textContent = `Planilla de ${cursoSeleccionado.toUpperCase()}`;
        planilla.appendChild(titulo);

        // Verificar que el curso tiene materias definidas
        if (!materiasPorCurso[cursoSeleccionado]) {
            alert(`No hay materias definidas para el curso ${cursoSeleccionado.toUpperCase()}`);
            return;
        }

        // Crear la tabla de la planilla
        const tabla = document.createElement('table');
        tabla.classList.add('table', 'table-bordered', 'tabla-planilla');

        // Crear el encabezado de la tabla
        const thead = document.createElement('thead');
        thead.classList.add('table-dark');
        const encabezadoFila = document.createElement('tr');

        // Agregar columnas al encabezado
        const columnas = ['Alumno', 'Materia', 'TEA 1', 'TEP 1', 'TED 1', 'Nota 1', 'Asistencia 1', 'TEA 2', 'TEP 2', 'TED 2', 'Nota 2', 'Asistencia 2'];

        columnas.forEach(columna => {
            const th = document.createElement('th');
            th.textContent = columna;
            encabezadoFila.appendChild(th);
        });

        thead.appendChild(encabezadoFila);
        tabla.appendChild(thead);

        // Crear el cuerpo de la tabla
        const tbody = document.createElement('tbody');

        // Por cada alumno y por cada materia, crear una fila
        alumnos.forEach(alumno => {
            materiasPorCurso[cursoSeleccionado].forEach((materia, index) => {
                const fila = document.createElement('tr');

                // Celda para el nombre del alumno y checkbox (solo en la primera materia)
                const celdaNombre = document.createElement('td');
                if (index === 0) {
                    // Crear contenedor para el nombre y el checkbox
                    const contenedorNombre = document.createElement('div');
                    contenedorNombre.style.display = 'flex';
                    contenedorNombre.style.alignItems = 'center';

                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.classList.add('form-check-input', 'checkbox-alumno');
                    checkbox.checked = true; // Seleccionado por defecto
                    alumno.checkbox = checkbox;

                    const nombreTexto = document.createElement('span');
                    nombreTexto.textContent = ' ' + alumno.Nombre;

                    contenedorNombre.appendChild(checkbox);
                    contenedorNombre.appendChild(nombreTexto);

                    celdaNombre.appendChild(contenedorNombre);
                    celdaNombre.classList.add('celda-nombre');
                    celdaNombre.setAttribute('rowspan', materiasPorCurso[cursoSeleccionado].length); // Combinar celdas
                } else {
                    celdaNombre.style.display = 'none'; // Ocultar celdas adicionales del nombre
                }

                // Celda para la materia
                const celdaMateria = document.createElement('td');
                celdaMateria.textContent = materia;

                // Crear celdas para TEA, TEP, TED, Nota y Asistencia
                const celdasDatos = [];

                for (let i = 2; i < columnas.length; i++) {
                    const celda = document.createElement('td');

                    if (columnas[i].startsWith('Nota')) {
                        const inputNota = document.createElement('input');
                        inputNota.type = 'number';
                        inputNota.classList.add('form-control', 'input-nota');
                        inputNota.min = 1;
                        inputNota.max = 10;
                        inputNota.dataset.tipo = columnas[i]; // 'Nota 1' o 'Nota 2'

                        // Agregar evento para actualizar las cruces
                        inputNota.addEventListener('input', () => {
                            actualizarCruces(fila, inputNota);
                        });

                        celda.appendChild(inputNota);
                    } else {
                        // Dejar celdas vacías para TEA, TEP, TED y Asistencia
                        celda.classList.add('celda-cruz');
                    }

                    celdasDatos.push(celda);
                }

                // Agregar celdas a la fila
                fila.appendChild(celdaNombre);
                fila.appendChild(celdaMateria);
                celdasDatos.forEach(celda => fila.appendChild(celda));

                tbody.appendChild(fila);
            });
        });

        tabla.appendChild(tbody);
        planilla.appendChild(tabla);
        planillaContainer.appendChild(planilla);
    }

    function actualizarCruces(fila, inputNota) {
        const nota = parseInt(inputNota.value);
        const tipoNota = inputNota.dataset.tipo; // 'Nota 1' o 'Nota 2'

        if (isNaN(nota)) return;

        // Obtener todas las celdas de la fila
        const celdas = fila.querySelectorAll('td');

        let indiceTEA, indiceTEP, indiceTED, indiceNota;
        if (tipoNota === 'Nota 1') {
            indiceTEA = 2; // TEA 1
            indiceTEP = 3; // TEP 1
            indiceTED = 4; // TED 1
            indiceNota = 5; // Nota 1
        } else {
            indiceTEA = 7; // TEA 2
            indiceTEP = 8; // TEP 2
            indiceTED = 9; // TED 2
            indiceNota = 10; // Nota 2
        }

        // Limpiar cruces anteriores
        celdas[indiceTEA].textContent = '';
        celdas[indiceTEP].textContent = '';
        celdas[indiceTED].textContent = '';

        // Marcar la celda correspondiente
        if (nota >= 1 && nota <= 3) {
            celdas[indiceTED].textContent = 'X';
        } else if (nota >= 4 && nota <= 6) {
            celdas[indiceTEP].textContent = 'X';
        } else if (nota >= 7 && nota <= 10) {
            celdas[indiceTEA].textContent = 'X';
        }
    }

    function exportToPDF(tipoExportacion) {
        console.log('Exportando PDF para el curso:', cursoSeleccionado);
        if (!materiasPorCurso[cursoSeleccionado]) {
            alert('No hay materias definidas para este curso.');
            return;
        }

        // Clonar el contenedor de la planilla
        const planillaClonada = planillaContainer.cloneNode(true);

        // Eliminar los botones de exportación en el clon
        const botonesClon = planillaClonada.querySelector('#botones-exportacion');
        if (botonesClon) {
            botonesClon.remove();
        }

        const filas = Array.from(planillaClonada.querySelectorAll('tbody tr'));

        if (tipoExportacion === 'parcial') {
            // Crear una lista para almacenar las filas que se van a eliminar
            const filasParaEliminar = [];

            for (let i = 0; i < filas.length; i++) {
                const fila = filas[i];
                const checkbox = fila.querySelector('.checkbox-alumno');
                if (checkbox) {
                    if (!checkbox.checked) {
                        // Si el alumno está deseleccionado, eliminar esta fila y todas las siguientes hasta el próximo alumno
                        filasParaEliminar.push(fila);
                        let j = i + 1;
                        while (j < filas.length && !filas[j].querySelector('.checkbox-alumno')) {
                            filasParaEliminar.push(filas[j]);
                            j++;
                        }
                        i = j - 1; // Actualizar el índice i
                    }
                }
            }

            // Eliminar las filas marcadas
            filasParaEliminar.forEach(fila => fila.parentNode.removeChild(fila));
        }

        // Actualizar las filas después de eliminar
        const filasAlumnos = Array.from(planillaClonada.querySelectorAll('tbody tr'));

        // Si no hay alumnos seleccionados, mostrar un mensaje
        if (filasAlumnos.length === 0) {
            alert('No hay alumnos seleccionados para exportar.');
            return;
        }

        // Determinar cuántas filas caben en una página
        const alturaPagina = 297; // Altura de una página A4 en mm
        const alturaFila = 10; // Altura estimada de una fila en mm (puedes ajustarla)
        const filasPorPagina = Math.floor((alturaPagina - 40) / alturaFila); // Restamos espacio para márgenes y encabezados

        // Dividir las filas en grupos para cada página
        const gruposDeFilas = [];
        for (let i = 0; i < filasAlumnos.length; i += filasPorPagina) {
            gruposDeFilas.push(filasAlumnos.slice(i, i + filasPorPagina));
        }

        setTimeout(async () => {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4'); // Orientación vertical

            for (let i = 0; i < gruposDeFilas.length; i++) {
                const tablaClonada = planillaClonada.querySelector('table').cloneNode(true);
                const tbody = tablaClonada.querySelector('tbody');
                tbody.innerHTML = ''; // Limpiar el tbody

                // Agregar las filas correspondientes al grupo actual
                gruposDeFilas[i].forEach(fila => {
                    tbody.appendChild(fila.cloneNode(true));
                });

                // Crear un contenedor temporal para renderizar
                const contenedorTemporal = document.createElement('div');
                contenedorTemporal.style.position = 'absolute';
                contenedorTemporal.style.left = '-9999px'; // Mover fuera de la pantalla
                contenedorTemporal.style.top = '0';
                contenedorTemporal.style.backgroundColor = 'white';
                contenedorTemporal.appendChild(tablaClonada);
                document.body.appendChild(contenedorTemporal);

                // Esperar un momento para asegurar que el contenido se renderiza
                await new Promise(resolve => setTimeout(resolve, 500));

                // Renderizar el contenedor temporal
                await html2canvas(contenedorTemporal, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    windowWidth: tablaClonada.scrollWidth,
                    windowHeight: tablaClonada.scrollHeight
                }).then(canvas => {
                    const imgData = canvas.toDataURL('image/png');
                    const imgWidth = 210; // Ancho de una página A4 en mm
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;

                    if (i > 0) {
                        pdf.addPage();
                    }
                    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                });

                // Eliminar el contenedor temporal
                document.body.removeChild(contenedorTemporal);
            }

            pdf.save(`planilla_${cursoSeleccionado.replace(' ', '_')}.pdf`);
        }, 500); // Esperar 500 ms
    }

    function exportToExcel() {
        console.log('Exportando a Excel para el curso:', cursoSeleccionado);

        if (!materiasPorCurso[cursoSeleccionado]) {
            alert('No hay materias definidas para este curso.');
            return;
        }

        // Clonar la tabla de la planilla
        const tablaOriginal = planillaContainer.querySelector('table');
        if (!tablaOriginal) {
            alert('No hay datos para exportar.');
            return;
        }

        const tablaClonada = tablaOriginal.cloneNode(true);

        // Eliminar las filas de alumnos deseleccionados en el clon
        const filas = Array.from(tablaClonada.querySelectorAll('tbody tr'));
        const filasParaEliminar = [];

        for (let i = 0; i < filas.length; i++) {
            const fila = filas[i];
            const checkbox = fila.querySelector('.checkbox-alumno');
            if (checkbox) {
                if (!checkbox.checked) {
                    // Si el alumno está deseleccionado, eliminar esta fila y todas las siguientes hasta el próximo alumno
                    filasParaEliminar.push(fila);
                    let j = i + 1;
                    while (j < filas.length && !filas[j].querySelector('.checkbox-alumno')) {
                        filasParaEliminar.push(filas[j]);
                        j++;
                    }
                    i = j - 1; // Actualizar el índice i
                }
            }
        }

        // Eliminar las filas marcadas
        filasParaEliminar.forEach(fila => fila.parentNode.removeChild(fila));

        // Convertir la tabla clonada a una hoja de cálculo
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.table_to_sheet(tablaClonada);

        // Ajustar el ancho de las columnas
        ws['!cols'] = [
            { wpx: 200 }, // Columna Alumno
            { wpx: 100 }, // Columna Materia
            { wpx: 50 },  // TEA 1
            { wpx: 50 },  // TEP 1
            { wpx: 50 },  // TED 1
            { wpx: 50 },  // Nota 1
            { wpx: 70 },  // Asistencia 1
            { wpx: 50 },  // TEA 2
            { wpx: 50 },  // TEP 2
            { wpx: 50 },  // TED 2
            { wpx: 50 },  // Nota 2
            { wpx: 70 },  // Asistencia 2
        ];

        // Aplicar bordes a todas las celdas
        const rango = XLSX.utils.decode_range(ws['!ref']);
        for (let R = rango.s.r; R <= rango.e.r; ++R) {
            for (let C = rango.s.c; C <= rango.e.c; ++C) {
                const celdaDireccion = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[celdaDireccion]) continue;

                if (!ws[celdaDireccion].s) ws[celdaDireccion].s = {};

                ws[celdaDireccion].s.border = {
                    top: { style: 'thin', color: { rgb: '000000' } },
                    bottom: { style: 'thin', color: { rgb: '000000' } },
                    left: { style: 'thin', color: { rgb: '000000' } },
                    right: { style: 'thin', color: { rgb: '000000' } }
                };
            }
        }

        // Ajustar el estilo de las celdas de la primera columna (centrado vertical)
        for (let R = rango.s.r; R <= rango.e.r; ++R) {
            const celdaDireccion = XLSX.utils.encode_cell({ r: R, c: 0 }); // Columna A
            if (!ws[celdaDireccion]) continue;

            if (!ws[celdaDireccion].s) ws[celdaDireccion].s = {};

            ws[celdaDireccion].s.alignment = {
                vertical: 'center',
                wrapText: true
            };
        }

        XLSX.utils.book_append_sheet(wb, ws, 'Planilla');

        // Exportar el libro a un archivo Excel
        XLSX.writeFile(wb, `planilla_${cursoSeleccionado.replace(' ', '_')}.xlsx`);
    }
});
function actualizarPorcentajes() {
    const totalTEA = document.querySelectorAll('.celda-cruz:contains("X")').length;
    const totalNotas = document.querySelectorAll('.input-nota').length;

    const porcentajeTEA = (totalTEA / totalNotas) * 100;

    // Puedes hacer lo mismo para TEP y TED
    // Calcula el total de TEP y TED marcados con 'X'


    const porcentajeTEP = (totalTEP / totalNotas) * 100;
    const porcentajeTED = (totalTED / totalNotas) * 100;

    // Mostrar los porcentajes
    const porcentajesContainer = document.getElementById('porcentajes-container');
    porcentajesContainer.innerHTML = `
        <p>Porcentaje TEA: ${porcentajeTEA.toFixed(2)}%</p>
        <p>Porcentaje TEP: ${porcentajeTEP.toFixed(2)}%</p>
        <p>Porcentaje TED: ${porcentajeTED.toFixed(2)}%</p>
    `;

}

function actualizarCruces(fila, inputNota) {
    // ... código existente ...

    // Marcar la celda correspondiente
    if (nota >= 1 && nota <= 3) {
        celdas[indiceTED].textContent = 'X';
    } else if (nota >= 4 && nota <= 6) {
        celdas[indiceTEP].textContent = 'X';
    } else if (nota >= 7 && nota <= 10) {
        celdas[indiceTEA].textContent = 'X';
    }

    // Actualizar los porcentajes
    actualizarPorcentajes();
}