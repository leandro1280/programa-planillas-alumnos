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
        // ... (continúa con los demás cursos)
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
                } else {
                    celdaNombre.textContent = '';
                }

                // Celda para la materia
                const celdaMateria = document.createElement('td');
                celdaMateria.textContent = materia;

                // Crear celdas para las notas y asistencias
                const celdasDatos = [];
                for (let i = 0; i < 10; i++) {
                    const celda = document.createElement('td');

                    if (columnas[i + 2].startsWith('Nota')) {
                        const inputNota = document.createElement('input');
                        inputNota.type = 'number';
                        inputNota.classList.add('form-control', 'input-nota');
                        inputNota.min = 1;
                        inputNota.max = 10;
                        inputNota.dataset.tipo = columnas[i + 2]; // 'Nota 1' o 'Nota 2'

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

        let indiceTEA, indiceTEP, indiceTED;
        if (tipoNota === 'Nota 1') {
            indiceTEA = 2; // TEA 1
            indiceTEP = 3; // TEP 1
            indiceTED = 4; // TED 1
        } else {
            indiceTEA = 6; // TEA 2
            indiceTEP = 7; // TEP 2
            indiceTED = 8; // TED 2
        }

        // Limpiar cruces anteriores
        const celdas = fila.querySelectorAll('td');
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

        const filas = Array.from(planillaContainer.querySelectorAll('tbody tr'));

        if (tipoExportacion === 'parcial') {
            // Ocultar las filas de alumnos no seleccionados
            filas.forEach(fila => {
                const checkbox = fila.querySelector('.checkbox-alumno');
                if (checkbox && !checkbox.checked) {
                    // Ocultar todas las filas correspondientes al alumno
                    let nextFila = fila;
                    do {
                        nextFila.style.display = 'none';
                        nextFila = nextFila.nextElementSibling;
                    } while (nextFila && !nextFila.querySelector('.checkbox-alumno'));
                }
            });
        }

        // Esperar un breve momento antes de capturar
        setTimeout(async () => {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4'); // Orientación vertical

            // Número de alumnos por página
            const alumnosPorPagina = 4;

            // Obtener los índices de las filas donde comienza cada alumno
            const indicesAlumnos = [];
            filas.forEach((fila, index) => {
                const checkbox = fila.querySelector('.checkbox-alumno');
                if (checkbox) {
                    indicesAlumnos.push(index);
                }
            });

            // Número de filas por alumno (número de materias)
            const filasPorAlumno = materiasPorCurso[cursoSeleccionado].length;

            // Procesar cada grupo de alumnos
            for (let i = 0; i < indicesAlumnos.length; i += alumnosPorPagina) {
                // Crear un clon de la tabla
                const tablaClonada = planillaContainer.querySelector('table').cloneNode(true);

                // Obtener las filas del grupo actual
                const grupoIndices = indicesAlumnos.slice(i, i + alumnosPorPagina);
                const inicio = grupoIndices[0];
                const fin = grupoIndices[grupoIndices.length - 1] + filasPorAlumno;

                // Clonar las filas del encabezado
                const thead = tablaClonada.querySelector('thead');
                const tbody = tablaClonada.querySelector('tbody');
                tbody.innerHTML = ''; // Limpiar el tbody

                // Agregar las filas correspondientes al grupo actual
                const filasGrupo = filas.slice(inicio, fin);
                filasGrupo.forEach(fila => {
                    const filaClonada = fila.cloneNode(true);
                    tbody.appendChild(filaClonada);
                });

                // Crear un contenedor temporal para renderizar
                const contenedorTemporal = document.createElement('div');
                contenedorTemporal.style.visibility = 'hidden';
                contenedorTemporal.style.position = 'absolute';
                contenedorTemporal.style.top = '0';
                contenedorTemporal.style.left = '0';
                contenedorTemporal.style.width = '210mm';
                contenedorTemporal.style.backgroundColor = 'white';
                contenedorTemporal.appendChild(tablaClonada);
                document.body.appendChild(contenedorTemporal);

                // Esperar un momento para asegurar que el contenido se renderiza
                await new Promise(resolve => setTimeout(resolve, 100));

                // Renderizar el contenedor temporal
                await html2canvas(contenedorTemporal, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true
                }).then(canvas => {
                    const imgData = canvas.toDataURL('image/png');
                    const imgWidth = 210; // Ancho de una página A4 en mm
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;

                    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                    if (i + alumnosPorPagina < indicesAlumnos.length) {
                        pdf.addPage();
                    }
                });

                // Eliminar el contenedor temporal
                document.body.removeChild(contenedorTemporal);
            }

            pdf.save(`planilla_${cursoSeleccionado.replace(' ', '_')}.pdf`);

            // Restaurar la visibilidad de las filas
            filas.forEach(fila => {
                fila.style.display = '';
            });
        }, 500); // Esperar 500 ms
    }

    function exportToExcel() {
        // Recoger datos de la tabla
        const tabla = planillaContainer.querySelector('table');
        if (!tabla) {
            alert('No hay datos para exportar.');
            return;
        }

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.table_to_sheet(tabla);
        XLSX.utils.book_append_sheet(wb, ws, 'Planilla');

        XLSX.writeFile(wb, `planilla_${cursoSeleccionado.replace(' ', '_')}.xlsx`);
    }
});
