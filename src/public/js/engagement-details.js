function toggleYesNo(btn, textId) {
  const buttons = btn.parentNode.querySelectorAll(".btn");
  buttons.forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  if (textId) {
    const textElement = document.getElementById(textId);
    textElement.style.display = btn.textContent === "Yes" ? "block" : "none";
  }
}

function handleFMVTypeChange(select, index) {
  const row = select.closest("tr");
  const rateInput = row.querySelector('input[type="number"]');
  const currencyInput = row.querySelector(".currency-input");
  if (select.value === "Uncompensated") {
    rateInput.value = 0;
    rateInput.disabled = true;
    currencyInput.disabled = true;
  } else {
    rateInput.disabled = false;
    currencyInput.disabled = false;
  }
}

function toggleHCODetails(select, detailsId) {
  const detailsInput = document.getElementById(detailsId);
  detailsInput.style.display = select.value === "yes" ? "block" : "none";
}

function toggleEmailDate(select, dateId) {
  const dateInput = document.getElementById(dateId);
  dateInput.style.display = select.value === "yes" ? "block" : "none";
}

async function generateCRF(engagementId) {
  try {
    const response = await fetch(
      `/api/engagement-requests/${engagementId}/crf`,
      {
        method: "GET",
      }
    );

    if (!response.ok) throw new Error("Failed to generate CRF");

    // Trigger download of the generated document
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = `Engagement_${engagementId}_CRF.docx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating CRF:", error);
    alert("Failed to generate CRF");
  }
}
