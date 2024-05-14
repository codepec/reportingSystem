// Die jsPDF-Bibliothek wird als jspdf importiert
const jsPDF = window.jspdf.jsPDF;

// Funktion zum Umwandeln des PDF-Plans in ein Bild
function pdfToImage(pdfUrl, doc, x, y, width, height) {
  return new Promise((resolve, reject) => {
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    loadingTask.promise
      .then(function (pdf) {
        pdf.getPage(1).then(function (page) {
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          page.render(renderContext).promise.then(function () {
            const imgData = canvas.toDataURL("image/jpeg", 1.0);
            doc.addImage(imgData, "JPEG", x, y, width, height);
            resolve(); // Auflösen der Promise, nachdem das Bild hinzugefügt wurde
          });
        });
      })
      .catch(function (error) {
        reject(error); // Fehlerbehandlung
      });
  });
}

// Eventlistener für das Formular
document.addEventListener("DOMContentLoaded", function () {
  const mangelForm = document.getElementById("mangelForm");
  mangelForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const mangelText = document.getElementById("mangelText").value;
    const mangelOrt = document.getElementById("mangelOrt").value;
    const fotoUpload = document.getElementById("fotoUpload").files[0];
    const lageplanLink = document.getElementById("lageplanLink").files[0];
    const mangelEmail = "currentuser@example.com";

    const doc = new jsPDF();

    // Titel und Datum
    const currentDate = new Date().toLocaleDateString("de-DE");
    doc.setFontSize(18);
    doc.text("Schadstoffmeldeblatt", 105, 15, null, null, "center");
    doc.setFontSize(12);
    doc.text(`Datum: ${currentDate}`, 105, 25, null, null, "center");

    // Mangel, Ort und Erfasser
    doc.setFontSize(14);
    doc.text(`Mangel: ${mangelText}`, 20, 40);
    doc.text(`Ort: ${mangelOrt}`, 20, 50);
    doc.text(`Erfasser: ${mangelEmail}`, 20, 60);

    // Einlesen des PDF-Plans und Hinzufügen des Bildes
    if (lageplanLink) {
      try {
        await pdfToImage(
          URL.createObjectURL(lageplanLink),
          doc,
          120,
          70,
          80,
          80
        );
      } catch (error) {
        console.error("Fehler beim Einlesen des PDF-Plans:", error);
      }
    }

    // Foto
    if (fotoUpload) {
      const reader = new FileReader();
      reader.readAsDataURL(fotoUpload);
      reader.onloadend = function () {
        const imgData = reader.result;
        doc.addImage(imgData, "JPEG", 20, 200, 80, 80);
        doc.text(`Foto: ${fotoUpload.name}`, 20, 290);
        // Speichere die PDF-Datei lokal
        doc.save("mangelmeldung.pdf");
      };
    } else {
      doc.text("Kein Foto ausgewählt", 20, 290);
      // Speichere die PDF-Datei lokal
      doc.save("mangelmeldung.pdf");
    }
  });
});
