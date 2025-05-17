function fetchEngagements() {
  const loadingMessage = document.getElementById("loadingMessage");
  const errorMessage = document.getElementById("errorMessage");
  const list = document.getElementById("engagementList");
  loadingMessage.style.display = "block";
  list.innerHTML = "";

  fetch("/api/engagement-requests")
    .then((response) => response.json())
    .then((data) => {
      loadingMessage.style.display = "none";
      if (data.length === 0) {
        list.innerHTML =
          '<tr><td colspan="5">No engagement requests found.</td></tr>';
      } else {
        data.forEach((engagement) => {
          const row = `
            <tr>
              <td>${engagement.requestNumber || ""}</td>
              <td>${engagement.engagementName || ""}</td>
              <td>${new Date(
                engagement.engagementDate
              ).toLocaleDateString()}</td>
              <td>${engagement.status || "Pending"}</td>
              <td><a href="/engagement/${engagement._id}">View Details</a></td>
            </tr>
          `;
          list.innerHTML += row;
        });
      }
    })
    .catch((error) => {
      loadingMessage.style.display = "none";
      errorMessage.style.display = "block";
      console.error("Error:", error);
    });
}

// Filter table by engagement name
function filterTable() {
  const searchInput = document
    .getElementById("searchInput")
    .value.toLowerCase();
  const table = document.getElementById("engagementTable");
  const rows = table.getElementsByTagName("tr");

  for (let i = 1; i < rows.length; i++) {
    const engagementName = rows[i]
      .getElementsByTagName("td")[1]
      .textContent.toLowerCase();
    if (engagementName.indexOf(searchInput) > -1) {
      rows[i].style.display = "";
    } else {
      rows[i].style.display = "none";
    }
  }
}

// Sort table by column
function sortTable(columnIndex) {
  const table = document.getElementById("engagementTable");
  const rows = Array.from(table.rows).slice(1); // Skip the header row
  let sortedRows;

  sortedRows = rows.sort((a, b) => {
    const aText = a.cells[columnIndex].textContent.trim().toLowerCase();
    const bText = b.cells[columnIndex].textContent.trim().toLowerCase();

    return aText.localeCompare(bText);
  });

  // Append the sorted rows back to the table body
  const tbody = table.querySelector("tbody");
  tbody.innerHTML = "";
  sortedRows.forEach((row) => tbody.appendChild(row));
}
