// functions.js

// Función para calcular porcentajes generales de TEA, TEP y TED
function calcularPorcentajesGenerales() {
    const datosGuardados = JSON.parse(localStorage.getItem('gradesData'));
    if (!datosGuardados || !cursoSeleccionado) return;

    const datosCurso = datosGuardados[cursoSeleccionado];
    if (!datosCurso) return;

    let totalTEA = 0;
    let totalTEP = 0;
    let totalTED = 0;
    let totalNotas = 0;

    for (const alumno in datosCurso) {
        const materias = datosCurso[alumno];
        for (const materia in materias) {
            const notasMateria = materias[materia];

            // Contar TEA, TEP y TED de Nota 1
            if (notasMateria['TEA 1'] === 'X') totalTEA++;
            if (notasMateria['TEP 1'] === 'X') totalTEP++;
            if (notasMateria['TED 1'] === 'X') totalTED++;
            if (notasMateria['Nota 1']) totalNotas++;

            // Contar TEA, TEP y TED de Nota 2
            if (notasMateria['TEA 2'] === 'X') totalTEA++;
            if (notasMateria['TEP 2'] === 'X') totalTEP++;
            if (notasMateria['TED 2'] === 'X') totalTED++;
            if (notasMateria['Nota 2']) totalNotas++;
        }
    }

    // Calcular porcentajes
    const porcentajeTEA = totalNotas ? ((totalTEA / totalNotas) * 100).toFixed(2) : 0;
    const porcentajeTEP = totalNotas ? ((totalTEP / totalNotas) * 100).toFixed(2) : 0;
    const porcentajeTED = totalNotas ? ((totalTED / totalNotas) * 100).toFixed(2) : 0;

    // Mostrar resultados
    mostrarPorcentajesGenerales(porcentajeTEA, porcentajeTEP, porcentajeTED);
}

// Función para mostrar los porcentajes generales en el DOM
function mostrarPorcentajesGenerales(porcentajeTEA, porcentajeTEP, porcentajeTED) {
    let contenedorPorcentajes = document.getElementById('porcentajes-generales');
    if (!contenedorPorcentajes) {
        // Crear el contenedor si no existe
        contenedorPorcentajes = document.createElement('div');
        contenedorPorcentajes.id = 'porcentajes-generales';
        contenedorPorcentajes.classList.add('my-3');
        document.querySelector('.container').appendChild(contenedorPorcentajes);
    }

    contenedorPorcentajes.innerHTML = `
        <h4>Porcentajes Generales</h4>
        <p>TEA: ${porcentajeTEA}%</p>
        <p>TEP: ${porcentajeTEP}%</p>
        <p>TED: ${porcentajeTED}%</p>
    `;
}

// Función para calcular porcentajes específicos para MTM, PLG y LIT
function calcularPorcentajesEspecificos() {
    const datosGuardados = JSON.parse(localStorage.getItem('gradesData'));
    if (!datosGuardados || !cursoSeleccionado) return;

    const datosCurso = datosGuardados[cursoSeleccionado];
    if (!datosCurso) return;

    let materiasEspecificas = [];

    // Determinar las materias específicas según el curso
    if (cursoSeleccionado.startsWith('1ro') || cursoSeleccionado.startsWith('2do') || cursoSeleccionado.startsWith('3ro')) {
        materiasEspecificas = ['MTM', 'PLG'];
    } else if (cursoSeleccionado.startsWith('4to') || cursoSeleccionado.startsWith('5to') || cursoSeleccionado.startsWith('6to')) {
        materiasEspecificas = ['MTM', 'LIT'];
    } else {
        // Si el curso no coincide, no se calculan porcentajes específicos
        return;
    }

    let totalTEA = 0;
    let totalTEP = 0;
    let totalTED = 0;
    let totalNotas = 0;

    for (const alumno in datosCurso) {
        const materias = datosCurso[alumno];
        for (const materia in materias) {
            if (materiasEspecificas.includes(materia)) {
                const notasMateria = materias[materia];

                // Contar TEA, TEP y TED de Nota 1
                if (notasMateria['TEA 1'] === 'X') totalTEA++;
                if (notasMateria['TEP 1'] === 'X') totalTEP++;
                if (notasMateria['TED 1'] === 'X') totalTED++;
                if (notasMateria['Nota 1']) totalNotas++;

                // Contar TEA, TEP y TED de Nota 2
                if (notasMateria['TEA 2'] === 'X') totalTEA++;
                if (notasMateria['TEP 2'] === 'X') totalTEP++;
                if (notasMateria['TED 2'] === 'X') totalTED++;
                if (notasMateria['Nota 2']) totalNotas++;
            }
        }
    }

    // Calcular porcentajes
    const porcentajeTEA = totalNotas ? ((totalTEA / totalNotas) * 100).toFixed(2) : 0;
    const porcentajeTEP = totalNotas ? ((totalTEP / totalNotas) * 100).toFixed(2) : 0;
    const porcentajeTED = totalNotas ? ((totalTED / totalNotas) * 100).toFixed(2) : 0;

    // Determinar el nombre de la materia adicional
    const materiaAdicional = materiasEspecificas.includes('PLG') ? 'PLG' : 'LIT';

    // Mostrar resultados
    mostrarPorcentajesEspecificos(porcentajeTEA, porcentajeTEP, porcentajeTED, materiaAdicional);
}

// Función para mostrar los porcentajes específicos en el DOM
function mostrarPorcentajesEspecificos(porcentajeTEA, porcentajeTEP, porcentajeTED, materiaAdicional) {
    let contenedorPorcentajes = document.getElementById('porcentajes-especificos');
    if (!contenedorPorcentajes) {
        // Crear el contenedor si no existe
        contenedorPorcentajes = document.createElement('div');
        contenedorPorcentajes.id = 'porcentajes-especificos';
        contenedorPorcentajes.classList.add('my-3');
        document.querySelector('.container').appendChild(contenedorPorcentajes);
    }

    contenedorPorcentajes.innerHTML = `
        <h4>Porcentajes Específicos (${materiaAdicional})</h4>
        <p>TEA: ${porcentajeTEA}%</p>
        <p>TEP: ${porcentajeTEP}%</p>
        <p>TED: ${porcentajeTED}%</p>
    `;
}
