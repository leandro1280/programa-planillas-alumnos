// functions.js

// Función para exportar la planilla completa o parcial a PDF
function exportToPDF(tipo) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Seleccionar el contenido a exportar
    const planilla = document.getElementById('planilla-container');

    // Usar html2canvas para capturar el contenido
    html2canvas(planilla).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgProps = doc.getImageProperties(imgData);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        doc.save(`${tipo}_planilla.pdf`);
    });
}

// Función para exportar la planilla a Excel
function exportToExcel() {
    const table = document.getElementById('planilla-table');
    if (!table) {
        alert('No hay una planilla para exportar.');
        return;
    }

    const workbook = XLSX.utils.table_to_book(table, { sheet: "Planilla" });
    XLSX.writeFile(workbook, 'planilla_notas.xlsx');
}
