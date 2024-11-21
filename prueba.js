// scripts.js

// Declaración global de variables
let inputCSV;
let cursoContainer;
let alumnoContainer;
let planillaContainer;
let exportarCompletaButton;
let exportarParcialButton;
let exportarExcelButton;
let limpiarAvancesButton; // Añadido para manejar el botón de limpiar datos

// Variables globales para almacenar datos
let alumnosData = []; // Datos de los alumnos
let cursosDisponibles = []; // Cursos disponibles
let cursoSeleccionado = ''; // Curso seleccionado
let materiasPorCurso = {}; // Materias por curso

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

// Event Listener para DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Asignar las referencias a elementos del DOM
    inputCSV = document.getElementById('inputCSV');
    cursoContainer = document.getElementById('curso-container');
    alumnoContainer = document.getElementById('alumno-container');
    planillaContainer = document.getElementById('planilla-container');
    exportarCompletaButton = document.getElementById('exportarCompleta');
    exportarParcialButton = document.getElementById('exportarParcial');
    exportarExcelButton = document.getElementById('exportarExcel');
    limpiarAvancesButton = document.getElementById('limpiarAvances'); // Referencia al botón de limpiar

    // Añadir event listeners
    inputCSV.addEventListener('change', handleFileSelect);
    exportarCompletaButton.addEventListener('click', () => exportToPDF('completa'));
    exportarParcialButton.addEventListener('click', () => exportToPDF('parcial'));
    exportarExcelButton.addEventListener('click', exportToExcel);
    limpiarAvancesButton.addEventListener('click', limpiarDatos); // Añadir listener para limpiar datos

    // Cargar avances al iniciar
    cargarAvances();
});

// Función para manejar la selección de archivo CSV
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

// Función para parsear el contenido del CSV
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

// Función para mostrar la selección de cursos
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
        displayAlumnoSelection(alumnosDelCurso);
        displayPlanilla(alumnosDelCurso);
        // Llamar a las funciones de cálculo de porcentajes si están disponibles
        if (typeof calcularPorcentajesGenerales === 'function' && typeof calcularPorcentajesEspecificos === 'function') {
            calcularPorcentajesGenerales();
            calcularPorcentajesEspecificos();
            crearGraficos(); // Llamada para crear gráficos
        }
    });

    // Seleccionar el primer curso por defecto si hay cursos disponibles
    if (cursosDisponibles.length > 0) {
        select.value = cursosDisponibles[0];
        select.dispatchEvent(new Event('change'));
    }
}

// Función para mostrar la selección de alumnos
function displayAlumnoSelection(alumnos) {
    alumnoContainer.innerHTML = '';
    const label = document.createElement('label');
    label.textContent = 'Selecciona el alumno:';
    label.classList.add('form-label');

    const select = document.createElement('select');
    select.classList.add('form-select');

    select.innerHTML = '<option value="">Todos los alumnos</option>' + alumnos.map(alumno => `<option value="${alumno.Nombre}">${alumno.Nombre}</option>`).join('');

    alumnoContainer.appendChild(label);
    alumnoContainer.appendChild(select);

    select.addEventListener('change', () => {
        const alumnoSeleccionado = select.value;
        let alumnosFiltrados = alumnos;
        if (alumnoSeleccionado) {
            alumnosFiltrados = alumnos.filter(a => a.Nombre === alumnoSeleccionado);
        }
        displayPlanilla(alumnosFiltrados);
        // Llamar a las funciones de cálculo de porcentajes si están disponibles
        if (typeof calcularPorcentajesGenerales === 'function' && typeof calcularPorcentajesEspecificos === 'function') {
            calcularPorcentajesGenerales();
            calcularPorcentajesEspecificos();
            crearGraficos(); // Llamada para crear gráficos
        }
    });
}

// Función para mostrar la planilla de notas
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

    // Agrupar materias por alumno
    const materiasPorAlumno = {};

    alumnos.forEach(alumno => {
        if (!materiasPorAlumno[alumno.Nombre]) {
            materiasPorAlumno[alumno.Nombre] = [];
        }
        materiasPorAlumno[alumno.Nombre].push(alumno);
    });

    // Iterar sobre cada alumno y sus materias
    for (const [nombre, materias] of Object.entries(materiasPorAlumno)) {
        const numeroDeMaterias = materiasPorCurso[cursoSeleccionado].length;
        materias.forEach((alumno, index) => {
            const fila = document.createElement('tr');

            // Si es la primera materia del alumno, agregar la celda del nombre con rowspan
            if (index === 0) {
                const celdaNombre = document.createElement('td');
                // Crear contenedor para checkbox y nombre
                const contenedorNombre = document.createElement('div');
                contenedorNombre.style.display = 'flex';
                contenedorNombre.style.alignItems = 'center';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.classList.add('form-check-input', 'checkbox-alumno');
                checkbox.checked = true; // Seleccionado por defecto

                const nombreTexto = document.createElement('span');
                nombreTexto.textContent = ' ' + nombre;

                contenedorNombre.appendChild(checkbox);
                contenedorNombre.appendChild(nombreTexto);

                celdaNombre.appendChild(contenedorNombre);
                celdaNombre.classList.add('celda-nombre');
                celdaNombre.setAttribute('rowspan', numeroDeMaterias);

                fila.appendChild(celdaNombre);
            }

            // Celda para la materia
            const materiaCell = document.createElement('td');
            materiaCell.textContent = alumno.Materia;

            fila.appendChild(materiaCell);

            // Crear celdas para TEA, TEP, TED, Nota y Asistencia
            columnas.slice(2).forEach(columna => {
                const celda = document.createElement('td');

                if (columna.startsWith('TEA')) {
                    // Asignar clase para TEA
                    celda.classList.add('celda-tea');
                } else if (columna.startsWith('TEP')) {
                    // Asignar clase para TEP
                    celda.classList.add('celda-tep');
                } else if (columna.startsWith('TED')) {
                    // Asignar clase para TED
                    celda.classList.add('celda-ted');
                } else if (columna.startsWith('Nota')) {
                    const inputNota = document.createElement('input');
                    inputNota.type = 'number';
                    inputNota.classList.add('form-control', 'input-nota');
                    inputNota.min = 1;
                    inputNota.max = 10;
                    inputNota.dataset.tipo = columna; // 'Nota 1' o 'Nota 2'

                    // Obtener el valor guardado en localStorage
                    const datosGuardados = JSON.parse(localStorage.getItem('gradesData')) || {};
                    const notaGuardada = datosGuardados[cursoSeleccionado]?.[nombre]?.[alumno.Materia]?.[columna] || '';
                    inputNota.value = notaGuardada;

                    // Añadir validaciones
                    inputNota.addEventListener('input', () => {
                        let valor = parseInt(inputNota.value);
                        if (isNaN(valor) || valor < 1 || valor > 10) {
                            inputNota.classList.add('is-invalid');
                        } else {
                            inputNota.classList.remove('is-invalid');
                            inputNota.classList.add('is-valid');
                        }
                        actualizarCruces(fila, inputNota);
                        // Guardar avances cada vez que se actualiza una nota
                        guardarAvances();
                        // Calcular y mostrar porcentajes si las funciones están disponibles
                        if (typeof calcularPorcentajesGenerales === 'function' && typeof calcularPorcentajesEspecificos === 'function') {
                            calcularPorcentajesGenerales();
                            calcularPorcentajesEspecificos();
                            crearGraficos(); // Actualizar gráficos
                        }
                    });

                    celda.appendChild(inputNota);
                } else {
                    // Asistencia u otras columnas (editable si se desea)
                    // Por ahora, dejar en blanco
                }

                fila.appendChild(celda);
            });

            // Verificación de la estructura de la fila
            if (fila.children.length !== columnas.length) {
                console.error(`Fila mal estructurada para el alumno ${nombre} y materia ${alumno.Materia}. Esperado ${columnas.length} celdas, pero recibió ${fila.children.length}.`);
            }

            tbody.appendChild(fila);
        });
    }

    tabla.appendChild(tbody);
    planilla.appendChild(tabla);
    planillaContainer.appendChild(planilla);

    // Actualizar las cruces basadas en notas guardadas
    actualizarCrucesDesdeLocalStorage();

    // Calcular y mostrar porcentajes
    if (typeof calcularPorcentajesGenerales === 'function' && typeof calcularPorcentajesEspecificos === 'function') {
        calcularPorcentajesGenerales();
        calcularPorcentajesEspecificos();
        crearGraficos(); // Crear gráficos
    }
}

// Función para actualizar las cruces desde los datos guardados
function actualizarCrucesDesdeLocalStorage() {
    const datosGuardados = JSON.parse(localStorage.getItem('gradesData')) || {};

    if (!datosGuardados[cursoSeleccionado]) return;

    const filas = Array.from(planillaContainer.querySelectorAll('tbody tr'));

    filas.forEach(fila => {
        const celdas = fila.querySelectorAll('td');
        if (celdas.length < 12) return; // Ignorar filas mal estructuradas

        const alumnoNombre = celdas[0].querySelector('span') ? celdas[0].querySelector('span').textContent.trim() : 'Desconocido';
        const materia = celdas[1].textContent.trim();

        const notasGuardadas = datosGuardados[cursoSeleccionado]?.[alumnoNombre]?.[materia];
        if (!notasGuardadas) return;

        // Actualizar las notas en los inputs
        const inputNota1 = celdas[5].querySelector('input');
        const inputNota2 = celdas[10].querySelector('input');

        if (inputNota1) inputNota1.value = notasGuardadas['Nota 1'] || '';
        if (inputNota2) inputNota2.value = notasGuardadas['Nota 2'] || '';

        // Actualizar las clases de validación
        validarInputNota(inputNota1);
        validarInputNota(inputNota2);

        // Actualizar las cruces basadas en las notas
        actualizarCruces(fila, inputNota1);
        actualizarCruces(fila, inputNota2);
    });
}

// Función para validar los inputs de nota
function validarInputNota(inputNota) {
    let valor = parseInt(inputNota.value);
    if (isNaN(valor) || valor < 1 || valor > 10) {
        inputNota.classList.add('is-invalid');
    } else {
        inputNota.classList.remove('is-invalid');
        inputNota.classList.add('is-valid');
    }
}

// Función para actualizar las cruces de TEA, TEP y TED
function actualizarCruces(fila, inputNota) {
    const nota = parseInt(inputNota.value);
    const tipoNota = inputNota.dataset.tipo; // 'Nota 1' o 'Nota 2'

    console.log('Actualizando cruces:', tipoNota, 'Nota:', nota);

    if (isNaN(nota)) {
        limpiarCruces(fila, tipoNota);
        return;
    }

    // Obtener las celdas relevantes usando clases
    const celdas = fila.querySelectorAll('td');
    // Índices:
    // Alumno: 0, Materia:1, TEA1:2, TEP1:3, TED1:4, Nota1:5, Asistencia1:6,
    // TEA2:7, TEP2:8, TED2:9, Nota2:10, Asistencia2:11

    let celdaTEA, celdaTEP, celdaTED;

    if (tipoNota === 'Nota 1') {
        celdaTEA = celdas[2];
        celdaTEP = celdas[3];
        celdaTED = celdas[4];
    } else if (tipoNota === 'Nota 2') {
        celdaTEA = celdas[7];
        celdaTEP = celdas[8];
        celdaTED = celdas[9];
    }

    if (!celdaTEA || !celdaTEP || !celdaTED) {
        console.error('No se encontraron las celdas TEA, TEP o TED en la fila.');
        return;
    }

    // Limpiar cruces anteriores
    celdaTEA.textContent = '';
    celdaTEP.textContent = '';
    celdaTED.textContent = '';

    // Marcar la celda correspondiente
    if (nota >= 1 && nota <= 3) {
        celdaTED.textContent = 'X';
    } else if (nota >= 4 && nota <= 6) {
        celdaTEP.textContent = 'X';
    } else if (nota >= 7 && nota <= 10) {
        celdaTEA.textContent = 'X';
    } else {
        // Nota fuera de rango, limpiar celdas
        console.warn('Nota fuera de rango para:', tipoNota, 'Nota ingresada:', nota);
    }
}

// Función para limpiar las cruces de TEA, TEP y TED
function limpiarCruces(fila, tipoNota) {
    const celdas = fila.querySelectorAll('td');

    let celdaTEA, celdaTEP, celdaTED;

    if (tipoNota === 'Nota 1') {
        celdaTEA = celdas[2];
        celdaTEP = celdas[3];
        celdaTED = celdas[4];
    } else if (tipoNota === 'Nota 2') {
        celdaTEA = celdas[7];
        celdaTEP = celdas[8];
        celdaTED = celdas[9];
    }

    if (celdaTEA) celdaTEA.textContent = '';
    if (celdaTEP) celdaTEP.textContent = '';
    if (celdaTED) celdaTED.textContent = '';
}

// Función para guardar los avances en localStorage
function guardarAvances() {
    // Obtener todas las filas de la tabla
    const filas = Array.from(planillaContainer.querySelectorAll('tbody tr'));

    // Inicializar el objeto de datos a guardar
    let datosGuardados = JSON.parse(localStorage.getItem('gradesData')) || {};

    filas.forEach(fila => {
        const celdas = fila.querySelectorAll('td');
        if (celdas.length < 12) return; // Ignorar filas mal estructuradas

        const alumnoCell = celdas[0];
        const materiaCell = celdas[1];
        const notas = {
            'TEA 1': celdas[2].textContent.trim(),
            'TEP 1': celdas[3].textContent.trim(),
            'TED 1': celdas[4].textContent.trim(),
            'Nota 1': celdas[5].querySelector('input').value.trim(),
            'Asistencia 1': celdas[6].textContent.trim(),
            'TEA 2': celdas[7].textContent.trim(),
            'TEP 2': celdas[8].textContent.trim(),
            'TED 2': celdas[9].textContent.trim(),
            'Nota 2': celdas[10].querySelector('input').value.trim(),
            'Asistencia 2': celdas[11].textContent.trim(),
        };

        const alumnoNombre = alumnoCell.querySelector('span') ? alumnoCell.querySelector('span').textContent.trim() : 'Desconocido';
        const materia = materiaCell.textContent.trim();

        if (!datosGuardados[cursoSeleccionado]) {
            datosGuardados[cursoSeleccionado] = {};
        }

        if (!datosGuardados[cursoSeleccionado][alumnoNombre]) {
            datosGuardados[cursoSeleccionado][alumnoNombre] = {};
        }

        datosGuardados[cursoSeleccionado][alumnoNombre][materia] = notas;
    });

    // Guardar en localStorage
    localStorage.setItem('gradesData', JSON.stringify(datosGuardados));

    console.log('Avances guardados en localStorage.');
}

// Función para cargar los avances desde localStorage
function cargarAvances() {
    const datosGuardados = JSON.parse(localStorage.getItem('gradesData'));
    if (!datosGuardados) return;

    // Solo cargar si el curso seleccionado está presente en datosGuardados
    if (!datosGuardados[cursoSeleccionado]) return;

    // Obtener todas las filas de la tabla
    const filas = Array.from(planillaContainer.querySelectorAll('tbody tr'));

    filas.forEach(fila => {
        const celdas = fila.querySelectorAll('td');
        if (celdas.length < 12) return; // Ignorar filas mal estructuradas

        const alumnoNombre = celdas[0].querySelector('span') ? celdas[0].querySelector('span').textContent.trim() : 'Desconocido';
        const materia = celdas[1].textContent.trim();

        // Verificar si hay datos guardados para este alumno y materia
        if (datosGuardados[cursoSeleccionado][alumnoNombre] && datosGuardados[cursoSeleccionado][alumnoNombre][materia]) {
            const notasGuardadas = datosGuardados[cursoSeleccionado][alumnoNombre][materia];

            // Actualizar TEA, TEP, TED
            celdas[2].textContent = notasGuardadas['TEA 1'] || '';
            celdas[3].textContent = notasGuardadas['TEP 1'] || '';
            celdas[4].textContent = notasGuardadas['TED 1'] || '';
            celdas[5].querySelector('input').value = notasGuardadas['Nota 1'] || '';
            celdas[6].textContent = notasGuardadas['Asistencia 1'] || '';
            celdas[7].textContent = notasGuardadas['TEA 2'] || '';
            celdas[8].textContent = notasGuardadas['TEP 2'] || '';
            celdas[9].textContent = notasGuardadas['TED 2'] || '';
            celdas[10].querySelector('input').value = notasGuardadas['Nota 2'] || '';
            celdas[11].textContent = notasGuardadas['Asistencia 2'] || '';

            // Validar los inputs de nota
            validarInputNota(celdas[5].querySelector('input'));
            validarInputNota(celdas[10].querySelector('input'));

            // Actualizar las cruces basadas en las notas
            actualizarCruces(fila, celdas[5].querySelector('input'));
            actualizarCruces(fila, celdas[10].querySelector('input'));
        }
    });

    console.log('Avances cargados desde localStorage.');
}

// Función para limpiar los datos guardados
function limpiarDatos() {
    if (confirm('¿Estás seguro de que deseas limpiar todos los datos guardados? Esta acción no se puede deshacer.')) {
        localStorage.removeItem('gradesData');
        location.reload(); // Recargar la página para reflejar los cambios
    }
}

// Función para exportar a PDF
function exportToPDF(tipoExportacion) {
    console.log('Exportando PDF para el curso:', cursoSeleccionado);
    if (!materiasPorCurso[cursoSeleccionado]) {
        alert('No hay materias definidas para este curso.');
        return;
    }

    // Clonar el contenedor de la planilla
    const planillaClonada = planillaContainer.cloneNode(true);

    // Eliminar los botones de exportación y otros elementos no necesarios en el clon
    const elementosAEliminar = planillaClonada.querySelectorAll('#botones-exportacion, #porcentajes-container, #alumno-container, #graficos-container');
    elementosAEliminar.forEach(elem => elem.remove());

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
    const alturaFila = 10; // Altura estimada de una fila en mm
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

        pdf.save(`planilla_${cursoSeleccionado.replace(/ /g, '_')}.pdf`);
    }, 500); // Esperar 500 ms
}

// Función para exportar a Excel
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

    // Agregar filas de totales de porcentajes al final de la tabla
    const filaTotales = document.createElement('tr');
    filaTotales.innerHTML = `
        <td colspan="2"><strong>Totales de Porcentajes</strong></td>
        <td colspan="10" id="totalesPorcentajes"></td>
    `;
    tablaClonada.querySelector('tbody').appendChild(filaTotales);

    // Obtener los porcentajes calculados desde el DOM
    const porcentajeTEA = document.getElementById('porcentajes-generales')?.querySelector('p:nth-child(1)')?.textContent.replace('TEA: ', '').replace('%', '') || '0';
    const porcentajeTEP = document.getElementById('porcentajes-generales')?.querySelector('p:nth-child(2)')?.textContent.replace('TEP: ', '').replace('%', '') || '0';
    const porcentajeTED = document.getElementById('porcentajes-generales')?.querySelector('p:nth-child(3)')?.textContent.replace('TED: ', '').replace('%', '') || '0';
    const porcentajeEspecifico = document.getElementById('porcentajes-especificos')?.querySelector('p:nth-child(1)')?.textContent.replace('TEA: ', '').replace('%', '') || '0';
    const nombreEspecifico = document.getElementById('porcentajes-especificos')?.querySelector('h4')?.textContent.match(/\((.*?)\)/)?.[1] || 'PLG/LIT';

    // Insertar los porcentajes en la fila de totales
    const celdaTotalesPorcentajes = tablaClonada.querySelector('#totalesPorcentajes');
    celdaTotalesPorcentajes.innerHTML = `
        TEA: ${porcentajeTEA}%,
        TEP: ${porcentajeTEP}%,
        TED: ${porcentajeTED}%,
        ${nombreEspecifico}: ${porcentajeEspecifico}%
    `;

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

    // Exportar el libro a un archivo Excel
    XLSX.utils.book_append_sheet(wb, ws, 'Planilla');
    XLSX.writeFile(wb, `planilla_${cursoSeleccionado.replace(/ /g, '_')}.xlsx`);
}
